import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { connectionIdOf } from "../../console/connections/index.ts";
import type { ConnectionsView } from "../../console/connections/index.ts";
import { runConsoleOperation } from "../../console/operations/index.ts";
import { runToolCall } from "../../mcp/server/index.ts";
import type { SessionReport, SessionToolAnswer } from "../../platformKit/sessionCheck/index.ts";
import { createContext } from "../runner/client.ts";
import { signInActorsOf } from "./helpers/index.ts";
import type { SignInWiring } from "./helpers/index.ts";
import { sessionsCommand, sessionsDeps } from "./index.ts";

const KEYS = ["LOG_INBOX_STATE", "LOG_DB", "LOG_LOCAL_ACCOUNTS", "LOG_USER_ENV", "LOG_PLATFORM_STATE"] as const;
const before: Record<string, string | undefined> = {};
const held = { ...sessionsDeps };

const ANSWERS: Record<string, SessionToolAnswer> = {
  discordSessionCheck: { isError: true, structuredContent: { json: { ok: false, code: "sessionDead", loginState: "loggedOut", httpStatus: 401 } } },
  redditSessionCheck: { structuredContent: { json: { ok: true, loginState: "loggedIn", httpStatus: 200 } } },
  slackSessionCheck: { isError: true, structuredContent: { json: { ok: false, code: "rateLimited", loginState: "unknown", httpStatus: 429 } } },
  instagramSessionCheck: { isError: true, structuredContent: { exit: 1, stderr: "log instagram session check: twentyNotConfigured: not set" } },
};

let signedInNow = new Set<string>();
const calls: string[] = [];
const open = new Set<string>();
const callTool = async (name: string, input: Record<string, unknown>): Promise<SessionToolAnswer> => {
  calls.push(`${name} ${String(input.account)}`);
  if (name === "inspectStart") return (open.add(String(input.account)), { structuredContent: { ok: true } });
  if (name === "inspectDo" && input.action === "stop") return (open.delete(String(input.account)), { structuredContent: { ok: true } });
  if (name === "discordSessionCheck" && signedInNow.has(String(input.account))) return ANSWERS.redditSessionCheck;
  return ANSWERS[name] ?? { isError: true };
};

function wiring(): SignInWiring {
  return {
    callTool,
    viewerPhase: async (account) => (open.has(account) ? "signInRequired" : "browserMissing"),
    sessionSave: (_, since) => ({ saved: true, code: null, detail: "token saved", at: since }),
    cookieSave: async () => ({ saved: false, code: "cookieSignInUnavailable", detail: "none", at: new Date().toISOString() }),
    sleep: async () => {},
    now: () => new Date(),
    waitMs: 0,
    closeMs: 0,
    saveMs: 0,
    pollMs: 0,
  };
}

beforeAll(() => {
  for (const key of KEYS) before[key] = process.env[key];
  const dir = mkdtempSync(join(tmpdir(), "sessionsSurfaces"));
  process.env.LOG_INBOX_STATE = join(dir, "state");
  delete process.env.LOG_DB;
  process.env.LOG_LOCAL_ACCOUNTS = join(dir, "localAccounts.json");
  process.env.LOG_USER_ENV = join(dir, ".env");
  process.env.LOG_PLATFORM_STATE = join(dir, "platforms");
  writeFileSync(process.env.LOG_USER_ENV, "");
  writeFileSync(process.env.LOG_LOCAL_ACCOUNTS, JSON.stringify({ socialAccounts: [
    { id: "local:discord:fakeGuild", platform: "DISCORD", accountName: "fakeGuild" },
    { id: "local:reddit:fakeRedd", platform: "REDDIT", accountName: "fakeRedd" },
    { id: "local:slack:fakeSlack", platform: "SLACK", accountName: "fakeSlack" },
    { id: "local:instagram:fakeGram", platform: "INSTAGRAM", accountName: "fakeGram" },
    { id: "local:facebook:fakeFace", platform: "FACEBOOK", accountName: "fakeFace", accountStatus: "ACTIVE" },
    { id: "local:discord:fakeGone", platform: "DISCORD", accountName: "fakeGone", accountStatus: "DEACTIVATED" },
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

async function cli(argv: string[]): Promise<{ code: number; json: Record<string, unknown> }> {
  const result = await sessionsCommand.run(createContext({ out: () => {}, err: () => {} }), argv);
  return { code: result.code, json: JSON.parse(result.stdout ?? "{}") as Record<string, unknown> };
}

const FIXTURE = new Set(["fakeGuild", "fakeRedd", "fakeSlack", "fakeGram", "fakeFace", "fakeGone"]);

function consoleStates(view: ConnectionsView): Record<string, string | null> {
  return Object.fromEntries(view.accounts.filter((account) => FIXTURE.has(account.name)).map((account) => [account.name, account.lastCheck?.state ?? null]));
}

const verdicts = (reports: SessionReport[]) => Object.fromEntries(reports.filter((report) => FIXTURE.has(report.account)).map((report) => [report.account, report.verdict]));

describe("one check state on every surface", () => {
  test("the CLI, the MCP tool and the console say the same for every account in one fixture", async () => {
    const fromCli = verdicts((await cli(["check", "--json"])).json.accounts as SessionReport[]);
    expect(fromCli).toEqual({ fakeGuild: "signInNeeded", fakeRedd: "signedIn", fakeSlack: "stopped", fakeGram: "unknown", fakeFace: "skipped", fakeGone: "skipped" });
    const mcp = await runToolCall("sessionsCheck", { json: true });
    const fromMcp = verdicts((JSON.parse(String((mcp.structuredContent as { stdout?: string }).stdout ?? "{}")) as { accounts: SessionReport[] }).accounts);
    expect(fromMcp).toEqual(fromCli);
    const fromConsole = consoleStates((await runConsoleOperation("connectionsList", {})) as ConnectionsView);
    expect(fromConsole).toEqual({ fakeGuild: "signInNeeded", fakeRedd: "signedIn", fakeSlack: "stopped", fakeGram: "unknown", fakeFace: null, fakeGone: null });
    expect(calls.filter((call) => call.startsWith("slackSessionCheck"))).toEqual(["slackSessionCheck fakeSlack"]);
    await expect(runConsoleOperation("accountCheck", { accountId: connectionIdOf("slack", "fakeSlack") }, { callTool })).rejects.toThrow("accountCheckStopped");
    const fromConsoleCheck = (await runConsoleOperation("accountCheck", { accountId: connectionIdOf("reddit", "fakeRedd") }, { callTool })) as { state: string };
    expect(fromConsoleCheck.state).toBe(fromCli.fakeRedd);
  });

  test("after sign-in, the same account shows the same state from the CLI and the console", async () => {
    const waiting = await cli(["signIn", "--account", "fakeGuild", "--platform", "discord", "--json"]);
    expect(waiting.code).toBe(0);
    expect(waiting.json).toMatchObject({ ok: true, signIn: { state: "waitingForOwner", stage: "waitingForOwner" }, next: { tool: { name: "sessionsSignIn" } } });
    expect(open.has("fakeGuild")).toBe(true);
    signedInNow = new Set(["fakeGuild"]);
    const done = await cli(["signIn", "--account", "fakeGuild", "--done", "--json"]);
    expect(done.json).toMatchObject({ signIn: { state: "signedIn", route: "browser", save: { saved: true } } });
    expect(open.has("fakeGuild")).toBe(false);
    const fromConsole = consoleStates((await runConsoleOperation("connectionsList", {})) as ConnectionsView);
    const fromCli = verdicts((await cli(["check", "--account", "fakeGuild", "--json"])).json.accounts as SessionReport[]);
    expect(fromConsole.fakeGuild).toBe("signedIn");
    expect(fromCli.fakeGuild).toBe("signedIn");
  });

  test("X has no browser, so sign-in by browser is refused with the routes it has", async () => {
    writeFileSync(process.env.LOG_LOCAL_ACCOUNTS!, JSON.stringify({ socialAccounts: [{ id: "local:twitter:fakeBird", platform: "TWITTER", accountName: "fakeBird" }] }));
    const result = await sessionsCommand.run(createContext({ out: () => {}, err: () => {} }), ["signIn", "--account", "fakeBird", "--route", "browser"]);
    expect(result.code).toBe(1);
    expect(result.stderr).toContain("signInRouteUnavailable");
  });
});
