from __future__ import annotations

import json
import os
import time
import uuid
from datetime import datetime, timezone
from typing import Any
from urllib.parse import quote

from linkedinApi.share import ORIGIN, Composer, ShareRefused
from platformKit import media

VOYAGER = f"{ORIGIN}/voyager/api"
GRAPHQL = f"{VOYAGER}/voyagerMessagingGraphQL/graphql"
CONVERSATIONS_QUERY = "messengerConversations.cee0648f17e09c88a360194008a806c5"
MESSAGES_QUERY = "messengerMessages.b88ffdf26effae7a346a4df9ee0e764c"
RECORDED_VOYAGER_VERSION = "1.13.48229"
PRELOAD_REFERER = f"{ORIGIN}/preload/?_bprMode=vanilla"
INBOX_PAGE = "d_messaging_index"
THREAD_PAGE = "d_flagship3_messaging_conversation_detail"
INBOX_COUNT = 20
MESSAGES = f"{VOYAGER}/voyagerMessagingDashMessengerMessages"
CONVERSATIONS = f"{VOYAGER}/voyagerMessagingDashMessengerConversations"
MESSAGE_MAX = 8000


def text_of(node: Any) -> str:
    return str(node.get("text") or "") if isinstance(node, dict) else ""


def when_of(ms: Any) -> str | None:
    try:
        return datetime.fromtimestamp(int(ms) / 1000, tz=timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    except (TypeError, ValueError, OverflowError, OSError):
        return None


def person_of(participant: Any) -> dict[str, Any]:
    participant = participant if isinstance(participant, dict) else {}
    kinds = participant.get("participantType") or {}
    member = kinds.get("member") or {}
    organization = kinds.get("organization") or {}
    name = " ".join(x for x in (text_of(member.get("firstName")), text_of(member.get("lastName"))) if x) or text_of(organization.get("name")) or text_of((kinds.get("custom") or {}).get("name"))
    host = str(participant.get("hostIdentityUrn") or "")
    return {
        "name": name,
        "profileId": host.rsplit(":", 1)[-1] if host else "",
        "profileUrl": str(member.get("profileUrl") or organization.get("pageUrl") or ""),
        "headline": text_of(member.get("headline")),
    }


def attachment_of(content: Any) -> dict[str, Any] | None:
    if not isinstance(content, dict):
        return None
    file = content.get("file")
    if isinstance(file, dict):
        return {"name": str(file.get("name") or "file"), "type": str(file.get("mediaType") or ""), "url": str(file.get("url") or ""), "size": file.get("byteSize")}
    audio = content.get("audio")
    if isinstance(audio, dict):
        return {"name": "voice message", "type": "audio/", "url": str(audio.get("url") or ""), "duration": audio.get("duration")}
    image = content.get("vectorImage")
    if isinstance(image, dict):
        artifacts = [a for a in image.get("artifacts") or [] if isinstance(a, dict)]
        biggest = max(artifacts, key=lambda a: int(a.get("width") or 0), default={})
        return {"name": "image", "type": "image/", "url": str(image.get("rootUrl") or "") + str(biggest.get("fileIdentifyingUrlPathSegment") or "")}
    video = content.get("video")
    if isinstance(video, dict):
        streams = [s for s in video.get("progressiveStreams") or [] if isinstance(s, dict)]
        locations = [loc for s in streams for loc in s.get("streamingLocations") or [] if isinstance(loc, dict)]
        return {"name": "video", "type": "video/", "url": str((locations[0] if locations else {}).get("url") or "")}
    external = content.get("externalMedia")
    if isinstance(external, dict):
        inner = external.get("media") or {}
        return {"name": str(external.get("title") or "media"), "type": "image/", "url": str(inner.get("url") or "") if isinstance(inner, dict) else ""}
    return None


def message_of(element: dict[str, Any], mailbox: str) -> dict[str, Any]:
    sender = element.get("sender") or {}
    attachments = [a for a in (attachment_of(c) for c in element.get("renderContent") or []) if a]
    return {
        "at": when_of(element.get("deliveredAt")),
        "from": person_of(sender)["name"],
        "fromMe": str(sender.get("hostIdentityUrn") or "") == mailbox,
        "text": media.text_with_audio(text_of(element.get("body")) or str(element.get("renderContentFallbackText") or ""), attachments),
        "attachments": attachments,
        "messageUrn": str(element.get("entityUrn") or ""),
    }


def collection_of(answer: dict[str, Any], name: str) -> dict[str, Any]:
    errors = answer.get("errors") or []
    if errors:
        raise ShareRefused("linkedinRefused", f"LinkedIn answered {name} with errors: {'; '.join(str(e.get('message') or e) for e in errors)[:400]}")
    data = answer.get("data") or {}
    found = next((v for k, v in data.items() if not k.startswith("_") and isinstance(v, dict)), None)
    if found is None or not isinstance(found.get("elements"), list):
        raise ShareRefused("templateStale", f"LinkedIn's {name} answer had no elements: its messaging changed, record it again")
    return found


def conversation_of(element: dict[str, Any], mailbox: str) -> dict[str, Any]:
    people = [person_of(p) for p in element.get("conversationParticipants") or [] if str((p or {}).get("hostIdentityUrn") or "") != mailbox]
    last = ((element.get("messages") or {}).get("elements") or [None])[0]
    out: dict[str, Any] = {
        "conversationUrn": str(element.get("entityUrn") or ""),
        "people": people,
        "groupChat": bool(element.get("groupChat")),
        "unreadCount": int(element.get("unreadCount") or 0),
        "lastActivityAt": when_of(element.get("lastActivityAt")),
        "url": str(element.get("conversationUrl") or ""),
    }
    if isinstance(last, dict):
        out["last"] = message_of(last, mailbox)
    return out


def matches(conversation: dict[str, Any], wanted: str) -> bool:
    want = " ".join(wanted.split()).casefold()
    for person in conversation["people"]:
        if want in (person["profileId"].casefold(), " ".join(person["name"].split()).casefold()):
            return True
        if want and person["profileUrl"].rstrip("/").casefold().endswith("/" + want):
            return True
    return False


def voyager_track(browser: dict[str, str]) -> str:
    saved = browser.get("xLiTrack") or ""
    try:
        parsed = json.loads(saved) if saved else {}
    except ValueError:
        parsed = {}
    if isinstance(parsed, dict) and parsed.get("mpName") == "voyager-web" and parsed.get("clientVersion"):
        return saved
    now = datetime.now().astimezone()
    offset = now.utcoffset()
    zone = getattr(now.tzinfo, "key", None) or "America/Vancouver"
    return json.dumps({"clientVersion": RECORDED_VOYAGER_VERSION, "mpVersion": RECORDED_VOYAGER_VERSION, "osName": "web", "timezoneOffset": int(offset.total_seconds() // 3600) if offset else 0, "timezone": zone, "deviceFormFactor": "DESKTOP", "mpName": "voyager-web", "displayDensity": 1, "displayWidth": 1920, "displayHeight": 1080}, separators=(",", ":"))


def tracking_id() -> str:
    return "".join(chr(b) for b in os.urandom(16))


def message_body(conversation_urn: str, mailbox: str, text: str) -> dict[str, Any]:
    return {"message": {"body": {"attributes": [], "text": text}, "renderContentUnions": [], "conversationUrn": conversation_urn, "originToken": str(uuid.uuid4())}, "mailboxUrn": mailbox, "trackingId": tracking_id(), "dedupeByClientGeneratedToken": False}


def sent_message(answer: dict[str, Any], text: str) -> dict[str, Any] | None:
    value = answer.get("value") if isinstance(answer.get("value"), dict) else {}
    urn = str(value.get("entityUrn") or "")
    if not urn.startswith("urn:li:msg_message:") or ((value.get("body") or {}).get("text") or "") != text:
        return None
    return {"messageUrn": urn, "deliveredAt": when_of(value.get("deliveredAt"))}


class Messaging(Composer):
    def __init__(self, session: Any, cookies: dict[str, str], browser: dict[str, str], log: Any = None, sleep: Any = None, now: Any = None) -> None:
        super().__init__(session, cookies, browser, log=log, sleep=sleep)
        self.now = now or time.time
        self.mailbox = ""

    def voyager_headers(self, page: str, accept: str) -> dict[str, str]:
        headers = self.base_headers()
        headers.update({
            "accept": accept,
            "csrf-token": self.csrf,
            "referer": PRELOAD_REFERER,
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-li-lang": "en_US",
            "x-li-page-instance": f"urn:li:page:{page};{self.tracking}",
            "x-li-track": voyager_track(self.browser),
            "x-restli-protocol-version": "2.0.0",
        })
        return headers

    def get_json(self, name: str, url: str, page: str, accept: str = "application/graphql") -> dict[str, Any]:
        text = self.check(name, self.session.get(url, headers=self.voyager_headers(page, accept), allow_redirects=False))
        try:
            answer = json.loads(text or "{}")
        except ValueError as error:
            raise ShareRefused("templateStale", f"LinkedIn's {name} answer wasn't JSON") from error
        return answer if isinstance(answer, dict) else {}

    def open_mailbox(self) -> None:
        self.version_from_feed()
        self.pause(1.0, 2.5)
        me = self.get_json("me", f"{VOYAGER}/me", INBOX_PAGE, "application/vnd.linkedin.normalized+json+2.1")
        mini = me.get("miniProfile") or next((x for x in me.get("included") or [] if str(x.get("$type", "")).endswith("MiniProfile")), {})
        member = str(mini.get("dashEntityUrn") or mini.get("entityUrn") or "").rsplit(":", 1)[-1]
        if not member.startswith("ACoA"):
            raise ShareRefused("templateStale", "LinkedIn's /voyager/api/me answer named no profile id, so the account's mailbox isn't known")
        self.mailbox = f"urn:li:fsd_profile:{member}"

    def conversations(self) -> list[dict[str, Any]]:
        variables = f"(query:(predicateUnions:List((conversationCategoryPredicate:(category:PRIMARY_INBOX)))),count:{INBOX_COUNT},mailboxUrn:{quote(self.mailbox, safe='')},lastUpdatedBefore:{int(self.now() * 1000)})"
        answer = self.get_json("messengerConversations", f"{GRAPHQL}?queryId={CONVERSATIONS_QUERY}&variables={variables}", INBOX_PAGE)
        return [conversation_of(e, self.mailbox) for e in collection_of(answer, "messengerConversations")["elements"] if isinstance(e, dict)]

    def thread(self, conversation_urn: str) -> list[dict[str, Any]]:
        answer = self.get_json("messengerMessages", f"{GRAPHQL}?queryId={MESSAGES_QUERY}&variables=(conversationUrn:{quote(conversation_urn, safe='')})", THREAD_PAGE)
        found = [e for e in collection_of(answer, "messengerMessages")["elements"] if isinstance(e, dict)]
        return [message_of(e, self.mailbox) for e in sorted(found, key=lambda e: int(e.get("deliveredAt") or 0))]

    def inbox(self) -> dict[str, Any]:
        self.open_mailbox()
        self.pause(0.3, 0.9)
        return {"conversations": self.conversations()}

    def post_json(self, name: str, url: str, body: dict[str, Any], page: str) -> str:
        headers = self.voyager_headers(page, "application/json")
        headers["content-type"] = "text/plain;charset=UTF-8"
        return self.check(name, self.session.post(url, headers=headers, data=json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode("utf-8"), allow_redirects=False))

    def chosen(self, conversation_urn: str, with_whom: str) -> dict[str, Any]:
        listed = self.conversations()
        if conversation_urn:
            chosen = [c for c in listed if c["conversationUrn"] == conversation_urn] or [{"conversationUrn": conversation_urn, "people": []}]
        else:
            chosen = [c for c in listed if matches(c, with_whom)]
            if not chosen:
                offered = ", ".join(", ".join(p["name"] for p in c["people"]) for c in listed[:10]) or "nobody"
                raise ShareRefused("conversationNotFound", f"none of the account's {len(listed)} newest conversations is with {with_whom}. The newest are with: {offered}")
            if len(chosen) > 1:
                raise ShareRefused("conversationAmbiguous", f"{len(chosen)} of the newest conversations are with {with_whom}: pass --conversation with one of {', '.join(c['conversationUrn'] for c in chosen)}")
        return chosen[0]

    def messages(self, conversation_urn: str = "", with_whom: str = "") -> dict[str, Any]:
        self.open_mailbox()
        self.pause(0.3, 0.9)
        conversation = self.chosen(conversation_urn, with_whom)
        self.pause(0.8, 2.0)
        return {"conversation": conversation, "messages": self.thread(conversation["conversationUrn"])}

    def send(self, parts: list[str], conversation_urn: str = "", with_whom: str = "") -> dict[str, Any]:
        if not parts or any(not p.strip() or len(p) > MESSAGE_MAX for p in parts):
            raise ShareRefused("messageInvalid", f"a LinkedIn message needs text in every part, at most {MESSAGE_MAX} characters each")
        self.open_mailbox()
        self.pause(0.3, 0.9)
        conversation = self.chosen(conversation_urn, with_whom)
        urn = conversation["conversationUrn"]
        self.pause(0.8, 2.0)
        self.thread(urn)
        self.pause(2.0, 5.0)
        sent: list[dict[str, Any]] = []
        for part in parts:
            self.post_json("typing", f"{CONVERSATIONS}?action=typing", {"conversationUrn": urn}, THREAD_PAGE)
            self.pause(min(12.0, 1.5 + len(part) / 9), min(20.0, 3.0 + len(part) / 6))
            text_answer = self.post_json("createMessage", f"{MESSAGES}?action=createMessage", message_body(urn, self.mailbox, part), THREAD_PAGE)
            try:
                answer = json.loads(text_answer or "{}")
            except ValueError:
                answer = {}
            confirmed = sent_message(answer if isinstance(answer, dict) else {}, part)
            if not confirmed:
                raise ShareRefused("messageUnconfirmed", f"LinkedIn's answer to part {len(sent) + 1} of {len(parts)} named no message with that text in {urn}, so it isn't known to be sent; {len(sent)} went before it. Nothing is retried (rule 94)", sent=sent)
            sent.append({**confirmed, "text": part})
            if len(sent) < len(parts):
                self.pause(1.0, 3.0)
        return {"conversation": conversation, "sent": sent}
