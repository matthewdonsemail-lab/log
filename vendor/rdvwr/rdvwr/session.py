from __future__ import annotations

import base64
import json
import time
from typing import Any

from .errors import NotLoggedIn, raise_for
from .transport import Transport

TOKEN_MARGIN = 300


def jwt_exp(token: str) -> float:
    try:
        payload = token.split(".")[1]
        return float(json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))["exp"])
    except Exception:
        return time.time() + 3600


class Session:
    def __init__(self, transport: Transport) -> None:
        self.transport = transport
        self.token: str | None = None
        self.token_exp = 0.0
        self.shreddit: dict[str, Any] | None = None

    async def whoami(self) -> dict[str, Any] | None:
        response = await self.transport.request("GET", "/api/me.json", headers={"Accept": "application/json"})
        if response.status_code in (401, 403):
            return None
        raise_for(response, "whoami")
        try:
            data = (response.json() or {}).get("data") or {}
        except ValueError:
            return None
        return data if data.get("name") else None

    def forget_token(self) -> None:
        self.token = None
        self.token_exp = 0.0

    async def access_token(self) -> str:
        if self.token and time.time() < self.token_exp - TOKEN_MARGIN:
            return self.token
        held = self.transport.cookie("token_v2")
        if held and time.time() < jwt_exp(held) - TOKEN_MARGIN:
            self.token, self.token_exp = held, jwt_exp(held)
            return held
        self.transport.drop_cookie("token_v2")
        response = await self.transport.request("GET", "/", headers={"Accept": "text/html"})
        minted = self.transport.cookie("token_v2")
        if not minted:
            raise NotLoggedIn(f"Reddit gave no token_v2 for these cookies (HTTP {response.status_code}): the session has probably expired")
        self.token, self.token_exp = minted, jwt_exp(minted)
        return minted

    async def csrf_token(self) -> str:
        held = self.transport.cookie("csrf_token")
        if held:
            return held
        await self.transport.request("GET", "/", headers={"Accept": "text/html"})
        minted = self.transport.cookie("csrf_token")
        if not minted:
            raise NotLoggedIn("Reddit set no csrf_token cookie")
        return minted

    async def shreddit_token(self) -> dict[str, Any]:
        if self.shreddit and float(self.shreddit.get("expires") or 0) * 1000 > (time.time() + TOKEN_MARGIN) * 1000:
            return self.shreddit
        csrf = await self.csrf_token()
        response = await self.transport.request(
            "POST",
            "/svc/shreddit/token",
            headers={"Accept": "application/json", "Content-Type": "application/json", "Origin": "https://www.reddit.com", "Referer": "https://www.reddit.com/"},
            json={"csrf_token": csrf},
        )
        raise_for(response, "shreddit token")
        self.shreddit = response.json()
        return self.shreddit
