import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { checkSession, checkSessions, checkStateOfStored, claimCheck, nextStepOf, readStoredChecks, reconcileChecks, runSessionCheck, sessionGate, sessionsText, verdictOf, writeCheck } from "./index.ts";
import type { CheckStore, SessionCheckAccount, SessionToolAnswer, StoredCheck } from "./index.ts";

const dead401: SessionToolAnswer = {
  isError: true,
  structuredContent: { exit: 1, ok: false, json: { engine: "directApi", platform: "discord", ok: false, code: "sessionDead", detail: "Discord's /api/v9/users/@me answered 401", loginState: "loggedOut", httpStatus: 401 } },
};
const signedIn: SessionToolAnswer = { structuredContent: { exit: 0, ok: true, json: { ok: true, loginState: "loggedIn", httpStatus: 200, screenName: "someone" } } };
const limited: SessionToolAnswer = { isError: true, structuredContent: { exit: 1, ok: false, json: { ok: false, code: "rateLimited", loginState: "unknown", httpStatus: 429 } } };

const discord: SessionCheckAccount = { id: "d1", name: "fakeGuild", platform: "discord" };
const twitter: SessionCheckAccount = { id: "t1", name: "fakeBird", platform: "twitter" };

describe("verdictOf", () => {
  test("a 401 from the platform means sign in again", () => {
    expect(verdictOf(dead401)).toEqual({ verdict: "signInNeeded", code: "sessionDead", detail: "Discord's /api/v9/users/@me answered 401", httpStatus: 401 });
  });
  test("the platform's ok is signed in", () => {
    expect(verdictOf(signedIn).verdict).toBe("signedIn");
  });
  test("a refusal is a stop, not a sign-in", () => {
    expect(verdictOf(limited)).toMatchObject({ verdict: "stopped", code: "rateLimited", httpStatus: 429 });
  });
  test("no saved session means sign in", () => {
    expect(verdictOf({ isError: true, structuredContent: { json: { ok: false, code: "noPlatformSession", loginState: "unknown" } } }).verdict).toBe("signInNeeded");
  });
  test("a check that became a job is unknown", () => {
    expect(verdictOf({ structuredContent: { job: { id: "j1" } } }).verdict).toBe("unknown");
  });
  test("a bare result's own ok still counts", () => {
    expect(verdictOf({ structuredContent: { ok: true } }).verdict).toBe("signedIn");
    expect(verdictOf({ isError: true, structuredContent: { ok: false } }).verdict).toBe("stopped");
  });
  test("log failing before the platform answers is unknown, with log's own code", () => {
    const failed = verdictOf({ isError: true, structuredContent: { exit: 1, ok: false, code: "twentyNotConfigured", stderr: "log discord session check: twentyNotConfigured: TWENTY_BASE_URL or TWENTY_API_KEY is not set." } });
    expect(failed).toMatchObject({ verdict: "unknown", code: "twentyNotConfigured" });
    expect(verdictOf({ isError: true, structuredContent: { exit: 1, ok: false, code: null, stderr: "boom" } })).toMatchObject({ verdict: "unknown", code: "checkFailed", detail: "boom" });
  });
});

describe("nextStepOf", () => {
  test("a browser platform signs in through sessionsSignIn, its own browser on the login screen", () => {
    const next = nextStepOf(discord, "signInNeeded");
    expect(next?.tool).toEqual({ name: "sessionsSignIn", input: { account: "fakeGuild", platform: "discord" } });
    expect(next?.cli).toBe("log sessions signIn --account fakeGuild --platform discord");
    expect(next?.says).toContain("https://discord.com/login");
  });
  test("X signs in again from its cookie prompt", () => {
    expect(nextStepOf(twitter, "signInNeeded")?.cli).toBe("log sessions signIn --account fakeBird --platform twitter --route cookies");
  });
  test("signed in needs nothing", () => {
    expect(nextStepOf(discord, "signedIn")).toBeNull();
  });
});

describe("checkSession", () => {
  test("calls the platform's own session check with json", async () => {
    const calls: [string, Record<string, unknown>][] = [];
    const report = await checkSession(discord, async (name, input) => {
      calls.push([name, input]);
      return dead401;
    });
    expect(calls).toEqual([["discordSessionCheck", { account: "fakeGuild", json: true }]]);
    expect(report).toMatchObject({ id: "d1", platform: "discord", account: "fakeGuild", verdict: "signInNeeded", httpStatus: 401 });
  });
  test("facebook goes to its browser check and calls nothing", async () => {
    const report = await checkSession({ id: "f1", name: "fakeFace", platform: "facebook" }, async () => {
      throw new Error("not called");
    });
    expect(report).toMatchObject({ verdict: "skipped", code: "browserCheckRequired", next: { tool: { name: "sessionsSignIn" } } });
  });
  test("a deactivated account is skipped", async () => {
    const report = await checkSession({ ...discord, status: "deactivated" }, async () => signedIn);
    expect(report).toMatchObject({ verdict: "skipped", code: "accountDeactivated" });
  });
  test("a thrown call is unknown, never signed in", async () => {
    const report = await checkSession(discord, async () => {
      throw new Error("bridge down");
    });
    expect(report).toMatchObject({ verdict: "unknown", code: "checkFailed" });
  });
});

describe("checkSessions", () => {
  const accounts = [discord, twitter];
  test("filters by platform, x meaning twitter", async () => {
    const reports = await checkSessions(accounts, { platform: "x" }, (account) => checkSession(account, async () => signedIn));
    expect(reports.map((report) => report.account)).toEqual(["fakeBird"]);
  });
  test("an unknown account is refused", async () => {
    await expect(checkSessions(accounts, { account: "nobody" }, (account) => checkSession(account, async () => signedIn))).rejects.toThrow("accountNotFound");
  });
  test("an unknown platform is refused", async () => {
    await expect(checkSessions(accounts, { platform: "myspace" }, (account) => checkSession(account, async () => signedIn))).rejects.toThrow("sessionPlatformInvalid");
  });
  test("checks one after another and writes a summary", async () => {
    const seen: string[] = [];
    const reports = await checkSessions(accounts, {}, (account) => checkSession(account, async (name) => (name === "discordSessionCheck" ? dead401 : signedIn)), (report) => seen.push(report.account));
    expect(seen).toEqual(["fakeGuild", "fakeBird"]);
    const text = sessionsText(reports);
    expect(text).toContain("2 accounts: 1 needs signing in, 1 signed in");
    expect(text).toContain("discord fakeGuild: needs signing in (sessionDead, HTTP 401)");
  });
});

describe("sign-in route per platform", () => {
  test("linkedin and slack open the browser first, with cookies as the other way", () => {
    const linkedin = nextStepOf({ name: "fakeLink", platform: "linkedin" }, "signInNeeded");
    expect(linkedin?.tool?.name).toBe("sessionsSignIn");
    expect(linkedin?.alternative?.cli).toBe("log sessions signIn --account fakeLink --platform linkedin --route cookies");
    expect(nextStepOf({ name: "fakeSlack", platform: "slack" }, "signInNeeded")?.alternative?.cli).toBe("log sessions signIn --account fakeSlack --platform slack --route cookies");
  });
  test("reddit, instagram and discord open the browser, with no cookie prompt", () => {
    for (const platform of ["reddit", "instagram", "discord"] as const) {
      const next = nextStepOf({ name: "fake", platform }, "signInNeeded");
      expect(next?.tool?.name).toBe("sessionsSignIn");
      expect(next?.alternative).toBeNull();
    }
  });
  test("x has no browser yet, so it is cookies", () => {
    const next = nextStepOf({ name: "fakeBird", platform: "twitter" }, "signInNeeded");
    expect(next?.tool).toBeNull();
    expect(next?.cli).toBe("log sessions signIn --account fakeBird --platform twitter --route cookies");
  });
});

describe("one gate", () => {
  test("a deactivated account, a stopped status or session, and a refused last check are never checked", () => {
    expect(sessionGate({ name: "a", status: "deactivated" })).toMatchObject({ ok: false, code: "accountDeactivated" });
    expect(sessionGate({ name: "a", status: "banned" })).toMatchObject({ ok: false, code: "accountCheckStopped" });
    expect(sessionGate({ name: "a", state: "checkpoint" })).toMatchObject({ ok: false, code: "accountCheckStopped" });
    expect(sessionGate({ name: "a", lastCheck: { state: "stopped", checkedAt: "2026-11-14T10:00:00Z" } })).toMatchObject({ ok: false, code: "accountCheckStopped" });
    expect(sessionGate({ name: "a", checkedAt: "2026-11-14T11:00:00Z", lastCheck: { state: "stopped", checkedAt: "2026-11-14T10:00:00Z" } })).toEqual({ ok: true });
    expect(sessionGate({ name: "a", lastCheck: { state: "unknown", checkedAt: "2026-11-14T10:00:00Z" } })).toEqual({ ok: true });
    expect(sessionGate({ name: "a", lastCheck: { state: "stopped", checkedAt: "2026-11-14T10:00:00Z" } }, { openedByOwner: true })).toEqual({ ok: true });
  });
  test("checkSession calls nothing for an account held stopped", async () => {
    const report = await checkSession({ ...discord, lastCheck: { state: "stopped", checkedAt: "2026-11-14T10:00:00Z" } }, async () => {
      throw new Error("not called");
    });
    expect(report).toMatchObject({ verdict: "stopped", code: "accountCheckStopped" });
  });
});

function memoryStore(alive: (pid: unknown) => boolean = () => true) {
  const rows = new Map<string, StoredCheck>();
  const store: CheckStore = {
    claim(accountId, pid, now) {
      const held = rows.get(accountId);
      if (held?.state === "checking" && alive(held.pid)) return { claimed: false, holder: held.pid as number };
      rows.set(accountId, { state: "checking", pid, startedAt: now.toISOString(), checkedAt: now.toISOString() });
      return { claimed: true };
    },
    record: (accountId, check) => rows.set(accountId, check),
  };
  return { rows, store };
}

describe("the check machine", () => {
  test("claims the account, checks it and records the platform's answer", async () => {
    const { rows, store } = memoryStore();
    const seen: string[] = [];
    const run = await runSessionCheck(discord, { store, pid: 4242, callTool: async () => {
      seen.push(rows.get("d1")?.state ?? "none");
      return dead401;
    } });
    expect(seen).toEqual(["checking"]);
    expect(run).toMatchObject({ outcome: "done", state: "signInNeeded", report: { verdict: "signInNeeded", code: "sessionDead" } });
    expect(rows.get("d1")).toMatchObject({ state: "signInNeeded", code: "sessionDead" });
  });
  test("a second check of the same account while one runs is busy and calls nothing", async () => {
    const { rows, store } = memoryStore();
    rows.set("d1", { state: "checking", pid: 777, checkedAt: new Date().toISOString() });
    const run = await runSessionCheck(discord, { store, pid: 4242, callTool: async () => {
      throw new Error("not called");
    } });
    expect(run).toMatchObject({ outcome: "busy", state: "checking", report: { code: "accountCheckBusy" } });
    expect(rows.get("d1")).toMatchObject({ state: "checking", pid: 777 });
  });
  test("a thrown platform call is recorded as unknown, never left checking", async () => {
    const { rows, store } = memoryStore();
    const run = await runSessionCheck(discord, { store, callTool: async () => {
      throw new Error("bridge down");
    } });
    expect(run).toMatchObject({ outcome: "done", state: "unknown", report: { code: "checkFailed", detail: "bridge down" } });
    expect(rows.get("d1")?.state).toBe("unknown");
  });
  test("a refused account writes nothing and calls nothing", async () => {
    const { rows, store } = memoryStore();
    const run = await runSessionCheck({ ...discord, status: "deactivated" }, { store, callTool: async () => {
      throw new Error("not called");
    } });
    expect(run).toMatchObject({ outcome: "refused", state: "skipped" });
    expect(rows.size).toBe(0);
  });
});

describe("check rows in log.db", () => {
  test("a checking row whose process is gone is reconciled to unknown; a live one stays checking and holds the account", () => {
    const handle = new Database(":memory:");
    handle.exec("CREATE TABLE state (scope TEXT NOT NULL, key TEXT NOT NULL, body TEXT NOT NULL, updatedAt INTEGER NOT NULL, PRIMARY KEY (scope, key))");
    const alive = (pid: unknown) => pid === 1;
    expect(claimCheck("live", 1, new Date(), handle, alive)).toEqual({ claimed: true });
    expect(claimCheck("dead", 2, new Date(), handle, alive)).toEqual({ claimed: true });
    writeCheck("old", { state: "running" as never, checkedAt: new Date().toISOString() }, handle);
    expect(claimCheck("live", 3, new Date(), handle, alive)).toEqual({ claimed: false, holder: 1 });
    const checks = readStoredChecks(handle, alive);
    expect(checks.get("live")?.state).toBe("checking");
    expect(checks.get("dead")).toMatchObject({ state: "unknown", code: "checkInterrupted" });
    expect(checks.get("old")).toMatchObject({ state: "unknown", code: "checkInterrupted" });
    expect(reconcileChecks(handle, alive)).toEqual([]);
    expect(claimCheck("dead", 3, new Date(), handle, alive)).toEqual({ claimed: true });
  });
  test("old state names read as the one state type", () => {
    expect(checkStateOfStored("succeeded")).toBe("signedIn");
    expect(checkStateOfStored("running")).toBe("checking");
    expect(checkStateOfStored("unavailable")).toBe("unknown");
    expect(checkStateOfStored("signInNeeded")).toBe("signInNeeded");
    expect(checkStateOfStored("nonsense")).toBeNull();
  });
});
