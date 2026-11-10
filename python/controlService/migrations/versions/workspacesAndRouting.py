import sqlalchemy as sa
from alembic import op

revision = "workspacesAndRouting"
down_revision = "identityAndTeams"
branch_labels = None
depends_on = None


def stamp(name: str, nullable: bool = False) -> sa.Column:
    return sa.Column(name, sa.DateTime(timezone=True), nullable=nullable)


def base() -> list[sa.Column]:
    return [sa.Column("id", sa.Uuid(), primary_key=True), stamp("createdAt"), stamp("updatedAt")]


def upgrade() -> None:
    provider = sa.Enum("ownCloud", "boat", name="workspaceProvider")
    status = sa.Enum("pending", "connecting", "ready", "offline", "incompatible", "revoked", name="workspaceStatus")
    state = sa.Enum("accepted", "dispatched", "running", "succeeded", "failed", "cancelled", "unknown", name="operationState")
    op.create_table(
        "workspaces",
        *base(),
        sa.Column("teamId", sa.Uuid(), sa.ForeignKey("teams.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("createdBy", sa.Uuid(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("provider", provider, nullable=False),
        sa.Column("providerConnectionId", sa.Uuid(), nullable=True),
        sa.Column("providerRuntimeId", sa.String(), nullable=True),
        sa.Column("installationId", sa.Uuid(), nullable=True),
        sa.Column("status", status, nullable=False),
        sa.Column("runtimeVersion", sa.String(), nullable=True),
        sa.Column("protocolVersion", sa.Integer(), nullable=True),
        sa.Column("schemaVersion", sa.Integer(), nullable=True),
        sa.Column("connectionGeneration", sa.Integer(), nullable=False),
        sa.Column("capabilitySummary", sa.JSON(), nullable=False),
        stamp("lastContactAt", True),
        stamp("revokedAt", True),
        sa.UniqueConstraint("id", "teamId"),
    )
    op.create_index("ixWorkspacesTeamStatus", "workspaces", ["teamId", "status"])
    op.create_table(
        "teamWorkspaceSelections",
        sa.Column("teamId", sa.Uuid(), sa.ForeignKey("teams.id", ondelete="RESTRICT"), primary_key=True),
        sa.Column("workspaceId", sa.Uuid(), nullable=False),
        sa.Column("selectedBy", sa.Uuid(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        stamp("selectedAt"),
        sa.Column("generation", sa.Integer(), nullable=False),
        sa.UniqueConstraint("workspaceId"),
        sa.ForeignKeyConstraint(["workspaceId", "teamId"], ["workspaces.id", "workspaces.teamId"], ondelete="RESTRICT"),
    )
    op.create_table(
        "workspacePairings",
        *base(),
        sa.Column("teamId", sa.Uuid(), sa.ForeignKey("teams.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("workspaceId", sa.Uuid(), sa.ForeignKey("workspaces.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("approvedBy", sa.Uuid(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("tokenHash", sa.String(), nullable=False),
        sa.Column("challengeHash", sa.String(), nullable=False),
        stamp("expiresAt"),
        stamp("consumedAt", True),
        stamp("revokedAt", True),
        sa.UniqueConstraint("tokenHash"),
    )
    op.create_table(
        "runtimeCredentials",
        *base(),
        sa.Column("workspaceId", sa.Uuid(), sa.ForeignKey("workspaces.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("tokenHash", sa.String(), nullable=False),
        sa.Column("generation", sa.Integer(), nullable=False),
        stamp("expiresAt"),
        stamp("revokedAt", True),
        sa.UniqueConstraint("tokenHash"),
    )
    op.create_index("ixRuntimeCredentialsWorkspaceGeneration", "runtimeCredentials", ["workspaceId", "generation"])
    op.create_table(
        "workspaceLeases",
        sa.Column("workspaceId", sa.Uuid(), sa.ForeignKey("workspaces.id", ondelete="RESTRICT"), primary_key=True),
        sa.Column("holderId", sa.String(), nullable=False),
        sa.Column("generation", sa.Integer(), nullable=False),
        stamp("acquiredAt"),
        stamp("heartbeatAt"),
        stamp("expiresAt"),
    )
    op.create_table(
        "operationMetadata",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("teamId", sa.Uuid(), sa.ForeignKey("teams.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("workspaceId", sa.Uuid(), sa.ForeignKey("workspaces.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("grantId", sa.Uuid(), nullable=True),
        sa.Column("actorUserId", sa.Uuid(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=True),
        sa.Column("tool", sa.String(), nullable=False),
        sa.Column("state", state, nullable=False),
        sa.Column("routeGeneration", sa.Integer(), nullable=False),
        sa.Column("progressCursor", sa.String(), nullable=True),
        stamp("createdAt"),
        stamp("updatedAt"),
        stamp("expiresAt"),
        sa.CheckConstraint('"actorUserId" IS NOT NULL OR "grantId" IS NOT NULL', name="ckOperationMetadataAuthority"),
    )
    op.create_index("ixOperationMetadataTeamCreated", "operationMetadata", ["teamId", "createdAt"])
    op.create_index("ixOperationMetadataWorkspaceState", "operationMetadata", ["workspaceId", "state"])
    op.create_index("ixOperationMetadataExpires", "operationMetadata", ["expiresAt"])


def downgrade() -> None:
    for index, table in (
        ("ixOperationMetadataExpires", "operationMetadata"),
        ("ixOperationMetadataWorkspaceState", "operationMetadata"),
        ("ixOperationMetadataTeamCreated", "operationMetadata"),
        ("ixRuntimeCredentialsWorkspaceGeneration", "runtimeCredentials"),
        ("ixWorkspacesTeamStatus", "workspaces"),
    ):
        op.drop_index(index, table_name=table)
    for table in ("operationMetadata", "workspaceLeases", "runtimeCredentials", "workspacePairings", "teamWorkspaceSelections", "workspaces"):
        op.drop_table(table)
    for name in ("operationState", "workspaceStatus", "workspaceProvider"):
        sa.Enum(name=name).drop(op.get_bind(), checkfirst=True)
