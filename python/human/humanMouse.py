from __future__ import annotations

import asyncio
import math
import random
import time
from typing import Any, Callable

from human import scrollMotion

MOVE_TIMEOUT = 5.0
EMIT_HZ = 60


def min_jerk(t: float) -> float:
    return 10 * t**3 - 15 * t**4 + 6 * t**5


def bezier(p0, p1, p2, p3, t: float) -> tuple[float, float]:
    u = 1 - t
    return (u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1])


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


HIT_JS = "([x, y]) => { const hit = document.elementFromPoint(x, y); return { on: !!hit, hit: hit ? (hit.getAttribute('aria-label') || hit.textContent || hit.tagName).trim().slice(0, 60) : '' } }"
ON_TARGET_JS = "(el, [x, y]) => { const hit = document.elementFromPoint(x, y); return !!hit && (el === hit || el.contains(hit)) }"
VISIBLE_POINT_JS = """(el) => {
  const r = el.getBoundingClientRect(), points = [];
  for (const fx of [0.5, 0.3, 0.7, 0.15, 0.85]) for (const fy of [0.5, 0.3, 0.7, 0.15, 0.85]) points.push([r.left + r.width * fx, r.top + r.height * fy]);
  for (const [x, y] of points) {
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) continue;
    const hit = document.elementFromPoint(x, y);
    if (hit && (hit === el || el.contains(hit))) return { x, y };
  }
  return null;
}"""
MAX_AIMS = 3


def inside_box(box: dict, x: float, y: float) -> bool:
    return box["x"] <= x <= box["x"] + box["width"] and box["y"] <= y <= box["y"] + box["height"]

class Gesture:

    def __init__(self, kind: str, seconds: float, at: Callable[[float], tuple[float, float]], note: dict[str, Any] | None = None) -> None:
        self.kind = kind
        self.seconds = seconds
        self.at = at
        self.note = note or {}


def duration_for(rng: random.Random, chord: float) -> float:
    if chord >= 300:
        return rng.uniform(0.40, 0.52)
    if chord >= 120:
        return rng.uniform(0.42, 0.70)
    return rng.uniform(0.45, 0.90)


def reach(rng: random.Random, sx: float, sy: float, tx: float, ty: float, overshoot: float | None = None) -> list[Gesture]:
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
    warp = rng.uniform(0.50, 0.70)
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


def loops(rng: random.Random, cx: float, cy: float, seconds: float, resting: bool = False) -> Gesture:
    r1, r2 = (rng.uniform(2, 6), rng.uniform(1, 4)) if resting else (rng.uniform(80, 350), rng.uniform(50, 200))
    f1, f2 = rng.uniform(0.15, 0.7), rng.uniform(0.15, 0.5)
    ph1, ph2 = rng.uniform(0, 2 * math.pi), rng.uniform(0, 2 * math.pi)
    dx, dy = (0.0, 0.0) if resting else (rng.uniform(-40, 40), rng.uniform(-20, 40))
    return Gesture("wander", seconds, lambda t: (cx + dx * t + r1 * (math.sin(2 * math.pi * f1 * t + ph1) - math.sin(ph1)),
                                                 cy + dy * t + r2 * (math.sin(2 * math.pi * f2 * t + ph2) - math.sin(ph2))),
                   {"around": [round(cx), round(cy)]})


def ellipse(rng: random.Random, box: dict[str, float], sx: float, sy: float) -> Gesture:
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
    r = rng.random()
    return rng.uniform(1.5, 4.0) if r < 0.15 else rng.uniform(0.3, 1.5) if r < 0.55 else rng.uniform(0.1, 0.3)


def look_for(rng: random.Random) -> float:
    return rng.uniform(0.8, 6.0) if rng.random() < 0.8 else rng.uniform(6.0, 9.0)


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
        self.measured: dict[str, int] | None = None
        self._stop = False
        self._seen_errors: set[str] = set()

    def viewport(self) -> dict[str, int]:
        return self.page.viewport_size or self.measured or {"width": 1280, "height": 800}

    def clamp(self, x: float, y: float) -> tuple[float, float]:
        vp = self.viewport()
        return max(4.0, min(vp["width"] - 4.0, x)), max(4.0, min(vp["height"] - 4.0, y))

    def inside(self, box: dict[str, float], x0: float, x1: float, y0: float, y1: float) -> tuple[float, float]:
        return self.clamp(box["x"] + box["width"] * self.rng.uniform(x0, x1), box["y"] + box["height"] * self.rng.uniform(y0, y1))

    def choose(self, found: list[dict[str, Any]]) -> dict[str, Any] | None:
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
        samples = self.samples
        t_start = samples[0][0] if samples else 0.0
        recording = {"hz": EMIT_HZ, "seconds": round((samples[-1][0] - t_start) if samples else 0.0, 3), "columns": ["t", "x", "y", "left", "right"],
                     "samples": [[round(s[0] - t_start, 4), *s[1:]] for s in samples]}
        out = {"legs": self.legs, "idleMoves": self.idle_moves, "at": [round(self.x or 0), round(self.y or 0)], "recording": recording}
        self.legs, self.idle_moves, self.samples = [], 0, []
        return out


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
            resting = getattr(self, "resting", False)
            await self._run(loops(self.rng, self.x, self.y, seconds, resting), "rest" if resting else "wander", interruptible=True)

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
        vp = self.viewport()
        if self.x is None:
            await self._emit(vp["width"] * 0.5, vp["height"] * 0.45)
        while not self._stop:
            try:
                if self.navigating or self.lock.locked():
                    await asyncio.sleep(0.1)
                    continue
                if self.busy() and time.monotonic() - self.nav_at < 2.5:
                    await asyncio.sleep(0.1)
                    continue
                await self.measure()
                target = None if getattr(self, "resting", False) else self.choose(await self.targets())
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

    async def measure(self) -> None:
        if self.page.viewport_size:
            return
        try:
            size = await self.page.evaluate("() => ({ width: window.innerWidth, height: window.innerHeight })")
            if size and size.get("width") and size.get("height"):
                self.measured = {"width": int(size["width"]), "height": int(size["height"])}
        except Exception:
            pass

    async def approach(self, locator: Any, circle: bool | None = None) -> tuple[float, float]:
        await self.measure()
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

    async def aim(self, locator: Any) -> None:
        for attempt in range(MAX_AIMS):
            await self.measure()
            box = await locator.bounding_box()
            if not box:
                raise RuntimeError("the element has no box on screen")
            x, y = self.x or 0, self.y or 0
            if inside_box(box, x, y) and await locator.evaluate(ON_TARGET_JS, [x, y]):
                return
            self.log(f"  mouse: the target moved from under the cursor ({round(x)},{round(y)} not on it, box {round(box['x'])},{round(box['y'])} {round(box['width'])}x{round(box['height'])}): re-aiming ({attempt + 1}/{MAX_AIMS})")
            await scrollMotion.scroll_into_view(locator, self, self.log)
            box = await locator.bounding_box() or box
            shown = await locator.evaluate(VISIBLE_POINT_JS)
            tx, ty = (shown["x"], shown["y"]) if shown else self.inside(box, 0.3, 0.7, 0.35, 0.65)
            await self.glide(tx, ty, "correct")
            await asyncio.sleep(self.rng.uniform(0.08, 0.2))
        hit = await self.page.evaluate(HIT_JS, [self.x or 0, self.y or 0])
        raise RuntimeError(f"the element kept moving under the cursor: the point is on {hit.get('hit') or 'nothing'}, not the target; nothing pressed")

    async def click(self, locator: Any, circle: bool | None = None) -> None:
        box = await locator.bounding_box()
        x, y = self.x, self.y
        if not (box and x is not None and y is not None and inside_box(box, x, y) and await locator.evaluate(ON_TARGET_JS, [x, y])):
            await self.approach(locator, circle)
        await self.aim(locator)
        self.button = 1
        await self.page.mouse.down()
        self._sampled(self.x or 0, self.y or 0)
        await asyncio.sleep(self.rng.uniform(0.05, 0.14))
        await self.page.mouse.up()
        self.button = 0
        self._sampled(self.x or 0, self.y or 0)
        self.fresh_page = True


SYNC_MICE: dict[int, "SyncHumanMouse"] = {}


class SyncHumanMouse(MouseBase):

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

    def measure(self) -> None:
        if self.page.viewport_size:
            return
        try:
            size = self.page.evaluate("() => ({ width: window.innerWidth, height: window.innerHeight })")
            if size and size.get("width") and size.get("height"):
                self.measured = {"width": int(size["width"]), "height": int(size["height"])}
        except Exception:
            pass

    def approach(self, locator: Any, circle: bool | None = None) -> tuple[float, float]:
        self.measure()
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

    def aim(self, locator: Any) -> None:
        for attempt in range(MAX_AIMS):
            self.measure()
            box = locator.bounding_box()
            if not box:
                raise RuntimeError("the element has no box on screen")
            x, y = self.x or 0, self.y or 0
            if inside_box(box, x, y) and locator.evaluate(ON_TARGET_JS, [x, y]):
                return
            self.log(f"  mouse: the target moved from under the cursor: re-aiming ({attempt + 1}/{MAX_AIMS})")
            scrollMotion.scroll_into_view_sync(locator, self, self.log)
            box = locator.bounding_box() or box
            shown = locator.evaluate(VISIBLE_POINT_JS)
            tx, ty = (shown["x"], shown["y"]) if shown else self.inside(box, 0.3, 0.7, 0.35, 0.65)
            self.glide(tx, ty, "correct")
            time.sleep(self.rng.uniform(0.08, 0.2))
        hit = self.page.evaluate(HIT_JS, [self.x or 0, self.y or 0])
        raise RuntimeError(f"the element kept moving under the cursor: the point is on {hit.get('hit') or 'nothing'}, not the target; nothing pressed")

    def click(self, locator: Any, circle: bool | None = None) -> None:
        self.approach(locator, circle)
        self.aim(locator)
        self.button = 1
        self.page.mouse.down()
        self._sampled(self.x or 0, self.y or 0)
        time.sleep(self.rng.uniform(0.05, 0.14))
        self.page.mouse.up()
        self.button = 0
        self._sampled(self.x or 0, self.y or 0)
        self.fresh_page = True


def human_scroll_into_view(locator: Any) -> None:
    mouse = SYNC_MICE.get(id(locator.page))
    scrollMotion.scroll_into_view_sync(locator, mouse if mouse is not None and not mouse._stop else None, mouse.log if mouse else (lambda _l: None))


def human_scroll_by(page: Any, distance: float) -> None:
    mouse = SYNC_MICE.get(id(page))
    scrollMotion.scroll_by_sync(page, distance, mouse if mouse is not None and not mouse._stop else None, mouse.log if mouse else (lambda _l: None))


def human_click(locator: Any, circle: bool | None = None, timeout: int = 8000) -> None:
    mouse = SYNC_MICE.get(id(locator.page))
    if mouse is None or mouse._stop:
        locator.click(timeout=timeout)
        return
    mouse.click(locator, circle)
