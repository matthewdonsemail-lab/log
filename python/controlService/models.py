import uuid
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import Column, DateTime, Index, UniqueConstraint
from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def stamp() -> Column:
    return Column(DateTime(timezone=True), nullable=False)


def optionalStamp() -> Column:
    return Column(DateTime(timezone=True), nullable=True)


class Role(str, Enum):
    owner = "owner"
    admin = "admin"
    member = "member"


class MembershipStatus(str, Enum):
    active = "active"
    revoked = "revoked"


class ChallengePurpose(str, Enum):
    signIn = "signIn"


class User(SQLModel, table=True):
    __tablename__ = "users"
    __table_args__ = (UniqueConstraint("emailCanonical"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    updatedAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    email: str
    emailCanonical: str
    emailVerifiedAt: datetime | None = Field(default=None, sa_column=optionalStamp())
    suspended: bool = False
    tokenVersion: int = 1


class Team(SQLModel, table=True):
    __tablename__ = "teams"
    __table_args__ = (UniqueConstraint("slug"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    updatedAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    name: str
    slug: str
    suspended: bool = False
    authzVersion: int = 1


class Membership(SQLModel, table=True):
    __tablename__ = "memberships"
    __table_args__ = (UniqueConstraint("teamId", "userId"), Index("ixMembershipsUserStatus", "userId", "status"))
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    updatedAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    teamId: uuid.UUID = Field(foreign_key="teams.id", ondelete="RESTRICT")
    userId: uuid.UUID = Field(foreign_key="users.id", ondelete="RESTRICT")
    role: Role
    status: MembershipStatus = MembershipStatus.active
    version: int = 1


class Invite(SQLModel, table=True):
    __tablename__ = "invites"
    __table_args__ = (UniqueConstraint("tokenHash"), Index("ixInvitesTeamEmail", "teamId", "emailCanonical"))
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    updatedAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    teamId: uuid.UUID = Field(foreign_key="teams.id", ondelete="RESTRICT")
    emailCanonical: str
    role: Role
    tokenHash: str
    invitedBy: uuid.UUID = Field(foreign_key="users.id", ondelete="RESTRICT")
    expiresAt: datetime = Field(sa_column=stamp())
    acceptedAt: datetime | None = Field(default=None, sa_column=optionalStamp())
    acceptedBy: uuid.UUID | None = Field(default=None, foreign_key="users.id", ondelete="RESTRICT")
    revokedAt: datetime | None = Field(default=None, sa_column=optionalStamp())


class EmailChallenge(SQLModel, table=True):
    __tablename__ = "emailChallenges"
    __table_args__ = (Index("ixEmailChallengesLookup", "emailCanonical", "purpose", "expiresAt"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    updatedAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    emailCanonical: str
    purpose: ChallengePurpose = ChallengePurpose.signIn
    codeVerifier: str
    expiresAt: datetime = Field(sa_column=stamp())
    attempts: int = 0
    maxAttempts: int
    consumedAt: datetime | None = Field(default=None, sa_column=optionalStamp())
    supersededAt: datetime | None = Field(default=None, sa_column=optionalStamp())
    returnContextId: uuid.UUID | None = None
    safeReturnPath: str | None = None


class WebsiteSession(SQLModel, table=True):
    __tablename__ = "websiteSessions"
    __table_args__ = (UniqueConstraint("tokenHash"), Index("ixWebsiteSessionsUserRevoked", "userId", "revokedAt"))
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    updatedAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    userId: uuid.UUID = Field(foreign_key="users.id", ondelete="RESTRICT")
    tokenHash: str
    selectedTeamId: uuid.UUID | None = Field(default=None, foreign_key="teams.id", ondelete="RESTRICT")
    issuedTokenVersion: int
    expiresAt: datetime = Field(sa_column=stamp())
    lastSeenAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    revokedAt: datetime | None = Field(default=None, sa_column=optionalStamp())
