import uuid
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from fastapi import Request
from sqlmodel import Session, select

from controlService.errors import ApiError
from controlService.models import Membership, MembershipStatus, Role, Team, User, WebsiteSession
from controlService.security import aware, csrf_token, same, token_hash
from controlService.settings import CSRF_HEADER, SESSION_COOKIE, Settings

PERMISSIONS = {
    Role.owner: {"teamAdmin", "invite", "membershipAdmin", "providerAdmin", "workspaceAdmin", "browserAdmin", "readTools", "approvedWriteTools", "grantRevoke"},
    Role.admin: {"invite", "nonOwnerMembershipAdmin", "providerAdmin", "workspaceAdmin", "browserAdmin", "readTools", "approvedWriteTools"},
    Role.member: {"readTools", "approvedWriteTools", "ownGrantRevoke"},
}

LAST_SEEN_EVERY = timedelta(minutes=5)


@dataclass
class Caller:
    session: WebsiteSession
    user: User
    token: str


@dataclass
class TeamAccess:
    caller: Caller
    team: Team
    membership: Membership

    def allows(self, permission: str) -> bool:
        return permission in PERMISSIONS[self.membership.role]


def parse_id(value: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except (ValueError, TypeError):
        raise ApiError("notFound")


def check_origin(request: Request, settings: Settings) -> None:
    origin = request.headers.get("origin")
    if origin and origin.rstrip("/") not in {settings.appOrigin, settings.consoleOrigin}:
        raise ApiError("forbidden", "origin not allowed")


def current_caller(request: Request, db: Session, settings: Settings, *, mutating: bool) -> Caller:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise ApiError("unauthenticated")
    found = db.exec(select(WebsiteSession).where(WebsiteSession.tokenHash == token_hash(token))).first()
    now = datetime.now(timezone.utc)
    if not found or found.revokedAt or aware(found.expiresAt) <= now:
        raise ApiError("unauthenticated")
    user = db.get(User, found.userId)
    if not user or user.suspended or found.issuedTokenVersion != user.tokenVersion:
        raise ApiError("unauthenticated")
    if mutating:
        check_origin(request, settings)
        sent = request.headers.get(CSRF_HEADER) or ""
        if not same(sent, csrf_token(settings.sessionSecret, token)):
            raise ApiError("forbidden", "csrf token missing or wrong")
    if now - aware(found.lastSeenAt) > LAST_SEEN_EVERY:
        found.lastSeenAt = now
        db.add(found)
        db.commit()
        db.refresh(found)
    return Caller(session=found, user=user, token=token)


def team_access(db: Session, caller: Caller, teamId: str, permission: str | None = None) -> TeamAccess:
    teamUuid = parse_id(teamId)
    membership = db.exec(select(Membership).where(Membership.teamId == teamUuid, Membership.userId == caller.user.id, Membership.status == MembershipStatus.active)).first()
    team = db.get(Team, teamUuid) if membership else None
    if not membership or not team or team.suspended:
        raise ApiError("forbidden")
    access = TeamAccess(caller=caller, team=team, membership=membership)
    if permission and not access.allows(permission):
        raise ApiError("forbidden")
    return access


def active_teams(db: Session, user: User) -> list[tuple[Team, Membership]]:
    rows = db.exec(select(Team, Membership).join(Membership, Membership.teamId == Team.id).where(Membership.userId == user.id, Membership.status == MembershipStatus.active, Team.suspended.is_(False)).order_by(Team.name)).all()
    return [(team, membership) for team, membership in rows]
