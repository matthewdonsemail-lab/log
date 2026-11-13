from __future__ import annotations

import base64
import json
import mimetypes
import random
import re
import secrets
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Any

TEMPLATES = Path(__file__).resolve().parent / "templates"
ORIGIN = "https://www.linkedin.com"
ACTIONS = f"{ORIGIN}/flagship-web/rsc-action/actions/"
COMPOSE_REFERER = f"{ORIGIN}/sharing/compose"
PAGE_KEY = "p_mwlite_feed_share_v2"
VERSION = re.compile(r"^0\.2\.\d{3,6}\.\d+$")
VERSION_HEADER = "x-li-application-version"
MENTION = re.compile(r"@\[([^\]\n|]{1,100})(?:\|([A-Za-z0-9_-]{1,64}))?\]")
IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif"}
IMAGE_MAX_BYTES = 20 * 1024 * 1024
TEXT_MAX = 3000
PLACEHOLDER = re.compile(r"\{\{(\w+)\}\}")


class ShareRefused(Exception):
    def __init__(self, code: str, detail: str, **extra: Any) -> None:
        super().__init__(detail)
        self.code = code
        self.detail = detail
        self.extra = extra


def template(name: str) -> dict[str, Any]:
    return json.loads((TEMPLATES / f"{name}.json").read_text(encoding="utf-8"))


def fill(node: Any, values: dict[str, Any]) -> Any:
    if isinstance(node, dict):
        return {k: fill(v, values) for k, v in node.items()}
    if isinstance(node, list):
        return [fill(v, values) for v in node]
    if isinstance(node, str):
        whole = PLACEHOLDER.fullmatch(node)
        if whole and whole.group(1) in values:
            return values[whole.group(1)]
        return PLACEHOLDER.sub(lambda m: str(values[m.group(1)]) if m.group(1) in values else m.group(0), node)
    return node


def set_state(body: dict[str, Any], key: str, value: Any) -> None:
    for state in body.get("states") or []:
        if state.get("key") == key:
            state["value"] = value
            return
    raise ShareRefused("templateStale", f"the recorded request has no state {key}: LinkedIn's composer changed, record it again")


def frames(text: str) -> dict[str, Any]:
    for line in text.splitlines():
        head, _, rest = line.partition(":")
        if head == "0" and rest.startswith("{"):
            try:
                return json.loads(rest)
            except ValueError:
                return {}
    return {}


def errors_of(text: str) -> list[str]:
    response = frames(text).get("response") or {}
    return [str(e.get("message") or e) for e in response.get("errors") or []]


def image_of(path: str) -> dict[str, Any]:
    file = Path(path)
    if not file.is_file():
        raise ShareRefused("fileRefused", f"{path} isn't a file")
    data = file.read_bytes()
    if len(data) > IMAGE_MAX_BYTES:
        raise ShareRefused("fileRefused", f"{file.name} is over 20 MB")
    mime = mimetypes.guess_type(file.name)[0] or ""
    if mime not in IMAGE_TYPES:
        raise ShareRefused("fileRefused", f"{file.name} isn't a JPEG, PNG or GIF")
    from PIL import Image

    with Image.open(file) as img:
        width, height = img.size
    return {"data": data, "fileName": file.name, "mimeType": mime, "size": str(len(data)), "width": width, "height": height}


def text_model(text: str, attributes: list[dict[str, Any]] | None = None) -> dict[str, Any]:
    return {"text": text, "attribute": attributes or [], "$type": "TextModel", "source": "local"}


def units(text: str) -> int:
    return sum(2 if ord(ch) > 0xFFFF else 1 for ch in text)


def candidates_of(answer: str) -> list[dict[str, Any]]:
    decoder = json.JSONDecoder()
    found: list[dict[str, Any]] = []
    seen: set[str] = set()
    for at in re.finditer(r'"textModelForWrite":', answer):
        try:
            model, _ = decoder.raw_decode(answer, at.end())
        except ValueError:
            continue
        if not isinstance(model, dict):
            continue
        attributes = [a for a in model.get("attribute") or [] if isinstance(a, dict)]
        ids = [str(((a.get("type") or {}).get("mention") or {}).get("entityID")) for a in attributes if (a.get("type") or {}).get("$case") == "mention"]
        if not ids or ids[0] in seen:
            continue
        seen.add(ids[0])
        found.append({"name": str(model.get("text") or ""), "entityID": ids[0], "attribute": attributes})
    return found


def plain(name: str) -> str:
    return " ".join(name.split()).casefold()


def pick(query: str, entity: str | None, candidates: list[dict[str, Any]]) -> dict[str, Any]:
    if entity:
        chosen = [c for c in candidates if c["entityID"] == entity]
    else:
        chosen = [c for c in candidates if plain(c["name"]) == plain(query)]
    if len(chosen) == 1:
        return chosen[0]
    offered = ", ".join(f"{c['name']} ({c['entityID']})" for c in candidates[:8]) or "nobody"
    if len(chosen) > 1:
        raise ShareRefused("mentionAmbiguous", f"@[{query}] matches {len(chosen)} people or pages with that name: {offered}. Write it as @[name|entityID]")
    raise ShareRefused("mentionNotFound", f"LinkedIn's mention search for @[{query}{'|' + entity if entity else ''}] has no exact match. It offered: {offered}")


def with_mentions(text: str, chosen: dict[tuple[str, str | None], dict[str, Any]]) -> tuple[str, list[dict[str, Any]]]:
    out = ""
    attributes: list[dict[str, Any]] = []
    last = 0
    for found in MENTION.finditer(text):
        out += text[last:found.start()]
        match = chosen[(found.group(1), found.group(2))]
        start = units(out)
        for attribute in match["attribute"]:
            moved = json.loads(json.dumps(attribute))
            moved["start"] = start + int(attribute.get("start") or 0)
            attributes.append(moved)
        out += match["name"]
        last = found.end()
    return out + text[last:], attributes


def track_of(version: str) -> str:
    now = datetime.now().astimezone()
    offset = now.utcoffset()
    hours = int(offset.total_seconds() // 3600) if offset else 0
    zone = getattr(now.tzinfo, "key", None) or "America/Vancouver"
    return json.dumps({"clientVersion": version, "mpVersion": version, "osName": "web", "timezoneOffset": hours, "timezone": zone, "deviceFormFactor": "DESKTOP", "mpName": "web", "displayDensity": 2, "displayWidth": 2620, "displayHeight": 1648}, separators=(",", ":"))


class Composer:
    def __init__(self, session: Any, cookies: dict[str, str], browser: dict[str, str], log: Any = None, sleep: Any = None) -> None:
        self.session = session
        self.csrf = cookies.get("JSESSIONID", "").strip('"')
        self.browser = browser
        self.version = ""
        self.sleep = sleep or time.sleep
        self.results_ref = ""
        self.follow_up_stopped: dict[str, Any] | None = None
        self.record: Path | None = None
        self.tracking = base64.b64encode(secrets.token_bytes(16)).decode()
        self.forest = secrets.token_hex(16)
        self.log = log or (lambda line: None)
        self.calls: list[dict[str, Any]] = []

    def base_headers(self) -> dict[str, str]:
        headers = {"user-agent": self.browser["userAgent"], "accept-language": self.browser.get("acceptLanguage") or "en-US,en;q=0.9"}
        for key, name in (("secChUa", "sec-ch-ua"), ("secChUaMobile", "sec-ch-ua-mobile"), ("secChUaPlatform", "sec-ch-ua-platform")):
            if self.browser.get(key):
                headers[name] = self.browser[key]
        return headers

    def headers(self) -> dict[str, str]:
        span = secrets.token_hex(8)
        headers = self.base_headers()
        headers.update({
            "accept": "*/*",
            "content-type": "application/json",
            "csrf-token": self.csrf,
            "origin": ORIGIN,
            "referer": COMPOSE_REFERER,
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-li-actor": "Self",
            "x-li-anchor-page-key": PAGE_KEY,
            "x-li-application-instance": "undefined",
            "x-li-application-version": self.version,
            "x-li-page-instance": f"urn:li:page:{PAGE_KEY};{self.tracking}",
            "x-li-page-instance-tracking-id": self.tracking,
            "x-li-pageforestid": self.forest,
            "x-li-rsc-stream": "true",
            "x-li-traceparent": f"00-{self.forest}-{span}-00",
            "x-li-tracestate": f"LinkedIn={span}",
            "x-li-track": track_of(self.version),
        })
        return headers

    def check(self, name: str, res: Any) -> str:
        status = res.status_code
        deleted = any(raw.split("=", 1)[0].strip() == "li_at" and ("delete me" in raw.lower() or "max-age=0" in raw.lower()) for raw in res.headers.get_list("set-cookie"))
        self.calls.append({"call": name, "httpStatus": status})
        if self.record:
            self.record.mkdir(parents=True, exist_ok=True)
            (self.record / f"{len(self.calls):02d}_{name}_{status}.txt").write_text(str(res.text or ""), encoding="utf-8")
        self.log(f"linkedin {name}: HTTP {status}")
        if deleted:
            raise ShareRefused("sessionRevoked", f"LinkedIn answered {name} with HTTP {status} and deleted li_at: it ended this session", loginState="loggedOut", httpStatus=status)
        if status in (429, 999):
            raise ShareRefused("rateLimited", f"LinkedIn answered {name} with HTTP {status}", event="throttled", httpStatus=status)
        if status in (401, 403):
            raise ShareRefused("sessionDead", f"LinkedIn answered {name} with HTTP {status}", loginState="loggedOut", httpStatus=status)
        if status >= 300:
            raise ShareRefused("linkedinRefused", f"LinkedIn answered {name} with HTTP {status}", httpStatus=status)
        answered = str(res.headers.get(VERSION_HEADER) or "")
        if VERSION.match(answered) and answered != self.version:
            if self.version:
                self.log(f"linkedin app version {self.version} -> {answered}, from LinkedIn's answer to {name}")
            self.version = answered
        return res.text

    def pause(self, low: float, high: float) -> None:
        self.sleep(random.uniform(low, high))

    def version_from_feed(self) -> None:
        headers = self.base_headers()
        headers.update({"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "sec-fetch-dest": "document", "sec-fetch-mode": "navigate", "sec-fetch-site": "none", "sec-fetch-user": "?1", "upgrade-insecure-requests": "1"})
        html = self.check("feed", self.session.get(f"{ORIGIN}/feed/", headers=headers, allow_redirects=False))
        if self.version:
            self.log(f"linkedin app version {self.version}, from the feed's {VERSION_HEADER} header")
            return
        found = re.findall(r"\b0\.2\.\d{3,6}\.\d+\b", html)
        if not found:
            raise ShareRefused("appVersionUnknown", f"LinkedIn's feed page gave no {VERSION_HEADER} header and no 0.2.x.y version, so nothing was sent: an old version would mark every call")
        self.version = max(set(found), key=found.count)
        self.log(f"linkedin app version {self.version}, from the feed page")

    def action(self, name: str, url: str, body: dict[str, Any]) -> str:
        text = self.check(name, self.session.post(url, headers=self.headers(), data=json.dumps(body, ensure_ascii=False, separators=(",", ":")).encode("utf-8"), allow_redirects=False))
        errors = errors_of(text)
        if errors:
            raise ShareRefused("linkedinRefused", f"LinkedIn answered {name} with errors: {'; '.join(errors)[:400]}")
        return text

    def server_request(self, request_id: str, body: dict[str, Any]) -> str:
        return self.action(request_id.rsplit(".", 1)[-1], f"{ACTIONS}server-request?sduiid={request_id}", body)

    def open_composer(self) -> str:
        screen = "com.linkedin.sdui.flagshipnav.sharing.ShareCompose"
        text = self.action("ShareCompose", f"{ACTIONS}navigation?screenId={screen}&sduiid={screen}", template("shareCompose"))
        found = re.search(r"urn:li:shareboxSession:[A-Za-z0-9+/=]+", text)
        if not found:
            raise ShareRefused("templateStale", "LinkedIn's composer answer had no shareboxSession: its composer changed, record it again")
        ref = re.search(r"MentionDefault_TypeaheadResults_[A-Za-z0-9+/=]+", text)
        self.results_ref = ref.group(0) if ref else ""
        return found.group(0)

    def mentions(self, text: str) -> tuple[str, list[dict[str, Any]], list[dict[str, Any]]]:
        wanted = list(dict.fromkeys((m.group(1), m.group(2)) for m in MENTION.finditer(text)))
        if "@[" in MENTION.sub("", text):
            raise ShareRefused("invalidArgs", "the text has an @[ that isn't a mention: write @[Name] or @[Name|entityID], nothing was posted")
        if not wanted:
            return text, [], []
        if not self.results_ref:
            raise ShareRefused("templateStale", "LinkedIn's composer answer had no mention results component: its composer changed, record it again")
        chosen: dict[tuple[str, str | None], dict[str, Any]] = {}
        for query, entity in wanted:
            self.pause(0.8, 1.8)
            answer = self.server_request("com.linkedin.sdui.impl.sharing.request.mentionResults", fill(template("mentionResults"), {"query": query, "resultsRef": self.results_ref}))
            match = pick(query, entity, candidates_of(answer))
            chosen[(query, entity)] = match
            self.log(f"linkedin mention @[{query}] -> {match['name']} ({match['entityID']})")
        final, attributes = with_mentions(text, chosen)
        if units(final) > TEXT_MAX:
            raise ShareRefused("invalidArgs", f"with the mentions written out the post has {units(final)} characters, over {TEXT_MAX}")
        picks = [{"query": q, "name": c["name"], "entityID": c["entityID"]} for (q, _), c in chosen.items()]
        return final, attributes, picks

    def preview_mentions(self, text: str) -> dict[str, Any]:
        self.version_from_feed()
        self.open_composer()
        final, _, picks = self.mentions(text)
        return {"text": final, "mentions": picks}

    def follow_ups(self, answer: str, session_urn: str, activity: str) -> None:
        tracking = re.search(r'"activityId":"' + activity + r'"\}\}\},"trackingId":"([^"]+)"', answer)
        steps = [("com.linkedin.sdui.sharing.requests.FetchSharingAfterPostNBA", "fetchAfterPost", {"activityId": activity})]
        if tracking:
            steps.append(("com.linkedin.sdui.requests.UpdatePlatform.addUpdateToFeedListRequest", "addUpdateToFeed", {"activityId": activity, "feedTrackingId": tracking.group(1)}))
        steps += [
            ("com.linkedin.sdui.requests.mediaproduct.media.restoreTagPills", "restoreTagPills", {}),
            ("com.linkedin.sdui.requests.sharing.collaboratorResetOnDiscardAction", "collaboratorReset", {}),
            ("com.linkedin.sdui.requests.sharing.TrackShareboxInteraction", "trackShareboxClose", {"sessionUrn": session_urn}),
        ]
        self.pause(0.5, 0.9)
        for request_id, name, values in steps:
            try:
                self.server_request(request_id, fill(template(name), values))
            except ShareRefused as refused:
                self.follow_up_stopped = {"call": name, "code": refused.code, "detail": refused.detail}
                self.log(f"linkedin {name} refused after the post was live ({refused.code}): the composer's other follow-ups are skipped, nothing retried")
                return
            self.pause(0.01, 0.05)

    def upload(self, image: dict[str, Any]) -> str:
        answer = self.server_request("com.linkedin.sdui.requests.mediaproduct.UploadImageMedia", template("uploadImageMedia"))
        upload_id = re.search(r"imageUpload-([0-9a-f]{8}-[0-9a-f\-]{27})", answer)
        if not upload_id:
            raise ShareRefused("templateStale", "LinkedIn's UploadImageMedia answer had no upload id")
        values = {k: image[k] for k in ("fileName", "mimeType", "size", "width", "height")}
        values.update({"uploadId": upload_id.group(1), "filePointer": str(uuid.uuid4())})
        answer = self.server_request("com.linkedin.sdui.requests.media.registerMediaUpload", fill(template("registerMediaUpload"), values))
        asset = re.search(r'"assetUrn":"(D[0-9A-Za-z_\-]+)"', answer)
        url = re.search(r'"uploadUrl":"([^"]+)"', answer)
        if not asset or not url:
            raise ShareRefused("templateStale", "LinkedIn's registerMediaUpload answer had no asset or upload URL")
        extra = dict(re.findall(r'"\$type":"proto\.com\.linkedin\.digitalmedia\.ingest\.Header","key":"([^"]+)","value":"([^"]*)"', answer))
        headers = self.base_headers()
        headers.update({"accept": "*/*", "content-type": image["mimeType"], "origin": ORIGIN, "referer": COMPOSE_REFERER, "sec-fetch-dest": "empty", "sec-fetch-mode": "cors", "sec-fetch-site": "same-origin", **{k.lower(): v for k, v in extra.items()}})
        self.check("imageUpload", self.session.put(url.group(1).encode().decode("unicode_escape"), headers=headers, data=image["data"], allow_redirects=False))
        values["assetId"] = asset.group(1)
        self.server_request("com.linkedin.sdui.requests.mediaproduct.RegisterImageMedia", fill(template("registerImageMedia"), values))
        return asset.group(1)

    def post(self, text: str, image: dict[str, Any] | None) -> dict[str, Any]:
        self.version_from_feed()
        session_urn = self.open_composer()
        self.pause(0.6, 1.2)
        self.server_request("com.linkedin.sdui.requests.mediaproduct.media.restoreTagPills", template("restoreTagPills"))
        text, attributes, picks = self.mentions(text)
        typing = min(30.0, 3.0 + 0.04 * len(text))
        self.pause(typing * 0.8, typing * 1.2)
        if image:
            dispatch = template("dispatchPostCreate")
            set_state(dispatch, "ShareBoxdetourType", "Image")
            self.server_request("com.linkedin.sdui.requests.sharing.DispatchPostCreateWithDetour", dispatch)
            asset = self.upload(image)
            body = fill(template("createPost"), {"sessionUrn": session_urn, "assetId": asset, "text": text})
            set_state(body, "ShareBoxdetourType", "Image")
        else:
            asset = ""
            self.server_request("com.linkedin.sdui.requests.sharing.LaunchCreatePost", template("launchCreatePost"))
            self.pause(0.08, 0.15)
            body = fill(template("createPostText"), {"sessionUrn": session_urn, "text": text})
            set_state(body, "ShareBoxdetourType", "Text")
        set_state(body, "ShareBoxrichCommentaryTextMemoryBinding", text_model(text, attributes))
        answer = self.server_request("com.linkedin.sdui.requests.sharing.CreatePost", body)
        activity = re.search(r'"activityId":"(\d+)"', answer)
        if not activity:
            raise ShareRefused("postUnconfirmed", "LinkedIn answered CreatePost without the new post's activityId, so it isn't known to be live; check the profile before posting again")
        self.follow_ups(answer, session_urn, activity.group(1))
        out = {"activityId": activity.group(1), "url": f"{ORIGIN}/feed/update/urn:li:activity:{activity.group(1)}/", "image": bool(image), "assetId": asset or None, "mentions": picks}
        if self.follow_up_stopped:
            out["followUpStopped"] = self.follow_up_stopped
        return out

    def delete(self, activity_id: str) -> dict[str, Any]:
        self.version_from_feed()
        body = fill(template("deletePost"), {"activityId": activity_id, "trackingId": base64.b64encode(secrets.token_bytes(16)).decode(), "toastKey": str(uuid.uuid4())})
        self.server_request("com.linkedin.sdui.update.deletePost", body)
        return {"activityId": activity_id, "deleted": True}
