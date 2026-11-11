import sqlalchemy as sa
from alembic import op

revision = "mcpAuthorization"
down_revision = "workspacesAndRouting"
branch_labels = None
depends_on = None


def stamp(name: str, nullable: bool = False) -> sa.Column:
    return sa.Column(name, sa.DateTime(timezone=True), nullable=nullable)


def upgrade() -> None:
    kind = sa.Enum("public", "confidential", name="clientKind")
    registration = sa.Enum("active", "revoked", name="registrationStatus")
    op.create_table(
        "oauthClients",
        sa.Column("id", sa.Uuid(), primary_key=True),
        stamp("createdAt"),
        stamp("updatedAt"),
        sa.Column("clientId", sa.String(), nullable=False),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("kind", kind, nullable=False),
        sa.Column("redirectUris", sa.JSON(), nullable=False),
        sa.Column("clientSecretHash", sa.String(), nullable=True),
        sa.Column("registrationStatus", registration, nullable=False),
        sa.UniqueConstraint("clientId"),
    )
    op.create_table(
        "authorizationRequests",
        sa.Column("id", sa.Uuid(), primary_key=True),
        stamp("createdAt"),
        stamp("updatedAt"),
        sa.Column("clientId", sa.Uuid(), sa.ForeignKey("oauthClients.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("userId", sa.Uuid(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=True),
        sa.Column("teamId", sa.Uuid(), sa.ForeignKey("teams.id", ondelete="RESTRICT"), nullable=True),
        sa.Column("redirectUri", sa.String(), nullable=False),
        sa.Column("clientState", sa.String(), nullable=True),
        sa.Column("codeChallenge", sa.String(), nullable=False),
        sa.Column("codeChallengeMethod", sa.String(), nullable=False),
        sa.Column("resource", sa.String(), nullable=False),
        sa.Column("scopes", sa.JSON(), nullable=False),
        stamp("expiresAt"),
        stamp("consumedAt", True),
        sa.CheckConstraint("\"codeChallengeMethod\" = 'S256'", name="ckAuthorizationRequestsS256"),
    )
    op.create_table(
        "oauthGrants",
        sa.Column("id", sa.Uuid(), primary_key=True),
        stamp("createdAt"),
        stamp("updatedAt"),
        sa.Column("userId", sa.Uuid(), sa.ForeignKey("users.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("teamId", sa.Uuid(), sa.ForeignKey("teams.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("clientId", sa.Uuid(), sa.ForeignKey("oauthClients.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("resource", sa.String(), nullable=False),
        sa.Column("scopes", sa.JSON(), nullable=False),
        sa.Column("authzVersion", sa.Integer(), nullable=False),
        stamp("revokedAt", True),
    )
    op.create_index("ixOauthGrantsTeamUserClient", "oauthGrants", ["teamId", "userId", "clientId"])
    op.create_table(
        "authorizationCodes",
        sa.Column("id", sa.Uuid(), primary_key=True),
        stamp("createdAt"),
        sa.Column("codeHash", sa.String(), nullable=False),
        sa.Column("requestId", sa.Uuid(), sa.ForeignKey("authorizationRequests.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("grantId", sa.Uuid(), sa.ForeignKey("oauthGrants.id", ondelete="RESTRICT"), nullable=False),
        stamp("expiresAt"),
        stamp("consumedAt", True),
        sa.UniqueConstraint("codeHash"),
    )
    op.create_table(
        "oauthRefreshTokens",
        sa.Column("id", sa.Uuid(), primary_key=True),
        stamp("createdAt"),
        sa.Column("tokenHash", sa.String(), nullable=False),
        sa.Column("grantId", sa.Uuid(), sa.ForeignKey("oauthGrants.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("familyId", sa.Uuid(), nullable=False),
        sa.Column("parentId", sa.Uuid(), sa.ForeignKey("oauthRefreshTokens.id", ondelete="RESTRICT"), nullable=True),
        sa.Column("issuedTeamId", sa.Uuid(), sa.ForeignKey("teams.id", ondelete="RESTRICT"), nullable=False),
        stamp("expiresAt"),
        stamp("consumedAt", True),
        stamp("revokedAt", True),
        sa.UniqueConstraint("tokenHash"),
        sa.UniqueConstraint("parentId"),
    )
    op.create_index("ixOauthRefreshTokensFamily", "oauthRefreshTokens", ["familyId"])
    op.create_table(
        "oauthAccessTokens",
        sa.Column("id", sa.Uuid(), primary_key=True),
        stamp("createdAt"),
        sa.Column("tokenHash", sa.String(), nullable=False),
        sa.Column("grantId", sa.Uuid(), sa.ForeignKey("oauthGrants.id", ondelete="RESTRICT"), nullable=False),
        stamp("expiresAt"),
        stamp("revokedAt", True),
        sa.UniqueConstraint("tokenHash"),
    )
    if op.get_bind().dialect.name != "sqlite":
        op.create_foreign_key("fkOperationMetadataGrant", "operationMetadata", "oauthGrants", ["grantId"], ["id"], ondelete="RESTRICT")


def downgrade() -> None:
    if op.get_bind().dialect.name != "sqlite":
        op.drop_constraint("fkOperationMetadataGrant", "operationMetadata", type_="foreignkey")
    op.drop_table("oauthAccessTokens")
    op.drop_index("ixOauthRefreshTokensFamily", table_name="oauthRefreshTokens")
    op.drop_table("oauthRefreshTokens")
    op.drop_table("authorizationCodes")
    op.drop_index("ixOauthGrantsTeamUserClient", table_name="oauthGrants")
    op.drop_table("oauthGrants")
    op.drop_table("authorizationRequests")
    op.drop_table("oauthClients")
    for name in ("registrationStatus", "clientKind"):
        sa.Enum(name=name).drop(op.get_bind(), checkfirst=True)
