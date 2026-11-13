import uuid
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone

from anyio import to_thread
from sqlalchemy.engine import Engine
from sqlmodel import Session, select

from controlService.access import PERMISSIONS
from controlService.bridge import Bridges, Link
from controlService.dispatchAuthority import request_hash, sign_authority
from controlService.errors import ApiError
from controlService.models import Membership, MembershipStatus, OperationMetadata, OperationState, Team, TeamWorkspaceSelection, Workspace, WorkspaceStatus
from controlService.settings import DISPATCH_WAIT_SECONDS, OPERATION_METADATA_DAYS, PROTOCOL_VERSION, Settings
from controlService.tools import CONSOLE_TOOLS, tool_kind
from controlService.views import OperationView


@dataclass
class Actor:
    teamId: uuid.UUID
    userId: uuid.UUID
    grantId: uuid.UUID | None = None
    scopes: frozenset = field(default_factory=lambda: frozenset({"log:read", "log:write"}))


def current_membership(db: Session, actor: Actor) -> tuple[Team, Membership]:
    team = db.get(Team, actor.teamId)
    membership = db.exec(select(Membership).where(Membership.teamId == actor.teamId, Membership.userId == actor.userId, Membership.status == MembershipStatus.active)).first()
    if not team or team.suspended or not membership:
        raise ApiError("forbidden")
    return team, membership


def selected_route(db: Session, teamId, bridges: Bridges) -> tuple[Workspace, Link]:
    selection = db.get(TeamWorkspaceSelection, teamId)
    if not selection:
        raise ApiError("workspaceNotSelected", "set up a workspace first")
    workspace = db.get(Workspace, selection.workspaceId)
    if not workspace or workspace.teamId != teamId:
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
    return OperationView(operationId=operationId, state=str(payload.get("state") or fallback.value), progressCursor=payload.get("progressCursor"), result=payload.get("result"), error=payload.get("error"))


async def exchange(link: Link, envelope: dict, operationId: str) -> dict | None:
    answer = await link.ask(envelope, operationId, DISPATCH_WAIT_SECONDS)
    if answer and answer.get("kind") == "accepted":
        final = await link.ask({**envelope, "kind": "reconcile", "authority": None, "payload": None}, operationId, DISPATCH_WAIT_SECONDS)
        return final or answer
    return answer


@dataclass
class Dispatcher:
    settings: Settings
    engine: Engine
    bridges: Bridges

    def admit(self, actor: Actor, operationId: uuid.UUID, tool: str, record: bool):
        kind = tool_kind(tool)
        if kind is None:
            raise ApiError("invalidInput", f"{tool} is not a registered tool")
        with Session(self.engine, expire_on_commit=False) as db:
            team, membership = current_membership(db, actor)
            needed = "approvedWriteTools" if kind == "write" else "readTools"
            if needed not in PERMISSIONS[membership.role] or f"log:{kind}" not in actor.scopes:
                raise ApiError("forbidden", f"this {'grant' if actor.grantId else 'role'} may not run {kind} tools")
            if kind == "write":
                raise ApiError("approvalRequired", "live writes need an approval, which is not built yet")
            workspace, link = selected_route(db, team.id, self.bridges)
            if not record:
                return team, workspace, link, OperationState.dispatched, False
            existing = db.get(OperationMetadata, operationId)
            if existing:
                if existing.teamId != team.id or existing.tool != tool or existing.workspaceId != workspace.id:
                    raise ApiError("idempotencyConflict")
                return team, workspace, link, existing.state, True
            now = datetime.now(timezone.utc)
            db.add(OperationMetadata(id=operationId, teamId=team.id, workspaceId=workspace.id, actorUserId=actor.userId, grantId=actor.grantId, tool=tool, state=OperationState.dispatched, routeGeneration=link.generation, expiresAt=now + timedelta(days=OPERATION_METADATA_DAYS)))
            db.commit()
            return team, workspace, link, OperationState.dispatched, False

    def admit_console(self, actor: Actor, tool: str):
        permission = CONSOLE_TOOLS.get(tool)
        if permission is None:
            raise ApiError("invalidInput", f"{tool} is not a console operation")
        with Session(self.engine, expire_on_commit=False) as db:
            team, membership = current_membership(db, actor)
            if permission not in PERMISSIONS[membership.role]:
                raise ApiError("forbidden", "your role may not do that in this team")
            workspace, link = selected_route(db, team.id, self.bridges)
            return team, workspace, link

    async def run_console(self, actor: Actor, tool: str, args: dict) -> OperationView:
        team, workspace, link = await to_thread.run_sync(self.admit_console, actor, tool)
        return await self.dispatch(actor, team, workspace, link, uuid.uuid4(), tool, args, OperationState.dispatched, False)

    async def run(self, actor: Actor, operationId: uuid.UUID, tool: str, args: dict, record: bool = True) -> OperationView:
        team, workspace, link, state, repeat = await to_thread.run_sync(self.admit, actor, operationId, tool, record)
        return await self.dispatch(actor, team, workspace, link, operationId, tool, args, state, repeat)

    async def dispatch(self, actor: Actor, team: Team, workspace: Workspace, link: Link, operationId: uuid.UUID, tool: str, args: dict, state: OperationState, repeat: bool) -> OperationView:
        authority = sign_authority(
            self.settings.dispatchSigningKey,
            teamId=str(team.id),
            workspaceId=str(workspace.id),
            actorUserId=str(actor.userId),
            grantId=str(actor.grantId) if actor.grantId else None,
            tool=tool,
            requestHash=request_hash(tool, args),
            routeGeneration=link.generation,
            authzVersion=team.authzVersion,
        )
        envelope = {"protocolVersion": PROTOCOL_VERSION, "kind": "reconcile" if repeat else "dispatch", "workspaceId": str(workspace.id), "routeGeneration": link.generation, "operationId": str(operationId), "authority": authority, "payload": {"tool": tool, "args": args}}
        return view_of(str(operationId), await exchange(link, envelope, str(operationId)), state)
