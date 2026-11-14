import { describe, expect, test } from "bun:test";
import { randomBytes } from "node:crypto";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { answeredAction, answerStateless, argumentsDigest, dualEraTransport, headerMismatchOf, httpStatusOf, isModernMessage, openRequestState, sealRequestState, statelessHttp, urlInputRequired } from "./index.ts";
import { META_KEYS, MODERN_PROTOCOL_VERSIONS, RPC_ERRORS } from "./types.ts";
import type { RpcResponse, StatelessCaller, StatelessHandlers } from "./types.ts";

const VERSION = MODERN_PROTOCOL_VERSIONS[0];
const META = { [META_KEYS.protocolVersion]: VERSION, [META_KEYS.clientCapabilities]: {}, [META_KEYS.clientInfo]: { name: "fakeHost", version: "1" } };
const KEY = randomBytes(32);
const EXPECT = { tool: "sessionsSignIn", digest: argumentsDigest({ account: "fakeGuild" }), principal: "local", key: "signIn" };

function handlers(seen: StatelessCaller[] = []): StatelessHandlers {
  return {
    serverInfo: { name: "log", version: "0.1.0" },
    instructions: "fake instructions",
    capabilities: { tools: {} },
    listTools: async (caller) => (seen.push(caller), [{ name: "a", inputSchema: { type: "object" } }]),
    listResources: async () => [{ uri: "log://agents", name: "AGENTS.md" }],
    readResource: async (uri) => (uri === "log://agents" ? { contents: [{ uri, text: "rules" }] } : null),
    callTool: async (params, caller) => (params.name === "ask" ? urlInputRequired(EXPECT, "https://console.example/console/connections?signIn=t", "Sign in", KEY) : { content: [{ type: "text", text: `${params.name} ${caller.clientInfo?.name}` }] }),
  };
}

const request = (method: string, params: Record<string, unknown> = {}, id: number | string = 1) => ({ jsonrpc: "2.0", id, method, params: { ...params, _meta: META } });

function resultOf(answer: RpcResponse | null): Record<string, unknown> {
  if (!answer || !("result" in answer)) throw new Error(`no result: ${JSON.stringify(answer)}`);
  return answer.result;
}

function errorOf(answer: RpcResponse | null) {
  if (!answer || !("error" in answer)) throw new Error(`no error: ${JSON.stringify(answer)}`);
  return answer.error;
}

describe("a 2026-07-28 request is served statelessly", () => {
  test("server/discover names the versions, capabilities, identity and instructions, as complete and cacheable", async () => {
    const result = resultOf(await answerStateless(request("server/discover"), handlers()));
    expect(result).toMatchObject({ resultType: "complete", supportedVersions: ["2026-07-28", "2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05", "2024-10-07"], capabilities: { tools: {} }, instructions: "fake instructions", ttlMs: 3_600_000, cacheScope: "private" });
    expect((result._meta as Record<string, unknown>)[META_KEYS.serverInfo]).toEqual({ name: "log", version: "0.1.0" });
  });

  test("tools/list, resources/list and resources/read carry resultType, the server's identity and cache hints; the caller comes from _meta", async () => {
    const seen: StatelessCaller[] = [];
    const listed = resultOf(await answerStateless(request("tools/list"), handlers(seen)));
    expect(listed).toMatchObject({ resultType: "complete", tools: [{ name: "a" }], ttlMs: 60_000, cacheScope: "private" });
    expect(seen[0]).toMatchObject({ version: VERSION, capabilities: {}, clientInfo: { name: "fakeHost", version: "1" }, inputResponses: null, requestState: null });
    expect(resultOf(await answerStateless(request("resources/list"), handlers()))).toMatchObject({ resultType: "complete", resources: [{ uri: "log://agents" }] });
    expect(resultOf(await answerStateless(request("resources/read", { uri: "log://agents" }), handlers()))).toMatchObject({ resultType: "complete", contents: [{ text: "rules" }] });
    expect(errorOf(await answerStateless(request("resources/read", { uri: "log://none" }), handlers())).code).toBe(RPC_ERRORS.invalidParams);
  });

  test("tools/call answers complete, or input_required with the client's request and an opaque state", async () => {
    expect(resultOf(await answerStateless(request("tools/call", { name: "b" }), handlers()))).toMatchObject({ resultType: "complete", content: [{ text: "b fakeHost" }] });
    const asked = resultOf(await answerStateless(request("tools/call", { name: "ask" }), handlers()));
    expect(asked.resultType).toBe("input_required");
    expect(asked.inputRequests).toEqual({ signIn: { method: "elicitation/create", params: { mode: "url", url: "https://console.example/console/connections?signIn=t", message: "Sign in" } } });
    expect(typeof asked.requestState).toBe("string");
    expect(asked.content).toBeUndefined();
  });

  test("a request without its version or capabilities is malformed; an unknown or legacy version is refused with the supported list", async () => {
    const bare = { jsonrpc: "2.0", id: 2, method: "tools/list", params: { _meta: { [META_KEYS.protocolVersion]: VERSION } } };
    expect(errorOf(await answerStateless(bare, handlers())).code).toBe(RPC_ERRORS.invalidParams);
    const unknown = errorOf(await answerStateless({ jsonrpc: "2.0", id: 3, method: "tools/list", params: { _meta: { ...META, [META_KEYS.protocolVersion]: "1900-01-01" } } }, handlers()));
    expect(unknown).toMatchObject({ code: -32022, data: { requested: "1900-01-01" } });
    expect((unknown.data as { supported: string[] }).supported).toContain("2026-07-28");
    const legacy = errorOf(await answerStateless({ jsonrpc: "2.0", id: 4, method: "tools/list", params: { _meta: { ...META, [META_KEYS.protocolVersion]: "2025-11-25" } } }, handlers()));
    expect(legacy.message).toContain("initialize");
    expect(errorOf(await answerStateless({ jsonrpc: "2.0", id: 5, method: "server/discover" }, handlers())).code).toBe(RPC_ERRORS.invalidParams);
  });

  test("ping, logging/setLevel and anything unknown are not methods of this revision; a notification gets no answer", async () => {
    for (const method of ["ping", "logging/setLevel", "subscriptions/listen", "prompts/list"]) expect(errorOf(await answerStateless(request(method), handlers())).code).toBe(RPC_ERRORS.methodNotFound);
    expect(await answerStateless({ jsonrpc: "2.0", method: "notifications/cancelled", params: { _meta: META } }, handlers())).toBeNull();
  });

  test("a modern request is told apart by its _meta version or by server/discover", () => {
    expect(isModernMessage(request("tools/list"))).toBe(true);
    expect(isModernMessage({ jsonrpc: "2.0", id: 1, method: "server/discover" })).toBe(true);
    expect(isModernMessage({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-11-25", capabilities: {} } })).toBe(false);
    expect(isModernMessage({ jsonrpc: "2.0", id: 1, method: "tools/list", params: { _meta: { progressToken: 1 } } })).toBe(false);
    expect(isModernMessage({ jsonrpc: "2.0", id: 1, result: {} })).toBe(false);
  });
});

describe("the request state of an input_required answer", () => {
  test("opens only for the same tool, arguments, principal and key, unaltered and before it expires", () => {
    const now = Date.now();
    const state = sealRequestState(EXPECT, KEY, now);
    expect(openRequestState(state, KEY, EXPECT, now + 1000)).toBe(true);
    expect(openRequestState(state, KEY, { ...EXPECT, digest: argumentsDigest({ account: "fakeGuildB" }) }, now)).toBe(false);
    expect(openRequestState(state, KEY, { ...EXPECT, principal: "http" }, now)).toBe(false);
    expect(openRequestState(state, randomBytes(32), EXPECT, now)).toBe(false);
    expect(openRequestState(state, KEY, EXPECT, now + 601_000)).toBe(false);
    const [payload, signature] = state.split(".");
    const forged = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(payload, "base64url").toString()), expiresAt: now + 9e9 })).toString("base64url");
    expect(openRequestState(`${forged}.${signature}`, KEY, EXPECT, now)).toBe(false);
    expect(openRequestState("garbage", KEY, EXPECT, now)).toBe(false);
  });

  test("the argument digest ignores key order", () => {
    expect(argumentsDigest({ a: 1, b: { c: 2, d: 3 } })).toBe(argumentsDigest({ b: { d: 3, c: 2 }, a: 1 }));
  });

  test("an answer counts only with a state that opens and an action the protocol defines", () => {
    const requestState = sealRequestState(EXPECT, KEY);
    expect(answeredAction({ requestState, inputResponses: { signIn: { action: "accept" } } }, EXPECT, KEY)).toBe("accept");
    expect(answeredAction({ requestState, inputResponses: { signIn: { action: "sure" } } }, EXPECT, KEY)).toBeNull();
    expect(answeredAction({ requestState: null, inputResponses: { signIn: { action: "accept" } } }, EXPECT, KEY)).toBeNull();
    expect(answeredAction({ requestState, inputResponses: null }, EXPECT, KEY)).toBeNull();
  });
});

describe("Streamable HTTP for the 2026-07-28 revision", () => {
  const headers = (extra: Record<string, string> = {}) => new Headers({ "MCP-Protocol-Version": VERSION, "Mcp-Method": "tools/call", "Mcp-Name": "b", ...extra });

  test("the mirrored headers must match the body; Mcp-Name may be base64", () => {
    const call = request("tools/call", { name: "b" });
    expect(headerMismatchOf(headers(), call)).toBeNull();
    expect(headerMismatchOf(headers({ "Mcp-Name": `=?base64?${Buffer.from("b").toString("base64")}?=` }), call)).toBeNull();
    expect(headerMismatchOf(headers({ "Mcp-Name": "c" }), call)).toContain("Mcp-Name");
    expect(headerMismatchOf(headers({ "Mcp-Method": "tools/list" }), call)).toContain("Mcp-Method");
    expect(headerMismatchOf(new Headers({ "Mcp-Method": "tools/call", "Mcp-Name": "b" }), call)).toContain("MCP-Protocol-Version");
    expect(headerMismatchOf(headers({ "MCP-Protocol-Version": "2025-11-25" }), call)).toContain("does not match");
    const noName = new Headers({ "MCP-Protocol-Version": VERSION, "Mcp-Method": "tools/call" });
    expect(headerMismatchOf(noName, call)).toBe("the Mcp-Name header is missing");
  });

  test("status codes: 200 for a result, 400 for a mismatch or bad version, 404 for an unknown method, 202 for a notification", async () => {
    const ok = await statelessHttp(headers(), request("tools/call", { name: "b" }), handlers());
    expect(ok.status).toBe(200);
    expect(((await ok.json()) as { result: { resultType: string } }).result.resultType).toBe("complete");
    const mismatch = await statelessHttp(headers({ "Mcp-Name": "c" }), request("tools/call", { name: "b" }), handlers());
    expect(mismatch.status).toBe(400);
    expect(((await mismatch.json()) as { error: { code: number } }).error.code).toBe(RPC_ERRORS.headerMismatch);
    const unknown = await statelessHttp(new Headers({ "MCP-Protocol-Version": VERSION, "Mcp-Method": "ping" }), request("ping"), handlers());
    expect(unknown.status).toBe(404);
    expect((await statelessHttp(headers(), { jsonrpc: "2.0", method: "notifications/x", params: { _meta: META } }, handlers())).status).toBe(202);
    expect(httpStatusOf({ jsonrpc: "2.0", id: 1, error: { code: -32022, message: "x" } })).toBe(400);
  });
});

describe("one stdio connection serves both eras", () => {
  test("a modern request is answered beside the SDK; initialize still reaches it; server notifications wait for a legacy session", async () => {
    const server = new Server({ name: "legacy", version: "1" }, { capabilities: { tools: { listChanged: true } } });
    server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: [{ name: "legacyTool", inputSchema: { type: "object" as const } }] }));
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    const got: JSONRPCMessage[] = [];
    clientSide.onmessage = (message) => void got.push(message);
    await server.connect(dualEraTransport(serverSide, handlers()));
    await clientSide.start();
    const settle = () => new Promise((resolve) => setTimeout(resolve, 20));
    await clientSide.send(request("tools/list", {}, "m1") as JSONRPCMessage);
    await server.sendToolListChanged();
    await settle();
    expect(got).toHaveLength(1);
    expect(got[0]).toMatchObject({ id: "m1", result: { resultType: "complete", tools: [{ name: "a" }] } });
    await clientSide.send({ jsonrpc: "2.0", id: "l1", method: "initialize", params: { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "old", version: "1" } } } as JSONRPCMessage);
    await clientSide.send({ jsonrpc: "2.0", method: "notifications/initialized" } as JSONRPCMessage);
    await clientSide.send({ jsonrpc: "2.0", id: "l2", method: "tools/list", params: {} } as JSONRPCMessage);
    await server.sendToolListChanged();
    await settle();
    expect(got.find((m) => "id" in m && m.id === "l1")).toMatchObject({ result: { protocolVersion: "2025-11-25" } });
    const legacyList = got.find((m) => "id" in m && m.id === "l2") as unknown as { result: { tools: { name: string }[]; resultType?: string } };
    expect(legacyList.result.tools[0].name).toBe("legacyTool");
    expect(legacyList.result.resultType).toBeUndefined();
    expect(got.some((m) => "method" in m && m.method === "notifications/tools/list_changed")).toBe(true);
    await server.close();
  });

  test("notifications/cancelled for a modern request stops its answer", async () => {
    let release: () => void = () => {};
    const slow: StatelessHandlers = { ...handlers(), callTool: (_, caller) => new Promise((resolve) => { release = () => resolve({ content: [{ type: "text", text: caller.signal?.aborted ? "aborted" : "ran" }] }); }) };
    const server = new Server({ name: "legacy", version: "1" }, { capabilities: {} });
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    const got: JSONRPCMessage[] = [];
    clientSide.onmessage = (message) => void got.push(message);
    await server.connect(dualEraTransport(serverSide, slow));
    await clientSide.start();
    await clientSide.send(request("tools/call", { name: "b" }, 9) as JSONRPCMessage);
    await clientSide.send({ jsonrpc: "2.0", method: "notifications/cancelled", params: { requestId: 9 } } as JSONRPCMessage);
    release();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(got).toHaveLength(0);
    await server.close();
  });
});
