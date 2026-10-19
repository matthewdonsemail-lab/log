"""Human scrolling (rule 32): the Robotic VSL engine's trajectory scroll, ported.

Source (read through the GitHub API, 2026-10-19):
matthewdonsemail-lab/Robotic-Video-Sales-Letter-Pydantic-Camoufox-Agent-for-GTM,
`src/capability/scroll_math.py` (pure trajectory, a port of HumanJS `planScroll`)
and `src/capability/scroll_motion.py` (driving it on a real page).

One scroll is ONE trajectory: wheel deltas weighted by a half-sine, so the page
accelerates from rest, peaks halfway and slows to a stop, the deltas summing to
the distance exactly (no correction jump at the end). Short flicks overshoot
more (up to 25 %) and recoil in a short reverse phase; long scrolls overshoot
~3 %. A few mid-scroll pauses (8 % of steps, 100-240 ms). The page's own wheel
scrolling does the moving (`page.mouse.wheel`), or `scrollTop` inside a nested
scroll container; never `scroll_into_view_if_needed`, which jumps instantly
(the Robotic VSL's own rule, and what made our scrolls look wrong).

Our cursor (humanMouse.py) is moved onto the page first by its own trajectory,
where the Robotic VSL moved it there in one jump.
"""
from __future__ import annotations

import asyncio
import math
import random
import time
from dataclasses import dataclass
from typing import Any


@dataclass
class ScrollStep:
    """One wheel delta in a human scroll trajectory."""
    delta_y: float
    delay_ms: int


def _bell_phase(distance: float, *, segments_per_kpx: float = 18.0, segment_delay_ms: float = 32.0,
                delay_jitter: float = 0.20, rng: random.Random) -> list[ScrollStep]:
    """Bell-curve-velocity segments (scroll_math._bell_phase): half-sine weights normalised to sum to the
    distance; fewer, faster steps for a short flick (12 ms floor), the full 32 ms ramp from 5000 px."""
    if distance == 0:
        return []
    abs_dist = abs(distance)
    count = max(1, math.ceil(abs_dist / 1000.0 * segments_per_kpx))
    short_floor_ms, long_full_ms, long_ref_px = 12.0, segment_delay_ms, 5000.0
    if abs_dist >= long_ref_px:
        delay_base = long_full_ms
    else:
        t = math.log1p(abs_dist) / math.log1p(long_ref_px)
        delay_base = short_floor_ms + (long_full_ms - short_floor_ms) * t
    direction = 1.0 if distance > 0 else -1.0
    weights = [math.sin(((i + 0.5) / count) * math.pi) for i in range(count)]
    total = sum(weights)
    return [
        ScrollStep(delta_y=direction * abs_dist * w / total,
                   delay_ms=max(12, int(delay_base * rng.uniform(1.0 - delay_jitter, 1.0 + delay_jitter))))
        for w in weights
    ]


def human_scroll_trajectory(distance: float, *, seed: int | None = None) -> list[ScrollStep]:
    """The whole scroll (scroll_math.human_scroll_trajectory): forward bell to the target plus an overshoot
    that shrinks with distance (25 % → 3 % at 5000 px, linear in log-distance), a short reverse bell recoiling
    the overshoot, and the occasional mid-scroll pause (never in the recoil). Pure."""
    rng = random.Random(seed)
    if not distance:
        return []
    direction = 1 if distance > 0 else -1
    abs_dist = abs(distance)
    long_ref_px = 5000.0
    if abs_dist >= long_ref_px:
        fraction = 0.03
    else:
        t = math.log1p(abs_dist) / math.log1p(long_ref_px)
        fraction = 0.25 + (0.03 - 0.25) * t
    extra = abs_dist * fraction
    forward = _bell_phase(abs_dist + extra, rng=rng)
    reverse = _bell_phase(extra, segments_per_kpx=10.0, segment_delay_ms=20.0, rng=rng) if extra >= 1.0 else []
    steps = forward + reverse
    fwd_len = len(forward)
    paused: list[tuple[ScrollStep, bool]] = []
    for idx, step in enumerate(steps):
        is_fwd = idx < fwd_len
        paused.append((step, is_fwd))
        if 0 < idx < fwd_len - 1 and rng.random() < 0.08:
            paused.append((ScrollStep(delta_y=0.0, delay_ms=rng.randint(100, 240)), is_fwd))
    out: list[ScrollStep] = []
    for s, is_fwd in paused:
        d = direction if is_fwd else -direction
        out.append(ScrollStep(delta_y=s.delta_y * d, delay_ms=s.delay_ms))
    return out


# Where a locator scrolls from: the page, or its nearest scrollable ancestor (scroll_motion.resolve_scroll_owner).
OWNER_JS = """(el) => {
  let cur = el;
  while (cur && cur !== document.documentElement) {
    const s = getComputedStyle(cur);
    if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && cur.scrollHeight > cur.clientHeight) {
      const r = cur.getBoundingClientRect();
      return {isWindow: false, hoverX: r.left + r.width / 2, hoverY: r.top + r.height / 2};
    }
    cur = cur.parentElement;
  }
  return {isWindow: true};
}"""

# How far the page (or the container) must move to bring the element to 28 % from the top, clamped to what
# it can move (scroll_motion.scroll_to_ref's target, as a relative distance so the owner needs no locator).
DISTANCE_JS = """(el) => {
  let cur = el.parentElement, owner = null;
  while (cur && cur !== document.documentElement) {
    const s = getComputedStyle(cur);
    if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && cur.scrollHeight > cur.clientHeight) { owner = cur; break; }
    cur = cur.parentElement;
  }
  const r = el.getBoundingClientRect();
  if (!owner) {
    const want = Math.max(0, r.top + window.scrollY - window.innerHeight * 0.28);
    const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    return {isWindow: true, distance: Math.min(want, max) - window.scrollY, inView: r.top >= 0 && r.bottom <= window.innerHeight && r.height > 0};
  }
  const c = owner.getBoundingClientRect();
  const want = Math.max(0, r.top - c.top + owner.scrollTop - owner.clientHeight * 0.28);
  const max = Math.max(0, owner.scrollHeight - owner.clientHeight);
  return {isWindow: false, distance: Math.min(want, max) - owner.scrollTop, inView: r.top >= c.top && r.bottom <= c.bottom && r.height > 0};
}"""

# One step of a nested container's scroll (scroll_motion.walk_segments_container), found from the element.
CONTAINER_STEP_JS = """(el, d) => {
  let cur = el.parentElement;
  while (cur && cur !== document.documentElement) {
    const s = getComputedStyle(cur);
    if ((s.overflowY === 'auto' || s.overflowY === 'scroll') && cur.scrollHeight > cur.clientHeight) { cur.scrollTop += d; return true; }
    cur = cur.parentElement;
  }
  return false;
}"""


def _wheel_point(page: Any, rng: random.Random) -> tuple[float, float]:
    vp = page.viewport_size or {"width": 1280, "height": 800}
    return vp["width"] * 0.5 + rng.uniform(-60, 60), vp["height"] * 0.45 + rng.uniform(-50, 50)


# -- async (the inspect and flow sessions) --------------------------------------------------------
async def scroll_by(page: Any, distance: float, mouse: Any = None, log=lambda _l: None) -> int:
    """One human scroll of `distance` px on the page (scroll_motion.human_scroll_by). The cursor glides onto
    the page first (humanMouse), so the wheel lands where a hand is. Returns the steps sent."""
    steps = human_scroll_trajectory(distance)
    if not steps:
        return 0
    rng = random.Random()
    x, y = _wheel_point(page, rng)
    if mouse is not None and mouse.x is not None:
        # Already over the page's middle band: scroll where the hand is, as a person does.
        vp = page.viewport_size or {"width": 1280, "height": 800}
        if not (vp["width"] * 0.2 < mouse.x < vp["width"] * 0.8 and vp["height"] * 0.15 < mouse.y < vp["height"] * 0.85):
            await mouse.glide(x, y, "scrollPosition")
    elif mouse is not None:
        await mouse.glide(x, y, "scrollPosition")
    else:
        await asyncio.wait_for(page.mouse.move(x, y), timeout=5.0)
    started = time.monotonic()
    for step in steps:
        if step.delta_y:
            await page.mouse.wheel(0, step.delta_y)
        await asyncio.sleep(step.delay_ms / 1000)
    log(f"  scroll: {distance:+.0f}px in {len(steps)} wheel steps, {(time.monotonic() - started) * 1000:.0f} ms")
    return len(steps)


async def scroll_into_view(locator: Any, mouse: Any = None, log=lambda _l: None) -> bool:
    """Bring an element to 28 % from the top by one trajectory scroll (scroll_motion.scroll_to_ref), never
    scroll_into_view_if_needed. A nested container scrolls by its scrollTop with the cursor over it.
    Returns whether it ended up in view."""
    page = locator.page
    await locator.wait_for(state="attached", timeout=10_000)
    where = await locator.evaluate(DISTANCE_JS)
    if where["inView"] or abs(where["distance"]) < 4:
        return True
    steps = human_scroll_trajectory(where["distance"])
    if where["isWindow"]:
        await scroll_by(page, where["distance"], mouse, log)
    else:
        owner = await locator.evaluate(OWNER_JS)
        if mouse is not None and owner.get("hoverX") is not None:
            await mouse.glide(owner["hoverX"], owner["hoverY"], "scrollPosition")
        for step in steps:
            if step.delta_y:
                await locator.evaluate(CONTAINER_STEP_JS, step.delta_y)
            await asyncio.sleep(step.delay_ms / 1000)
        log(f"  scroll: container {where['distance']:+.0f}px in {len(steps)} steps")
    return bool((await locator.evaluate(DISTANCE_JS))["inView"])


# -- sync (the publish, connect and profile sessions) ---------------------------------------------
def scroll_by_sync(page: Any, distance: float, mouse: Any = None, log=lambda _l: None) -> int:
    steps = human_scroll_trajectory(distance)
    if not steps:
        return 0
    x, y = _wheel_point(page, random.Random())
    if mouse is not None:
        mouse.glide(x, y, "scrollPosition")
    else:
        page.mouse.move(x, y)
    for step in steps:
        if step.delta_y:
            page.mouse.wheel(0, step.delta_y)
        time.sleep(step.delay_ms / 1000)
    log(f"  scroll: {distance:+.0f}px in {len(steps)} wheel steps")
    return len(steps)


def scroll_into_view_sync(locator: Any, mouse: Any = None, log=lambda _l: None) -> bool:
    page = locator.page
    locator.wait_for(state="attached", timeout=10_000)
    where = locator.evaluate(DISTANCE_JS)
    if where["inView"] or abs(where["distance"]) < 4:
        return True
    if where["isWindow"]:
        scroll_by_sync(page, where["distance"], mouse, log)
    else:
        for step in human_scroll_trajectory(where["distance"]):
            if step.delta_y:
                locator.evaluate(CONTAINER_STEP_JS, step.delta_y)
            time.sleep(step.delay_ms / 1000)
    return bool(locator.evaluate(DISTANCE_JS)["inView"])
