from __future__ import annotations

import threading
from typing import Any

from discordApi import browserIdentity

DROPPED = {"user-agent", "x-super-properties", "sec-fetch-site", "sec-fetch-mode", "sec-fetch-dest", "priority", "accept"}


def browser_discord(token: str, identity: dict[str, Any], launched: dict[str, str], session_factory: Any = None) -> Any:
    from endcord import discord

    class BrowserDiscord(discord.Discord):
        def request(self, method: str, path: str, body: Any = None, headers: Any = None, timeout: Any = None, exit_on_error: bool = False) -> tuple[Any, Any]:
            merged = browserIdentity.rest_headers(identity, token, launched)
            for name, value in (headers or {}).items():
                if name.lower() not in DROPPED:
                    merged[name] = value
            try:
                with lock:
                    answer = session.request(method, f"{browserIdentity.ORIGIN}{path}", data=body, headers=merged, timeout=timeout or 20, allow_redirects=False)
            except Exception as error:
                if exit_on_error:
                    raise SystemExit(f"Network error: {error}") from error
                return None, None
            return answer.content, answer.status_code

    lock = threading.Lock()
    if session_factory:
        session = session_factory()
    else:
        from curl_cffi.requests import Session

        session = Session(impersonate=browserIdentity.IMPERSONATE)
    return BrowserDiscord(token, None, browserIdentity.super_properties(identity, launched), identity["headers"]["user-agent"])
