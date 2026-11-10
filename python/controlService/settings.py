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


@dataclass(frozen=True)
class Settings:
    appOrigin: str
    databaseUrl: str
    sessionSecret: str
    otpPepper: str
    resendApiKey: str | None
    authEmailFrom: str | None
    authEmailReplyTo: str | None
    secureCookies: bool

    @property
    def mcpResourceUrl(self) -> str:
        return os.environ.get("MCP_RESOURCE_URL") or f"{self.appOrigin}/mcp"

    @property
    def bridgePublicUrl(self) -> str:
        return os.environ.get("BRIDGE_PUBLIC_URL") or f"{self.appOrigin.replace('https://', 'wss://').replace('http://', 'ws://')}/bridge"


class MissingSetting(RuntimeError):
    pass


def required(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        raise MissingSetting(f"{name} is not set")
    return value


def load_settings() -> Settings:
    origin = required("APP_ORIGIN").rstrip("/")
    return Settings(
        appOrigin=origin,
        databaseUrl=required("DATABASE_URL"),
        sessionSecret=required("SESSION_SECRET"),
        otpPepper=required("OTP_PEPPER"),
        resendApiKey=os.environ.get("RESEND_API_KEY") or None,
        authEmailFrom=os.environ.get("AUTH_EMAIL_FROM") or None,
        authEmailReplyTo=os.environ.get("AUTH_EMAIL_REPLY_TO") or None,
        secureCookies=urlparse(origin).scheme == "https",
    )
