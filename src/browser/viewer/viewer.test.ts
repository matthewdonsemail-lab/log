import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { addressOf, eventOf, streamOf, viewerDeps, viewerFrame, viewerInput, viewerState, viewOf, voxlOrigins } from "./index.ts";
import { ViewerError } from "./types.ts";
import { consoleBrowserAnswer } from "../../console/web/helpers/browser.ts";

const GENERATION = "a".repeat(32);
const REVISION = "b".repeat(64);
const NEXT = "c".repeat(64);
const TOKEN = "fixtureToken";

interface Fake {
  state: { state: string; inputAllowed: boolean; blocked: boolean; busy: boolean; url: string };
  inputs: Record<string, unknown>[];
}

function fakeViewer(fake: Fake) {
  const revision = () => (fake.inputs.length ? NEXT : REVISION);
  const live = () => ({ generation: GENERATION, revision: revision(), width: 800, height: 600, historyLength: 1, stream: null, ...fake.state });
  return Bun.serve({
    hostname: "127.0.0.1",
    port: 0,
    async fetch(request) {
      if (request.headers.get("authorization") !== `Bearer ${TOKEN}`) return Response.json({ error: "browserAccessDenied" }, { status: 403 });
      const path = new URL(request.url).pathname;
      if (path === "/state") return Response.json(live());
      if (path === "/frame") return new Response(new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), { headers: { "content-type": "image/jpeg", "X-Log-Browser-Generation": GENERATION, "X-Log-Browser-Revision": revision() } });
      const body = (await request.json()) as Record<string, unknown>;
      if (body.generation !== GENERATION || body.revision !== revision()) return Response.json({ error: "browserStateChanged" }, { status: 409 });
      if (fake.state.blocked || !fake.state.inputAllowed) return Response.json({ error: "browserInputStopped" }, { status: 409 });
      fake.inputs.push(body);
      return Response.json(live());
    },
  });
}

let dir = "";
let server: ReturnType<typeof Bun.serve>;
const fake: Fake = { state: { state: "loginForm", inputAllowed: true, blocked: false, busy: false, url: "https://example.com/login?next=secret" }, inputs: [] };
const original = { ...viewerDeps };

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "viewer-"));
  mkdirSync(join(dir, "run"));
  server = fakeViewer(fake);
  writeFileSync(join(dir, "run", "browserViewer.json"), JSON.stringify({ port: server.port, token: TOKEN, generation: GENERATION, pid: process.pid }));
  viewerDeps.owner = (account) => (account === "fixtureAccount" ? { account, runDir: join(dir, "run"), commandsPath: "", repliesPath: "", startedAt: "", pid: process.pid } : null);
});

afterAll(() => {
  Object.assign(viewerDeps, original);
  server.stop(true);
  rmSync(dir, { recursive: true, force: true });
});

describe("the viewer's stream and address", () => {
  test("streamOf takes https anywhere and http only on loopback, with the window matching the page", () => {
    const row = { kind: "voxl", url: "https://voxl.example.com/?token=x", page: { width: 800, height: 600 }, window: { left: 0, top: 0, width: 800, height: 600 } };
    expect(streamOf(row)?.url).toBe(row.url);
    expect(streamOf({ ...row, url: "http://voxl.example.com/" })).toBeNull();
    expect(streamOf({ ...row, url: "http://127.0.0.1:6901/" })?.kind).toBe("voxl");
    expect(streamOf({ ...row, window: { ...row.window, width: 801 } })).toBeNull();
    expect(streamOf({ ...row, page: { width: -1, height: 600 } })).toBeNull();
  });

  test("voxl origins follow the same rule, as https plus wss", () => {
    expect(voxlOrigins("https://voxl.example.com:8443/?token=x")).toEqual(["https://voxl.example.com:8443", "wss://voxl.example.com:8443"]);
    expect(voxlOrigins("http://127.0.0.1:6901/")).toEqual(["http://127.0.0.1:6901", "ws://127.0.0.1:6901"]);
    expect(voxlOrigins("http://voxl.example.com/")).toEqual([]);
    expect(voxlOrigins(undefined)).toEqual([]);
  });

  test("the address drops the query", () => {
    expect(addressOf("https://example.com/login?next=secret")).toBe("https://example.com/login");
    expect(addressOf("about:blank")).toBeNull();
  });

  test("phases: blocked is a stop, a sign-in state takes input, anything else is ready", () => {
    const base = { generation: GENERATION, revision: REVISION, state: "loginForm", blocked: false, inputAllowed: true, busy: false };
    expect(viewOf("a", base)).toMatchObject({ phase: "signInRequired", needsHuman: true, canInteract: true });
    expect(viewOf("a", { ...base, state: "checkpoint", blocked: true, inputAllowed: false })).toMatchObject({ phase: "needsAttention", needsHuman: true, canInteract: false });
    expect(viewOf("a", { ...base, state: "loggedIn", inputAllowed: false })).toMatchObject({ phase: "ready", needsHuman: false });
    expect(viewOf("a", { ...base, busy: true })).toMatchObject({ phase: "busy", canInteract: false });
  });

  test("events are checked before anything is sent", () => {
    expect(eventOf({ type: "click", x: 1, y: 2 })).toEqual({ type: "click", x: 1, y: 2 });
    expect(eventOf({ type: "scroll", deltaY: 5000 })).toEqual({ type: "scroll", deltaY: 600 });
    for (const bad of [null, [], { type: "key", key: "F12" }, { type: "text", text: "" }, { type: "text", text: "x".repeat(2049) }, { type: "click", x: Number.NaN, y: 1 }, { type: "drag" }]) expect(() => eventOf(bad)).toThrow(ViewerError);
  });
});

describe("the viewer client against a running viewer", () => {
  test("a missing account has no browser", async () => {
    expect((await viewerState("nobody")).phase).toBe("browserMissing");
  });

  test("state reads the page", async () => {
    expect(await viewerState("fixtureAccount")).toMatchObject({ phase: "signInRequired", generation: GENERATION, revision: REVISION, address: "https://example.com/login", width: 800, stream: null });
  });

  test("a frame needs the current generation", async () => {
    await expect(viewerFrame("fixtureAccount", "d".repeat(32))).rejects.toThrow("browserGenerationChanged");
    const frame = await viewerFrame("fixtureAccount", GENERATION);
    expect(frame).toMatchObject({ generation: GENERATION, revision: REVISION, mimeType: "image/jpeg" });
    expect(Buffer.from(frame.data, "base64")[0]).toBe(0xff);
  });

  test("input with a stale revision is refused and nothing reaches the page", async () => {
    await expect(viewerInput("fixtureAccount", { generation: GENERATION, revision: NEXT, event: { type: "click", x: 1, y: 1 } })).rejects.toThrow("browserStateChanged");
    expect(fake.inputs).toEqual([]);
  });

  test("input with the current revision goes through and the revision moves on", async () => {
    const view = await viewerInput("fixtureAccount", { generation: GENERATION, revision: REVISION, event: { type: "text", text: "me@example.com" } });
    expect(fake.inputs).toEqual([{ type: "text", text: "me@example.com", generation: GENERATION, revision: REVISION }]);
    expect(view.revision).toBe(NEXT);
  });

  test("a page that no longer asks for sign-in refuses input", async () => {
    fake.state = { ...fake.state, state: "loggedIn", inputAllowed: false };
    await expect(viewerInput("fixtureAccount", { generation: GENERATION, revision: NEXT, event: { type: "key", key: "Enter" } })).rejects.toThrow("browserInputStopped");
    fake.state = { ...fake.state, state: "loginForm", inputAllowed: true };
  });

  test("the local console answers the same routes, and refuses a bad account name", async () => {
    const state = await consoleBrowserAnswer(new URL("http://127.0.0.1/api/console/browser?account=fixtureAccount"), new Request("http://127.0.0.1/api/console/browser?account=fixtureAccount"))!;
    expect(((await state.json()) as { view: { phase: string } }).view.phase).toBe("signInRequired");
    const frame = await consoleBrowserAnswer(new URL(`http://127.0.0.1/api/console/browser/frame?account=fixtureAccount&generation=${GENERATION}`), new Request("http://127.0.0.1/"))!;
    expect(frame.headers.get("content-type")).toBe("image/jpeg");
    const body = JSON.stringify({ account: "fixtureAccount", generation: GENERATION, revision: REVISION, event: { type: "click", x: 3, y: 4 } });
    const stale = await consoleBrowserAnswer(new URL("http://127.0.0.1/api/console/browser/input"), new Request("http://127.0.0.1/api/console/browser/input", { method: "POST", body, headers: { "content-type": "application/json", "Content-Length": String(body.length) } }))!;
    expect(stale.status).toBe(409);
    expect(await stale.json()).toEqual({ error: "browserStateChanged" });
    const bad = await consoleBrowserAnswer(new URL("http://127.0.0.1/api/console/browser?account=../x"), new Request("http://127.0.0.1/"))!;
    expect(bad.status).toBe(400);
    expect(consoleBrowserAnswer(new URL("http://127.0.0.1/api/console/events"), new Request("http://127.0.0.1/"))).toBeNull();
  });
});
