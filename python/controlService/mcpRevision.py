import base64
import hashlib
import hmac
import json
import time

from controlService.settings import MCP_MODERN_PROTOCOL_VERSIONS, MCP_PROTOCOL_VERSIONS

PROTOCOL_VERSION_KEY = "io.modelcontextprotocol/protocolVersion"
CLIENT_CAPABILITIES_KEY = "io.modelcontextprotocol/clientCapabilities"
CLIENT_INFO_KEY = "io.modelcontextprotocol/clientInfo"
SERVER_INFO_KEY = "io.modelcontextprotocol/serverInfo"
DISCOVER_METHOD = "server/discover"
ALL_VERSIONS = (*MCP_MODERN_PROTOCOL_VERSIONS, *MCP_PROTOCOL_VERSIONS)
SERVER_INFO = {"name": "log", "title": "log by ListeningKit", "version": "1"}
LIST_CACHE = {"ttlMs": 60000, "cacheScope": "private"}
DISCOVER_CACHE = {"ttlMs": 3600000, "cacheScope": "private"}
NAMED_METHODS = {"tools/call": "name", "prompts/get": "name", "resources/read": "uri"}
ELICIT_ACTIONS = ("accept", "decline", "cancel")
STATE_SECONDS = 600
METHOD_NOT_FOUND = -32601
INVALID_PARAMS = -32602
INTERNAL_ERROR = -32603
HEADER_MISMATCH = -32020
UNSUPPORTED_VERSION = -32022


def record(value) -> dict | None:
    return value if isinstance(value, dict) else None


def meta_version(message) -> str | None:
    params = record(record(message) and message.get("params")) or {}
    version = (record(params.get("_meta")) or {}).get(PROTOCOL_VERSION_KEY)
    return version if isinstance(version, str) else None


def is_modern(message, header_version: str | None = None) -> bool:
    if header_version in MCP_MODERN_PROTOCOL_VERSIONS:
        return True
    if not isinstance(message, dict) or not isinstance(message.get("method"), str):
        return False
    if message["method"] == DISCOVER_METHOD:
        return True
    meta = record((record(message.get("params")) or {}).get("_meta"))
    return bool(meta) and PROTOCOL_VERSION_KEY in meta


def caller_of(params: dict) -> tuple[dict | None, dict | None]:
    meta = record(params.get("_meta")) or {}
    version = meta.get(PROTOCOL_VERSION_KEY)
    if not isinstance(version, str) or not version:
        return None, {"code": INVALID_PARAMS, "message": f'_meta["{PROTOCOL_VERSION_KEY}"] is required on every request'}
    if version not in MCP_MODERN_PROTOCOL_VERSIONS:
        legacy = f": {version} is served after an initialize request" if version in MCP_PROTOCOL_VERSIONS else ""
        return None, {"code": UNSUPPORTED_VERSION, "message": f"Unsupported protocol version{legacy}", "data": {"supported": list(ALL_VERSIONS), "requested": version}}
    capabilities = record(meta.get(CLIENT_CAPABILITIES_KEY))
    if capabilities is None:
        return None, {"code": INVALID_PARAMS, "message": f'_meta["{CLIENT_CAPABILITIES_KEY}"] is required on every request'}
    responses = record(params.get("inputResponses"))
    state = params.get("requestState")
    return {"version": version, "capabilities": capabilities, "inputResponses": responses, "requestState": state if isinstance(state, str) else None}, None


def header_value(value: str) -> str | None:
    if value.startswith("=?base64?") and value.endswith("?="):
        try:
            return base64.b64decode(value[9:-2], validate=True).decode("utf-8")
        except (ValueError, UnicodeDecodeError):
            return None
    return value


def header_mismatch(headers, message: dict) -> str | None:
    version = headers.get("mcp-protocol-version")
    if not version:
        return "the MCP-Protocol-Version header is missing"
    body_version = meta_version(message)
    if body_version is not None and body_version != version:
        return f"the MCP-Protocol-Version header value '{version}' does not match the body value '{body_version}'"
    method = headers.get("mcp-method")
    if method != message.get("method"):
        return "the Mcp-Method header is missing" if method is None else f"the Mcp-Method header value '{method}' does not match the body value '{message.get('method')}'"
    field = NAMED_METHODS.get(message.get("method"))
    if not field:
        return None
    raw = headers.get("mcp-name")
    if raw is None:
        return "the Mcp-Name header is missing"
    body = (record(message.get("params")) or {}).get(field)
    return None if header_value(raw) == body else f"the Mcp-Name header value '{raw}' does not match the body value '{body}'"


def http_status(error: dict | None) -> int:
    if not error:
        return 200
    if error.get("code") == METHOD_NOT_FOUND:
        return 404
    if error.get("code") == INTERNAL_ERROR:
        return 500
    return 400


def with_server_info(result: dict) -> dict:
    return {**result, "_meta": {**(record(result.get("_meta")) or {}), SERVER_INFO_KEY: SERVER_INFO}}


def complete(result: dict) -> dict:
    return with_server_info({**result, "resultType": "complete"})


def discover_result(capabilities: dict, instructions: str) -> dict:
    return complete({"supportedVersions": list(ALL_VERSIONS), "capabilities": capabilities, "instructions": instructions, **DISCOVER_CACHE})


def url_elicitation_capable(capabilities) -> bool:
    elicitation = record(record(capabilities) and capabilities.get("elicitation"))
    return bool(elicitation) and isinstance(elicitation.get("url"), dict)


def stable(value) -> str:
    return json.dumps(value, sort_keys=True, separators=(",", ":"), ensure_ascii=False)


def arguments_digest(arguments: dict | None) -> str:
    return base64.urlsafe_b64encode(hashlib.sha256(stable(arguments or {}).encode()).digest()).decode().rstrip("=")


def state_key(secret: str) -> bytes:
    return hashlib.sha256(f"mcpRequestState:{secret}".encode()).digest()


def signed(payload: str, key: bytes) -> str:
    return base64.urlsafe_b64encode(hmac.new(key, payload.encode(), hashlib.sha256).digest()).decode().rstrip("=")


def seal_state(secret: str, expect: dict, now: float | None = None) -> str:
    body = {**expect, "expiresAt": int(((now if now is not None else time.time()) + STATE_SECONDS) * 1000)}
    payload = base64.urlsafe_b64encode(stable(body).encode()).decode().rstrip("=")
    return f"{payload}.{signed(payload, state_key(secret))}"


def open_state(secret: str, state: str | None, expect: dict, now: float | None = None) -> bool:
    if not state or state.count(".") != 1:
        return False
    payload, signature = state.split(".")
    if not hmac.compare_digest(signed(payload, state_key(secret)), signature):
        return False
    try:
        body = json.loads(base64.urlsafe_b64decode(payload + "=" * (-len(payload) % 4)))
    except ValueError:
        return False
    if not isinstance(body, dict) or any(body.get(name) != value for name, value in expect.items()):
        return False
    expires = body.get("expiresAt")
    return isinstance(expires, int) and expires > (now if now is not None else time.time()) * 1000


def answered_action(secret: str, caller: dict, expect: dict, now: float | None = None) -> str | None:
    if not open_state(secret, caller.get("requestState"), expect, now):
        return None
    answer = record((caller.get("inputResponses") or {}).get(expect["key"]))
    action = answer.get("action") if answer else None
    return action if action in ELICIT_ACTIONS else None


def input_required(secret: str, expect: dict, url: str, message: str, now: float | None = None) -> dict:
    return with_server_info({
        "resultType": "input_required",
        "inputRequests": {expect["key"]: {"method": "elicitation/create", "params": {"mode": "url", "url": url, "message": message}}},
        "requestState": seal_state(secret, expect, now),
    })
