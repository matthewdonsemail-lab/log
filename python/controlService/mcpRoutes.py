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
from controlService.tools import READ_TOOLS

INSTRUCTIONS = (
    "log runs your team's social accounts from its own cloud workspace. Every tool runs there, with that workspace's "
    "accounts and limits; nothing is stored by this server. Start with accountsList to see which accounts exist. "
    "Tools that post or send are not available over this connection yet."
)
HIDDEN = {"toolManifest"}
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

    async def list_tools(actor: Actor) -> list[dict]:
        names = sorted(READ_TOOLS - HIDDEN - {"accountsList"})
        try:
            view = await dispatcher.run(actor, uuid.uuid4(), "toolManifest", {"names": names}, record=False)
            listed = (view.result or {}).get("tools") if view.state == "succeeded" else None
        except ApiError:
            listed = None
        tools = listed if isinstance(listed, list) and listed else [fallback_tool(name) for name in names]
        return [ACCOUNTS_TOOL, *[tool for tool in tools if isinstance(tool, dict) and tool.get("name") in READ_TOOLS - HIDDEN]]

    async def call_tool(actor: Actor, params: dict) -> dict:
        name = params.get("name")
        arguments = params.get("arguments") or {}
        if not isinstance(name, str) or name in HIDDEN or not isinstance(arguments, dict):
            return {"isError": True, "content": [{"type": "text", "text": "unknown tool"}]}
        try:
            view = await dispatcher.run(actor, uuid.uuid4(), name, arguments)
        except ApiError as error:
            return {"isError": True, "content": [{"type": "text", "text": f"{error.code}: {error.safeMessage or 'refused'}"}]}
        if view.state != "succeeded":
            detail = (view.error or {}).get("message") if isinstance(view.error, dict) else None
            text = tool_text(view.result) if view.result else (detail or f"the operation is {view.state}; ask again later with the same request")
            return {"isError": True, "content": [{"type": "text", "text": f"{view.state}: {text}"}]}
        return {"content": [{"type": "text", "text": tool_text(view.result)}]}

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
            return JSONResponse(rpc(id_, {"protocolVersion": version, "capabilities": {"tools": {"listChanged": False}}, "serverInfo": {"name": "log", "title": "log by ListeningKit", "version": "1"}, "instructions": INSTRUCTIONS}), headers=headers)
        if method == "ping":
            return JSONResponse(rpc(id_, {}), headers=headers)
        if method == "tools/list":
            return JSONResponse(rpc(id_, {"tools": await list_tools(actor)}), headers=headers)
        if method == "tools/call":
            return JSONResponse(rpc(id_, await call_tool(actor, params if isinstance(params, dict) else {})), headers=headers)
        return JSONResponse(rpc(id_, error={"code": -32601, "message": f"{method} is not supported"}), headers=headers)

    @router.get("/mcp")
    @router.delete("/mcp")
    def mcp_other():
        return Response(status_code=405, headers={"Allow": "POST"})

    return router
