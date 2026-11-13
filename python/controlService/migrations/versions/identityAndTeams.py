import sqlalchemy as sa
from alembic import op

revision = "identityAndTeams"
down_revision = None
branch_labels = None
depends_on = None


def stamp(name: str, nullable: bool = False) -> sa.Column:
    return sa.Column(name, sa.DateTime(timezone=True), nullable=nullable)


def base() -> list[sa.Column]:
    return [sa.Column("id", sa.Uuid(), primary_key=True), stamp("createdAt"), stamp("updatedAt")]


def upgrade() -> None:
    role = sa.Enum("owner", "admin", "member", name="role")
    status = sa.Enum("active", "revoked", name="membershipStatus")
    purpose = sa.Enum("signIn", name="challengePurpose")
    op.create_table(
        "users",
        *base(),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("emailCanonical", sa.String(), nullable=False),
        stamp("emailVerifiedAt", True),
        sa.Column("suspended", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("tokenVersion", sa.Integer(), nullable=False),
        sa.UniqueConstraint("emailCanonical"),
    )
    op.create_table(
        "teams",
        *base(),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("suspended", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("authzVersion", sa.Integer(), nullable=False),
        sa.UniqueConstraint("slug"),
    )
    op.create_table(
        "memberships",
        *base(),
        sa.Column("teamId", sa.Uuid(), sa.ForeignKey("teams.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("userId", sa.Uuid(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("role", role, nullable=False),
        sa.Column("status", status, nullable=False),
        sa.Column("version", sa.Integer(), nullable=False),
        sa.UniqueConstraint("teamId", "userId"),
    )
    op.create_index("ixMembershipsUserStatus", "memberships", ["userId", "status"])
    op.create_table(
        "invites",
        *base(),
        sa.Column("teamId", sa.Uuid(), sa.ForeignKey("teams.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("emailCanonical", sa.String(), nullable=False),
        sa.Column("role", role, nullable=False),
        sa.Column("tokenHash", sa.String(), nullable=False),
        sa.Column("invitedBy", sa.Uuid(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        stamp("expiresAt"),
        stamp("acceptedAt", True),
        sa.Column("acceptedBy", sa.Uuid(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=True),
        stamp("revokedAt", True),
        sa.UniqueConstraint("tokenHash"),
        sa.CheckConstraint("role <> 'owner'", name="ckInvitesRoleNotOwner"),
    )
    op.create_index("ixInvitesTeamEmail", "invites", ["teamId", "emailCanonical"])
    op.create_table(
        "emailChallenges",
        *base(),
        sa.Column("emailCanonical", sa.String(), nullable=False),
        sa.Column("purpose", purpose, nullable=False),
        sa.Column("codeVerifier", sa.String(), nullable=False),
        stamp("expiresAt"),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("maxAttempts", sa.Integer(), nullable=False),
        stamp("consumedAt", True),
        stamp("supersededAt", True),
        sa.Column("returnContextId", sa.Uuid(), nullable=True),
        sa.Column("safeReturnPath", sa.String(), nullable=True),
    )
    op.create_index("ixEmailChallengesLookup", "emailChallenges", ["emailCanonical", "purpose", "expiresAt"])
    op.create_table(
        "websiteSessions",
        *base(),
        sa.Column("userId", sa.Uuid(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("tokenHash", sa.String(), nullable=False),
        sa.Column("selectedTeamId", sa.Uuid(), sa.ForeignKey("teams.id", ondelete="RESTRICT"), nullable=True),
        sa.Column("issuedTokenVersion", sa.Integer(), nullable=False),
        stamp("expiresAt"),
        stamp("lastSeenAt"),
        stamp("revokedAt", True),
        sa.UniqueConstraint("tokenHash"),
    )
    op.create_index("ixWebsiteSessionsUserRevoked", "websiteSessions", ["userId", "revokedAt"])


def downgrade() -> None:
    for index, table in (("ixWebsiteSessionsUserRevoked", "websiteSessions"), ("ixEmailChallengesLookup", "emailChallenges"), ("ixInvitesTeamEmail", "invites"), ("ixMembershipsUserStatus", "memberships")):
        op.drop_index(index, table_name=table)
    for table in ("websiteSessions", "emailChallenges", "invites", "memberships", "teams", "users"):
        op.drop_table(table)
    for name in ("challengePurpose", "membershipStatus", "role"):
        sa.Enum(name=name).drop(op.get_bind(), checkfirst=True)
