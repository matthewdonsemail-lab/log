import asyncio
import uuid
from dataclasses import dataclass, field

from fastapi import WebSocket


@dataclass
class Link:
    workspaceId: str
    installationId: str
    holderId: str
    generation: int
    websocket: WebSocket
    pending: dict[str, list[asyncio.Future]] = field(default_factory=dict)
    sequence: int = 0

    async def send(self, envelope: dict) -> None:
        self.sequence += 1
        await self.websocket.send_json({**envelope, "sequence": self.sequence})

    async def ask(self, envelope: dict, operationId: str, seconds: float) -> dict | None:
        waiter = asyncio.get_running_loop().create_future()
        self.pending.setdefault(operationId, []).append(waiter)
        try:
            await self.send(envelope)
            return await asyncio.wait_for(asyncio.shield(waiter), seconds)
        except asyncio.TimeoutError:
            return None
        finally:
            waiters = self.pending.get(operationId, [])
            if waiter in waiters:
                waiters.remove(waiter)
            if not waiters:
                self.pending.pop(operationId, None)

    def answer(self, operationId: str, envelope: dict) -> None:
        for waiter in self.pending.pop(operationId, []):
            if not waiter.done():
                waiter.set_result(envelope)

    def drop(self) -> None:
        for waiters in self.pending.values():
            for waiter in waiters:
                if not waiter.done():
                    waiter.set_result(None)
        self.pending.clear()


class Bridges:
    def __init__(self) -> None:
        self.links: dict[str, Link] = {}

    def get(self, workspaceId) -> Link | None:
        return self.links.get(str(workspaceId))

    async def attach(self, link: Link) -> None:
        old = self.links.get(link.workspaceId)
        self.links[link.workspaceId] = link
        if old and old is not link:
            old.drop()
            try:
                await old.websocket.close(code=4409, reason="fenced by a newer connection")
            except Exception:
                pass

    def detach(self, link: Link) -> bool:
        if self.links.get(link.workspaceId) is link:
            del self.links[link.workspaceId]
            link.drop()
            return True
        link.drop()
        return False

    async def close(self, workspaceId, code: int, reason: str) -> None:
        link = self.links.pop(str(workspaceId), None)
        if link:
            link.drop()
            try:
                await link.websocket.close(code=code, reason=reason)
            except Exception:
                pass


def new_holder() -> str:
    return uuid.uuid4().hex
