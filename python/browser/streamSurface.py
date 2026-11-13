from __future__ import annotations

import asyncio
import os
import time
from typing import Any
from urllib.parse import urlsplit

CACHE_SECONDS = 3.0
_cache: dict[int, tuple[float, dict[str, int] | None]] = {}


def configured() -> str | None:
    url = os.environ.get("LOG_VOXL_URL", "").strip()
    if not url:
        return None
    parts = urlsplit(url)
    if parts.scheme not in {"http", "https"} or not parts.hostname:
        return None
    return url


def box_of(answer: Any) -> dict[str, Any]:
    return (answer or {}).get("bounds") or {}


def ints_of(box: dict[str, Any]) -> tuple[int, int] | None:
    values = [box.get(key) for key in ("left", "top")]
    if not all(isinstance(value, int) for value in values):
        return None
    return values[0], values[1]


async def composite(page: Any) -> tuple[int, int] | None:
    session = None
    try:
        session = await page.context.new_cdp_session(page)
        target = await session.send("Browser.getWindowForTarget")
        window_id = target.get("windowId")
        if not isinstance(window_id, int):
            return None
        answer = await session.send("Browser.getWindowBounds", {"windowId": window_id})
        box = box_of(answer)
        if box.get("windowState") not in {None, "fullscreen"}:
            await session.send("Browser.setWindowBounds", {"windowId": window_id, "bounds": {"windowState": "fullscreen"}})
            await asyncio.sleep(0.2)
            box = box_of(await session.send("Browser.getWindowBounds", {"windowId": window_id}))
            if box.get("windowState") not in {None, "fullscreen"}:
                return None
        origin = ints_of(box)
        return origin if origin and origin[0] >= 0 and origin[1] >= 0 else (0, 0)
    except Exception:
        return None
    finally:
        if session is not None:
            try:
                await session.detach()
            except Exception:
                pass


async def origin_of(owner: Any) -> tuple[int, int] | None:
    key = id(owner)
    held = _cache.get(key)
    now = time.monotonic()
    if held and now - held[0] < CACHE_SECONDS:
        return held[1]
    value = await composite(owner.page)
    _cache[key] = (now, value)
    return value


async def surface(owner: Any) -> dict[str, Any] | None:
    url = configured()
    if not url:
        return None
    origin = await origin_of(owner)
    if origin is None:
        return None
    try:
        size = await owner.page.evaluate("() => ({width: innerWidth, height: innerHeight})")
    except Exception:
        return None
    if not isinstance(size, dict):
        return None
    viewport = {"width": int(size.get("width") or 0), "height": int(size.get("height") or 0)}
    if viewport["width"] <= 0 or viewport["height"] <= 0:
        return None
    return {"kind": "voxl", "url": url, "page": viewport, "window": {"left": origin[0], "top": origin[1], "width": viewport["width"], "height": viewport["height"]}}
