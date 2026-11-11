import uuid

from anyio import to_thread
from fastapi import APIRouter, Request, Response
from sqlalchemy.engine import Engine
from sqlmodel import Session

from controlService.access import current_caller, parse_id, team_access
from controlService.bridge import Bridges
from controlService.dispatcher import Actor, Dispatcher, exchange, view_of
from controlService.errors import ApiError
from controlService.models import OperationMetadata
from controlService.settings import PROTOCOL_VERSION, Settings
from controlService.views import OperationCreate, OperationView

NO_STORE = {"Cache-Control": "no-store"}


def operation_router(settings: Settings, engine: Engine, bridges: Bridges, dispatcher: Dispatcher) -> APIRouter:
    router = APIRouter()

    def actor_of(request: Request, teamId: str, mutating: bool) -> Actor:
        with Session(engine, expire_on_commit=False) as db:
            access = team_access(db, current_caller(request, db, settings, mutating=mutating), teamId)
            return Actor(teamId=access.team.id, userId=access.caller.user.id)

    @router.post("/teams/{teamId}/operations", response_model=OperationView)
    async def create_operation(teamId: str, body: OperationCreate, request: Request, response: Response):
        response.headers.update(NO_STORE)
        actor = await to_thread.run_sync(actor_of, request, teamId, True)
        return await dispatcher.run(actor, parse_id(body.operationId), body.tool, body.args)

    def lookup(request: Request, teamId: str, operationId: str, mutating: bool):
        with Session(engine, expire_on_commit=False) as db:
            access = team_access(db, current_caller(request, db, settings, mutating=mutating), teamId)
            metadata = db.get(OperationMetadata, parse_id(operationId))
            if not metadata or metadata.teamId != access.team.id:
                raise ApiError("notFound")
            if metadata.actorUserId != access.caller.user.id and not access.allows("teamAdmin"):
                raise ApiError("forbidden")
            return metadata

    async def relay(request: Request, teamId: str, operationId: str, kind: str) -> OperationView:
        metadata = await to_thread.run_sync(lookup, request, teamId, operationId, kind == "cancel")
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

    @router.get("/teams/{teamId}/accounts")
    async def list_accounts(teamId: str, request: Request, response: Response, cursor: str | None = None, limit: int = 50):
        response.headers.update(NO_STORE)
        actor = await to_thread.run_sync(actor_of, request, teamId, False)
        view = await dispatcher.run(actor, uuid.uuid4(), "accountsList", {"cursor": cursor, "limit": max(1, min(limit, 200))}, record=False)
        if view.state != "succeeded":
            raise ApiError("workspaceOffline", "the workspace did not answer in time")
        result = view.result or {}
        return {"accounts": result.get("accounts", []), "cursor": result.get("cursor")}

    return router
