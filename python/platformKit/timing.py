from __future__ import annotations

import contextvars
import os
import re
import secrets
import time
from contextlib import contextmanager
from typing import Any, Iterator
from urllib.parse import urlparse

BOOT = time.time()
MAX_SPANS = 500

_STATE: contextvars.ContextVar[dict[str, Any] | None] = contextvars.ContextVar("timingState", default=None)
_PARENT: contextvars.ContextVar[str | None] = contextvars.ContextVar("timingParent", default=None)
_PATCHED: dict[str, bool] = {}


def begin(trace: Any) -> bool:
    if not isinstance(trace, dict) or not trace.get("parentId"):
        return False
    instrument_curl()
    _PARENT.set(str(trace["parentId"]))
    _STATE.set({"spans": []})
    return True


def active() -> bool:
    return _STATE.get() is not None


def current_span() -> str | None:
    return _PARENT.get() if active() else None


def child_trace(trace: Any) -> Any:
    parent = current_span()
    if not isinstance(trace, dict) or parent is None:
        return trace
    return {**trace, "parentId": parent}


def _keep(state: dict[str, Any], row: dict[str, Any]) -> None:
    if len(state["spans"]) < MAX_SPANS:
        state["spans"].append(row)


def _clean(attrs: dict[str, Any]) -> dict[str, Any]:
    return {k: v if isinstance(v, (int, float, bool)) else str(v) for k, v in attrs.items() if v is not None}


@contextmanager
def span(name: str, **attrs: Any) -> Iterator[dict[str, Any]]:
    state = _STATE.get()
    if state is None:
        yield {}
        return
    span_id = secrets.token_hex(8)
    row: dict[str, Any] = {"spanId": span_id, "parentId": _PARENT.get(), "name": name, "startedAt": time.time() * 1000, "pid": os.getpid(), "ok": True, "attrs": _clean(attrs)}
    token = _PARENT.set(span_id)
    started = time.perf_counter()
    try:
        yield row
    except BaseException:
        row["ok"] = False
        raise
    finally:
        _PARENT.reset(token)
        row["ms"] = (time.perf_counter() - started) * 1000
        row["attrs"] = _clean(row["attrs"])
        _keep(state, row)


def record_since(name: str, started_epoch: float, **attrs: Any) -> None:
    state = _STATE.get()
    if state is None:
        return
    now = time.time()
    _keep(state, {"spanId": secrets.token_hex(8), "parentId": _PARENT.get(), "name": name, "startedAt": started_epoch * 1000, "ms": max(0.0, (now - started_epoch) * 1000), "pid": os.getpid(), "ok": True, "attrs": _clean(attrs)})


def attach(out: Any, boot: bool = False) -> Any:
    state = _STATE.get()
    if state is None or not isinstance(out, dict):
        return out
    out["spans"] = [*(out.get("spans") or []), *state["spans"]]
    if boot:
        out["bootAt"] = BOOT * 1000
    return out


def name_of_url(url: str) -> str:
    try:
        parsed = urlparse(str(url))
    except ValueError:
        return "url"
    path = parsed.path or "/"
    graphql = re.search(r"/graphql/[^/]+/([A-Za-z0-9_]+)", path)
    if graphql:
        return f"{parsed.hostname} graphql {graphql.group(1)}"
    parts = []
    for part in path.split("/"):
        if len(part) > 24 and re.fullmatch(r"[A-Za-z0-9_\-=.]+", part):
            parts.append(":key")
        else:
            parts.append(re.sub(r"\d{4,}", ":id", part))
    return f"{parsed.hostname}{'/'.join(parts)}"


def instrument_curl() -> None:
    if _PATCHED.get("curl"):
        return
    _PATCHED["curl"] = True
    try:
        from curl_cffi.requests import AsyncSession, Session
    except ImportError:
        return
    sync_request = Session.request
    async_request = AsyncSession.request

    def timed_request(self: Any, method: Any, url: Any, *args: Any, **kwargs: Any) -> Any:
        if not active():
            return sync_request(self, method, url, *args, **kwargs)
        with span(f"http {str(method).upper()} {name_of_url(url)}") as row:
            response = sync_request(self, method, url, *args, **kwargs)
            row.setdefault("attrs", {})["status"] = getattr(response, "status_code", None)
            return response

    async def timed_async_request(self: Any, method: Any, url: Any, *args: Any, **kwargs: Any) -> Any:
        if not active():
            return await async_request(self, method, url, *args, **kwargs)
        with span(f"http {str(method).upper()} {name_of_url(url)}") as row:
            response = await async_request(self, method, url, *args, **kwargs)
            row.setdefault("attrs", {})["status"] = getattr(response, "status_code", None)
            return response

    Session.request = timed_request
    AsyncSession.request = timed_async_request
