import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { ElicitRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { ViewerView } from "../../../browser/viewer/index.ts";
import { signInActorsOf } from "../../../cli/sessions/helpers/index.ts";
import type { SignInWiring } from "../../../cli/sessions/helpers/index.ts";
import { sessionsDeps } from "../../../cli/sessions/index.ts";
import { hostedSignIn } from "../../../cli/runtime/index.ts";
import { PLATFORMS } from "../../../cli/runner/helpers/platforms.ts";
import { runConsoleOperation } from "../../../console/operations/index.ts";
import type { SessionToolAnswer } from "../../../platformKit/sessionCheck/index.ts";
import { createLogMcpServer, runToolCall } from "../../server/index.ts";
import { MCP_APP_MIME_TYPE, UI_EXTENSION_ID } from "../browserView/index.ts";
import { signInCall, signInRungOf } from "./index.ts";

const KEYS = ["LOG_INBOX_STATE", "LOG_DB", "LOG_LOCAL_ACCOUNTS", "LOG_USER_ENV", "LOG_PLATFORM_STATE", "LOG_BROWSER_VIEW_LOCATION"] as const;
const before: Record<string, string | undefined> = {};
const held = { ...sessionsDeps };
const UI = { extensions: { [UI_EXTENSION_ID]: { mimeTypes: [MCP_APP_MIME_TYPE] } } };
const open = new Set<string>();
const SIGNED_OUT: SessionToolAnswer = { isError: true, structuredContent: { json: { ok: false, code: "sessionDead", loginState: "loggedOut", httpStatus: 401 } } };

const callTool = async (name: string, input: Record<string, unknown>): Promise<SessionToolAnswer> => {
  if (name === "inspectStart") return (open.add(String(input.account)), { structuredContent: { ok: true } });
  if (name === "inspectDo" && input.action === "stop") return (open.delete(String(input.account)), { structuredContent: { ok: true } });
  return SIGNED_OUT;
};

function wiring(): SignInWiring {
  return {
    callTool,
    viewerPhase: async (account) => (open.has(account) ? "signInRequired" : "browserMissing"),
    sessionSave: (_, since) => ({ saved: false, code: "noPlatformSession", detail: "none", at: since }),
    cookieSave: async () => ({ saved: false, code: "cookieSignInUnavailable", detail: "none", at: new Date().toISOString() }),
    sleep: async () => {},
    now: () => new Date(),
    waitMs: 0,
    closeMs: 0,
    saveMs: 0,
    pollMs: 0,
  };
}

const view = async (account: string): Promise<ViewerView> => ({ account, phase: "signInRequired", needsHuman: true, generation: "a".repeat(32), revision: "b".repeat(64), pageState: "discordLogin", address: "discord.com/login", width: 800, height: 600, canInteract: true, stream: { kind: "voxl", url: "https://voxl.example/stream?password=secret" } as never });

function textOf(result: CallToolResult): string {
  return (result.content ?? []).map((part) => (part.type === "text" ? part.text : "")).join("\n");
}

function tokenOf(url: string): string {
  return new URL(url).searchParams.get("signIn") ?? "";
}

const run = (input: Record<string, unknown>) => runToolCall("sessionsSignIn", input);

beforeAll(() => {
  for (const key of KEYS) before[key] = process.env[key];
  const dir = mkdtempSync(join(tmpdir(), "signInSurfaces"));
  process.env.LOG_INBOX_STATE = join(dir, "state");
  delete process.env.LOG_DB;
  process.env.LOG_LOCAL_ACCOUNTS = join(dir, "localAccounts.json");
  process.env.LOG_USER_ENV = join(dir, ".env");
  process.env.LOG_PLATFORM_STATE = join(dir, "platforms");
  process.env.LOG_BROWSER_VIEW_LOCATION = "remote";
  writeFileSync(process.env.LOG_USER_ENV, "");
  writeFileSync(process.env.LOG_LOCAL_ACCOUNTS, JSON.stringify({ socialAccounts: [
    ...["fakeGuild", "fakeGuildB", "fakeGuildC", "fakeGuildD", "fakeGuildE", "fakeGuildF"].map((name) => ({ id: `local:discord:${name}`, platform: "DISCORD", accountName: name })),
    { id: "local:reddit:fakeRedd", platform: "REDDIT", accountName: "fakeRedd" },
    { id: "local:slack:fakeSlack", platform: "SLACK", accountName: "fakeSlack" },
  ] }));
  mkdirSync(process.env.LOG_PLATFORM_STATE, { recursive: true });
  sessionsDeps.callTool = async () => callTool;
  sessionsDeps.actors = (_context, tool, route) => signInActorsOf({ ...wiring(), callTool: tool }, route);
});

afterAll(() => {
  Object.assign(sessionsDeps, held);
  for (const key of KEYS) {
    if (before[key] === undefined) delete process.env[key];
    else process.env[key] = before[key];
  }
});

describe("what the owner sees is decided from what the host declares", () => {
  test("MCP Apps first, then URL elicitation, then text", () => {
    expect(signInRungOf(UI)).toBe("app");
    expect(signInRungOf({ ...UI, elicitation: { url: {} } })).toBe("app");
    expect(signInRungOf({ elicitation: { form: {}, url: {} } })).toBe("url");
    expect(signInRungOf({ elicitation: {} })).toBe("text");
    expect(signInRungOf({})).toBe("text");
  });

  test("an MCP Apps host gets the live view inline, with the link as a fallback and no stream URL", async () => {
    open.clear();
    const result = await signInCall({ account: "fakeGuild", platform: "discord" }, run, { rung: "app", location: "remote", requester: "u1", origin: "https://console.example", view });
    const structured = result.structuredContent as { view: { phase: string; stream?: unknown; streamKind: string }; json: { signInSurface: string; signInLink: { url: string } } };
    expect(structured.view).toMatchObject({ phase: "signInRequired", pageState: "discordLogin", streamKind: "voxl" });
    expect(structured.view.stream).toBeUndefined();
    expect(structured.json.signInSurface).toBe("app");
    expect(textOf(result)).toContain("The live browser shows here");
    expect(JSON.stringify(result)).not.toContain("password=secret");
  });

  test("a host with neither gets plain text with the same link, never the stream", async () => {
    open.clear();
    const result = await signInCall({ account: "fakeGuildB", platform: "discord" }, run, { rung: "text", location: "remote", requester: "u1", origin: "https://console.example" });
    const link = (result.structuredContent as { json: { signInLink: { url: string; expiresAt: string } } }).json.signInLink;
    expect(link.url.startsWith("https://console.example/console/connections?signIn=")).toBe(true);
    expect(textOf(result)).toContain(link.url);
    expect(link.url).not.toContain("fakeGuildB");
    expect(Date.parse(link.expiresAt) - Date.now()).toBeLessThanOrEqual(10 * 60 * 1000);
    expect(textOf(result)).toContain("waiting for the owner to sign in");
  });

  test("a local runtime keeps the window on this machine: no link", async () => {
    open.clear();
    const result = await signInCall({ account: "fakeGuildC", platform: "discord" }, run, { rung: "text", location: "local", requester: "owner", origin: "http://127.0.0.1:7338" });
    expect((result.structuredContent as { json: Record<string, unknown> }).json.signInLink).toBeUndefined();
    expect(textOf(result)).not.toContain("/console/connections");
  });

  test("asking for JSON keeps JSON, with the link in it", async () => {
    open.clear();
    const result = await signInCall({ account: "fakeGuildD", platform: "discord", json: true }, run, { rung: "text", location: "remote", requester: "u1", origin: "https://console.example" });
    const said = JSON.parse(textOf(result)) as { signIn: { state: string }; signInLink: { url: string } };
    expect(said.signIn.state).toBe("waitingForOwner");
    expect(said.signInLink.url).toContain("signIn=");
  });

  test("a host with URL elicitation and no MCP Apps is asked to open the console link", async () => {
    open.clear();
    const server = createLogMcpServer({}, { logDir: null, watchFlows: false });
    const client = new Client({ name: "elicitingHost", version: "0.0.0" }, { capabilities: { elicitation: { url: {} } } });
    const asked: { mode?: string; url?: string; message?: string }[] = [];
    client.setRequestHandler(ElicitRequestSchema, async (request) => {
      asked.push(request.params as { mode?: string; url?: string; message?: string });
      return { action: "accept" };
    });
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
    const result = (await client.callTool({ name: "sessionsSignIn", arguments: { account: "fakeGuildE", platform: "discord" } })) as CallToolResult;
    expect(asked).toHaveLength(1);
    expect(asked[0].mode).toBe("url");
    expect(asked[0].url).toContain("/console/connections?signIn=");
    expect(asked[0].url).not.toContain("voxl");
    expect((result.structuredContent as { json: { signInSurface: string; elicitation: string } }).json).toMatchObject({ signInSurface: "url", elicitation: "accept" });
    await client.close();
  });

  test("the hosted runtime makes the link for the person who asked, on its paired origin", async () => {
    open.clear();
    const answer = (await hostedSignIn({ account: "fakeGuildF", platform: "discord", ui: false }, { actorUserId: "u7" }, (input) => runToolCall("sessionsSignIn", input), "https://hosted.example")) as CallToolResult;
    const url = (answer.structuredContent as { json: { signInLink: { url: string } }; stdout: string }).json.signInLink.url;
    expect(url.startsWith("https://hosted.example/console/connections?signIn=")).toBe(true);
    expect((answer.structuredContent as { stdout: string }).stdout).toContain(url);
    await expect(runConsoleOperation("signInLinkOpen", { token: tokenOf(url) }, { requester: "u8" })).rejects.toThrow("signInLinkNotYours");
    const opened = (await runConsoleOperation("signInLinkOpen", { token: tokenOf(url) }, { requester: "u7" })) as { platform: string; account: string; accountId: string };
    expect(opened).toMatchObject({ platform: "discord", account: "fakeGuildF" });
    expect(opened.accountId).toBeTruthy();
    await expect(runConsoleOperation("signInLinkOpen", { token: tokenOf(url) }, { requester: "u7" })).rejects.toThrow("signInLinkInvalid");
  });
});

describe("a missing account answers with a structured accountNotConfigured", () => {
  for (const platform of PLATFORMS) {
    test(platform, async () => {
      const result = await signInCall({ account: "fakeNobody", platform }, run, { rung: "text", location: "remote", requester: "u1", origin: "https://console.example" });
      const structured = result.structuredContent as { code: string; json: { error: string; platform: string; next: { says: string; cli: string } } };
      expect(result.isError).toBe(true);
      expect(structured.code).toBe("accountNotConfigured");
      expect(structured.json).toMatchObject({ error: "accountNotConfigured", platform, account: "fakeNobody" });
      expect(structured.json.next.cli).toBe(`log localAccount add --platform ${platform} --account fakeNobody`);
      expect(textOf(result)).toStartWith("accountNotConfigured: ");
    });
  }

  test("with no platform given, the platform is null", async () => {
    const result = await signInCall({ account: "fakeNobody" }, run, { rung: "text", location: "remote", requester: "u1", origin: "https://console.example" });
    expect((result.structuredContent as { json: { platform: unknown } }).json.platform).toBeNull();
  });

  test("sessionsCheck for a missing account says the same", async () => {
    const result = await runToolCall("sessionsCheck", { account: "fakeNobody", platform: "reddit", json: true });
    expect((result.structuredContent as { code: string }).code).toBe("accountNotConfigured");
    expect((result.structuredContent as { json: { error: string; platform: string } }).json).toMatchObject({ error: "accountNotConfigured", platform: "reddit" });
  });
});
