from __future__ import annotations

from typing import Any

from browser import proxyGate

HUMANIZE_MAX_SECONDS = 0.6

VISIBLE_LAUNCH: dict[str, Any] = {"headless": False, "humanize": HUMANIZE_MAX_SECONDS, "showcursor": True}


HUMANIZE_HOP_SECONDS = 0.02


def launch_kwargs(kwargs: dict[str, Any], own_trajectory: bool = False) -> dict[str, Any]:
    visible = {**VISIBLE_LAUNCH, "humanize": HUMANIZE_HOP_SECONDS} if own_trajectory else VISIBLE_LAUNCH
    return proxyGate.apply(kwargs, visible)


def force_visible() -> None:
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

        launcher._logCliVisible = True
        setattr(module, name, launcher)
