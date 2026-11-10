from datetime import datetime, timezone

from pydantic import BaseModel, ConfigDict, Field

from controlService.models import Invite, Membership, Role, Team, User
from controlService.security import aware


class Strict(BaseModel):
    model_config = ConfigDict(extra="forbid")


class UserView(Strict):
    id: str
    email: str
    emailVerified: bool


class TeamView(Strict):
    id: str
    name: str
    slug: str
    role: Role


class SessionView(Strict):
    user: UserView
    teams: list[TeamView]
    selectedTeamId: str | None
    expiresAt: datetime


class AuthChallengeView(Strict):
    challengeId: str
    expiresAt: datetime
    retryAfterSeconds: int


class MemberView(Strict):
    id: str
    userId: str
    email: str
    role: Role
    status: str


class InviteView(Strict):
    id: str
    email: str
    role: Role
    expiresAt: datetime
    status: str


class EmailStart(Strict):
    email: str = Field(max_length=320)
    returnContextId: str | None = None
    returnPath: str | None = Field(default=None, max_length=512)


class EmailVerify(Strict):
    challengeId: str = Field(max_length=64)
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class TeamCreate(Strict):
    name: str = Field(min_length=1, max_length=80)
    slug: str = Field(min_length=2, max_length=48, pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")


class TeamSelect(Strict):
    teamId: str


class MemberUpdate(Strict):
    role: Role | None = None
    status: str | None = Field(default=None, pattern=r"^(active|revoked)$")


class InviteCreate(Strict):
    email: str = Field(max_length=320)
    role: Role = Role.member


class InviteAccept(Strict):
    token: str = Field(min_length=16, max_length=128)


def user_view(user: User) -> UserView:
    return UserView(id=str(user.id), email=user.email, emailVerified=user.emailVerifiedAt is not None)


def team_view(team: Team, membership: Membership) -> TeamView:
    return TeamView(id=str(team.id), name=team.name, slug=team.slug, role=membership.role)


def member_view(membership: Membership, user: User) -> MemberView:
    return MemberView(id=str(membership.id), userId=str(user.id), email=user.email, role=membership.role, status=membership.status.value)


def invite_status(invite: Invite) -> str:
    if invite.revokedAt:
        return "revoked"
    if invite.acceptedAt:
        return "accepted"
    if aware(invite.expiresAt) <= datetime.now(timezone.utc):
        return "expired"
    return "pending"


def invite_view(invite: Invite) -> InviteView:
    return InviteView(id=str(invite.id), email=invite.emailCanonical, role=invite.role, expiresAt=aware(invite.expiresAt), status=invite_status(invite))
