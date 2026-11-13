import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ViewerView } from "../../browser/viewer/index.ts";
import { connectionIdOf } from "../connections/index.ts";
import { redactConsoleResult, runConsoleOperation } from "../operations/index.ts";
import { browserCheckDeps } from "./index.ts";
import type { BrowserCheckView } from "./index.ts";

const KEYS = ["LOG_INBOX_STATE", "LOG_DB", "LOG_LOCAL_ACCOUNTS", "LOG_USER_ENV", "LOG_PLATFORM_STATE", "LOG_TWITTER_STATE", "LOG_FBK_STATE", "LOG_BROWSER_VIEW_LOCATION"] as const;
const before: Record<string, string | undefined> = {};
const held = { ...browserCheckDeps };
const STREAM = { kind: "voxl" as const, url: "https://voxl.example/s?password=fakeReadOnly0001", page: { width: 10, height: 10 }, window: { left: 0, top: 0, width: 10, height: 10 } };
const seller = connectionIdOf("facebook", "fakeSeller");
let live: ViewerView;
let calls: string[] = [];
const callTool = async (name: string, input: Record<string, unknown>) => {
  calls.push(`${name} ${String(input.action ?? (input.args as string[] | undefined)?.join(" ") ?? "")}${input.confirmLive ? " live" : ""}`);
  return { structuredContent: { ok: true } };
};

function view(phase: ViewerView["phase"], revision = "b".repeat(64)): ViewerView {
  return { account: "fakeSeller", phase, needsHuman: phase === "signInRequired", generation: "a".repeat(32), revision, pageState: "home", address: "https://www.facebook.com/", width: 1280, height: 800, canInteract: phase === "signInRequired", stream: STREAM };
}

async function state(): Promise<BrowserCheckView> {
  return ((await runConsoleOperation("browserState", { accountId: seller }, { callTool })) as { view: BrowserCheckView }).view;
}

beforeAll(() => {
  for (const key of KEYS) before[key] = process.env[key];
  const dir = mkdtempSync(join(tmpdir(), "consoleBrowserCheck"));
  process.env.LOG_INBOX_STATE = join(dir, "state");
  delete process.env.LOG_DB;
  process.env.LOG_LOCAL_ACCOUNTS = join(dir, "localAccounts.json");
  process.env.LOG_USER_ENV = join(dir, ".env");
  process.env.LOG_PLATFORM_STATE = join(dir, "platforms");
  process.env.LOG_TWITTER_STATE = join(dir, "twitter");
  process.env.LOG_FBK_STATE = join(dir, "fbk");
  process.env.LOG_BROWSER_VIEW_LOCATION = "remote";
  writeFileSync(process.env.LOG_LOCAL_ACCOUNTS, JSON.stringify({ socialAccounts: [{ id: "local:facebook:fakeSeller", platform: "FACEBOOK", accountName: "fakeSeller", browserDriver: "camoufox", email: "seller@example.com", password: "fakePassword" }] }));
  browserCheckDeps.state = async () => live;
  browserCheckDeps.frame = async (_account, generation) => ({ generation: String(generation), revision: "b".repeat(64), mimeType: "image/jpeg", data: "ZmFrZUZyYW1l" });
  browserCheckDeps.input = async () => live;
});

afterAll(() => {
  Object.assign(browserCheckDeps, held);
  for (const key of KEYS) {
    if (before[key] === undefined) delete process.env[key];
    else process.env[key] = before[key];
  }
});

describe("the console browser check on the runtime", () => {
  test("a missing browser opens through inspect start, detached, on the account's own platform", async () => {
    calls = [];
    live = { ...view("ready"), phase: "browserMissing", generation: null, revision: null, stream: null };
    expect((await state()).phase).toBe("browserMissing");
    const opened = (await runConsoleOperation("browserOpen", { accountId: seller }, { callTool: async (name, input) => { calls.push(`${name} ${input.detach} ${input.url}`); live = view("signInRequired"); return { structuredContent: { ok: true } }; } })) as { view: BrowserCheckView };
    expect(calls).toEqual(["inspectStart true https://www.facebook.com/"]);
    expect(opened.view).toMatchObject({ phase: "signInRequired", canInteract: true, canResolve: true, location: "remote" });
    expect(opened.view.stream?.url).toBe(STREAM.url);
  });

  test("resolve signs in with the saved login as a live inspect step, and a stale view is refused", async () => {
    calls = [];
    live = view("signInRequired");
    await expect(runConsoleOperation("browserAction", { accountId: seller, action: "resolve", generation: "c".repeat(32) }, { callTool })).rejects.toThrow("browserGenerationChanged");
    await runConsoleOperation("browserAction", { accountId: seller, action: "resolve", generation: "a".repeat(32) }, { callTool });
    expect(calls).toEqual(["inspectDoLive signIn live"]);
  });

  test("verify proves the page, complete saves the session and marks the account checked, close stops it", async () => {
    calls = [];
    live = view("ready");
    const verified = (await runConsoleOperation("browserAction", { accountId: seller, action: "verify" }, { callTool })) as { view: BrowserCheckView };
    expect(verified.view).toMatchObject({ phase: "verified", canComplete: true });
    await expect(runConsoleOperation("browserSaveState", { accountId: seller, revision: "d".repeat(64) }, { callTool })).rejects.toThrow("browserStateChanged");
    const saved = (await runConsoleOperation("browserSaveState", { accountId: seller }, { callTool })) as { connections: { accounts: { id: string; lastCheck: { state: string } | null }[] } };
    expect(saved.connections.accounts.find((account) => account.id === seller)?.lastCheck?.state).toBe("succeeded");
    await runConsoleOperation("browserClose", { accountId: seller }, { callTool });
    expect(calls).toEqual(["inspectDo snapshot", "inspectDo saveState", "inspectDo stop"]);
  });

  test("a page needing a person refuses resolve, and back and reload go through inspect", async () => {
    calls = [];
    live = view("needsAttention");
    await expect(runConsoleOperation("browserAction", { accountId: seller, action: "resolve" }, { callTool })).rejects.toThrow("browserCheckUnresolved");
    await runConsoleOperation("browserAction", { accountId: seller, action: "reload" }, { callTool });
    await runConsoleOperation("browserAction", { accountId: seller, action: "back" }, { callTool });
    expect(calls).toEqual(["inspectDo goto", "inspectDo back"]);
    await expect(runConsoleOperation("browserAction", { accountId: seller, action: "post" }, { callTool })).rejects.toThrow("browserInputInvalid");
  });

  test("the journal keeps neither the stream URL nor a frame", async () => {
    live = view("signInRequired");
    const viewResult = await runConsoleOperation("browserState", { accountId: seller }, { callTool });
    expect(JSON.stringify(redactConsoleResult("browserState", viewResult))).not.toContain("fakeReadOnly0001");
    const frame = await runConsoleOperation("browserFrame", { accountId: seller, generation: "a".repeat(32) }, { callTool });
    expect(JSON.stringify(redactConsoleResult("browserFrame", frame))).not.toContain("ZmFrZUZyYW1l");
    expect(JSON.stringify(redactConsoleResult("browserViewStream", { generation: "a", stream: STREAM }))).not.toContain("fakeReadOnly0001");
    expect(redactConsoleResult("connectionsList", { a: 1 })).toEqual({ a: 1 });
  });
});
