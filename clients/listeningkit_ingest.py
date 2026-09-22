"""Push helper shared by the platform clients (stdlib only).

Sends batches of normalized posts to the ListeningKit `/ingest` endpoint with an
ingest key made on the dashboard's "Send posts in" tab. Configure with
LISTENINGKIT_INGEST_URL and LISTENINGKIT_INGEST_KEY; never hardcode the key.
"""
from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
from typing import Callable, Iterable, Iterator

MAX_BATCH = 100
PLATFORMS = ("facebook", "x", "reddit")


class SessionError(RuntimeError):
    pass


class IngestError(RuntimeError):
    def __init__(self, status: int, message: str):
        super().__init__(f"ingest failed ({status}): {message}")
        self.status = status


def chunked(items: list[dict], size: int = MAX_BATCH) -> Iterator[list[dict]]:
    for start in range(0, len(items), size):
        yield items[start:start + size]


def _send(url: str, key: str, body: dict) -> tuple[int, str]:
    request = urllib.request.Request(
        url,
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, response.read().decode()
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode()


def push(
    platform: str,
    posts: Iterable[dict],
    *,
    endpoint: str,
    key: str,
    send: Callable[[str, str, dict], tuple[int, str]] = _send,
    sleep: Callable[[float], None] = time.sleep,
    retries: int = 2,
) -> dict:
    """Push posts in batches of 100. Returns totals; raises IngestError on a rejected batch.

    Client errors (4xx) fail immediately: a bad key or payload will not fix itself.
    Server errors and network failures retry with a short backoff.
    """
    if platform not in PLATFORMS:
        raise ValueError(f"platform must be one of {PLATFORMS}")
    totals = {"ingested": 0, "skipped": 0, "batches": 0}
    for batch in chunked(list(posts)):
        attempt = 0
        while True:
            try:
                status, text = send(endpoint, key, {"platform": platform, "posts": batch})
            except (urllib.error.URLError, TimeoutError, ConnectionError) as error:
                status, text = 0, str(error)
            if status == 200:
                summary = json.loads(text)
                totals["ingested"] += int(summary.get("ingested", 0))
                totals["skipped"] += int(summary.get("skipped", 0))
                totals["batches"] += 1
                break
            retryable = status == 0 or status >= 500
            if not retryable or attempt >= retries:
                try:
                    message = json.loads(text).get("error", text)
                except (ValueError, AttributeError):
                    message = text
                raise IngestError(status, str(message)[:200])
            attempt += 1
            sleep(attempt)
    return totals


def sibling_url(endpoint: str, path: str, platform: str) -> str:
    """An address that sits beside the /ingest endpoint on the same deployment."""
    base = endpoint.rstrip("/")
    if base.endswith("/ingest"):
        base = base[: -len("/ingest")]
    return f"{base}/{path}?platform={platform}"


def session_url(endpoint: str, platform: str) -> str:
    return sibling_url(endpoint, "session", platform)


def _get(url: str, key: str) -> tuple[int, str]:
    request = urllib.request.Request(url, headers={"Authorization": f"Bearer {key}"}, method="GET")
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            return response.status, response.read().decode()
    except urllib.error.HTTPError as error:
        return error.code, error.read().decode()


def fetch_session(
    platform: str,
    *,
    endpoint: str,
    key: str,
    get: Callable[[str, str], tuple[int, str]] = _get,
) -> list[dict]:
    """The cookie jar you connected in ListeningKit, so no cookies file is needed."""
    if platform not in PLATFORMS:
        raise ValueError(f"platform must be one of {PLATFORMS}")
    try:
        status, text = get(session_url(endpoint, platform), key)
    except (urllib.error.URLError, TimeoutError, ConnectionError) as error:
        raise SessionError(f"could not reach ListeningKit: {error}") from error
    if status == 404:
        raise SessionError(f"No {platform} account is connected. Connect it in ListeningKit (onboarding or Settings), then try again.")
    if status == 401:
        raise SessionError("The ingest key was rejected. Make a new one on the Send posts in tab.")
    if status != 200:
        raise SessionError(f"could not load the connected {platform} login ({status})")
    cookies = json.loads(text).get("cookies")
    if not isinstance(cookies, list) or not cookies:
        raise SessionError(f"the connected {platform} login is empty. Connect it again.")
    return cookies


def fetch_proxy(
    *,
    endpoint: str,
    key: str,
    get: Callable[[str, str], tuple[int, str]] = _get,
) -> dict | None:
    """The proxy this helper must browse through, or None when the operator has waived the requirement.

    The person never chooses or sees it: it comes from the deployment, only to a valid ingest key. A deployment
    with no proxy refuses (503), and the helper must stop rather than browse directly.
    """
    base = endpoint.rstrip("/")
    if base.endswith("/ingest"):
        base = base[: -len("/ingest")]
    try:
        status, text = get(f"{base}/proxy", key)
    except (urllib.error.URLError, TimeoutError, ConnectionError) as error:
        raise SessionError(f"could not reach ListeningKit: {error}") from error
    if status == 401:
        raise SessionError("The ingest key was rejected. Make a new one on the Send posts in tab.")
    if status == 503:
        raise SessionError("Reading is paused until the operator sets up the proxy. Nothing is wrong on your side; try again later.")
    if status != 200:
        raise SessionError(f"could not load the connection settings ({status})")
    proxy = json.loads(text).get("proxy")
    if proxy is None:
        return None
    if not isinstance(proxy, dict) or not str(proxy.get("server", "")).strip():
        raise SessionError("the connection settings came back in an unexpected shape")
    return {key_: str(value) for key_, value in proxy.items() if key_ in ("server", "username", "password") and value}


def fetch_phrases(
    platform: str,
    *,
    endpoint: str,
    key: str,
    get: Callable[[str, str], tuple[int, str]] = _get,
) -> list[str]:
    """The phrases this person is listening for on one platform, so the helper needs no list of its own."""
    if platform not in PLATFORMS:
        raise ValueError(f"platform must be one of {PLATFORMS}")
    try:
        status, text = get(sibling_url(endpoint, "phrases", platform), key)
    except (urllib.error.URLError, TimeoutError, ConnectionError) as error:
        raise SessionError(f"could not reach ListeningKit: {error}") from error
    if status == 401:
        raise SessionError("The ingest key was rejected. Make a new one on the Send posts in tab.")
    if status != 200:
        raise SessionError(f"could not load your {platform} phrases ({status})")
    rows = json.loads(text).get("phrases")
    if not isinstance(rows, list):
        raise SessionError(f"your {platform} phrases came back in an unexpected shape")
    seen: list[str] = []
    for row in rows:
        phrase = str(row.get("phrase", "")).strip() if isinstance(row, dict) else ""
        if phrase and phrase not in seen:
            seen.append(phrase)
    return seen


def _base(endpoint: str) -> str:
    base = endpoint.rstrip("/")
    return base[: -len("/ingest")] if base.endswith("/ingest") else base


def push_dms(
    platform: str,
    threads: list[dict],
    *,
    endpoint: str,
    key: str,
    send: Callable[[str, str, dict], tuple[int, str]] = _send,
) -> dict:
    """Push newly-read direct-message threads/messages to `/dm/ingest`. Idempotent: a message already pushed is skipped server-side."""
    if not threads:
        return {"threadsSeen": 0, "messagesAdded": 0}
    status, text = send(f"{_base(endpoint)}/dm/ingest", key, {"platform": platform, "threads": threads})
    if status != 200:
        try:
            message = json.loads(text).get("error", text)
        except (ValueError, AttributeError):
            message = text
        raise IngestError(status, str(message)[:200])
    return json.loads(text)


def fetch_pending_dms(platform: str, *, endpoint: str, key: str, get: Callable[[str, str], tuple[int, str]] = _get) -> list[dict]:
    """Outbound messages queued in the dashboard, waiting for this helper to actually send them."""
    status, text = get(f"{_base(endpoint)}/dm/pending?platform={platform}", key)
    if status == 401:
        raise SessionError("The ingest key was rejected. Make a new one on the Send posts in tab.")
    if status != 200:
        raise SessionError(f"could not load pending messages ({status})")
    pending = json.loads(text).get("pending")
    return pending if isinstance(pending, list) else []


def report_dm_sent(message_id: str, external_id: str | None, *, endpoint: str, key: str, send: Callable[[str, str, dict], tuple[int, str]] = _send) -> None:
    body: dict = {"messageId": message_id}
    if external_id:
        body["externalId"] = external_id
    status, text = send(f"{_base(endpoint)}/dm/sent", key, body)
    if status != 200:
        raise IngestError(status, text[:200])


def report_dm_failed(message_id: str, error: str, *, endpoint: str, key: str, send: Callable[[str, str, dict], tuple[int, str]] = _send) -> None:
    status, text = send(f"{_base(endpoint)}/dm/failed", key, {"messageId": message_id, "error": error[:300]})
    if status != 200:
        raise IngestError(status, text[:200])
