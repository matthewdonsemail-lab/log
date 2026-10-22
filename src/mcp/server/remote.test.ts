import { afterEach, describe, expect, test } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { createLogMcpServer, serveLogMcpHttp, TOOL_RESULT_SCHEMA } from "./index.ts";

const stops: (() => void)[] = [];
afterEach(() => stops.splice(0).forEach((stop) => stop()));

function serve(token: string | null) {
  const served = serveLogMcpHttp({ port: 0, token, context: { twenty: marketplaceFixture() }, server: { logDir: null, watchFlows: false } });
  stops.push(served.stop);
  return served;
}

async function clientOf(url: string, token: string | null) {
  const client = new Client({ name: "remoteTest", version: "0.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(url), token ? { requestInit: { headers: { Authorization: `Bearer ${token}` } } } : {});
  await client.connect(transport);
  stops.push(() => void client.close());
  return client;
}

describe("the log MCP server over Streamable HTTP (remote)", () => {
  test("a remote client with the token lists the tools and calls one, with its structured result", async () => {
    const served = serve("s3cret");
    const client = await clientOf(served.url, "s3cret");
    const { tools } = await client.listTools();
    expect(tools.some((t) => t.name === "join")).toBe(true);
    const result = await client.callTool({ name: "accounts", arguments: { args: ["--json"] } });
    expect(result.isError).toBe(false);
    const structured = result.structuredContent as { exit: number; ok: boolean; json: unknown };
    expect(structured).toMatchObject({ exit: 0, ok: true });
    expect(Array.isArray(structured.json) || typeof structured.json === "object").toBe(true);
  });

  test("without the token: 401, nothing runs", async () => {
    const served = serve("s3cret");
    const response = await fetch(served.url, { method: "POST", headers: { "content-type": "application/json", accept: "application/json, text/event-stream" }, body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }) });
    expect(response.status).toBe(401);
  });

  test("off loopback it refuses to start without a token", () => {
    expect(() => serveLogMcpHttp({ host: "0.0.0.0", port: 0, token: null })).toThrow("needs a token");
  });

  test("--live still needs confirmLive over HTTP (rule 10)", async () => {
    const client = await clientOf(serve(null).url, null);
    const result = await client.callTool({ name: "join", arguments: { args: ["group", "--account", "galwayOne", "--group", "123", "--live"] } });
    expect(result.isError).toBe(true);
    expect((result.structuredContent as { stderr: string }).stderr).toContain("confirmLive");
  });
});

describe("--bypass over MCP (rule 20)", () => {
  test("refused without confirmBypass, before anything runs; runs with it", async () => {
    const client = await clientOf(serve(null).url, null);
    const args = ["group", "--account", "galwayOne", "--group", "123", "--show", "--bypass"];
    const refused = await client.callTool({ name: "join", arguments: { args } });
    expect(refused.isError).toBe(true);
    expect((refused.structuredContent as { stderr: string }).stderr).toContain("confirmBypass");
    const ran = await client.callTool({ name: "join", arguments: { args, confirmBypass: true } });
    expect((ran.structuredContent as { exit: number }).exit).toBe(0);
  });
});

describe("what a client needs from the server (MCP client best practices)", () => {
  test("every tool declares the same outputSchema, and listChanged is on", async () => {
    const server = createLogMcpServer({ twenty: marketplaceFixture() }, { logDir: null, watchFlows: false });
    const client = new Client({ name: "test", version: "0.0.0" });
    const [a, b] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(b), client.connect(a)]);
    const { tools } = await client.listTools();
    expect(tools.every((t) => JSON.stringify(t.outputSchema) === JSON.stringify(TOOL_RESULT_SCHEMA))).toBe(true);
    expect(client.getServerCapabilities()?.tools?.listChanged).toBe(true);
    await client.close();
  });
});
