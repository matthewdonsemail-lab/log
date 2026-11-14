import base64
import time

from controlService.mcpRevision import (
    CLIENT_CAPABILITIES_KEY,
    HEADER_MISMATCH,
    INVALID_PARAMS,
    PROTOCOL_VERSION_KEY,
    SERVER_INFO_KEY,
    UNSUPPORTED_VERSION,
    answered_action,
    arguments_digest,
    caller_of,
    complete,
    discover_result,
    header_mismatch,
    http_status,
    input_required,
    is_modern,
    open_state,
    seal_state,
    url_elicitation_capable,
)

SECRET = "fakeSessionSecret"
META = {PROTOCOL_VERSION_KEY: "2026-07-28", CLIENT_CAPABILITIES_KEY: {"elicitation": {"url": {}}}}
EXPECT = {"tool": "sessionsSignIn", "digest": arguments_digest({"account": "fakeGuild"}), "principal": "team:user:grant", "key": "signIn"}


def call(name: str = "sessionsSignIn") -> dict:
    return {"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": name, "arguments": {"account": "fakeGuild"}, "_meta": META}}


def headers(**extra: str) -> dict:
    return {"mcp-protocol-version": "2026-07-28", "mcp-method": "tools/call", "mcp-name": "sessionsSignIn", **extra}


def test_a_modern_request_is_told_apart_by_its_meta_its_header_or_server_discover() -> None:
    assert is_modern(call())
    assert is_modern({"jsonrpc": "2.0", "id": 1, "method": "server/discover"})
    assert is_modern({"jsonrpc": "2.0", "id": 1, "method": "tools/list"}, "2026-07-28")
    assert not is_modern({"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2025-11-25"}})
    assert not is_modern({"jsonrpc": "2.0", "id": 1, "method": "tools/list"}, "2025-11-25")


def test_the_caller_comes_from_meta_and_a_bad_version_is_refused_with_the_supported_list() -> None:
    caller, error = caller_of(call()["params"])
    assert error is None and caller["capabilities"] == {"elicitation": {"url": {}}}
    _, missing = caller_of({"_meta": {PROTOCOL_VERSION_KEY: "2026-07-28"}})
    assert missing["code"] == INVALID_PARAMS
    _, unknown = caller_of({"_meta": {**META, PROTOCOL_VERSION_KEY: "1900-01-01"}})
    assert unknown["code"] == UNSUPPORTED_VERSION and "2026-07-28" in unknown["data"]["supported"] and "2025-11-25" in unknown["data"]["supported"]
    _, legacy = caller_of({"_meta": {**META, PROTOCOL_VERSION_KEY: "2025-11-25"}})
    assert "initialize" in legacy["message"]


def test_mirrored_headers_must_match_the_body() -> None:
    assert header_mismatch(headers(), call()) is None
    encoded = "=?base64?" + base64.b64encode(b"sessionsSignIn").decode() + "?="
    assert header_mismatch(headers(**{"mcp-name": encoded}), call()) is None
    assert "Mcp-Name" in header_mismatch(headers(**{"mcp-name": "report"}), call())
    assert "Mcp-Method" in header_mismatch(headers(**{"mcp-method": "tools/list"}), call())
    assert "MCP-Protocol-Version" in header_mismatch({"mcp-method": "tools/call", "mcp-name": "sessionsSignIn"}, call())
    assert http_status({"code": HEADER_MISMATCH}) == 400 and http_status({"code": -32601}) == 404 and http_status(None) == 200


def test_results_carry_result_type_and_the_server_identity() -> None:
    done = complete({"content": []})
    assert done["resultType"] == "complete" and done["_meta"][SERVER_INFO_KEY]["name"] == "log"
    found = discover_result({"tools": {}}, "fake instructions")
    assert found["supportedVersions"][0] == "2026-07-28" and found["ttlMs"] > 0 and found["cacheScope"] == "private"


def test_the_sign_in_link_is_asked_for_in_the_result_and_the_answer_counts_only_with_its_state() -> None:
    asked = input_required(SECRET, EXPECT, "https://console.example/console/connections?signIn=t", "Sign in")
    assert asked["resultType"] == "input_required"
    assert asked["inputRequests"] == {"signIn": {"method": "elicitation/create", "params": {"mode": "url", "url": "https://console.example/console/connections?signIn=t", "message": "Sign in"}}}
    state = asked["requestState"]
    assert answered_action(SECRET, {"requestState": state, "inputResponses": {"signIn": {"action": "accept"}}}, EXPECT) == "accept"
    assert answered_action(SECRET, {"requestState": state, "inputResponses": {"signIn": {"action": "sure"}}}, EXPECT) is None
    assert answered_action(SECRET, {"requestState": state + "x", "inputResponses": {"signIn": {"action": "accept"}}}, EXPECT) is None
    assert answered_action(SECRET, {"requestState": state, "inputResponses": {"signIn": {"action": "accept"}}}, {**EXPECT, "principal": "other"}) is None
    assert answered_action("anotherSecret", {"requestState": state, "inputResponses": {"signIn": {"action": "accept"}}}, EXPECT) is None


def test_a_state_expires_and_the_digest_ignores_key_order() -> None:
    now = time.time()
    state = seal_state(SECRET, EXPECT, now)
    assert open_state(SECRET, state, EXPECT, now + 10)
    assert not open_state(SECRET, state, EXPECT, now + 601)
    assert arguments_digest({"a": 1, "b": {"c": 2, "d": 3}}) == arguments_digest({"b": {"d": 3, "c": 2}, "a": 1})


def test_url_elicitation_is_read_from_the_declared_capabilities() -> None:
    assert url_elicitation_capable({"elicitation": {"url": {}}})
    assert not url_elicitation_capable({"elicitation": {}})
    assert not url_elicitation_capable({})
