from __future__ import annotations

import asyncio
import json
import mimetypes
import os
import shutil
import subprocess
import tempfile
import time
from typing import Any

from curl_cffi import CurlMime

from .errors import NotLoggedIn, RateLimited, RedditError, Refused
from .reads import Reads
from .session import Session
from .transport import OAUTH, Transport

IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
VIDEO_TYPES = {"video/mp4", "video/quicktime"}
MAX_IMAGE = 20 * 1024 * 1024
MAX_VIDEO = 100 * 1024 * 1024
UPLOAD_HOSTS = ("https://reddit-uploaded-media.s3-accelerate.amazonaws.com/", "https://reddit-uploaded-video.s3-accelerate.amazonaws.com/")


class Actions:
    def __init__(self, transport: Transport, session: Session, reads: Reads, username: str | None = None) -> None:
        self.transport = transport
        self.session = session
        self.reads = reads
        self.username = username

    async def post(self, path: str, data: dict[str, Any] | None = None, *, json_body: Any = None, timeout: float = 15, raw: bool = False) -> Any:
        token = await self.session.access_token()
        kwargs: dict[str, Any] = {}
        if json_body is not None:
            kwargs["json"] = {**json_body, "api_type": "json", "raw_json": 1}
        else:
            form = dict(data or {}) if raw else {**(data or {}), "api_type": "json", "raw_json": 1}
            upload = form.pop("_file", None)
            if upload:
                mime = CurlMime()
                for name, value in form.items():
                    mime.addpart(name=name, data=str(value).encode())
                mime.addpart(name="file", filename=upload[0], content_type=upload[1], data=upload[2])
                kwargs["multipart"] = mime
            else:
                kwargs["data"] = form
        response = await self.transport.request("POST", OAUTH + path, headers={"Authorization": f"Bearer {token}"}, timeout=timeout, **kwargs)
        if response.status_code in (401, 403):
            raise NotLoggedIn(f"Reddit rejected the account on {path}", response.status_code)
        if response.status_code == 429:
            raise RateLimited(f"Reddit is rate limiting {path}")
        if not 200 <= response.status_code < 300:
            raise RedditError(f"Reddit answered HTTP {response.status_code} on {path}", response.status_code)
        try:
            body = response.json()
        except ValueError:
            return {}
        errors = (body.get("json") or {}).get("errors") if isinstance(body, dict) else None
        if errors:
            raise Refused(" ".join(str(e[1]) for e in errors if len(e) > 1) or "Reddit refused that", 400, body)
        return body

    async def vote(self, fullname: str, direction: int) -> None:
        await self.post("/api/vote", {"id": fullname, "dir": direction})

    async def subscribe(self, subreddit: str, join: bool) -> None:
        await self.post("/api/subscribe", {"action": "sub" if join else "unsub", "sr_name": subreddit})

    async def edit(self, fullname: str, text: str) -> None:
        await self.post("/api/editusertext", {"thing_id": fullname, "text": text})

    async def delete(self, fullname: str) -> None:
        await self.post("/api/del", {"id": fullname})

    async def comment(self, parent: str, text: str, media_id: str | None = None) -> dict[str, Any]:
        if media_id:
            doc = [{"e": "par", "c": [{"e": "text", "t": line}]} for line in (text or "").split("\n") if line.strip()]
            doc.append({"e": "img", "id": media_id, "c": ""})
            body = await self.post("/api/comment", {"thing_id": parent, "richtext_json": json.dumps({"document": doc})})
        else:
            body = await self.post("/api/comment", {"thing_id": parent, "text": text})
        try:
            made = body["json"]["data"]["things"][0]["data"]
        except (KeyError, IndexError, TypeError):
            if not (isinstance(body, dict) and str(body.get("name", "")).startswith("t1_")):
                raise RedditError("Reddit didn't return the new comment")
            made = body
        return await self.finished_comment(made) if media_id else made

    async def finished_comment(self, made: dict[str, Any], tries: int = 8) -> dict[str, Any]:
        for _ in range(tries):
            if "Processing img" not in (made.get("body") or ""):
                return made
            await asyncio.sleep(1.5)
            try:
                children = (await self.reads.info([made["name"]]))["data"]["children"]
            except Exception:
                continue
            if children:
                made = {**made, **children[0]["data"], "likes": True}
        return made

    async def own_name(self) -> str:
        if not self.username:
            me = await self.session.whoami()
            if not me:
                raise NotLoggedIn()
            self.username = me["name"]
        return self.username

    async def await_new_post(self, title: str, since: float, timeout: float = 20) -> str:
        name = await self.own_name()
        deadline = time.time() + timeout
        while time.time() < deadline:
            await asyncio.sleep(2)
            try:
                children = (await self.reads.user_listing(name, "submitted", "new", limit=5))["data"]["children"]
            except Exception:
                continue
            for c in children:
                if c["data"]["title"] == title and c["data"]["created_utc"] >= since - 120:
                    return "https://www.reddit.com" + c["data"]["permalink"]
        raise RedditError("Reddit is still processing that upload", 504)

    async def submit(self, subreddit: str, title: str, kind: str = "self", text: str = "", url: str = "", media: tuple[dict[str, Any], ...] = (), flair_id: str = "", flair_text: str = "") -> str:
        flair = {"flair_id": flair_id, **({"flair_text": flair_text} if flair_text else {})} if flair_id else {}
        if kind == "gallery":
            body = await self.post("/api/submit_gallery_post.json", json_body={"sr": subreddit, "title": title, "kind": "self", "sendreplies": True, "show_error_list": True, "validate_on_submit": True, **flair, "items": [{"caption": "", "outbound_url": "", "media_id": m["asset_id"]} for m in media]}, timeout=30)
        else:
            data: dict[str, Any] = {"sr": subreddit, "title": title, "kind": kind, "resubmit": "true", "sendreplies": "true", **flair}
            if kind == "self":
                data["text"] = text
            elif kind == "link":
                data["url"] = url
            else:
                data["url"] = media[0]["url"]
                if kind == "video":
                    data["video_poster_url"] = media[0]["poster_url"]
            started = time.time()
            body = await self.post("/api/submit", data, timeout=30)
            if kind in ("image", "video"):
                return await self.await_new_post(title, started)
        try:
            return body["json"]["data"]["url"]
        except (KeyError, TypeError):
            raise RedditError("Reddit didn't confirm the post; check the profile before retrying")

    async def set_avatar(self, filename: str, mimetype: str, blob: bytes) -> None:
        name = await self.own_name()
        body = await self.post(f"/r/u_{name}/api/upload_sr_img", {"upload_type": "icon", "name": "icon", "img_type": "png" if mimetype == "image/png" else "jpg", "_file": (filename, mimetype, blob)}, raw=True)
        errs = body.get("errors") if isinstance(body, dict) else None
        if errs:
            raise Refused(f"Reddit refused the picture: {errs[0]}", 400, body)

    async def remove_avatar(self) -> None:
        name = await self.own_name()
        await self.post(f"/r/u_{name}/api/delete_sr_icon", {}, raw=True)

    async def send_upload(self, filename: str, mimetype: str, blob: bytes) -> tuple[str, str]:
        lease = await self.post("/api/media/asset.json", {"filepath": filename, "mimetype": mimetype})
        try:
            args = lease["args"]
            fields = {f["name"]: f["value"] for f in args["fields"]}
            asset_id, action = lease["asset"]["asset_id"], "https:" + args["action"]
        except (KeyError, TypeError):
            raise RedditError("Reddit didn't accept the upload")
        mime = CurlMime()
        for name, value in fields.items():
            mime.addpart(name=name, data=str(value).encode())
        mime.addpart(name="file", filename=filename, content_type=mimetype, data=blob)
        response = await self.transport.request("POST", action, multipart=mime, timeout=180)
        if response.status_code not in (200, 201, 204):
            raise RedditError(f"Reddit storage refused the file (HTTP {response.status_code})", response.status_code)
        return asset_id, f"{action}/{fields['key']}"

    async def upload(self, filename: str, mimetype: str, blob: bytes) -> dict[str, Any]:
        filename = os.path.basename(filename or "upload")
        if not mimetype or mimetype == "application/octet-stream":
            mimetype = mimetypes.guess_type(filename)[0] or ""
        if mimetype in IMAGE_TYPES and len(blob) <= MAX_IMAGE:
            kind = "image"
        elif mimetype in VIDEO_TYPES and len(blob) <= MAX_VIDEO:
            kind = "video"
        else:
            raise Refused("Only JPEG, PNG, GIF, WebP images and MP4/MOV video up to the size limits are supported", 415)
        asset_id, url = await self.send_upload(filename, mimetype, blob)
        result: dict[str, Any] = {"asset_id": asset_id, "url": url, "type": kind}
        if kind == "video":
            _, result["poster_url"] = await self.send_upload("poster.jpg", "image/jpeg", video_poster(blob))
        return result


def is_upload_url(url: Any) -> bool:
    return isinstance(url, str) and url.startswith(UPLOAD_HOSTS)


def video_poster(blob: bytes) -> bytes:
    ffmpeg = shutil.which("ffmpeg")
    if not ffmpeg:
        raise RedditError("Video posts need ffmpeg installed")
    with tempfile.TemporaryDirectory() as folder:
        path = os.path.join(folder, "video.mp4")
        with open(path, "wb") as f:
            f.write(blob)
        for seek in ("1", "0"):
            out = subprocess.run([ffmpeg, "-loglevel", "error", "-ss", seek, "-i", path, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "mjpeg", "pipe:1"], capture_output=True, timeout=60).stdout
            if out:
                return out
    raise RedditError("Couldn't read a frame from that video")
