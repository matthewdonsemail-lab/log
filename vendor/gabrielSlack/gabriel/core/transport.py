from __future__ import annotations

from collections.abc import AsyncIterable, AsyncIterator, Mapping
from typing import Any

from curl_cffi.requests import AsyncSession
from curl_cffi.requests.exceptions import Timeout
from curl_cffi.requests.websockets import WebSocketClosed, WebSocketError

IMPERSONATE = "chrome150"
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36"
TIMEOUT_ERRORS: tuple[type[BaseException], ...] = (Timeout, TimeoutError)
MAX_FRAME_SIZE = 16 * 1024 * 1024

__all__ = ["IMPERSONATE", "TIMEOUT_ERRORS", "USER_AGENT", "ConnectionClosed", "SlackResponse", "SlackTransport", "new_session", "ws_connect"]


def new_session() -> AsyncSession:
    return AsyncSession(impersonate=IMPERSONATE, allow_redirects=False)


def _headers(headers: Mapping[str, str] | None) -> dict[str, str]:
    return {k: v for k, v in (headers or {}).items() if k.lower() != "user-agent"}


async def _body(content: bytes | AsyncIterable[bytes] | None) -> bytes | None:
    if content is None or isinstance(content, bytes | bytearray):
        return content
    chunks = [chunk async for chunk in content]
    return b"".join(chunks)


class SlackResponse:
    def __init__(self, response: Any, stream: bool) -> None:
        self._response = response
        self._stream = stream
        self.status_code: int = response.status_code
        self.headers = response.headers

    @property
    def is_success(self) -> bool:
        return 200 <= self.status_code < 300

    @property
    def text(self) -> str:
        return self._response.text

    @property
    def content(self) -> bytes:
        return self._response.content

    def json(self) -> Any:
        return self._response.json()

    async def aread(self) -> bytes:
        if self._stream:
            return await self._response.acontent()
        return self._response.content

    async def aiter_bytes(self) -> AsyncIterator[bytes]:
        async for chunk in self._response.aiter_content():
            yield chunk

    async def aclose(self) -> None:
        if self._stream:
            await self._response.aclose()


class SlackTransport:
    def __init__(self) -> None:
        self._session = new_session()

    async def request(
        self,
        method: str,
        url: str,
        *,
        headers: Mapping[str, str] | None = None,
        content: bytes | AsyncIterable[bytes] | None = None,
        data: Mapping[str, Any] | None = None,
        timeout: float | None = None,
        follow_redirects: bool = False,
        stream: bool = False,
    ) -> SlackResponse:
        body = await _body(content)
        try:
            response = await self._session.request(
                method,
                url,
                headers=_headers(headers),
                data=dict(data) if data is not None else body,
                timeout=timeout if timeout is not None else 120,
                allow_redirects=follow_redirects,
                stream=stream,
            )
        finally:
            self._session.cookies.clear()
        return SlackResponse(response, stream)

    async def get(self, url: str, **kwargs: Any) -> SlackResponse:
        return await self.request("GET", url, **kwargs)

    async def post(self, url: str, **kwargs: Any) -> SlackResponse:
        return await self.request("POST", url, **kwargs)

    async def aclose(self) -> None:
        await self._session.close()


class ConnectionClosed(Exception):
    def __init__(self, code: int, reason: str = "") -> None:
        super().__init__(f"websocket closed ({code}) {reason}".strip())
        self.code = code


class _SlackSocket:
    def __init__(self, session: AsyncSession, ws: Any) -> None:
        self._session = session
        self._ws = ws
        self.close_code: int | None = None

    async def send(self, data: str) -> None:
        try:
            await self._ws.send_str(data)
        except (WebSocketClosed, WebSocketError) as err:
            raise self._closed(err) from err

    async def recv(self) -> str | bytes:
        try:
            return await self._ws.recv_str()
        except (WebSocketClosed, WebSocketError) as err:
            raise self._closed(err) from err

    async def close(self, code: int = 1000, reason: str = "") -> None:
        try:
            await self._ws.close(code, reason)
        finally:
            self.close_code = self.close_code or code
            await self._session.close()

    def _closed(self, err: BaseException) -> ConnectionClosed:
        code = getattr(self._ws, "close_code", None) or getattr(err, "code", None)
        self.close_code = code if isinstance(code, int) and code >= 1000 else 1006
        return ConnectionClosed(self.close_code, str(getattr(self._ws, "close_reason", "") or ""))


async def ws_connect(url: str, headers: Mapping[str, str], timeout: float) -> _SlackSocket:
    session = new_session()
    try:
        ws = await session.ws_connect(url, headers=_headers(headers), timeout=timeout, max_message_size=MAX_FRAME_SIZE)
    except BaseException:
        await session.close()
        raise
    return _SlackSocket(session, ws)
