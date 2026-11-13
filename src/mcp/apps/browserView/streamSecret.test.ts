import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { viewerDeps } from "../../../browser/viewer/index.ts";
import { marketplaceFixture } from "../../../twenty/graphql/index.ts";
import { createLogMcpServer, runToolCall } from "../../server/index.ts";
import { MCP_APP_MIME_TYPE, UI_EXTENSION_ID } from "./index.ts";

const PASSWORD = "voxlSecretPassword42";
const VOXL = `https://voxl.example.com:8443/?token=${PASSWORD}`;
const GENERATION = "a".repeat(32);
const TOKEN = "viewerToken";
const ACCOUNT = "streamAccount";
const UI = { extensions: { [UI_EXTENSION_ID]: { mimeTypes: [MCP_APP_MIME_TYPE] } } };

let dir = "";
let server: ReturnType<typeof Bun.serve>;
const original = { ...viewerDeps };

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "streamSecret-"));
  mkdirSync(join(dir, "run"));
  server = Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    fetch(request) {
      if (request.headers.get("authorization") !== `Bearer ${TOKEN}`) return Response.json({ error: "browserAccessDenied" }, { status: 403 });
      return Response.json({ generation: GENERATION, revision: "b".repeat(64), state: "loginForm", url: "https://example.com/login", blocked: false, inputAllowed: true, busy: false, width: 800, height: 600, stream: { kind: "voxl", url: VOXL, page: { width: 800, height: 600 }, window: { left: 0, top: 0, width: 800, height: 600 } } });
    },
  });
  writeFileSync(join(dir, "run", "browserViewer.json"), JSON.stringify({ port: server.port, token: TOKEN, generation: GENERATION, pid: process.pid }));
  viewerDeps.owner = (account) => (account === ACCOUNT ? { account, runDir: join(dir, "run"), commandsPath: "", repliesPath: "", startedAt: "", pid: process.pid } : null);
});

afterAll(() => {
  Object.assign(viewerDeps, original);
  delete process.env.LOG_BROWSER_VIEW_LOCATION;
  server.stop(true);
  rmSync(dir, { recursive: true, force: true });
});

async function connected(capabilities: Record<string, unknown>) {
  const mcp = createLogMcpServer({ twenty: marketplaceFixture() }, { logDir: null, watchFlows: false });
  const client = new Client({ name: "test", version: "0.0.0" }, { capabilities });
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await Promise.all([mcp.connect(serverSide), client.connect(clientSide)]);
  return client;
}

function modelSees(answer: unknown): string {
  const result = answer as { content?: unknown; structuredContent?: unknown };
  return JSON.stringify({ content: result.content, structuredContent: result.structuredContent });
}

function expectNoSecret(seen: string) {
  expect(seen).not.toContain(PASSWORD);
  expect(seen).not.toContain("voxl.example.com");
}

describe("the voxl URL and its password never reach the model", () => {
  test("local runtime (stdio): browserView carries no stream, and the stream tool is refused", async () => {
    process.env.LOG_BROWSER_VIEW_LOCATION = "local";
    const client = await connected(UI);
    for (const args of [{ account: ACCOUNT }, { account: ACCOUNT, json: true }]) expectNoSecret(modelSees(await client.callTool({ name: "browserView", arguments: args })));
    const called = await client.callTool({ name: "logCall", arguments: { id: "browser.view", inputs: { account: ACCOUNT } } });
    expect(called.isError).toBeFalsy();
    expect((called.structuredContent as { json: { account: string } }).json.account).toBe(ACCOUNT);
    expectNoSecret(modelSees(called));
    const stream = await client.callTool({ name: "browserViewStream", arguments: { account: ACCOUNT, generation: GENERATION } });
    expect((stream.structuredContent as { error: string }).error).toBe("browserViewLocal");
  });

  test("remote runtime over MCP: browserView says voxl without the descriptor, which only the app-only tool gives the view", async () => {
    process.env.LOG_BROWSER_VIEW_LOCATION = "remote";
    const client = await connected(UI);
    const viewed = await client.callTool({ name: "browserView", arguments: { account: ACCOUNT } });
    expectNoSecret(modelSees(viewed));
    expect((viewed.structuredContent as { json: { streamKind: string } }).json.streamKind).toBe("voxl");
    expectNoSecret(modelSees(await client.callTool({ name: "browserView", arguments: { account: ACCOUNT, json: true } })));
    const called = await client.callTool({ name: "logCall", arguments: { id: "browser.view", inputs: { account: ACCOUNT } } });
    expect(called.isError).toBeFalsy();
    expect((called.structuredContent as { json: { account: string } }).json.account).toBe(ACCOUNT);
    expectNoSecret(modelSees(called));
    expectNoSecret(modelSees(await client.callTool({ name: "browserViewDone", arguments: { account: ACCOUNT } })));
    const { tools } = await client.listTools();
    expect(tools.find((tool) => tool.name === "browserViewStream")?._meta?.ui).toMatchObject({ visibility: ["app"] });
    const stream = await client.callTool({ name: "browserViewStream", arguments: { account: ACCOUNT, generation: GENERATION } });
    expect((stream.structuredContent as { stream: { url: string } }).stream.url).toBe(VOXL);
    expect(JSON.stringify(stream.content)).not.toContain(PASSWORD);
    const stale = await client.callTool({ name: "browserViewStream", arguments: { account: ACCOUNT, generation: "c".repeat(32) } });
    expect((stale.structuredContent as { error: string }).error).toBe("browserGenerationChanged");
  });

  test("remote runtime over MCP, a client without MCP Apps: nothing carries it, and the stream tool is not listed or callable", async () => {
    process.env.LOG_BROWSER_VIEW_LOCATION = "remote";
    const client = await connected({});
    expectNoSecret(modelSees(await client.callTool({ name: "browserView", arguments: { account: ACCOUNT } })));
    expect((await client.listTools()).tools.some((tool) => tool.name === "browserViewStream")).toBe(false);
    const refused = await client.callTool({ name: "browserViewStream", arguments: { account: ACCOUNT, generation: GENERATION } });
    expectNoSecret(modelSees(refused));
    expect((refused.structuredContent as { error: string }).error).toBe("browserViewAppOnly");
  });

  test("remote runtime through the hosted bridge (runToolCall): browserView carries no descriptor", async () => {
    process.env.LOG_BROWSER_VIEW_LOCATION = "remote";
    const viewed = await runToolCall("browserView", { account: ACCOUNT });
    expectNoSecret(modelSees(viewed));
    expect((viewed.structuredContent as { json: { streamKind: string } }).json.streamKind).toBe("voxl");
    expectNoSecret(modelSees(await runToolCall("browserView", { account: ACCOUNT, json: true })));
  });
});
