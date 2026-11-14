import { afterEach, describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { MCP_APP_MIME_TYPE, UI_EXTENSION_ID } from "../apps/browserView/index.ts";
import { dualEraTransport, META_KEYS } from "../stateless/index.ts";
import { createLogMcpServer, serveLogMcpHttp, statelessLogHandlers, statelessTools } from "./index.ts";

const UI = { extensions: { [UI_EXTENSION_ID]: { mimeTypes: [MCP_APP_MIME_TYPE] } } };
const meta = (capabilities: Record<string, unknown> = {}, name = "fakeHost") => ({ [META_KEYS.protocolVersion]: "2026-07-28", [META_KEYS.clientCapabilities]: capabilities, [META_KEYS.clientInfo]: { name, version: "1" } });
const call = (id: string | number, method: string, params: Record<string, unknown> = {}, capabilities: Record<string, unknown> = {}, name = "fakeHost") => ({ jsonrpc: "2.0", id, method, params: { ...params, _meta: meta(capabilities, name) } });
const context = () => ({ twenty: marketplaceFixture() });

const stops: (() => void)[] = [];
afterEach(() => stops.splice(0).forEach((stop) => stop()));

async function pair() {
  const server = createLogMcpServer(context(), { logDir: null, watchFlows: false });
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await server.connect(dualEraTransport(serverSide, statelessLogHandlers(context(), { logDir: null })));
  const got = new Map<string | number, Record<string, unknown>>();
  clientSide.onmessage = (message) => {
    if ("id" in message && message.id !== undefined) got.set(message.id, message as unknown as Record<string, unknown>);
  };
  await clientSide.start();
  const ask = async (message: Record<string, unknown>) => {
    await clientSide.send(message as JSONRPCMessage);
    const id = message.id as string | number;
    for (let i = 0; i < 400 && !got.has(id); i++) await new Promise((resolve) => setTimeout(resolve, 25));
    return got.get(id) as { result?: Record<string, unknown>; error?: { code: number; message: string } };
  };
  stops.push(() => void server.close());
  return { server, clientSide, ask };
}

describe("the local log server speaks 2026-07-28 beside the older revisions", () => {
  test("tools/list is one list in a fixed order, whatever the host declares", async () => {
    const { ask } = await pair();
    const plain = (await ask(call(1, "tools/list"))).result as { tools: { name: string; _meta?: { ui?: { resourceUri?: string; visibility?: string[] } } }[]; resultType: string; ttlMs: number; cacheScope: string };
    const drawn = (await ask(call(2, "tools/list", {}, { ...UI, elicitation: { url: {} } }, "claude-code"))).result as typeof plain;
    expect(plain.resultType).toBe("complete");
    expect(plain.ttlMs).toBeGreaterThan(0);
    expect(plain.cacheScope).toBe("private");
    expect(JSON.stringify(drawn.tools)).toBe(JSON.stringify(plain.tools));
    const names = plain.tools.map((tool) => tool.name);
    expect(names[0]).toBe("getGuide");
    expect(new Set(names).size).toBe(names.length);
    expect(plain.tools.find((tool) => tool.name === "sessionsSignIn")?._meta?.ui?.resourceUri).toBe("ui://log/browserView");
    expect(plain.tools.find((tool) => tool.name === "browserViewStream")?._meta?.ui?.visibility).toEqual(["app"]);
    expect(JSON.stringify(statelessTools())).toBe(JSON.stringify(plain.tools));
  });

  test("server/discover, resources and a tool call answer with resultType and the server's identity", async () => {
    const { ask } = await pair();
    const discovered = (await ask(call("d", "server/discover"))).result as Record<string, unknown>;
    expect(discovered).toMatchObject({ resultType: "complete", supportedVersions: expect.arrayContaining(["2026-07-28", "2025-11-25"]), capabilities: { tools: {}, resources: {} } });
    expect(String(discovered.instructions)).toContain("getGuide");
    expect((discovered._meta as Record<string, unknown>)[META_KEYS.serverInfo]).toEqual({ name: "log", version: "0.1.0" });
    const resources = (await ask(call("r", "resources/list"))).result as { resources: { uri: string }[] };
    expect(resources.resources.map((r) => r.uri)).toEqual(["log://agents", "ui://log/browserView", "ui://log/report"]);
    const agents = (await ask(call("a", "resources/read", { uri: "log://agents" }))).result as { contents: { text: string }[]; resultType: string };
    expect(agents.resultType).toBe("complete");
    expect(agents.contents[0].text).toContain("AGENTS.md");
    const ran = (await ask(call("t", "tools/call", { name: "facebookAccounts", arguments: { json: true } }))).result as { resultType: string; isError: boolean; structuredContent: { ok: boolean } };
    expect(ran.resultType).toBe("complete");
    expect(ran.structuredContent.ok).toBe(true);
  });

  test("what differs per host is decided per request: app-only tools refuse a caller that declared no MCP Apps", async () => {
    const { ask } = await pair();
    const refused = (await ask(call("s", "tools/call", { name: "browserViewStream", arguments: { account: "fakeGuild", generation: "g" } }))).result as { isError: boolean; structuredContent: { error: string } };
    expect(refused.isError).toBe(true);
    expect(refused.structuredContent.error).toBe("browserViewAppOnly");
  });

  test("an initialize on the same connection still gets the legacy server", async () => {
    const { server, clientSide, ask } = await pair();
    expect((await ask(call("first", "tools/list"))).result?.resultType).toBe("complete");
    const client = new Client({ name: "legacyHost", version: "0" });
    await client.connect(clientSide);
    expect(client.getServerVersion()?.name).toBe("log");
    const { tools } = await client.listTools();
    expect(tools.some((tool) => tool.name === "browserViewStream")).toBe(false);
    await client.close();
    await server.close();
  });
});

describe("the local HTTP server answers 2026-07-28 requests without a session", () => {
  function serve() {
    const served = serveLogMcpHttp({ port: 0, token: "s3cret", context: context(), server: { logDir: null, watchFlows: false } });
    stops.push(served.stop);
    return served;
  }
  const post = (url: string, body: Record<string, unknown>, headers: Record<string, string> = {}) => fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json, text/event-stream", Authorization: "Bearer s3cret", "MCP-Protocol-Version": "2026-07-28", "Mcp-Method": String(body.method), ...headers }, body: JSON.stringify(body) });

  test("a modern request is answered in one JSON body, no Mcp-Session-Id minted", async () => {
    const served = serve();
    const answer = await post(served.url, call(1, "tools/list"));
    expect(answer.status).toBe(200);
    expect(answer.headers.get("mcp-session-id")).toBeNull();
    const body = (await answer.json()) as { result: { resultType: string; tools: unknown[] } };
    expect(body.result.resultType).toBe("complete");
    expect(body.result.tools.length).toBeGreaterThan(10);
    const ran = await post(served.url, call(2, "tools/call", { name: "facebookAccounts", arguments: { json: true } }), { "Mcp-Name": "facebookAccounts" });
    expect(((await ran.json()) as { result: { resultType: string } }).result.resultType).toBe("complete");
  });

  test("header checks, unknown methods and the token", async () => {
    const served = serve();
    const mismatch = await post(served.url, call(3, "tools/call", { name: "facebookAccounts", arguments: {} }), { "Mcp-Name": "somethingElse" });
    expect(mismatch.status).toBe(400);
    expect(((await mismatch.json()) as { error: { code: number } }).error.code).toBe(-32020);
    const unknown = await post(served.url, call(4, "ping"));
    expect(unknown.status).toBe(404);
    const version = await post(served.url, { ...call(5, "tools/list"), params: { _meta: { ...meta(), [META_KEYS.protocolVersion]: "1900-01-01" } } }, { "MCP-Protocol-Version": "1900-01-01" });
    expect(version.status).toBe(400);
    expect(((await version.json()) as { error: { code: number } }).error.code).toBe(-32022);
    const unauthorized = await fetch(served.url, { method: "POST", headers: { "Content-Type": "application/json", "MCP-Protocol-Version": "2026-07-28", "Mcp-Method": "tools/list" }, body: JSON.stringify(call(6, "tools/list")) });
    expect(unauthorized.status).toBe(401);
  });
});
