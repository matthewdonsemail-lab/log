"""How every Camoufox in log-cli launches: headed, humanized, cursor shown.

AGENTS.md rule 11 (matt, 2026-10-18): Camoufox is never headless. Whenever it
launches you can see the window, humanize is on, and the cursor is drawn so
you can watch it move. There is no flag to turn any of this off.

Every launch also goes through the proxy gate (proxyGate.py, AGENTS.md rules
12, 15-17): the account's proxy attached and its exit IP in the account's
country, launched as the account's one device in its pinned locale, then the
self-check. launch_kwargs() is the only way to get launch options, and they
are always {"from_options": <what the gate built>}. There is no ungated
helper. publishSession.py calls it directly. logWorker.py launches through
facebook-camofox-client, so it calls force_visible() first, which wraps
Camoufox's launchers (module and package names) so whatever the caller
passes, the gate builds the launch. Anything that still reaches Playwright
another way is refused by the gate's launch guard.
"""
from __future__ import annotations

from typing import Any

import proxyGate

# humanize must be a float: a bool hangs mouse.move on current builds
# (facebook-camofox-client session_manager.py).
# 0.6 s: a hand crosses a screen in about 0.3-0.6 s; 1.5 s made every long move a slow wobble (rule 32).
HUMANIZE_MAX_SECONDS = 0.6

VISIBLE_LAUNCH: dict[str, Any] = {"headless": False, "humanize": HUMANIZE_MAX_SECONDS, "showcursor": True}


# Sessions where python/humanMouse.py draws every trajectory itself (inspect, flow; rule 32): humanize stays
# on, but its per-hop curve is capped at 20 ms so our velocity profile owns the clock. Measured 2026-10-19
# with the 0.6 s cap: a 100 px hop cost 530 ms and a 5 px hop 100 ms, so 60 Hz emission ran at 2 Hz.
HUMANIZE_HOP_SECONDS = 0.02


def launch_kwargs(kwargs: dict[str, Any], own_trajectory: bool = False) -> dict[str, Any]:
    """Proxy gate, device, locale, visible: the only launch kwargs any Camoufox in log-cli gets."""
    visible = {**VISIBLE_LAUNCH, "humanize": HUMANIZE_HOP_SECONDS} if own_trajectory else VISIBLE_LAUNCH
    return proxyGate.apply(kwargs, visible)


def force_visible() -> None:
    """Make every Camoufox launched after this go through launch_kwargs()."""
    import camoufox
    import camoufox.async_api as async_api
    import camoufox.sync_api as sync_api

    for module, name in ((async_api, "AsyncCamoufox"), (sync_api, "Camoufox"), (camoufox, "AsyncCamoufox"), (camoufox, "Camoufox")):
        original = getattr(module, name)
        if getattr(original, "_logCliVisible", False):
            continue

        def launcher(*args: Any, _original=original, **kwargs: Any):
            if args:
                raise proxyGate.GateError("unguardedLaunch", "positional Camoufox launch arguments")
            return _original(**launch_kwargs(kwargs))

        launcher._logCliVisible = True  # type: ignore[attr-defined]
        setattr(module, name, launcher)
