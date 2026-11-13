import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { spawn, spawnSync } from "node:child_process";
import type { ChildProcessWithoutNullStreams } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { EXTENSION_ID, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { marketplaceFixture } from "../../../twenty/graphql/index.ts";
import { createLogMcpServer } from "../../server/index.ts";
import { browserViewJson } from "../../../cli/browser/index.ts";
import { appTools, BROWSER_VIEW_URI, browserViewCsp, httpLocation, MCP_APP_MIME_TYPE, settleLocation, readBrowserViewResource, runAppTool, uiCapable, UI_EXTENSION_ID } from "./index.ts";

const UI = { extensions: { [UI_EXTENSION_ID]: { mimeTypes: [MCP_APP_MIME_TYPE] } } };
const FIXTURE = fileURLToPath(new URL("../../../../python/fixtures/browserViewerFixture.py", import.meta.url));

async function connected(capabilities: Record<string, unknown>) {
  const server = createLogMcpServer({ twenty: marketplaceFixture() }, { logDir: null, watchFlows: false });
  const client = new Client({ name: "test", version: "0.0.0" }, { capabilities });
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
  return client;
}

describe("the browser view as an MCP App", () => {
  test("the extension id and mime type are the SDK's", () => {
    expect(UI_EXTENSION_ID).toBe(EXTENSION_ID);
    expect(MCP_APP_MIME_TYPE).toBe(RESOURCE_MIME_TYPE);
    expect(uiCapable(UI)).toBe(true);
    expect(uiCapable({})).toBe(false);
    expect(uiCapable({ extensions: { [UI_EXTENSION_ID]: { mimeTypes: ["text/plain"] } } })).toBe(false);
  });

  test("app-only tools are hidden from the model and point at the view", () => {
    for (const tool of appTools()) expect(tool._meta.ui).toEqual({ resourceUri: BROWSER_VIEW_URI, visibility: ["app"] });
    expect(appTools().map((tool) => tool.name)).toEqual(["browserViewStream", "browserViewFrame", "browserViewInput", "browserViewDone"]);
  });

  test("a host with MCP Apps sees browserView with its view, the app-only tools and the resource", async () => {
    const client = await connected(UI);
    const { tools } = await client.listTools();
    const view = tools.find((tool) => tool.name === "browserView");
    expect(view?._meta?.ui).toEqual({ resourceUri: BROWSER_VIEW_URI });
    expect(tools.filter((tool) => (tool._meta?.ui as { visibility?: string[] } | undefined)?.visibility?.includes("app") && !(tool._meta?.ui as { visibility: string[] }).visibility.includes("model")).map((tool) => tool.name)).toEqual(["browserViewStream", "browserViewFrame", "browserViewInput", "browserViewDone"]);
    const { resources } = await client.listResources();
    expect(resources.some((resource) => resource.uri === BROWSER_VIEW_URI && resource.mimeType === MCP_APP_MIME_TYPE)).toBe(true);
  });

  test("a host without MCP Apps gets browserView as text and no app-only tools, and cannot call them", async () => {
    const client = await connected({});
    const { tools } = await client.listTools();
    expect(tools.find((tool) => tool.name === "browserView")?._meta?.ui).toBeUndefined();
    expect(tools.some((tool) => tool.name.startsWith("browserViewFrame"))).toBe(false);
    const refused = await client.callTool({ name: "browserViewInput", arguments: { account: "a", generation: "g", revision: "r", event: { type: "click", x: 1, y: 1 } } });
    expect(refused.isError).toBe(true);
    expect((refused.structuredContent as { error: string }).error).toBe("browserViewAppOnly");
    const text = await client.callTool({ name: "browserView", arguments: { account: "nobodyHere" } });
    expect((text.content as { text: string }[])[0].text).toContain("nobodyHere: browserMissing");
    expect((text.structuredContent as { json: { phase: string } }).json.phase).toBe("browserMissing");
  });

  test("the resource is one HTML page with the app mime type, its CSP and a border", async () => {
    const read = await readBrowserViewResource({});
    const content = read.contents[0];
    expect(content.mimeType).toBe("text/html;profile=mcp-app");
    expect(content.uri).toBe(BROWSER_VIEW_URI);
    expect(content._meta.ui).toEqual({ csp: { connectDomains: [], resourceDomains: [] }, prefersBorder: true });
    expect(content.text.startsWith("<!doctype html>")).toBe(true);
    expect(content.text).toContain("ui/initialize");
    expect(content.text).not.toMatch(/<script[^>]+src=/);
    expect(content.text).not.toContain("<iframe");
  }, 30_000);

  test("the CSP names voxl only when it is https, or http on loopback", () => {
    expect(browserViewCsp({ LOG_VOXL_URL: "https://voxl.example.com/?token=t" }).connectDomains).toEqual(["https://voxl.example.com", "wss://voxl.example.com"]);
    expect(browserViewCsp({ LOG_VOXL_URL: "http://voxl.example.com/" }).connectDomains).toEqual([]);
    expect(browserViewCsp({ LOG_VOXL_URL: "http://127.0.0.1:6901/" }).connectDomains).toEqual(["http://127.0.0.1:6901", "ws://127.0.0.1:6901"]);
  });

  test("same machine or remote: stdio and an open loopback HTTP server are local, anything served with a token or OAuth or off loopback is remote", () => {
    expect(httpLocation("127.0.0.1", false)).toBe("local");
    expect(httpLocation("127.0.0.1", true)).toBe("remote");
    expect(httpLocation("0.0.0.0", false)).toBe("remote");
    const env: Record<string, string | undefined> = {};
    expect(settleLocation("remote", env)).toBe("remote");
    expect(settleLocation("local", env)).toBe("remote");
    expect(settleLocation("local", { LOG_BROWSER_VIEW_LOCATION: "local" })).toBe("local");
  });

  test("the view the model gets says which stream there is but never carries the descriptor", () => {
    const stream = { kind: "voxl" as const, url: "https://voxl.example.com/?token=t", page: { width: 800, height: 600 }, window: { left: 0, top: 0, width: 800, height: 600 } };
    const view = { account: "a", phase: "signInRequired" as const, needsHuman: true, generation: "g", revision: "r", pageState: "loginForm", address: null, width: 800, height: 600, canInteract: true, stream };
    expect(browserViewJson(view, "remote")).toEqual(expect.objectContaining({ location: "remote", streamKind: "voxl" }));
    expect("stream" in browserViewJson(view, "remote")).toBe(false);
    expect(browserViewJson({ ...view, stream: null }, "remote")).toMatchObject({ streamKind: "frames" });
    expect(browserViewJson(view, "local")).toMatchObject({ location: "local", streamKind: "none" });
  });

  test("app tools refuse a missing account before anything else", async () => {
    const result = await runAppTool("browserViewFrame", {}, true);
    expect((result.structuredContent as { error: string }).error).toBe("browserInputInvalid");
  });
});

const python = process.env.LOG_PYTHON;
const withBrowser = Boolean(python) && spawnSync(python!, ["-c", "import playwright.async_api"], { windowsHide: true, timeout: 30_000 }).status === 0;

describe.skipIf(!withBrowser)("end to end with the real viewer on a loopback sign-in page", () => {
  let dir = "";
  let child: ChildProcessWithoutNullStreams;
  const previous = process.env.LOG_INSPECT_CURRENT;
  const account = "fixtureAccount";

  beforeAll(async () => {
    dir = mkdtempSync(join(tmpdir(), "browserView-"));
    process.env.LOG_INSPECT_CURRENT = join(dir, "current.json");
    child = spawn(python!, [FIXTURE, process.env.LOG_INSPECT_CURRENT, account], { stdio: ["pipe", "pipe", "pipe"], windowsHide: true });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("fixture did not start")), 60_000);
      child.stdout.on("data", (chunk: Buffer) => {
        if (chunk.toString().includes('"ready": true')) {
          clearTimeout(timer);
          resolve();
        }
      });
      child.on("exit", (code) => reject(new Error(`fixture exited ${code}`)));
    });
  }, 70_000);

  afterAll(() => {
    child?.stdin.end();
    child?.kill();
    delete process.env.LOG_BROWSER_VIEW_LOCATION;
    if (previous === undefined) delete process.env.LOG_INSPECT_CURRENT;
    else process.env.LOG_INSPECT_CURRENT = previous;
    rmSync(dir, { recursive: true, force: true });
  });

  test("on the person's own machine browserView sends them to the window there, and the view neither streams nor sends input", async () => {
    process.env.LOG_BROWSER_VIEW_LOCATION = "local";
    try {
      const client = await connected(UI);
      const viewed = await client.callTool({ name: "browserView", arguments: { account } });
      expect((viewed.content as { text: string }[])[0].text).toContain("sign-in is open in the browser window on this machine. Finish there, then continue");
      const view = (viewed.structuredContent as { json: { location: string; streamKind: string; generation: string } }).json;
      expect(view).toMatchObject({ location: "local", streamKind: "none" });
      const frame = await client.callTool({ name: "browserViewFrame", arguments: { account, generation: view.generation } });
      expect((frame.structuredContent as { error: string }).error).toBe("browserViewLocal");
      const done = await client.callTool({ name: "browserViewDone", arguments: { account } });
      expect((done.structuredContent as { done: boolean }).done).toBe(false);
    } finally {
      delete process.env.LOG_BROWSER_VIEW_LOCATION;
    }
  }, 30_000);

  test("from a remote runtime: browserView says sign-in is needed, a stale input is refused, a fresh one lands as a recorded step, and done reads the result", async () => {
    process.env.LOG_BROWSER_VIEW_LOCATION = "remote";
    const client = await connected(UI);
    const viewed = await client.callTool({ name: "browserView", arguments: { account } });
    const view = (viewed.structuredContent as { json: { phase: string; generation: string; revision: string; pageState: string; location: string; streamKind: string } }).json;
    expect(view.phase).toBe("signInRequired");
    expect(view.pageState).toBe("loginForm");
    expect(view).toMatchObject({ location: "remote", streamKind: "frames" });

    const frame = await client.callTool({ name: "browserViewFrame", arguments: { account, generation: view.generation, withState: true } });
    const framed = frame.structuredContent as { data: string; revision: string; mimeType: string };
    expect(framed.mimeType).toBe("image/jpeg");
    expect(Buffer.from(framed.data, "base64").subarray(0, 2)).toEqual(Buffer.from([0xff, 0xd8]));

    const stale = await client.callTool({ name: "browserViewInput", arguments: { account, generation: view.generation, revision: "0".repeat(64), event: { type: "click", x: 450, y: 150 } } });
    expect((stale.structuredContent as { error: string }).error).toBe("browserStateChanged");

    const wrongOwner = await client.callTool({ name: "browserViewInput", arguments: { account, generation: "f".repeat(32), revision: framed.revision, event: { type: "click", x: 450, y: 150 } } });
    expect((wrongOwner.structuredContent as { error: string }).error).toBe("browserGenerationChanged");

    let revision = framed.revision;
    const send = async (event: Record<string, unknown>) => {
      const answer = await client.callTool({ name: "browserViewInput", arguments: { account, generation: view.generation, revision, event } });
      expect(answer.isError ? JSON.stringify(answer.structuredContent) : "ok").toBe("ok");
      revision = (answer.structuredContent as { view: { revision: string } }).view.revision;
      return answer;
    };
    await send({ type: "key", key: "Tab" });
    await send({ type: "text", text: "person@example.com" });
    await send({ type: "key", key: "Tab" });
    await send({ type: "text", text: "fixturePassword" });
    await send({ type: "key", key: "Enter" });
    let after = { phase: "", address: "", revision: "" };
    for (let tries = 0; tries < 40 && after.phase !== "ready"; tries++) {
      await Bun.sleep(250);
      after = ((await client.callTool({ name: "browserViewDone", arguments: { account } })).structuredContent as { view: typeof after }).view;
    }
    expect(after.phase).toBe("ready");
    expect(after.address).toEndWith("/home");
    revision = after.revision;

    const refused = await client.callTool({ name: "browserViewInput", arguments: { account, generation: view.generation, revision, event: { type: "key", key: "Enter" } } });
    expect((refused.structuredContent as { error: string }).error).toBe("browserInputStopped");

    const done = await client.callTool({ name: "browserViewDone", arguments: { account } });
    expect((done.structuredContent as { done: boolean }).done).toBe(true);
  }, 60_000);
});
