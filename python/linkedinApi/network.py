from __future__ import annotations

import json
import re
import secrets
import base64
from typing import Any
from urllib.parse import unquote

from linkedinApi.share import ORIGIN, Composer, ShareRefused, fill, template

GROW_SCREEN = "com.linkedin.sdui.flagshipnav.mynetwork.Grow"
CONNECT_REQUEST = "com.linkedin.sdui.requests.mynetwork.addaAddConnection"
NETWORK_PAGE_KEY = "p_mwlite_my_network"
NETWORK_REFERER = f"{ORIGIN}/mynetwork/grow/"
FEED_PAGE_KEY = "d_flagship3_feed"
RECORDED_SDUI_VERSION = "0.2.4926"
RETRY_FIELDS = ("maxRetries", "backOffMultiplier", "maxSeconds")
SERVER_REQUEST = re.compile(r'\{"\$type":"proto\.sdui\.actions\.core\.ServerRequest","value":')
FOLLOW_UPS = (
    ("com.linkedin.sdui.requests.mynetwork.mojoTabsBadge", "mojoTabsBadge"),
    ("com.linkedin.sdui.requests.mynetwork.addaMarkNotificationsSeen", "markNotificationsSeen"),
    ("com.linkedin.sdui.requests.mynetwork.addaClearUnseenInvitationsMutation", "clearUnseenInvitations"),
)


def public_id_of(url: str) -> str:
    found = re.search(r"/in/([^/?#]+)", url)
    return unquote(found.group(1)).strip().lower() if found else ""


def cards_of(page: str) -> list[dict[str, Any]]:
    decoder = json.JSONDecoder()
    cards: list[dict[str, Any]] = []
    seen: set[str] = set()
    for at in SERVER_REQUEST.finditer(page):
        try:
            request, _ = decoder.raw_decode(page, at.end())
        except ValueError:
            continue
        if not isinstance(request, dict) or request.get("requestId") != CONNECT_REQUEST:
            continue
        payload = ((request.get("requestedArguments") or {}).get("payload")) or {}
        member = str(((payload.get("inviteeUrn") or {}).get("memberId")) or "")
        url = str(payload.get("profileCanonicalUrl") or "")
        if not member or member in seen:
            continue
        seen.add(member)
        cards.append({
            "name": " ".join(x for x in (payload.get("firstName"), payload.get("lastName")) if x),
            "publicId": public_id_of(url),
            "profileUrl": url,
            "memberId": member,
            "origin": str(payload.get("origin") or ""),
            "request": request,
        })
    return cards


def connect_body(request: dict[str, Any]) -> dict[str, Any]:
    server = {k: v for k, v in request.items() if k not in RETRY_FIELDS}
    arguments = dict(request.get("requestedArguments") or {})
    arguments.update({"states": [], "screenId": GROW_SCREEN, "knownTemplateIds": []})
    return {"requestId": request["requestId"], "serverRequest": server, "states": [], "requestedArguments": arguments}


def toast_of(text: str) -> str:
    found = re.search(r'"presetToast":\{"category":"ToastPresetCategory_ERROR","text":\["([^"]{0,200})', text)
    return found.group(1) if found else ""


class Network(Composer):
    def __init__(self, session: Any, cookies: dict[str, str], browser: dict[str, str], log: Any = None, sleep: Any = None) -> None:
        super().__init__(session, cookies, browser, log=log, sleep=sleep)
        self.cookies = cookies
        self.page_key = FEED_PAGE_KEY
        self.referer = f"{ORIGIN}/mynetwork"

    def sdui_version(self) -> str:
        found = re.search(r"0\.2\.\d+", self.cookies.get("sdui_ver", ""))
        return found.group(0) if found else RECORDED_SDUI_VERSION

    def open_network(self) -> list[dict[str, Any]]:
        self.version_from_feed()
        self.pause(1.0, 2.5)
        page = self.action("MyNetwork", f"{ORIGIN}/flagship-web/mynetwork", fill(template("myNetwork"), {"sduiVersion": self.sdui_version()}))
        self.page_key = NETWORK_PAGE_KEY
        self.referer = NETWORK_REFERER
        self.tracking = base64.b64encode(secrets.token_bytes(16)).decode()
        for request_id, name in FOLLOW_UPS:
            self.pause(0.1, 0.4)
            try:
                self.server_request(request_id, template(name))
            except ShareRefused as refused:
                if refused.code in ("rateLimited", "sessionRevoked", "sessionDead"):
                    raise
                self.follow_up_stopped = {"call": name, "code": refused.code}
                self.log(f"linkedin {name} refused ({refused.code}): the rest of My Network's follow-ups were skipped, nothing is retried")
                break
        cards = cards_of(page)
        if not cards:
            raise ShareRefused("templateStale", "LinkedIn's My Network answer had no Connect buttons: its page changed, record it again")
        return cards

    def suggestions(self) -> dict[str, Any]:
        cards = self.open_network()
        out: dict[str, Any] = {"people": [{k: v for k, v in c.items() if k != "request"} for c in cards]}
        if self.follow_up_stopped:
            out["followUpStopped"] = self.follow_up_stopped
        return out

    def connect(self, public_id: str) -> dict[str, Any]:
        wanted = public_id.strip().lower()
        cards = self.open_network()
        card = next((c for c in cards if c["publicId"] == wanted), None)
        if not card:
            offered = ", ".join(f"{c['name']} ({c['publicId']})" for c in cards[:10])
            raise ShareRefused("profileNotSuggested", f"{public_id} isn't among the people LinkedIn suggests on My Network right now, and connect only sends what a suggestion's own Connect button sends. Suggested: {offered}")
        self.pause(2.0, 5.0)
        text = self.server_request(CONNECT_REQUEST, connect_body(card["request"]))
        toast = toast_of(text)
        if toast or '"stringValue":"Pending"' not in text:
            raise ShareRefused("connectRefused", f"LinkedIn didn't send the invitation to {card['name']}: {toast or 'its answer never set the invitation to Pending'}. Nothing is retried (rule 94)", event="throttled")
        out: dict[str, Any] = {"connected": {k: v for k, v in card.items() if k != "request"}, "invitation": "Pending"}
        if self.follow_up_stopped:
            out["followUpStopped"] = self.follow_up_stopped
        return out
