import base64
from dataclasses import dataclass, replace
from datetime import datetime, timedelta, timezone
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import inspect, text
from sqlmodel import Session, SQLModel, select

from controlService.app import create_app
from controlService.bridge import Link
from controlService.db import make_engine
from controlService.dispatchAuthority import request_hash
from controlService.models import Membership, OperationMetadata, Role, Team, TeamWorkspaceSelection, User, WebsiteSession, Workspace, WorkspaceProvider, WorkspaceStatus
from controlService.security import csrf_token, token_hash
from controlService.settings import CSRF_HEADER, SESSION_COOKIE
from controlService.test_hosted_origins import AcceptingMailer, settings

SECRET = "sk-fakeSecretForRelayTest000000000001"
SIGNING_KEY = base64.b64encode(b"k" * 32).decode()


class FakeLink(Link):
    def __init__(self, workspaceId: str, generation: int, answer: dict | None):
        super().__init__(workspaceId=workspaceId, installationId="installation", holderId="holder", generation=generation, websocket=None)
        self.sent: list[dict] = []
        self.reply = answer

    async def ask(self, envelope: dict, operationId: str, seconds: float) -> dict | None:
        self.sent.append(envelope)
        return self.reply


@dataclass
class World:
    app: TestClient
    engine: object
    teamId: str
    workspaceId: str
    tokens: dict


def person(db: Session, email: str, team: Team, role: Role) -> tuple[str, User]:
    user = User(email=email, emailCanonical=email, emailVerifiedAt=datetime.now(timezone.utc))
    db.add(user)
    db.flush()
    db.add(Membership(teamId=team.id, userId=user.id, role=role))
    token = f"token-{email}"
    db.add(WebsiteSession(userId=user.id, tokenHash=token_hash(token), selectedTeamId=team.id, issuedTokenVersion=user.tokenVersion, expiresAt=datetime.now(timezone.utc) + timedelta(days=1)))
    return token, user


@pytest.fixture
def world(tmp_path: Path):
    url = f"sqlite:///{tmp_path / 'console.db'}"
    engine = make_engine(url)
    SQLModel.metadata.create_all(engine)
    with Session(engine, expire_on_commit=False) as db:
        team = Team(name="Team", slug="team")
        other = Team(name="Other", slug="other")
        db.add(team)
        db.add(other)
        db.flush()
        ownerToken, owner = person(db, "owner@example.com", team, Role.owner)
        tokens = {"owner": ownerToken, "member": person(db, "member@example.com", team, Role.member)[0], "stranger": person(db, "stranger@example.com", other, Role.owner)[0]}
        workspace = Workspace(teamId=team.id, createdBy=owner.id, provider=WorkspaceProvider.ownCloud, status=WorkspaceStatus.ready, connectionGeneration=4, installationId=None)
        db.add(workspace)
        db.flush()
        db.add(TeamWorkspaceSelection(teamId=team.id, workspaceId=workspace.id, selectedBy=owner.id))
        db.commit()
        teamId, workspaceId = str(team.id), str(workspace.id)
    app = create_app(replace(settings(url), dispatchSigningKey=SIGNING_KEY), engine, AcceptingMailer())
    with TestClient(app, base_url="https://log.listeningkit.com") as client:
        yield World(app=client, engine=engine, teamId=teamId, workspaceId=workspaceId, tokens=tokens)


def attach(world: World, answer: dict | None) -> FakeLink:
    link = FakeLink(world.workspaceId, 4, answer)
    world.app.app.state.bridges.links[world.workspaceId] = link
    return link


def call(world: World, who: str, method: str, path: str, body: dict | None = None, csrf: bool = True):
    token = world.tokens[who]
    headers = {CSRF_HEADER: csrf_token("sessionSecret", token)} if csrf else {}
    world.app.cookies.set(SESSION_COOKIE, token)
    return world.app.request(method, f"/api/v1/teams/{world.teamId}/console/{path}", json=body, headers=headers)


def result(tool: str, payload) -> dict:
    return {"kind": "result", "payload": {"state": "succeeded", "result": payload}}


def everything_stored(world: World) -> str:
    rows = []
    with world.engine.connect() as connection:
        for table in inspect(world.engine).get_table_names():
            rows.extend(str(row) for row in connection.execute(text(f'SELECT * FROM "{table}"')))
    return "\n".join(rows)


def test_a_member_reads_connections_through_the_selected_workspace_and_nothing_is_kept(world: World) -> None:
    link = attach(world, result("connectionsList", {"schemaVersion": 1, "source": "workspace", "accounts": [], "extensions": []}))
    response = call(world, "member", "GET", "connections")
    assert response.status_code == 200
    assert response.json()["source"] == "workspace"
    assert response.headers.get("Cache-Control") == "no-store"
    sent = link.sent[0]
    assert sent["kind"] == "dispatch" and sent["payload"] == {"tool": "connectionsList", "args": {}}
    assert sent["authority"]["tool"] == "connectionsList" and sent["authority"]["teamId"] == world.teamId
    assert sent["authority"]["requestHash"] == request_hash("connectionsList", {})
    with Session(world.engine) as db:
        assert db.exec(select(OperationMetadata)).all() == []


def test_saving_a_key_needs_a_provider_admin_and_relays_it_without_storing_it(world: World) -> None:
    link = attach(world, result("credentialsSave", {"saved": True, "changed": True, "connections": {"accounts": [], "extensions": []}}))
    body = {"provider": "jina", "values": {"JINA_API_KEY": SECRET}}
    assert call(world, "member", "POST", "credentials", body).status_code == 403
    assert link.sent == []
    response = call(world, "owner", "POST", "credentials", body)
    assert response.status_code == 200
    assert response.json()["saved"] is True
    assert SECRET not in response.text
    assert link.sent[0]["payload"] == {"tool": "credentialsSave", "args": body}
    assert SECRET not in everything_stored(world)


def test_another_team_csrf_and_sign_in_are_enforced(world: World) -> None:
    attach(world, result("connectionsList", {}))
    assert call(world, "stranger", "GET", "connections").status_code == 403
    assert call(world, "owner", "POST", "accountCheck", {"accountId": "a" * 24}, csrf=False).status_code == 403
    world.app.cookies.clear()
    assert world.app.get(f"/api/v1/teams/{world.teamId}/console/connections").status_code == 401


def test_runtime_refusals_come_back_as_their_own_codes(world: World) -> None:
    attach(world, {"kind": "result", "payload": {"state": "failed", "error": {"code": "credentialRejected", "message": "credentialRejected"}}})
    assert call(world, "owner", "POST", "credentials", {"provider": "jina", "values": {"JINA_API_KEY": "x"}}).json()["code"] == "credentialRejected"
    attach(world, {"kind": "result", "payload": {"state": "failed", "error": {"code": "toolFailed", "message": "unknown tool"}}})
    assert call(world, "owner", "GET", "usage?days=7").json()["code"] == "consoleOperationUnknown"
    attach(world, {"kind": "result", "payload": {"state": "failed", "error": {"code": "somethingPrivate", "message": SECRET}}})
    refused = call(world, "owner", "GET", "events")
    assert refused.status_code == 503 and SECRET not in refused.text
    attach(world, {"kind": "result", "payload": {"state": "running"}})
    assert call(world, "owner", "POST", "accountCheck", {"accountId": "a" * 24}).status_code == 202
    world.app.app.state.bridges.links.clear()
    assert call(world, "owner", "GET", "connections").json()["code"] == "workspaceOffline"


def test_inputs_are_checked_before_anything_is_relayed(world: World) -> None:
    link = attach(world, result("accountCheck", {}))
    assert call(world, "owner", "POST", "accountCheck", {"accountId": "../etc"}).status_code == 400
    assert call(world, "owner", "GET", "usage?days=90").status_code == 400
    assert call(world, "owner", "POST", "signIn", {"platform": "twitter", "method": "magic", "account": "a"}).status_code == 400
    assert link.sent == []


def test_sign_in_needs_a_browser_admin_and_drops_empty_fields(world: World) -> None:
    link = attach(world, result("accountSignIn", {"signedIn": True}))
    body = {"platform": "twitter", "method": "cookies", "account": "fakeBird", "cookies": SECRET}
    assert call(world, "member", "POST", "signIn", body).status_code == 403
    assert call(world, "owner", "POST", "signIn", body).status_code == 200
    assert link.sent[0]["payload"]["args"] == body
    assert SECRET not in everything_stored(world)


def test_console_operations_are_not_generic_tools(world: World) -> None:
    attach(world, result("connectionsList", {}))
    world.app.cookies.set(SESSION_COOKIE, world.tokens["owner"])
    response = world.app.post(f"/api/v1/teams/{world.teamId}/operations", json={"operationId": "00000000-0000-4000-8000-000000000001", "tool": "credentialsSave", "args": {}}, headers={CSRF_HEADER: csrf_token("sessionSecret", world.tokens["owner"])})
    assert response.status_code == 400
    assert response.json()["code"] == "invalidInput"
