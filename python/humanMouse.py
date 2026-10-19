"""The cursor as a person moves it (rule 32), fitted to matt's own hand.

python/recordMouse.py recorded matt's mouse for 60 s on a Facebook page
(2026-10-19, ~/.logCli/mouse/20261019T192448.json). What it showed, and what
this file does with it:

- A move is ONE continuous velocity profile, never a chain of small moves. A
  reach of 400-800 px takes 0.42-0.45 s: speed ramps to its peak
  (5000-6600 px/s) within the first tenth, then settles in a long slow tail.
  A short move (60-80 px) is slow and deliberate, 0.5-1 s. So `reach()`
  draws a cubic Bezier from here to the target (control points pulled
  sideways by 8-25 % of the distance, so the path curves) and walks it with a
  minimum-jerk profile time-warped to put the peak early, emitting a point
  every 1/60 s clocked against real time.
- About half of matt's reaches overshoot by 10-60 px and come back. The
  overshoot is the same curve carried past the target, then an ease-out
  return of 0.15-0.35 s, still one gesture.
- Looking at something, his hand keeps moving: loose loops of 80-350 px at
  0.15-0.7 Hz, 100-1500 px/s, mostly 1-6 s, a few of 6-9 s (`loops()`), with
  pauses of 0.1-1.5 s and, now and then, a still moment of 1.5-4 s. He was
  still 25 % of the time.
- Camoufox's humanize stays on (rule 11) but, measured 2026-10-19, its own
  per-hop curve cost 100 ms for 5 px and 530 ms for 100 px, so the sessions
  that draw their trajectory here launch with `own_trajectory=True`
  (python/visibleBrowser.py): the per-hop cap is 20 ms and this profile owns
  the clock.

Two drivers share the maths: `HumanMouse` for the async sessions (inspect,
flow), with an idle loop that flicks to a visible element, loops around it,
pauses, next, and is preempted by any step; `SyncHumanMouse` for the sync
sessions (publish, connect, profile, through `human_click()` and
`Session.mouse.look()`), which looks at the page before each step and clicks
the way the async one does. Every step's emitted samples go to
`mouseSamples.json` in recordMouse.py's format, so
`python/recordMouse.py --analyze` measures ours exactly as it measured matt's.
Nothing is injected into Facebook's page.
"""
from __future__ import annotations

import asyncio
import math
import random
import time
from typing import Any, Callable

import scrollMotion

MOVE_TIMEOUT = 5.0
EMIT_HZ = 60


def min_jerk(t: float) -> float:
    """Position 0..1 along a move with the smoothest possible velocity (peak speed at t=0.5)."""
    return 10 * t**3 - 15 * t**4 + 6 * t**5


def bezier(p0, p1, p2, p3, t: float) -> tuple[float, float]:
    u = 1 - t
    return (u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1])


# The elements a person's eye and cursor go to, with their boxes and a short label (isolated world).
TARGETS_JS = """() => {
  const vw = innerWidth, vh = innerHeight, out = [];
  const pick = 'a[href],button,[role=button],[role=link],[role=menuitem],[role=tab],h1,h2,h3,input,textarea,[role=textbox],img';
  for (const el of document.querySelectorAll(pick)) {
    const r = el.getBoundingClientRect();
    if (r.width < 16 || r.height < 12 || r.bottom < 0 || r.right < 0 || r.top > vh || r.left > vw) continue;
    const style = getComputedStyle(el);
    if (style.visibility === 'hidden' || style.display === 'none' || +style.opacity === 0) continue;
    const tag = el.tagName.toLowerCase();
    const label = (el.getAttribute('aria-label') || el.innerText || el.getAttribute('alt') || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
    out.push({x: r.left, y: r.top, width: r.width, height: r.height, kind: /^h[1-3]$/.test(tag) ? 'heading' : tag, label});
    if (out.length >= 80) break;
  }
  return out;
}"""


# -- the maths: gestures over real time ---------------------------------------
class Gesture:
    """A trajectory: `at(t)` is the position t seconds in, for 0 <= t <= seconds."""

    def __init__(self, kind: str, seconds: float, at: Callable[[float], tuple[float, float]], note: dict[str, Any] | None = None) -> None:
        self.kind = kind
        self.seconds = seconds
        self.at = at
        self.note = note or {}


def duration_for(rng: random.Random, chord: float) -> float:
    """How long matt's hand took for a move of this length."""
    if chord >= 300:
        return rng.uniform(0.40, 0.52)
    if chord >= 120:
        return rng.uniform(0.42, 0.70)
    return rng.uniform(0.45, 0.90)


def reach(rng: random.Random, sx: float, sy: float, tx: float, ty: float, overshoot: float | None = None) -> list[Gesture]:
    """One human move: curved path, early speed peak, long settle; maybe carried past the target and eased back."""
    chord = math.hypot(tx - sx, ty - sy)
    if chord < 1.5:
        return []
    duration = duration_for(rng, chord)
    over = overshoot if overshoot is not None else (rng.uniform(10, 60) if chord > 150 and rng.random() < 0.5 else 0.0)
    ux, uy = (tx - sx) / chord, (ty - sy) / chord
    nx, ny = -uy, ux
    lateral = rng.uniform(0.08, 0.25) * chord * rng.choice((1, -1))
    ex, ey = tx + ux * over, ty + uy * over
    p0, p3 = (sx, sy), (ex, ey)
    p1 = (sx + ux * chord * 0.30 + nx * lateral, sy + uy * chord * 0.30 + ny * lateral)
    p2 = (ex - ux * chord * 0.25 + nx * lateral * 0.4, ey - uy * chord * 0.25 + ny * lateral * 0.4)
    warp = rng.uniform(0.50, 0.70)  # t**warp pulls the speed peak to ~0.3 and stretches the tail
    gestures = [Gesture("reach", duration, lambda t: bezier(p0, p1, p2, p3, min_jerk(min(1.0, t / duration) ** warp)),
                        {"from": [round(sx), round(sy)], "to": [round(tx), round(ty)], "overshootPx": round(over), "curvePx": round(abs(lateral))})]
    if over:
        ret = rng.uniform(0.15, 0.35)
        wob = rng.uniform(-5, 5)
        q0, q3 = (ex, ey), (tx, ty)
        q1 = (ex + (tx - ex) * 0.3 + nx * wob, ey + (ty - ey) * 0.3 + ny * wob)
        q2 = (tx - (tx - ex) * 0.2, ty - (ty - ey) * 0.2)
        gestures.append(Gesture("return", ret, lambda t: bezier(q0, q1, q2, q3, 1 - (1 - min(1.0, t / ret)) ** 3)))
    return gestures


def loops(rng: random.Random, cx: float, cy: float, seconds: float) -> Gesture:
    """Looking at something: loose continuous loops around here, drifting, starting from here (no jump)."""
    r1, r2 = rng.uniform(80, 350), rng.uniform(50, 200)
    f1, f2 = rng.uniform(0.15, 0.7), rng.uniform(0.15, 0.5)
    ph1, ph2 = rng.uniform(0, 2 * math.pi), rng.uniform(0, 2 * math.pi)
    dx, dy = rng.uniform(-40, 40), rng.uniform(-20, 40)
    return Gesture("wander", seconds, lambda t: (cx + dx * t + r1 * (math.sin(2 * math.pi * f1 * t + ph1) - math.sin(ph1)),
                                                 cy + dy * t + r2 * (math.sin(2 * math.pi * f2 * t + ph2) - math.sin(ph2))),
                   {"around": [round(cx), round(cy)]})


def ellipse(rng: random.Random, box: dict[str, float], sx: float, sy: float) -> Gesture:
    """A highlight: one continuous ellipse around the element, eased in and out, from the cursor's own angle."""
    cx, cy = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
    rx = max(25.0, min(90.0, box["width"] * 0.45))
    ry = max(14.0, min(50.0, box["height"] * 0.7))
    direction = rng.choice((1, -1))
    seconds = rng.uniform(0.7, 1.0)
    a0 = math.atan2((sy - cy) / ry, (sx - cx) / rx)
    return Gesture("circle", seconds, lambda t: (cx + rx * math.cos(a0 + direction * 2 * math.pi * min_jerk(min(1.0, t / seconds))),
                                                 cy + ry * math.sin(a0 + direction * 2 * math.pi * min_jerk(min(1.0, t / seconds)))),
                   {"around": [round(cx), round(cy)], "radius": [round(rx), round(ry)]})


def rest_for(rng: random.Random) -> float:
    """matt's pauses: ~0.2 s mostly, 0.3-1.5 s often, a still moment of 1.5-4 s now and then (25 % still overall)."""
    r = rng.random()
    return rng.uniform(1.5, 4.0) if r < 0.15 else rng.uniform(0.3, 1.5) if r < 0.55 else rng.uniform(0.1, 0.3)


def look_for(rng: random.Random) -> float:
    """matt's looking-moves: median ~1.3 s, a few of 5-9 s."""
    return rng.uniform(0.8, 6.0) if rng.random() < 0.8 else rng.uniform(6.0, 9.0)


# -- what both drivers share ---------------------------------------------------
class MouseBase:
    def __init__(self, page: Any, log) -> None:
        self.page = page
        self.log = log
        self.rng = random.Random()
        self.x: float | None = None
        self.y: float | None = None
        self.button = 0
        self.legs: list[dict[str, Any]] = []
        self.samples: list[list[float]] = []
        self.t0 = time.monotonic()
        self.idle_moves = 0
        self.last_target: str | None = None
        self.fresh_page = True
        self._stop = False
        self._seen_errors: set[str] = set()

    def viewport(self) -> dict[str, int]:
        return self.page.viewport_size or {"width": 1280, "height": 800}

    def clamp(self, x: float, y: float) -> tuple[float, float]:
        vp = self.viewport()
        return max(4.0, min(vp["width"] - 4.0, x)), max(4.0, min(vp["height"] - 4.0, y))

    def inside(self, box: dict[str, float], x0: float, x1: float, y0: float, y1: float) -> tuple[float, float]:
        return self.clamp(box["x"] + box["width"] * self.rng.uniform(x0, x1), box["y"] + box["height"] * self.rng.uniform(y0, y1))

    def choose(self, found: list[dict[str, Any]]) -> dict[str, Any] | None:
        """The eight nearest, down the page preferred, never the one just read; the main heading after a navigation."""
        if not found:
            return None
        if self.fresh_page:
            headings = [t for t in found if t["kind"] == "heading"]
            if headings:
                return min(headings, key=lambda t: (t["y"], t["x"]))
        here = (self.x or 0.0, self.y or 0.0)

        def distance(t: dict[str, Any]) -> float:
            return math.dist(here, (t["x"] + t["width"] / 2, t["y"] + t["height"] / 2))

        options = sorted((t for t in found if f"{t['kind']}:{t['label']}:{round(t['x'])}" != self.last_target), key=distance)[:8]
        if not options:
            return None

        def weight(t: dict[str, Any]) -> float:
            reading = 1.4 if t["y"] + t["height"] / 2 >= here[1] - 40 else 1.0
            return reading / (1 + distance(t) / 150) ** 2

        return self.rng.choices(options, weights=[weight(t) for t in options], k=1)[0]

    def _failed(self, exc: Exception) -> None:
        if "TargetClosed" in type(exc).__name__:
            if not self._stop:
                self.log("  mouse: the browser window closed; the cursor stops")
            self._stop = True
            return
        kind = type(exc).__name__
        if kind not in self._seen_errors:
            self._seen_errors.add(kind)
            self.log(f"  mouse: move failed ({kind})")

    def _sampled(self, x: float, y: float) -> None:
        self.x, self.y = x, y
        self.samples.append([round(time.monotonic() - self.t0, 4), round(x, 1), round(y, 1), self.button, 0])

    def _record(self, gesture: Gesture, kind: str, started: float, target: str = "") -> None:
        if gesture.kind == "return":
            return
        self.legs.append({"kind": kind, **({"target": target} if target else {}), **gesture.note, "ms": round((time.monotonic() - started) * 1000)})

    def take(self) -> dict[str, Any]:
        """This step's trajectory: legs for mouse.json, samples (recordMouse.py's format) for mouseSamples.json."""
        samples = self.samples
        t_start = samples[0][0] if samples else 0.0
        recording = {"hz": EMIT_HZ, "seconds": round((samples[-1][0] - t_start) if samples else 0.0, 3), "columns": ["t", "x", "y", "left", "right"],
                     "samples": [[round(s[0] - t_start, 4), *s[1:]] for s in samples]}
        out = {"legs": self.legs, "idleMoves": self.idle_moves, "at": [round(self.x or 0), round(self.y or 0)], "recording": recording}
        self.legs, self.idle_moves, self.samples = [], 0, []
        return out


# -- the async driver (inspect, flow) ----------------------------------------------
class HumanMouse(MouseBase):
    def __init__(self, page: Any, log, busy: Callable[[], bool] = lambda: False) -> None:
        super().__init__(page, log)
        self.busy = busy
        self.lock = asyncio.Lock()
        self.preempt = False
        self._navigating = False
        self.nav_at = 0.0
        self._task: asyncio.Task | None = None

    @property
    def navigating(self) -> bool:
        return self._navigating

    @navigating.setter
    def navigating(self, value: bool) -> None:
        self._navigating = value
        if value:
            self.nav_at = time.monotonic()

    async def _emit(self, x: float, y: float) -> bool:
        x, y = self.clamp(x, y)
        try:
            await asyncio.wait_for(self.page.mouse.move(x, y), timeout=MOVE_TIMEOUT)
        except Exception as exc:
            self._failed(exc)
            return False
        self._sampled(x, y)
        return True

    async def _run(self, gesture: Gesture, kind: str, target: str = "", interruptible: bool = False) -> bool:
        """Walk a gesture against real time, a point every 1/EMIT_HZ s."""
        started = time.monotonic()
        while not self._stop:
            t = time.monotonic() - started
            if interruptible and (self.preempt or self.navigating):
                break
            x, y = gesture.at(min(t, gesture.seconds))
            if not await self._emit(x, y):
                return False
            if t >= gesture.seconds:
                break
            await asyncio.sleep(1 / EMIT_HZ)
        self._record(gesture, kind, started, target)
        return not self._stop

    async def glide(self, tx: float, ty: float, kind: str, target: str = "", overshoot: float | None = None) -> bool:
        tx, ty = self.clamp(tx, ty)
        if self.x is None:
            return await self._emit(tx, ty)
        for g in reach(self.rng, self.x, self.y, tx, ty, overshoot):
            if not await self._run(g, kind, target):
                return False
        return True

    async def wander(self, seconds: float) -> None:
        if self.x is not None:
            await self._run(loops(self.rng, self.x, self.y, seconds), "wander", interruptible=True)

    async def circle(self, box: dict[str, float]) -> None:
        if self.x is not None:
            await self._run(ellipse(self.rng, box, self.x, self.y), "circle")

    def start_idle(self) -> None:
        if self._task is None or self._task.done():
            self._stop = False
            self._task = asyncio.ensure_future(self._idle_loop())

    async def stop_idle(self) -> None:
        self._stop = True
        if self._task is not None:
            try:
                await asyncio.wait_for(self._task, timeout=3)
            except Exception:
                self._task.cancel()
        self._task = None

    async def targets(self) -> list[dict[str, Any]]:
        try:
            return await self.page.evaluate(TARGETS_JS)
        except Exception:
            return []

    async def _idle_loop(self) -> None:
        """Between steps: flick to a visible element, loop around it, pause, next. A step preempts it at once."""
        vp = self.viewport()
        if self.x is None:
            await self._emit(vp["width"] * 0.5, vp["height"] * 0.45)
        while not self._stop:
            try:
                if self.navigating or self.lock.locked():
                    await asyncio.sleep(0.1)
                    continue
                # Still while a page is loading, for the first 2.5 s after a navigation only.
                if self.busy() and time.monotonic() - self.nav_at < 2.5:
                    await asyncio.sleep(0.1)
                    continue
                target = self.choose(await self.targets())
                async with self.lock:
                    if self.preempt:
                        continue
                    if target is not None:
                        self.fresh_page = False
                        self.last_target = f"{target['kind']}:{target['label']}:{round(target['x'])}"
                        tx, ty = self.inside(target, 0.25, 0.75, 0.3, 0.7)
                        if await self.glide(tx, ty, "flick", f"{target['kind']} \"{target['label']}\""):
                            self.idle_moves += 1
                    await self.wander(look_for(self.rng))
                rest_until = time.monotonic() + rest_for(self.rng)
                while time.monotonic() < rest_until and not self._stop and not self.preempt:
                    await asyncio.sleep(0.05)
            except asyncio.CancelledError:
                break
            except Exception as exc:
                kind = type(exc).__name__
                if kind not in self._seen_errors:
                    self._seen_errors.add(kind)
                    self.log(f"  mouse: idle loop error {kind}: {str(exc)[:120]}")
                await asyncio.sleep(0.3)

    async def approach(self, locator: Any, circle: bool | None = None) -> tuple[float, float]:
        # One trajectory scroll (the Robotic VSL's scroll_to_ref), never scroll_into_view_if_needed's jump.
        await scrollMotion.scroll_into_view(locator, self, self.log)
        box = await locator.bounding_box()
        if not box:
            raise RuntimeError("the element has no box on screen")
        if circle is True or (circle is None and self.rng.random() < 0.2):
            await self.circle(box)
        tx, ty = self.inside(box, 0.3, 0.7, 0.35, 0.65)
        await self.glide(tx, ty, "approach")
        await asyncio.sleep(self.rng.uniform(0.05, 0.15))
        return tx, ty

    async def click(self, locator: Any, circle: bool | None = None) -> None:
        """Approach, then press and release where the cursor is (Playwright's click would jump to the centre)."""
        await self.approach(locator, circle)
        self.button = 1
        await self.page.mouse.down()
        self._sampled(self.x or 0, self.y or 0)
        await asyncio.sleep(self.rng.uniform(0.05, 0.14))
        await self.page.mouse.up()
        self.button = 0
        self._sampled(self.x or 0, self.y or 0)
        self.fresh_page = True


# -- the sync driver (publish, connect, profile) ----------------------------------
SYNC_MICE: dict[int, "SyncHumanMouse"] = {}


class SyncHumanMouse(MouseBase):
    """The same gestures on a sync Playwright page. No background loop (sync pages are single-threaded):
    `look()` before each step is the wait in between, the way a hand moves while the eye reads."""

    def __init__(self, page: Any, log) -> None:
        super().__init__(page, log)
        SYNC_MICE[id(page)] = self

    def _emit(self, x: float, y: float) -> bool:
        x, y = self.clamp(x, y)
        try:
            self.page.mouse.move(x, y)
        except Exception as exc:
            self._failed(exc)
            return False
        self._sampled(x, y)
        return True

    def _run(self, gesture: Gesture, kind: str, target: str = "") -> bool:
        started = time.monotonic()
        while not self._stop:
            t = time.monotonic() - started
            x, y = gesture.at(min(t, gesture.seconds))
            if not self._emit(x, y):
                return False
            if t >= gesture.seconds:
                break
            time.sleep(1 / EMIT_HZ)
        self._record(gesture, kind, started, target)
        return not self._stop

    def glide(self, tx: float, ty: float, kind: str, target: str = "", overshoot: float | None = None) -> bool:
        tx, ty = self.clamp(tx, ty)
        if self.x is None:
            return self._emit(tx, ty)
        for g in reach(self.rng, self.x, self.y, tx, ty, overshoot):
            if not self._run(g, kind, target):
                return False
        return True

    def wander(self, seconds: float) -> None:
        if self.x is not None:
            self._run(loops(self.rng, self.x, self.y, seconds), "wander")

    def circle(self, box: dict[str, float]) -> None:
        if self.x is not None:
            self._run(ellipse(self.rng, box, self.x, self.y), "circle")

    def targets(self) -> list[dict[str, Any]]:
        try:
            return self.page.evaluate(TARGETS_JS)
        except Exception:
            return []

    def look(self, low: float = 0.4, high: float = 1.6) -> None:
        """Before a step acts: flick to something visible nearby and look around it for low-high s, then a short pause."""
        if self._stop:
            return
        try:
            if self.x is None:
                vp = self.viewport()
                self._emit(vp["width"] * 0.5, vp["height"] * 0.45)
            target = self.choose(self.targets())
            if target is not None:
                self.fresh_page = False
                self.last_target = f"{target['kind']}:{target['label']}:{round(target['x'])}"
                tx, ty = self.inside(target, 0.25, 0.75, 0.3, 0.7)
                if self.glide(tx, ty, "flick", f"{target['kind']} \"{target['label']}\""):
                    self.idle_moves += 1
            self.wander(self.rng.uniform(low, high))
            time.sleep(min(rest_for(self.rng), 1.0))
        except Exception as exc:
            kind = type(exc).__name__
            if kind not in self._seen_errors:
                self._seen_errors.add(kind)
                self.log(f"  mouse: look failed ({kind})")

    def approach(self, locator: Any, circle: bool | None = None) -> tuple[float, float]:
        scrollMotion.scroll_into_view_sync(locator, self, self.log)
        box = locator.bounding_box()
        if not box:
            raise RuntimeError("the element has no box on screen")
        if circle is True or (circle is None and self.rng.random() < 0.2):
            self.circle(box)
        tx, ty = self.inside(box, 0.3, 0.7, 0.35, 0.65)
        self.glide(tx, ty, "approach")
        time.sleep(self.rng.uniform(0.05, 0.15))
        return tx, ty

    def click(self, locator: Any, circle: bool | None = None) -> None:
        self.approach(locator, circle)
        self.button = 1
        self.page.mouse.down()
        self._sampled(self.x or 0, self.y or 0)
        time.sleep(self.rng.uniform(0.05, 0.14))
        self.page.mouse.up()
        self.button = 0
        self._sampled(self.x or 0, self.y or 0)
        self.fresh_page = True


def human_scroll_into_view(locator: Any) -> None:
    """Bring an element into view in a sync session by one trajectory scroll (scrollMotion), never a jump."""
    mouse = SYNC_MICE.get(id(locator.page))
    scrollMotion.scroll_into_view_sync(locator, mouse if mouse is not None and not mouse._stop else None, mouse.log if mouse else (lambda _l: None))


def human_scroll_by(page: Any, distance: float) -> None:
    """One trajectory scroll of the page in a sync session (scrollMotion), the cursor gliding onto it first."""
    mouse = SYNC_MICE.get(id(page))
    scrollMotion.scroll_by_sync(page, distance, mouse if mouse is not None and not mouse._stop else None, mouse.log if mouse else (lambda _l: None))


def human_click(locator: Any, circle: bool | None = None, timeout: int = 8000) -> None:
    """A click in a sync session goes through the page's SyncHumanMouse (rule 32); without one, Playwright's own."""
    mouse = SYNC_MICE.get(id(locator.page))
    if mouse is None or mouse._stop:
        locator.click(timeout=timeout)
        return
    mouse.click(locator, circle)
