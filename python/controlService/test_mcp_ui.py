import logging
from datetime import datetime, timedelta, timezone

from sqlmodel import Session, select

from controlService.models import Membership, OauthAccessToken, OauthClient, OauthGrant, Role, User
from controlService.security import token_hash
from controlService.test_console_routes import World, attach, everything_stored, world

STREAM_URL = "https://voxl.example/stream?password=fakeReadOnlyPassword0001"
UI_CAPS = {"extensions": {"io.modelcontextprotocol/ui": {"mimeTypes": ["text/html;profile=mcp-app"]}}}
APP_META = {"ui": {"resourceUri": "ui://log/browserView", "visibility": ["app"]}}
MANIFEST_UI = [
    {"name": "browserView", "description": "view", "inputSchema": {"type": "object"}, "_meta": {"ui": {"resourceUri": "ui://log/browserView"}}},
    {"name": "browserViewStream", "description": "stream", "inputSchema": {"type": "object"}, "_meta": APP_META},
    {"name": "browserViewFrame", "description": "frame", "inputSchema": {"type": "object"}, "_meta": APP_META},
    {"name": "search", "description": "search", "inputSchema": {"type": "object"}},
]


def answer(envelope: dict) -> dict:
    tool = envelope["payload"]["tool"]
    args = envelope["payload"]["args"]
    if tool == "toolManifest":
        tools = MANIFEST_UI if args.get("ui") else [{key: value for key, value in tool.items() if key != "_meta"} for tool in MANIFEST_UI if tool["name"] in ("browserView", "search")]
        return {"kind": "result", "payload": {"state": "succeeded", "result": {"tools": tools}}}
    if tool == "uiResourcesList":
        return {"kind": "result", "payload": {"state": "succeeded", "result": {"resources": [{"uri": "ui://log/browserView", "name": "Live browser", "mimeType": "text/html;profile=mcp-app"}, {"uri": "log://agents", "name": "not ui"}]}}}
    if tool == "uiResourceRead":
        return {"kind": "result", "payload": {"state": "succeeded", "result": {"contents": [{"uri": args["uri"], "mimeType": "text/html;profile=mcp-app", "text": "<html>view</html>"}]}}}
    if tool == "browserViewStream":
        return {"kind": "result", "payload": {"state": "succeeded", "result": {"generation": "a" * 32, "stream": {"kind": "voxl", "url": STREAM_URL, "page": {"width": 10, "height": 10}, "window": {"left": 0, "top": 0, "width": 10, "height": 10}}}}}
    return {"kind": "result", "payload": {"state": "succeeded", "result": {"stdout": "ok"}}}


def bearer(world: World) -> str:
    with Session(world.engine, expire_on_commit=False) as db:
        owner = db.exec(select(User).where(User.email == "owner@example.com")).one()
        membership = db.exec(select(Membership).where(Membership.userId == owner.id)).one()
        client = OauthClient(clientId="clientOne", name="Claude", redirectUris=["http://127.0.0.1:1/callback"])
        db.add(client)
        db.flush()
        grant = OauthGrant(userId=owner.id, teamId=membership.teamId, clientId=client.id, resource="https://mcp.listeningkit.com/mcp", scopes=["log:read"], authzVersion=1)
        db.add(grant)
        db.flush()
        db.add(OauthAccessToken(tokenHash=token_hash("accessTokenOne"), grantId=grant.id, expiresAt=datetime.now(timezone.utc) + timedelta(hours=1)))
        db.commit()
    return "accessTokenOne"


def rpc(world: World, token: str, method: str, params: dict | None = None, session: str | None = None):
    headers = {"Authorization": f"Bearer {token}", **({"Mcp-Session-Id": session} if session else {})}
    world.app.cookies.clear()
    return world.app.post("/mcp", json={"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}}, headers=headers)


def initialize(world: World, token: str, capabilities: dict) -> str:
    response = rpc(world, token, "initialize", {"protocolVersion": "2025-06-18", "capabilities": capabilities})
    assert response.status_code == 200
    return response.headers["Mcp-Session-Id"]


def test_a_client_without_mcp_apps_sees_no_widget_tools_resources_or_meta(world: World) -> None:
    link = attach(world, answer)
    token = bearer(world)
    session = initialize(world, token, {})
    tools = rpc(world, token, "tools/list", session=session).json()["result"]["tools"]
    names = [tool["name"] for tool in tools]
    assert "browserView" in names and "browserViewStream" not in names and "browserViewFrame" not in names
    assert all("_meta" not in tool for tool in tools)
    assert rpc(world, token, "resources/list", session=session).json()["result"]["resources"] == []
    assert rpc(world, token, "resources/read", {"uri": "ui://log/browserView"}, session=session).json()["error"]["code"] == -32002
    sent = len(link.sent)
    refused = rpc(world, token, "tools/call", {"name": "browserViewStream", "arguments": {"account": "a", "generation": "b"}}, session=session).json()["result"]
    assert refused["isError"] is True and len(link.sent) == sent


def test_a_forged_session_is_not_a_ui_client(world: World) -> None:
    attach(world, answer)
    token = bearer(world)
    names = [tool["name"] for tool in rpc(world, token, "tools/list", session="ui.forged").json()["result"]["tools"]]
    assert "browserViewStream" not in names


def test_an_mcp_apps_client_gets_the_widget_its_app_tools_and_the_meta(world: World) -> None:
    link = attach(world, answer)
    token = bearer(world)
    session = initialize(world, token, UI_CAPS)
    tools = {tool["name"]: tool for tool in rpc(world, token, "tools/list", session=session).json()["result"]["tools"]}
    assert tools["browserView"]["_meta"]["ui"]["resourceUri"] == "ui://log/browserView"
    assert tools["browserViewStream"]["_meta"]["ui"]["visibility"] == ["app"]
    manifest = next(envelope for envelope in link.sent if envelope["payload"]["tool"] == "toolManifest")
    assert manifest["payload"]["args"]["ui"] is True
    resources = rpc(world, token, "resources/list", session=session).json()["result"]["resources"]
    assert [item["uri"] for item in resources] == ["ui://log/browserView"]
    read = rpc(world, token, "resources/read", {"uri": "ui://log/browserView"}, session=session).json()["result"]
    assert read["contents"][0]["mimeType"] == "text/html;profile=mcp-app"
    assert rpc(world, token, "resources/read", {"uri": "log://agents"}, session=session).json()["error"]["code"] == -32002


def test_the_stream_url_reaches_the_view_but_never_the_control_db_or_logs(world: World, caplog) -> None:
    attach(world, answer)
    token = bearer(world)
    session = initialize(world, token, UI_CAPS)
    with caplog.at_level(logging.DEBUG):
        result = rpc(world, token, "tools/call", {"name": "browserViewStream", "arguments": {"account": "fakeSeller", "generation": "a" * 32}}, session=session).json()["result"]
    assert result["structuredContent"]["stream"]["url"] == STREAM_URL
    assert STREAM_URL not in result["content"][0]["text"]
    assert STREAM_URL not in everything_stored(world)
    assert "fakeReadOnlyPassword0001" not in caplog.text


def test_app_tools_cannot_be_run_as_team_operations(world: World) -> None:
    attach(world, answer)
    from controlService.security import csrf_token
    from controlService.settings import CSRF_HEADER, SESSION_COOKIE
    world.app.cookies.set(SESSION_COOKIE, world.tokens["owner"])
    response = world.app.post(f"/api/v1/teams/{world.teamId}/operations", json={"operationId": "00000000-0000-4000-8000-000000000002", "tool": "browserViewStream", "args": {}}, headers={CSRF_HEADER: csrf_token("sessionSecret", world.tokens["owner"])})
    assert response.status_code == 400
