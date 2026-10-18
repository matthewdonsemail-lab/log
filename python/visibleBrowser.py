"""How every Camoufox in log-cli launches: headed, humanized, cursor shown.

AGENTS.md rule 11 (matt, 2026-10-18): Camoufox is never headless. Whenever it
launches you can see the window, humanize is on, and the cursor is drawn so
you can watch it move. There is no flag to turn any of this off.

publishSession.py launches with VISIBLE_LAUNCH directly. logWorker.py launches
through facebook-camofox-client, so it calls force_visible() first, which
wraps Camoufox's launchers so the same settings win whatever the caller passes.
"""
from __future__ import annotations

from typing import Any

# humanize must be a float: a bool hangs mouse.move on current builds
# (facebook-camofox-client session_manager.py).
HUMANIZE_MAX_SECONDS = 1.5

VISIBLE_LAUNCH: dict[str, Any] = {"headless": False, "humanize": HUMANIZE_MAX_SECONDS}


def visible_kwargs(kwargs: dict[str, Any]) -> dict[str, Any]:
    """The caller's launch kwargs with headed, humanize and the cursor forced on."""
    config = dict(kwargs.get("config") or {})
    config["showcursor"] = True
    return {**kwargs, **VISIBLE_LAUNCH, "config": config}


def force_visible() -> None:
    """Make every Camoufox launched after this headed, humanized, with the cursor shown."""
    import camoufox.async_api as async_api
    import camoufox.sync_api as sync_api

    for module, name in ((async_api, "AsyncCamoufox"), (sync_api, "Camoufox")):
        original = getattr(module, name)
        if getattr(original, "_logCliVisible", False):
            continue

        def launcher(*args: Any, _original=original, **kwargs: Any):
            return _original(*args, **visible_kwargs(kwargs))

        launcher._logCliVisible = True  # type: ignore[attr-defined]
        setattr(module, name, launcher)
