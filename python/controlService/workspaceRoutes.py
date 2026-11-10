import hashlib
import re
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy import update
from sqlmodel import Session, select

from controlService.access import current_caller, parse_id, team_access
from controlService.bridge import Bridges
from controlService.dispatchAuthority import public_key
from controlService.errors import ApiError
from controlService.models import (
    RuntimeCredential,
    TeamWorkspaceSelection,
    Workspace,
    WorkspacePairing,
    WorkspaceProvider,
    WorkspaceStatus,
)
from controlService.security import aware, new_token, same, token_hash
from controlService.settings import PAIRING_SECONDS, PROTOCOL_VERSION, RUNTIME_CREDENTIAL_DAYS, Settings
from controlService.views import PairingCreate, PairingView, RuntimeCredentialView, RuntimePair, WorkspaceCreate, WorkspaceSelect, WorkspaceView

NO_STORE = {"Cache-Control": "no-store"}
HEX64 = re.compile(r"^[0-9a-f]{64}$")


def live_status(workspace: Workspace, bridges: Bridges) -> WorkspaceStatus:
    if workspace.status in (WorkspaceStatus.revoked, WorkspaceStatus.incompatible, WorkspaceStatus.pending):
        return workspace.status
    return WorkspaceStatus.ready if bridges.get(workspace.id) else WorkspaceStatus.offline


def workspace_view(workspace: Workspace, selectedId, bridges: Bridges) -> WorkspaceView:
    return WorkspaceView(
        id=str(workspace.id),
        provider=workspace.provider,
        status=live_status(workspace, bridges),
        selected=selectedId == workspace.id,
        lastContactAt=aware(workspace.lastContactAt),
        capabilities=workspace.capabilitySummary or None,
        browserConnection=None,
    )


def selection_of(db: Session, teamId) -> TeamWorkspaceSelection | None:
    return db.get(TeamWorkspaceSelection, teamId)


def team_workspace(db: Session, teamId, workspaceId: str) -> Workspace:
    workspace = db.exec(select(Workspace).where(Workspace.id == parse_id(workspaceId), Workspace.teamId == teamId)).first()
    if not workspace:
        raise ApiError("notFound")
    return workspace


def workspace_router(settings: Settings, open_db, bridges: Bridges) -> APIRouter:
    router = APIRouter()

    @router.get("/teams/{teamId}/workspaces", response_model=list[WorkspaceView])
    def list_workspaces(teamId: str, request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        access = team_access(db, current_caller(request, db, settings, mutating=False), teamId)
        selection = selection_of(db, access.team.id)
        rows = db.exec(select(Workspace).where(Workspace.teamId == access.team.id).order_by(Workspace.createdAt)).all()
        return [workspace_view(row, selection.workspaceId if selection else None, bridges) for row in rows]

    @router.post("/teams/{teamId}/workspaces", response_model=WorkspaceView, status_code=201)
    def create_workspace(teamId: str, body: WorkspaceCreate, request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        access = team_access(db, current_caller(request, db, settings, mutating=True), teamId, "workspaceAdmin")
        if body.provider == WorkspaceProvider.boat:
            raise ApiError("providerUnavailable", "boat workspaces are not connected yet")
        workspace = Workspace(teamId=access.team.id, createdBy=access.caller.user.id, provider=body.provider)
        db.add(workspace)
        db.flush()
        selection = selection_of(db, access.team.id)
        if not selection:
            db.add(TeamWorkspaceSelection(teamId=access.team.id, workspaceId=workspace.id, selectedBy=access.caller.user.id))
        db.commit()
        db.refresh(workspace)
        selection = selection_of(db, access.team.id)
        return workspace_view(workspace, selection.workspaceId if selection else None, bridges)

    @router.post("/teams/{teamId}/workspaceSelection", response_model=WorkspaceView)
    def select_workspace(teamId: str, body: WorkspaceSelect, request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        access = team_access(db, current_caller(request, db, settings, mutating=True), teamId, "workspaceAdmin")
        workspace = team_workspace(db, access.team.id, body.workspaceId)
        if workspace.status == WorkspaceStatus.revoked:
            raise ApiError("runtimeRevoked")
        now = datetime.now(timezone.utc)
        selection = db.exec(select(TeamWorkspaceSelection).where(TeamWorkspaceSelection.teamId == access.team.id).with_for_update()).first()
        current = selection.generation if selection else 0
        if body.expectedGeneration != current:
            db.rollback()
            raise ApiError("conflict", f"the selection changed, generation is {current}")
        if selection:
            selection.workspaceId = workspace.id
            selection.selectedBy = access.caller.user.id
            selection.selectedAt = now
            selection.generation = current + 1
        else:
            selection = TeamWorkspaceSelection(teamId=access.team.id, workspaceId=workspace.id, selectedBy=access.caller.user.id, generation=1)
        db.add(selection)
        db.commit()
        return workspace_view(workspace, workspace.id, bridges)

    @router.post("/teams/{teamId}/workspaces/{workspaceId}/pairings", response_model=PairingView, status_code=201)
    def create_pairing(teamId: str, workspaceId: str, body: PairingCreate, request: Request, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        access = team_access(db, current_caller(request, db, settings, mutating=True), teamId, "workspaceAdmin")
        workspace = team_workspace(db, access.team.id, workspaceId)
        if workspace.status == WorkspaceStatus.revoked:
            raise ApiError("runtimeRevoked")
        if not HEX64.match(body.challengeHash):
            raise ApiError("invalidInput", "challengeHash is sha256 hex of the runtime's challenge proof")
        now = datetime.now(timezone.utc)
        db.execute(update(WorkspacePairing).where(WorkspacePairing.workspaceId == workspace.id, WorkspacePairing.consumedAt.is_(None), WorkspacePairing.revokedAt.is_(None)).values(revokedAt=now, updatedAt=now))
        token = new_token()
        pairing = WorkspacePairing(teamId=access.team.id, workspaceId=workspace.id, approvedBy=access.caller.user.id, tokenHash=token_hash(token), challengeHash=body.challengeHash, expiresAt=now + timedelta(seconds=PAIRING_SECONDS))
        db.add(pairing)
        db.commit()
        return PairingView(id=str(pairing.id), token=token, expiresAt=pairing.expiresAt, workspaceId=str(workspace.id))

    @router.post("/teams/{teamId}/workspaces/{workspaceId}/revoke", status_code=204)
    async def revoke_workspace(teamId: str, workspaceId: str, request: Request, db: Session = Depends(open_db)):
        access = team_access(db, current_caller(request, db, settings, mutating=True), teamId, "workspaceAdmin")
        workspace = team_workspace(db, access.team.id, workspaceId)
        now = datetime.now(timezone.utc)
        workspace.status = WorkspaceStatus.revoked
        workspace.revokedAt = now
        workspace.updatedAt = now
        workspace.connectionGeneration += 1
        db.add(workspace)
        db.execute(update(RuntimeCredential).where(RuntimeCredential.workspaceId == workspace.id, RuntimeCredential.revokedAt.is_(None)).values(revokedAt=now, updatedAt=now))
        db.execute(update(WorkspacePairing).where(WorkspacePairing.workspaceId == workspace.id, WorkspacePairing.consumedAt.is_(None), WorkspacePairing.revokedAt.is_(None)).values(revokedAt=now, updatedAt=now))
        db.commit()
        await bridges.close(workspace.id, 4403, "workspace revoked")
        return Response(status_code=204, headers=NO_STORE)

    @router.post("/runtime/pair", response_model=RuntimeCredentialView)
    def pair_runtime(body: RuntimePair, response: Response, db: Session = Depends(open_db)):
        response.headers.update(NO_STORE)
        now = datetime.now(timezone.utc)
        pairing = db.exec(select(WorkspacePairing).where(WorkspacePairing.tokenHash == token_hash(body.pairingToken))).first()
        if not pairing or pairing.consumedAt or pairing.revokedAt or aware(pairing.expiresAt) <= now:
            raise ApiError("unauthenticated", "the pairing code is used, withdrawn or expired")
        if not same(hashlib.sha256(body.challengeProof.encode()).hexdigest(), pairing.challengeHash):
            raise ApiError("unauthenticated", "the pairing code does not match this runtime")
        consumed = db.execute(update(WorkspacePairing).where(WorkspacePairing.id == pairing.id, WorkspacePairing.consumedAt.is_(None), WorkspacePairing.revokedAt.is_(None)).values(consumedAt=now, updatedAt=now))
        if consumed.rowcount != 1:
            db.rollback()
            raise ApiError("unauthenticated", "the pairing code is used, withdrawn or expired")
        workspace = db.exec(select(Workspace).where(Workspace.id == pairing.workspaceId, Workspace.teamId == pairing.teamId).with_for_update()).one()
        if workspace.status == WorkspaceStatus.revoked:
            db.rollback()
            raise ApiError("runtimeRevoked")
        db.execute(update(RuntimeCredential).where(RuntimeCredential.workspaceId == workspace.id, RuntimeCredential.revokedAt.is_(None)).values(revokedAt=now, updatedAt=now))
        previous = db.exec(select(RuntimeCredential.generation).where(RuntimeCredential.workspaceId == workspace.id).order_by(RuntimeCredential.generation.desc())).first() or 0
        secret = new_token()
        credential = RuntimeCredential(workspaceId=workspace.id, tokenHash=token_hash(secret), generation=previous + 1, expiresAt=now + timedelta(days=RUNTIME_CREDENTIAL_DAYS))
        workspace.installationId = parse_id(body.installationId)
        workspace.status = WorkspaceStatus.connecting
        workspace.connectionGeneration += 1
        workspace.updatedAt = now
        db.add(credential)
        db.add(workspace)
        db.commit()
        return RuntimeCredentialView(workspaceId=str(workspace.id), credential=secret, generation=credential.generation, expiresAt=credential.expiresAt)

    @router.get("/runtime/dispatchKey")
    def dispatch_key(response: Response):
        response.headers["Cache-Control"] = "public, max-age=300"
        return {"algorithm": "ed25519", "publicKey": public_key(settings.dispatchSigningKey), "protocolVersion": PROTOCOL_VERSION, "bridgeUrl": settings.bridgePublicUrl}

    return router
