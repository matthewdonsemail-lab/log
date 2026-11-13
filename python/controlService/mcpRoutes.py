import hashlib
import hmac
import json
import uuid

from anyio import to_thread
from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse, Response
from sqlalchemy.engine import Engine
from sqlmodel import Session

from controlService.dispatcher import Actor, Dispatcher
from controlService.errors import ApiError
from controlService.oauthRoutes import bearer_grant
from controlService.settings import MCP_PROTOCOL_VERSIONS, Settings
from controlService.tools import APP_TOOLS, MCP_APP_MIME_TYPE, READ_TOOLS, UI_EXTENSION_ID

INSTRUCTIONS = (
    "log runs your team's social accounts from its own cloud workspace. Every tool runs there, with that workspace's "
    "accounts and limits; nothing is stored by this server. Start with accountsList to see which accounts exist. "
    "Tools that post or send are not available over this connection yet. "
    "Route each request first: getGuide({ ask: \"<the owner's words>\" }) returns the use case to follow, and "
    "getGuide({ topic: \"ui\" }) explains report, which shows the owner a view of their data."
)
HIDDEN = {"toolManifest", "uiResourcesList", "uiResourceRead"}
SESSION_HEADER = "mcp-session-id"
MAX_TEXT = 200_000


def fallback_tool(name: str) -> dict:
    return {"name": name, "description": f"log {name}, run in your team's workspace. Its full description loads when the workspace is connected.", "inputSchema": {"type": "object", "additionalProperties": True}, "annotations": {"readOnlyHint": True, "openWorldHint": True}}


ACCOUNTS_TOOL = {
    "name": "accountsList",
    "title": "Accounts",
    "description": "List the social accounts in your team's workspace: platform, account, status and session state. No credentials.",
    "inputSchema": {"type": "object", "properties": {"limit": {"type": "integer", "minimum": 1, "maximum": 200}, "cursor": {"type": "string"}}, "additionalProperties": False},
    "annotations": {"readOnlyHint": True, "openWorldHint": False},
}


def rpc(id_, result=None, error=None) -> dict:
    body = {"jsonrpc": "2.0", "id": id_}
    if error is not None:
        body["error"] = error
    else:
        body["result"] = result
    return body


def tool_text(result) -> str:
    if isinstance(result, dict):
        if isinstance(result.get("stdout"), str) and result["stdout"].strip():
            text = result["stdout"]
        elif "json" in result and result["json"] is not None:
            text = json.dumps(result["json"], ensure_ascii=False, indent=2)
        else:
            text = json.dumps(result, ensure_ascii=False, indent=2)
    else:
        text = json.dumps(result, ensure_ascii=False, indent=2)
    return text[:MAX_TEXT]


def ui_capable(capabilities) -> bool:
    extensions = capabilities.get("extensions") if isinstance(capabilities, dict) else None
    ui = extensions.get(UI_EXTENSION_ID) if isinstance(extensions, dict) else None
    mimeTypes = ui.get("mimeTypes") if isinstance(ui, dict) else None
    return isinstance(mimeTypes, list) and MCP_APP_MIME_TYPE in mimeTypes


def session_id(secret: str, grantId, ui: bool) -> str:
    flag = "ui" if ui else "plain"
    signature = hmac.new(secret.encode(), f"mcpSession:{grantId}:{flag}".encode(), hashlib.sha256).hexdigest()
    return f"{flag}.{signature}"


def session_ui(secret: str, grantId, value: str | None) -> bool:
    if not value or "." not in value:
        return False
    flag = value.split(".", 1)[0]
    return flag == "ui" and hmac.compare_digest(value, session_id(secret, grantId, True))


def mcp_router(settings: Settings, engine: Engine, dispatcher: Dispatcher) -> APIRouter:
    router = APIRouter()
    challenge = f'Bearer resource_metadata="{settings.appOrigin}/.well-known/oauth-protected-resource", scope="log:read"'

    def authorize(request: Request) -> Actor | None:
        header = request.headers.get("authorization") or ""
        kind, _, token = header.partition(" ")
        if kind.lower() != "bearer":
            return None
        with Session(engine, expire_on_commit=False) as db:
            alive = bearer_grant(db, token.strip())
            if not alive:
                return None
            grant, user, team = alive
            if grant.resource.rstrip("/") != settings.mcpResourceUrl.rstrip("/"):
                return None
            return Actor(teamId=team.id, userId=user.id, grantId=grant.id, scopes=frozenset(grant.scopes))

    async def list_tools(actor: Actor, ui: bool) -> list[dict]:
        names = sorted(READ_TOOLS - HIDDEN - {"accountsList"})
        try:
            view = await dispatcher.run(actor, uuid.uuid4(), "toolManifest", {"names": names, **({"ui": True} if ui else {})}, record=False)
            listed = (view.result or {}).get("tools") if view.state == "succeeded" else None
        except ApiError:
            listed = None
        tools = listed if isinstance(listed, list) and listed else [fallback_tool(name) for name in names]
        allowed = (READ_TOOLS - HIDDEN) | (APP_TOOLS if ui else frozenset())
        kept = [tool for tool in tools if isinstance(tool, dict) and tool.get("name") in allowed]
        if not ui:
            kept = [{key: value for key, value in tool.items() if key != "_meta"} for tool in kept]
        return [ACCOUNTS_TOOL, *kept]

    async def list_resources(actor: Actor, ui: bool) -> list[dict]:
        if not ui:
            return []
        try:
            view = await dispatcher.run(actor, uuid.uuid4(), "uiResourcesList", {}, record=False)
        except ApiError:
            return []
        resources = (view.result or {}).get("resources") if view.state == "succeeded" else None
        return [item for item in resources if isinstance(item, dict) and str(item.get("uri", "")).startswith("ui://")] if isinstance(resources, list) else []

    async def read_resource(actor: Actor, ui: bool, params: dict) -> dict | None:
        uri = params.get("uri")
        if not ui or not isinstance(uri, str) or not uri.startswith("ui://"):
            return None
        try:
            view = await dispatcher.run(actor, uuid.uuid4(), "uiResourceRead", {"uri": uri}, record=False)
        except ApiError:
            return None
        contents = (view.result or {}).get("contents") if view.state == "succeeded" else None
        return {"contents": contents} if isinstance(contents, list) else None

    async def call_app_tool(actor: Actor, name: str, arguments: dict) -> dict:
        try:
            view = await dispatcher.run(actor, uuid.uuid4(), name, arguments, record=False, app=True)
        except ApiError as error:
            return {"isError": True, "content": [{"type": "text", "text": f"{error.code}: {error.safeMessage or 'refused'}"}]}
        if view.state != "succeeded":
            code = (view.error or {}).get("code") if isinstance(view.error, dict) else None
            return {"isError": True, "content": [{"type": "text", "text": f"{code or view.state}"}], "structuredContent": {"error": code or view.state}}
        result = view.result if isinstance(view.result, dict) else {}
        return {"content": [{"type": "text", "text": name}], "structuredContent": result}

    async def call_tool(actor: Actor, params: dict, ui: bool) -> dict:
        name = params.get("name")
        arguments = params.get("arguments") or {}
        if not isinstance(name, str) or name in HIDDEN or not isinstance(arguments, dict) or (name in APP_TOOLS and not ui):
            return {"isError": True, "content": [{"type": "text", "text": "unknown tool"}]}
        if name in APP_TOOLS:
            return await call_app_tool(actor, name, arguments)
        if name == "report":
            arguments = {**arguments, "ui": ui}
        try:
            view = await dispatcher.run(actor, uuid.uuid4(), name, arguments)
        except ApiError as error:
            return {"isError": True, "content": [{"type": "text", "text": f"{error.code}: {error.safeMessage or 'refused'}"}]}
        if view.state != "succeeded":
            detail = (view.error or {}).get("message") if isinstance(view.error, dict) else None
            text = tool_text(view.result) if view.result else (detail or f"the operation is {view.state}; ask again later with the same request")
            return {"isError": True, "content": [{"type": "text", "text": f"{view.state}: {text}"}]}
        if name == "getGuide" and isinstance(view.result, dict) and isinstance(view.result.get("text"), str):
            return {"content": [{"type": "text", "text": view.result["text"]}]}
        if name == "report" and isinstance(view.result, dict):
            spec = view.result.get("spec")
            answer = {"content": [{"type": "text", "text": str(view.result.get("text") or "")}]}
            if isinstance(spec, dict):
                answer["structuredContent"] = spec
            return answer
        answer = {"content": [{"type": "text", "text": tool_text(view.result)}]}
        if ui and name == "browserView" and isinstance(view.result, dict):
            answer["structuredContent"] = view.result
        return answer

    @router.post("/mcp")
    async def mcp(request: Request):
        origin = request.headers.get("origin")
        if origin and origin.rstrip("/") != settings.appOrigin:
            return JSONResponse(rpc(None, error={"code": -32600, "message": "origin not allowed"}), status_code=403)
        actor = await to_thread.run_sync(authorize, request)
        if not actor:
            return JSONResponse({"error": "invalid_token", "error_description": "sign in to log again"}, status_code=401, headers={"WWW-Authenticate": challenge, "Cache-Control": "no-store"})
        try:
            message = await request.json()
        except ValueError:
            return JSONResponse(rpc(None, error={"code": -32700, "message": "parse error"}), status_code=400)
        if not isinstance(message, dict) or message.get("jsonrpc") != "2.0" or not isinstance(message.get("method"), str):
            return JSONResponse(rpc(message.get("id") if isinstance(message, dict) else None, error={"code": -32600, "message": "send one JSON-RPC 2.0 message"}), status_code=400)
        method = message["method"]
        if "id" not in message:
            return Response(status_code=202)
        id_ = message["id"]
        params = message.get("params") or {}
        headers = {"Cache-Control": "no-store"}
        if method == "initialize":
            asked = params.get("protocolVersion")
            version = asked if asked in MCP_PROTOCOL_VERSIONS else MCP_PROTOCOL_VERSIONS[0]
            ui = ui_capable(params.get("capabilities") if isinstance(params, dict) else None)
            headers["Mcp-Session-Id"] = session_id(settings.sessionSecret, actor.grantId, ui)
            return JSONResponse(rpc(id_, {"protocolVersion": version, "capabilities": {"tools": {"listChanged": False}, "resources": {"listChanged": False}}, "serverInfo": {"name": "log", "title": "log by ListeningKit", "version": "1"}, "instructions": INSTRUCTIONS}), headers=headers)
        ui = session_ui(settings.sessionSecret, actor.grantId, request.headers.get(SESSION_HEADER))
        if method == "resources/list":
            return JSONResponse(rpc(id_, {"resources": await list_resources(actor, ui)}), headers=headers)
        if method == "resources/read":
            read = await read_resource(actor, ui, params if isinstance(params, dict) else {})
            if read is None:
                return JSONResponse(rpc(id_, error={"code": -32002, "message": "resource not found"}), headers=headers)
            return JSONResponse(rpc(id_, read), headers=headers)
        if method == "ping":
            return JSONResponse(rpc(id_, {}), headers=headers)
        if method == "tools/list":
            return JSONResponse(rpc(id_, {"tools": await list_tools(actor, ui)}), headers=headers)
        if method == "tools/call":
            return JSONResponse(rpc(id_, await call_tool(actor, params if isinstance(params, dict) else {}, ui)), headers=headers)
        return JSONResponse(rpc(id_, error={"code": -32601, "message": f"{method} is not supported"}), headers=headers)

    @router.get("/mcp")
    @router.delete("/mcp")
    def mcp_other():
        return Response(status_code=405, headers={"Allow": "POST"})

    return router
