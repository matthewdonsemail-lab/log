import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from anyio import to_thread
from fastapi import APIRouter, Request, Response
from sqlalchemy.engine import Engine
from sqlmodel import Session, select

from controlService.access import current_caller, parse_id, team_access
from controlService.bridge import Bridges
from controlService.dispatchAuthority import request_hash, sign_authority
from controlService.errors import ApiError
from controlService.models import OperationMetadata, OperationState, TeamWorkspaceSelection, Workspace, WorkspaceStatus
from controlService.settings import DISPATCH_WAIT_SECONDS, OPERATION_METADATA_DAYS, PROTOCOL_VERSION, Settings
from controlService.tools import tool_kind
from controlService.views import OperationCreate, OperationView

NO_STORE = {"Cache-Control": "no-store"}


@dataclass
class Route:
    teamId: str
    workspaceId: str
    actorUserId: str
    authzVersion: int


def route_of(db: Session, access, bridges: Bridges) -> tuple[Workspace, object]:
    selection = db.get(TeamWorkspaceSelection, access.team.id)
    if not selection:
        raise ApiError("workspaceNotSelected", "set up a workspace first")
    workspace = db.get(Workspace, selection.workspaceId)
    if not workspace or workspace.teamId != access.team.id:
        raise ApiError("workspaceNotSelected")
    if workspace.status == WorkspaceStatus.revoked:
        raise ApiError("runtimeRevoked")
    if workspace.status == WorkspaceStatus.incompatible:
        raise ApiError("workspaceIncompatible")
    link = bridges.get(workspace.id)
    if not link or link.generation != workspace.connectionGeneration:
        raise ApiError("workspaceOffline", "the workspace is not connected")
    return workspace, link


def view_of(operationId: str, envelope: dict | None, fallback: OperationState) -> OperationView:
    if not envelope:
        return OperationView(operationId=operationId, state=fallback.value)
    payload = envelope.get("payload") or {}
    if envelope.get("kind") == "accepted":
        return OperationView(operationId=operationId, state=OperationState.running.value)
    state = str(payload.get("state") or fallback.value)
    return OperationView(operationId=operationId, state=state, progressCursor=payload.get("progressCursor"), result=payload.get("result"), error=payload.get("error"))


async def exchange(link, envelope: dict, operationId: str) -> dict | None:
    answer = await link.ask(envelope, operationId, DISPATCH_WAIT_SECONDS)
    if answer and answer.get("kind") == "accepted":
        final = await link.ask({**envelope, "kind": "reconcile", "authority": None, "payload": None}, operationId, DISPATCH_WAIT_SECONDS)
        return final or answer
    return answer


def operation_router(settings: Settings, engine: Engine, bridges: Bridges) -> APIRouter:
    router = APIRouter()

    def admit(request: Request, teamId: str, body: OperationCreate):
        with Session(engine, expire_on_commit=False) as db:
            access = team_access(db, current_caller(request, db, settings, mutating=True), teamId)
            kind = tool_kind(body.tool)
            if kind is None:
                raise ApiError("invalidInput", f"{body.tool} is not a registered tool")
            if not access.allows("readTools"):
                raise ApiError("forbidden")
            if kind == "write":
                raise ApiError("approvalRequired", "live writes need an approval, which is not built yet")
            operationId = parse_id(body.operationId)
            workspace, link = route_of(db, access, bridges)
            existing = db.get(OperationMetadata, operationId)
            if existing:
                if existing.teamId != access.team.id or existing.tool != body.tool or existing.workspaceId != workspace.id:
                    raise ApiError("idempotencyConflict")
                return access, workspace, link, existing.state, True
            now = datetime.now(timezone.utc)
            db.add(OperationMetadata(id=operationId, teamId=access.team.id, workspaceId=workspace.id, actorUserId=access.caller.user.id, tool=body.tool, state=OperationState.dispatched, routeGeneration=link.generation, expiresAt=now + timedelta(days=OPERATION_METADATA_DAYS)))
            db.commit()
            return access, workspace, link, OperationState.dispatched, False

    async def dispatch(request: Request, teamId: str, body: OperationCreate) -> OperationView:
        access, workspace, link, state, repeat = await to_thread.run_sync(admit, request, teamId, body)
        operationId = str(parse_id(body.operationId))
        authority = sign_authority(
            settings.dispatchSigningKey,
            teamId=str(access.team.id),
            workspaceId=str(workspace.id),
            actorUserId=str(access.caller.user.id),
            grantId=None,
            tool=body.tool,
            requestHash=request_hash(body.tool, body.args),
            routeGeneration=link.generation,
            authzVersion=access.team.authzVersion,
        )
        envelope = {"protocolVersion": PROTOCOL_VERSION, "kind": "reconcile" if repeat else "dispatch", "workspaceId": str(workspace.id), "routeGeneration": link.generation, "operationId": operationId, "authority": authority, "payload": {"tool": body.tool, "args": body.args}}
        return view_of(operationId, await exchange(link, envelope, operationId), state)

    @router.post("/teams/{teamId}/operations", response_model=OperationView)
    async def create_operation(teamId: str, body: OperationCreate, request: Request, response: Response):
        response.headers.update(NO_STORE)
        return await dispatch(request, teamId, body)

    def lookup(request: Request, teamId: str, operationId: str, mutating: bool):
        with Session(engine, expire_on_commit=False) as db:
            access = team_access(db, current_caller(request, db, settings, mutating=mutating), teamId)
            metadata = db.get(OperationMetadata, parse_id(operationId))
            if not metadata or metadata.teamId != access.team.id:
                raise ApiError("notFound")
            if metadata.actorUserId != access.caller.user.id and not access.allows("teamAdmin"):
                raise ApiError("forbidden")
            db.expunge(metadata)
            return access, metadata

    async def relay(request: Request, teamId: str, operationId: str, kind: str) -> OperationView:
        access, metadata = await to_thread.run_sync(lookup, request, teamId, operationId, kind == "cancel")
        link = bridges.get(metadata.workspaceId)
        if not link:
            view = OperationView(operationId=str(metadata.id), state=metadata.state.value, progressCursor=metadata.progressCursor)
            view.error = {"code": "workspaceOffline", "message": "the workspace is offline, the result stays there until it reconnects"}
            return view
        envelope = {"protocolVersion": PROTOCOL_VERSION, "kind": kind, "workspaceId": str(metadata.workspaceId), "routeGeneration": link.generation, "operationId": str(metadata.id), "authority": None, "payload": None}
        return view_of(str(metadata.id), await exchange(link, envelope, str(metadata.id)), metadata.state)

    @router.get("/teams/{teamId}/operations/{operationId}", response_model=OperationView)
    async def get_operation(teamId: str, operationId: str, request: Request, response: Response):
        response.headers.update(NO_STORE)
        return await relay(request, teamId, operationId, "reconcile")

    @router.post("/teams/{teamId}/operations/{operationId}/cancel", response_model=OperationView)
    async def cancel_operation(teamId: str, operationId: str, request: Request, response: Response):
        response.headers.update(NO_STORE)
        return await relay(request, teamId, operationId, "cancel")

    def read_admit(request: Request, teamId: str):
        with Session(engine, expire_on_commit=False) as db:
            access = team_access(db, current_caller(request, db, settings, mutating=False), teamId, "readTools")
            workspace, link = route_of(db, access, bridges)
            return access, workspace, link

    @router.get("/teams/{teamId}/accounts")
    async def list_accounts(teamId: str, request: Request, response: Response, cursor: str | None = None, limit: int = 50):
        response.headers.update(NO_STORE)
        access, workspace, link = await to_thread.run_sync(read_admit, request, teamId)
        operationId = str(uuid.uuid4())
        args = {"cursor": cursor, "limit": max(1, min(limit, 200))}
        authority = sign_authority(settings.dispatchSigningKey, teamId=str(access.team.id), workspaceId=str(workspace.id), actorUserId=str(access.caller.user.id), grantId=None, tool="accountsList", requestHash=request_hash("accountsList", args), routeGeneration=link.generation, authzVersion=access.team.authzVersion)
        envelope = {"protocolVersion": PROTOCOL_VERSION, "kind": "dispatch", "workspaceId": str(workspace.id), "routeGeneration": link.generation, "operationId": operationId, "authority": authority, "payload": {"tool": "accountsList", "args": args}}
        answer = await exchange(link, envelope, operationId)
        payload = (answer or {}).get("payload") or {}
        if not answer or payload.get("state") not in ("succeeded", None):
            raise ApiError("workspaceOffline", "the workspace did not answer in time")
        result = payload.get("result") or {}
        return {"accounts": result.get("accounts", []), "cursor": result.get("cursor")}

    return router
