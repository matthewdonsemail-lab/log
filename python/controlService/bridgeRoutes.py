import json
import uuid
from datetime import datetime, timedelta, timezone

from anyio import to_thread
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from sqlalchemy import update
from sqlalchemy.engine import Engine
from sqlmodel import Session, select

from controlService.bridge import Bridges, Link, new_holder
from controlService.models import OperationMetadata, OperationState, RuntimeCredential, Workspace, WorkspaceLease, WorkspaceStatus
from controlService.security import aware, token_hash
from controlService.settings import LEASE_HEARTBEAT_SECONDS, LEASE_SECONDS, MAX_ENVELOPE_BYTES, PROTOCOL_VERSION

CAPABILITY_FIELDS = {"persistentStorage", "browserAvailable", "driver", "protocolVersion", "checkedAt", "status"}
FINAL_STATES = {"succeeded": OperationState.succeeded, "failed": OperationState.failed, "cancelled": OperationState.cancelled, "unknown": OperationState.unknown}


def bearer(websocket: WebSocket) -> str | None:
    header = websocket.headers.get("authorization") or ""
    kind, _, value = header.partition(" ")
    return value.strip() if kind.lower() == "bearer" and value.strip() else None


def credential_workspace(engine: Engine, secret: str) -> Workspace | None:
    with Session(engine) as db:
        now = datetime.now(timezone.utc)
        credential = db.exec(select(RuntimeCredential).where(RuntimeCredential.tokenHash == token_hash(secret))).first()
        if not credential or credential.revokedAt or aware(credential.expiresAt) <= now:
            return None
        workspace = db.get(Workspace, credential.workspaceId)
        if not workspace or workspace.status == WorkspaceStatus.revoked or not workspace.installationId:
            return None
        db.expunge(workspace)
        return workspace


def acquire_lease(engine: Engine, workspaceId, hello: dict, holderId: str) -> int:
    with Session(engine) as db:
        now = datetime.now(timezone.utc)
        workspace = db.exec(select(Workspace).where(Workspace.id == workspaceId).with_for_update()).one()
        lease = db.get(WorkspaceLease, workspaceId)
        generation = max(workspace.connectionGeneration, lease.generation if lease else 0) + 1
        if lease:
            lease.holderId = holderId
            lease.generation = generation
            lease.acquiredAt = now
            lease.heartbeatAt = now
            lease.expiresAt = now + timedelta(seconds=LEASE_SECONDS)
        else:
            lease = WorkspaceLease(workspaceId=workspaceId, holderId=holderId, generation=generation, acquiredAt=now, heartbeatAt=now, expiresAt=now + timedelta(seconds=LEASE_SECONDS))
        capabilities = {key: value for key, value in (hello.get("capabilities") or {}).items() if key in CAPABILITY_FIELDS}
        workspace.connectionGeneration = generation
        workspace.status = WorkspaceStatus.ready
        workspace.lastContactAt = now
        workspace.runtimeVersion = str(hello.get("runtimeVersion") or "")[:64] or None
        workspace.protocolVersion = int(hello.get("protocolVersion") or 0)
        workspace.schemaVersion = int(hello.get("schemaVersion") or 0) or None
        workspace.capabilitySummary = capabilities
        workspace.updatedAt = now
        db.add(lease)
        db.add(workspace)
        db.commit()
        return generation


def mark_incompatible(engine: Engine, workspaceId, hello: dict) -> None:
    with Session(engine) as db:
        workspace = db.get(Workspace, workspaceId)
        workspace.status = WorkspaceStatus.incompatible
        workspace.protocolVersion = int(hello.get("protocolVersion") or 0)
        workspace.updatedAt = datetime.now(timezone.utc)
        db.add(workspace)
        db.commit()


def renew_lease(engine: Engine, workspaceId, holderId: str, generation: int) -> bool:
    with Session(engine) as db:
        now = datetime.now(timezone.utc)
        renewed = db.execute(update(WorkspaceLease).where(WorkspaceLease.workspaceId == workspaceId, WorkspaceLease.holderId == holderId, WorkspaceLease.generation == generation).values(heartbeatAt=now, expiresAt=now + timedelta(seconds=LEASE_SECONDS)))
        db.execute(update(Workspace).where(Workspace.id == workspaceId, Workspace.connectionGeneration == generation).values(lastContactAt=now))
        db.commit()
        return renewed.rowcount == 1


def release_lease(engine: Engine, workspaceId, holderId: str, generation: int) -> None:
    with Session(engine) as db:
        now = datetime.now(timezone.utc)
        released = db.execute(update(WorkspaceLease).where(WorkspaceLease.workspaceId == workspaceId, WorkspaceLease.holderId == holderId, WorkspaceLease.generation == generation).values(expiresAt=now))
        if released.rowcount == 1:
            db.execute(update(Workspace).where(Workspace.id == workspaceId, Workspace.connectionGeneration == generation, Workspace.status == WorkspaceStatus.ready).values(status=WorkspaceStatus.offline, updatedAt=now))
        db.commit()


def record_state(engine: Engine, workspaceId, operationId: str, kind: str, payload: dict | None, cursor) -> None:
    state = OperationState.running if kind in ("accepted", "progress") else FINAL_STATES.get(str((payload or {}).get("state") or "succeeded"), OperationState.unknown)
    with Session(engine) as db:
        values = {"state": state, "updatedAt": datetime.now(timezone.utc)}
        if cursor is not None:
            values["progressCursor"] = str(cursor)[:128]
        try:
            operation = uuid.UUID(operationId)
        except ValueError:
            return
        db.execute(update(OperationMetadata).where(OperationMetadata.id == operation, OperationMetadata.workspaceId == workspaceId).values(**values))
        db.commit()


def bridge_router(engine: Engine, bridges: Bridges) -> APIRouter:
    router = APIRouter()

    async def serve(websocket: WebSocket) -> None:
        secret = bearer(websocket)
        workspace = await to_thread.run_sync(credential_workspace, engine, secret) if secret else None
        if not workspace:
            await websocket.close(code=4401, reason="runtime credential missing, revoked or expired")
            return
        await websocket.accept()
        try:
            hello = await websocket.receive_json()
        except Exception:
            await websocket.close(code=4400, reason="send BridgeHello first")
            return
        if not isinstance(hello, dict) or str(hello.get("workspaceId")) != str(workspace.id) or str(hello.get("installationId")) != str(workspace.installationId):
            await websocket.close(code=4403, reason="hello does not match the paired installation")
            return
        if hello.get("protocolVersion") != PROTOCOL_VERSION:
            await to_thread.run_sync(mark_incompatible, engine, workspace.id, hello)
            await websocket.close(code=4426, reason=f"protocol {PROTOCOL_VERSION} required")
            return
        holderId = new_holder()
        generation = await to_thread.run_sync(acquire_lease, engine, workspace.id, hello, holderId)
        link = Link(workspaceId=str(workspace.id), installationId=str(workspace.installationId), holderId=holderId, generation=generation, websocket=websocket)
        await bridges.attach(link)
        await link.send({"protocolVersion": PROTOCOL_VERSION, "kind": "heartbeat", "workspaceId": str(workspace.id), "routeGeneration": generation, "operationId": None, "authority": None, "payload": {"leaseSeconds": LEASE_SECONDS, "heartbeatSeconds": LEASE_HEARTBEAT_SECONDS}})
        try:
            while True:
                raw = await websocket.receive_text()
                if len(raw.encode()) > MAX_ENVELOPE_BYTES:
                    await websocket.close(code=4413, reason="envelope too large")
                    break
                envelope = json.loads(raw)
                if not isinstance(envelope, dict) or envelope.get("routeGeneration") != generation:
                    await websocket.close(code=4409, reason="stale route generation")
                    break
                kind = envelope.get("kind")
                if kind == "heartbeat":
                    if not await to_thread.run_sync(renew_lease, engine, workspace.id, holderId, generation):
                        await websocket.close(code=4409, reason="lease fenced")
                        break
                    continue
                operationId = envelope.get("operationId")
                if kind in ("accepted", "progress", "result", "reconcile", "cancel") and operationId:
                    if kind in ("accepted", "progress", "result"):
                        await to_thread.run_sync(record_state, engine, workspace.id, str(operationId), kind, envelope.get("payload") if kind == "result" else None, envelope.get("sequence") if kind == "progress" else None)
                    if kind != "progress":
                        link.answer(str(operationId), envelope)
        except WebSocketDisconnect:
            pass
        except (ValueError, TypeError):
            await websocket.close(code=4400, reason="malformed envelope")
        finally:
            if bridges.detach(link):
                await to_thread.run_sync(release_lease, engine, workspace.id, holderId, generation)

    router.add_api_websocket_route("/runtime/bridge", serve)
    return router, serve
