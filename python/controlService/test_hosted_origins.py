from urllib.parse import parse_qs, urlparse
from pathlib import Path

from fastapi.testclient import TestClient
from sqlmodel import SQLModel

from controlService.app import create_app
from controlService.db import make_engine
from controlService.settings import Settings


class AcceptingMailer:
    def send(self, to: str, subject: str, text: str) -> bool:
        return True


def settings(databaseUrl: str) -> Settings:
    return Settings(
        appOrigin="https://mcp.listeningkit.com",
        consoleOrigin="https://log.listeningkit.com",
        databaseUrl=databaseUrl,
        sessionSecret="sessionSecret",
        otpPepper="otpPepper",
        dispatchSigningKey="dispatchSigningKey",
        resendApiKey=None,
        authEmailFrom=None,
        authEmailReplyTo=None,
        clerkIssuer=None,
        clerkSecretKey=None,
        secureCookies=True,
    )


def client(databaseUrl: str) -> TestClient:
    engine = make_engine(databaseUrl)
    SQLModel.metadata.create_all(engine)
    return TestClient(create_app(settings(databaseUrl), engine, AcceptingMailer()))


def test_authorize_redirects_to_the_console_origin_when_mcp_has_its_own_host(tmp_path: Path) -> None:
    with client(f"sqlite:///{tmp_path / 'oauth.db'}") as app:
        registered = app.post(
            "/oauth/register",
            json={
                "client_name": "Claude Code",
                "redirect_uris": ["http://127.0.0.1:43123/callback"],
                "token_endpoint_auth_method": "none",
            },
        ).json()
        response = app.get(
            "/oauth/authorize",
            params={
                "client_id": registered["client_id"],
                "redirect_uri": "http://127.0.0.1:43123/callback",
                "response_type": "code",
                "code_challenge_method": "S256",
                "code_challenge": "a" * 43,
                "resource": "https://mcp.listeningkit.com/mcp",
                "scope": "log:read",
            },
            follow_redirects=False,
        )

    location = response.headers["location"]
    parsed = urlparse(location)
    assert f"{parsed.scheme}://{parsed.netloc}" == "https://log.listeningkit.com"
    assert parsed.path == "/console/mcp"
    assert parse_qs(parsed.query)["request"]


def test_console_origin_can_start_a_same_site_proxied_sign_in(tmp_path: Path) -> None:
    with client(f"sqlite:///{tmp_path / 'auth.db'}") as app:
        response = app.post(
            "/api/v1/auth/email/start",
            headers={"Origin": "https://log.listeningkit.com"},
            json={"email": "mandy@example.com", "returnPath": "/console/start"},
        )

    assert response.status_code == 200
    assert response.json()["challengeId"]

