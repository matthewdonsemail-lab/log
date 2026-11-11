import os
from dataclasses import dataclass
from urllib.parse import urlparse

EMAIL_CODE_SECONDS = 600
WEBSITE_SESSION_DAYS = 30
INVITE_DAYS = 7
CHALLENGE_MAX_ATTEMPTS = 5
CHALLENGES_PER_EMAIL_WINDOW = 5
CHALLENGE_WINDOW_SECONDS = 900
RESEND_COOLDOWN_SECONDS = 30
SESSION_COOKIE = "logSession"
CSRF_COOKIE = "logCsrf"
CSRF_HEADER = "x-csrf-token"
PAIRING_SECONDS = 600
RUNTIME_CREDENTIAL_DAYS = 90
LEASE_SECONDS = 60
LEASE_HEARTBEAT_SECONDS = 20
OPERATION_METADATA_DAYS = 7
AUTHORITY_SECONDS = 120
DISPATCH_WAIT_SECONDS = 25
PROTOCOL_VERSION = 1
MAX_ENVELOPE_BYTES = 8388608
AUTHORIZATION_REQUEST_SECONDS = 600
AUTHORIZATION_CODE_SECONDS = 60
ACCESS_TOKEN_SECONDS = 3600
REFRESH_TOKEN_DAYS = 30
CLIENT_REGISTRATIONS_PER_HOUR = 30
SCOPES = ("log:read", "log:write")
MCP_PROTOCOL_VERSIONS = ("2025-11-25", "2025-06-18", "2025-03-26")


@dataclass(frozen=True)
class Settings:
    appOrigin: str
    consoleOrigin: str
    databaseUrl: str
    sessionSecret: str
    otpPepper: str
    dispatchSigningKey: str
    resendApiKey: str | None
    authEmailFrom: str | None
    authEmailReplyTo: str | None
    secureCookies: bool

    @property
    def mcpResourceUrl(self) -> str:
        return os.environ.get("MCP_RESOURCE_URL") or f"{self.appOrigin}/mcp"

    @property
    def bridgePublicUrl(self) -> str:
        return os.environ.get("BRIDGE_PUBLIC_URL") or f"{self.appOrigin.replace('https://', 'wss://', 1).replace('http://', 'ws://', 1)}/bridge"


class MissingSetting(RuntimeError):
    pass


def required(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise MissingSetting(f"{name} is not set")
    return value


def load_settings() -> Settings:
    origin = required("APP_ORIGIN").rstrip("/")
    consoleOrigin = (os.environ.get("CONSOLE_ORIGIN") or origin).rstrip("/")
    return Settings(
        appOrigin=origin,
        consoleOrigin=consoleOrigin,
        databaseUrl=required("DATABASE_URL"),
        sessionSecret=required("SESSION_SECRET"),
        otpPepper=required("OTP_PEPPER"),
        dispatchSigningKey=required("DISPATCH_SIGNING_KEY"),
        resendApiKey=os.environ.get("RESEND_API_KEY") or None,
        authEmailFrom=os.environ.get("AUTH_EMAIL_FROM") or None,
        authEmailReplyTo=os.environ.get("AUTH_EMAIL_REPLY_TO") or None,
        secureCookies=urlparse(origin).scheme == "https",
    )
