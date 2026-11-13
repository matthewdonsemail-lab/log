import uuid
from datetime import datetime, timezone
from enum import Enum

from sqlalchemy import JSON, CheckConstraint, Column, DateTime, ForeignKeyConstraint, Index, UniqueConstraint
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


class WorkspaceProvider(str, Enum):
    ownCloud = "ownCloud"
    boat = "boat"


class WorkspaceStatus(str, Enum):
    pending = "pending"
    connecting = "connecting"
    ready = "ready"
    offline = "offline"
    incompatible = "incompatible"
    revoked = "revoked"


class OperationState(str, Enum):
    accepted = "accepted"
    dispatched = "dispatched"
    running = "running"
    succeeded = "succeeded"
    failed = "failed"
    cancelled = "cancelled"
    unknown = "unknown"


class Workspace(SQLModel, table=True):
    __tablename__ = "workspaces"
    __table_args__ = (UniqueConstraint("id", "teamId"), Index("ixWorkspacesTeamStatus", "teamId", "status"))
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    updatedAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    teamId: uuid.UUID = Field(foreign_key="teams.id", ondelete="RESTRICT")
    createdBy: uuid.UUID = Field(foreign_key="users.id", ondelete="RESTRICT")
    provider: WorkspaceProvider
    providerConnectionId: uuid.UUID | None = None
    providerRuntimeId: str | None = None
    installationId: uuid.UUID | None = None
    status: WorkspaceStatus = WorkspaceStatus.pending
    runtimeVersion: str | None = None
    protocolVersion: int | None = None
    schemaVersion: int | None = None
    connectionGeneration: int = 0
    capabilitySummary: dict = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    lastContactAt: datetime | None = Field(default=None, sa_column=optionalStamp())
    revokedAt: datetime | None = Field(default=None, sa_column=optionalStamp())


class TeamWorkspaceSelection(SQLModel, table=True):
    __tablename__ = "teamWorkspaceSelections"
    __table_args__ = (UniqueConstraint("workspaceId"), ForeignKeyConstraint(["workspaceId", "teamId"], ["workspaces.id", "workspaces.teamId"], ondelete="RESTRICT"))
    teamId: uuid.UUID = Field(foreign_key="teams.id", ondelete="RESTRICT", primary_key=True)
    workspaceId: uuid.UUID
    selectedBy: uuid.UUID = Field(foreign_key="users.id", ondelete="RESTRICT")
    selectedAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    generation: int = 1


class WorkspacePairing(SQLModel, table=True):
    __tablename__ = "workspacePairings"
    __table_args__ = (UniqueConstraint("tokenHash"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    updatedAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    teamId: uuid.UUID = Field(foreign_key="teams.id", ondelete="RESTRICT")
    workspaceId: uuid.UUID = Field(foreign_key="workspaces.id", ondelete="RESTRICT")
    approvedBy: uuid.UUID = Field(foreign_key="users.id", ondelete="RESTRICT")
    tokenHash: str
    challengeHash: str
    expiresAt: datetime = Field(sa_column=stamp())
    consumedAt: datetime | None = Field(default=None, sa_column=optionalStamp())
    revokedAt: datetime | None = Field(default=None, sa_column=optionalStamp())


class RuntimeCredential(SQLModel, table=True):
    __tablename__ = "runtimeCredentials"
    __table_args__ = (UniqueConstraint("tokenHash"), Index("ixRuntimeCredentialsWorkspaceGeneration", "workspaceId", "generation"))
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    updatedAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    workspaceId: uuid.UUID = Field(foreign_key="workspaces.id", ondelete="RESTRICT")
    tokenHash: str
    generation: int
    expiresAt: datetime = Field(sa_column=stamp())
    revokedAt: datetime | None = Field(default=None, sa_column=optionalStamp())


class WorkspaceLease(SQLModel, table=True):
    __tablename__ = "workspaceLeases"
    workspaceId: uuid.UUID = Field(foreign_key="workspaces.id", ondelete="RESTRICT", primary_key=True)
    holderId: str
    generation: int
    acquiredAt: datetime = Field(sa_column=stamp())
    heartbeatAt: datetime = Field(sa_column=stamp())
    expiresAt: datetime = Field(sa_column=stamp())


class OperationMetadata(SQLModel, table=True):
    __tablename__ = "operationMetadata"
    __table_args__ = (
        Index("ixOperationMetadataTeamCreated", "teamId", "createdAt"),
        Index("ixOperationMetadataWorkspaceState", "workspaceId", "state"),
        Index("ixOperationMetadataExpires", "expiresAt"),
        CheckConstraint('"actorUserId" IS NOT NULL OR "grantId" IS NOT NULL', name="ckOperationMetadataAuthority"),
    )
    id: uuid.UUID = Field(primary_key=True)
    teamId: uuid.UUID = Field(foreign_key="teams.id", ondelete="RESTRICT")
    workspaceId: uuid.UUID = Field(foreign_key="workspaces.id", ondelete="RESTRICT")
    grantId: uuid.UUID | None = None
    actorUserId: uuid.UUID | None = Field(default=None, foreign_key="users.id", ondelete="RESTRICT")
    tool: str
    state: OperationState = OperationState.accepted
    routeGeneration: int
    progressCursor: str | None = None
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    updatedAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    expiresAt: datetime = Field(sa_column=stamp())


class ClientKind(str, Enum):
    public = "public"
    confidential = "confidential"


class RegistrationStatus(str, Enum):
    active = "active"
    revoked = "revoked"


class OauthClient(SQLModel, table=True):
    __tablename__ = "oauthClients"
    __table_args__ = (UniqueConstraint("clientId"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    updatedAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    clientId: str
    name: str
    kind: ClientKind = ClientKind.public
    redirectUris: list = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    clientSecretHash: str | None = None
    registrationStatus: RegistrationStatus = RegistrationStatus.active


class AuthorizationRequest(SQLModel, table=True):
    __tablename__ = "authorizationRequests"
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    updatedAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    clientId: uuid.UUID = Field(foreign_key="oauthClients.id", ondelete="RESTRICT")
    userId: uuid.UUID | None = Field(default=None, foreign_key="users.id", ondelete="RESTRICT")
    teamId: uuid.UUID | None = Field(default=None, foreign_key="teams.id", ondelete="RESTRICT")
    redirectUri: str
    clientState: str | None = None
    codeChallenge: str
    codeChallengeMethod: str = "S256"
    resource: str
    scopes: list = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    expiresAt: datetime = Field(sa_column=stamp())
    consumedAt: datetime | None = Field(default=None, sa_column=optionalStamp())


class OauthGrant(SQLModel, table=True):
    __tablename__ = "oauthGrants"
    __table_args__ = (Index("ixOauthGrantsTeamUserClient", "teamId", "userId", "clientId"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    updatedAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    userId: uuid.UUID = Field(foreign_key="users.id", ondelete="RESTRICT")
    teamId: uuid.UUID = Field(foreign_key="teams.id", ondelete="RESTRICT")
    clientId: uuid.UUID = Field(foreign_key="oauthClients.id", ondelete="RESTRICT")
    resource: str
    scopes: list = Field(default_factory=list, sa_column=Column(JSON, nullable=False))
    authzVersion: int
    revokedAt: datetime | None = Field(default=None, sa_column=optionalStamp())


class AuthorizationCode(SQLModel, table=True):
    __tablename__ = "authorizationCodes"
    __table_args__ = (UniqueConstraint("codeHash"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    codeHash: str
    requestId: uuid.UUID = Field(foreign_key="authorizationRequests.id", ondelete="RESTRICT")
    grantId: uuid.UUID = Field(foreign_key="oauthGrants.id", ondelete="RESTRICT")
    expiresAt: datetime = Field(sa_column=stamp())
    consumedAt: datetime | None = Field(default=None, sa_column=optionalStamp())


class OauthRefreshToken(SQLModel, table=True):
    __tablename__ = "oauthRefreshTokens"
    __table_args__ = (UniqueConstraint("tokenHash"), UniqueConstraint("parentId"), Index("ixOauthRefreshTokensFamily", "familyId"))
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    tokenHash: str
    grantId: uuid.UUID = Field(foreign_key="oauthGrants.id", ondelete="RESTRICT")
    familyId: uuid.UUID
    parentId: uuid.UUID | None = Field(default=None, foreign_key="oauthRefreshTokens.id", ondelete="RESTRICT")
    issuedTeamId: uuid.UUID = Field(foreign_key="teams.id", ondelete="RESTRICT")
    expiresAt: datetime = Field(sa_column=stamp())
    consumedAt: datetime | None = Field(default=None, sa_column=optionalStamp())
    revokedAt: datetime | None = Field(default=None, sa_column=optionalStamp())


class OauthAccessToken(SQLModel, table=True):
    __tablename__ = "oauthAccessTokens"
    __table_args__ = (UniqueConstraint("tokenHash"),)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    createdAt: datetime = Field(default_factory=utcnow, sa_column=stamp())
    tokenHash: str
    grantId: uuid.UUID = Field(foreign_key="oauthGrants.id", ondelete="RESTRICT")
    expiresAt: datetime = Field(sa_column=stamp())
    revokedAt: datetime | None = Field(default=None, sa_column=optionalStamp())
