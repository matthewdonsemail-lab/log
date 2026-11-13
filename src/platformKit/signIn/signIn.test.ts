import { describe, expect, test } from "bun:test";
import { keepSession } from "../../cli/live/index.ts";
import type { PreparedRun } from "../../browser/run/index.ts";
import type { CommandContext } from "../../cli/runner/types.ts";
import { savePlatformSession } from "../../marketplace/socialAccount/index.ts";
import type { FacebookAccount, PlaywrightCookie } from "../../marketplace/socialAccount/index.ts";
import type { TwentyClient } from "../../twenty/graphql/index.ts";
import type { SessionReport } from "../sessionCheck/index.ts";
import { browserSessionGate, readSessionSave, runSignIn, signInRouteFor } from "./index.ts";
import type { SaveOutcome, SignInAccount, SignInActors, SignInStore } from "./index.ts";

const discord: SignInAccount = { id: "d1", name: "fakeGuild", platform: "discord" };
const twitter: SignInAccount = { id: "t1", name: "fakeBird", platform: "twitter" };
const facebook: SignInAccount = { id: "f1", name: "fakeFace", platform: "facebook" };

function report(account: SignInAccount, verdict: SessionReport["verdict"], code: string | null = null): SessionReport {
  return { id: account.id, platform: account.platform, account: account.name, verdict, code, detail: null, httpStatus: null, checkedAt: "2026-11-14T10:00:00.000Z", next: null };
}

function memoryStore(): SignInStore & { rows: Map<string, { snapshot: unknown; route: "browser" | "cookies"; savedAt: number }> } {
  const rows = new Map<string, { snapshot: unknown; route: "browser" | "cookies"; savedAt: number }>();
  return {
    rows,
    load: (id) => rows.get(id) ?? null,
    keep: (id, snapshot, route, now) => rows.set(id, { snapshot: JSON.parse(JSON.stringify(snapshot)), route, savedAt: now }),
    drop: (id) => rows.delete(id),
  };
}

const saved: SaveOutcome = { saved: true, code: null, detail: "12 cookies, 1 origin(s)", at: "2026-11-14T10:05:00.000Z" };
const signedOut: SaveOutcome = { saved: false, code: "noPlatformSession", detail: "the browser has no Discord https://discord.com localStorage token", at: "2026-11-14T10:05:00.000Z" };

function actors(over: Partial<SignInActors>, calls: string[]): SignInActors {
  return {
    check: async (account) => {
      calls.push("check");
      return report(account, "signInNeeded", "sessionDead");
    },
    open: async () => {
      calls.push("open");
    },
    waitForOwner: async (_, finish) => {
      calls.push(`wait ${finish}`);
      return { finished: finish };
    },
    save: async () => {
      calls.push("save");
      return saved;
    },
    recheck: async (account) => {
      calls.push("recheck");
      return report(account, "signedIn");
    },
    ...over,
  };
}

const now = () => new Date("2026-11-14T10:00:00.000Z");

describe("the sign-in machine", () => {
  test("a signed-in account is done at the check, and nothing is opened", async () => {
    const calls: string[] = [];
    const result = await runSignIn({ account: discord }, { store: memoryStore(), now, actors: actors({ check: async (account) => (calls.push("check"), report(account, "signedIn")) }, calls) });
    expect(result).toMatchObject({ state: "signedIn", route: "browser", next: null });
    expect(calls).toEqual(["check"]);
  });

  test("an account the platform refused is stopped, and nothing is opened (rule 94)", async () => {
    const calls: string[] = [];
    const result = await runSignIn({ account: discord }, { store: memoryStore(), now, actors: actors({ check: async (account) => (calls.push("check"), report(account, "stopped", "accountCheckStopped")) }, calls) });
    expect(result).toMatchObject({ state: "stopped", code: "accountCheckStopped" });
    expect(calls).toEqual(["check"]);
  });

  test("the browser route opens, waits for the owner, then a later call with done saves and checks again", async () => {
    const calls: string[] = [];
    const store = memoryStore();
    const stages: string[] = [];
    const first = await runSignIn({ account: discord }, { store, now, onStage: (stage) => stages.push(stage), actors: actors({}, calls) });
    expect(first).toMatchObject({ state: "waitingForOwner", stage: "waitingForOwner", next: { tool: { name: "sessionsSignIn", input: { account: "fakeGuild", platform: "discord", done: true } } } });
    expect(stages).toEqual(["checking", "opening", "waitingForOwner"]);
    expect(store.rows.has("d1")).toBe(true);
    const second = await runSignIn({ account: discord, finish: true }, { store, now, actors: actors({}, calls) });
    expect(second).toMatchObject({ state: "signedIn", save: { saved: true }, check: { verdict: "signedIn" }, next: null });
    expect(calls).toEqual(["check", "open", "wait false", "wait true", "save", "recheck"]);
    expect(store.rows.has("d1")).toBe(false);
  });

  test("the owner closing the window finishes it in one call", async () => {
    const calls: string[] = [];
    const result = await runSignIn({ account: discord }, { store: memoryStore(), now, actors: actors({ waitForOwner: async () => (calls.push("closed"), { finished: true }) }, calls) });
    expect(result.state).toBe("signedIn");
    expect(calls).toEqual(["check", "open", "closed", "save", "recheck"]);
  });

  test("a signed-out browser saves nothing: still needs signing in, with the stored session left as it was", async () => {
    const calls: string[] = [];
    const result = await runSignIn({ account: discord, finish: true }, { store: memoryStore(), now, actors: actors({ save: async () => (calls.push("save"), signedOut) }, calls) });
    expect(result).toMatchObject({ state: "signInNeeded", save: { saved: false, code: "noPlatformSession" } });
    expect(result.next?.says).toContain("Nothing was saved (noPlatformSession)");
    expect(result.next?.says).toContain("stored session was left as it was");
    expect(calls).not.toContain("recheck");
  });

  test("a step that throws ends in failed with its code, and nothing is retried", async () => {
    const calls: string[] = [];
    const result = await runSignIn({ account: discord }, { store: memoryStore(), now, actors: actors({ open: async () => { throw new Error("browserOperationRefused: no AdsPower profile"); } }, calls) });
    expect(result).toMatchObject({ state: "failed", stage: "opening", code: "browserOperationRefused" });
    expect(result.next?.says).toContain("Nothing was retried");
  });

  test("a deactivated account fails at the check", async () => {
    const result = await runSignIn({ account: discord }, { store: memoryStore(), now, actors: actors({ check: async (account) => report(account, "skipped", "accountDeactivated") }, []) });
    expect(result).toMatchObject({ state: "failed", code: "accountDeactivated" });
  });

  test("X takes the cookie route: no browser, the save is the masked prompt, then a check", async () => {
    const calls: string[] = [];
    const result = await runSignIn({ account: twitter }, { store: memoryStore(), now, actors: actors({}, calls) });
    expect(result).toMatchObject({ state: "signedIn", route: "cookies" });
    expect(calls).toEqual(["check", "save", "recheck"]);
    expect(() => signInRouteFor(twitter, "browser")).toThrow("signInRouteUnavailable");
    expect(signInRouteFor({ platform: "linkedin" })).toBe("browser");
    expect(signInRouteFor({ platform: "linkedin" }, "cookies")).toBe("cookies");
  });

  test("Facebook has no session check: a gated save from its browser is what signs it in", async () => {
    const calls: string[] = [];
    const skipped = (account: SignInAccount) => report(account, "skipped", "browserCheckRequired");
    const result = await runSignIn({ account: facebook, finish: true }, { store: memoryStore(), now, actors: actors({ check: async (account) => (calls.push("check"), skipped(account)), recheck: async (account) => (calls.push("recheck"), skipped(account)) }, calls) });
    expect(result.state).toBe("signedIn");
    expect(calls).toEqual(["check", "open", "wait true", "save", "recheck"]);
  });

  test("a waiting snapshot older than its lifetime is not resumed", async () => {
    const calls: string[] = [];
    const store = memoryStore();
    await runSignIn({ account: discord }, { store, now, actors: actors({}, calls) });
    const later = () => new Date("2026-11-14T11:00:00.000Z");
    await runSignIn({ account: discord, finish: true }, { store, now: later, actors: actors({}, calls) });
    expect(calls).toEqual(["check", "open", "wait false", "check", "open", "wait true", "save", "recheck"]);
  });
});

describe("saving a browser session", () => {
  const cookie = (name: string, value = "v".repeat(20)): PlaywrightCookie => ({ name, value, domain: ".discord.com", path: "/", expires: -1, httpOnly: true, secure: true, sameSite: "Lax" }) as PlaywrightCookie;
  const token = [{ origin: "https://discord.com", localStorage: [{ name: "token", value: JSON.stringify("fakeToken") }] }];

  test("the gate wants the platform's own sign-in cookies or token", () => {
    expect(browserSessionGate("discord", { cookies: [cookie("locale")], origins: [] })).toMatchObject({ ok: false, code: "noPlatformSession" });
    expect(browserSessionGate("discord", { cookies: [], origins: token })).toEqual({ ok: true });
    expect(browserSessionGate("reddit", { cookies: [cookie("reddit_session")], origins: [] })).toEqual({ ok: true });
    expect(browserSessionGate("instagram", { cookies: [cookie("sessionid"), cookie("ds_user_id")], origins: [] })).toMatchObject({ ok: false, detail: expect.stringContaining("csrftoken") });
    expect(browserSessionGate("facebook", { cookies: [cookie("c_user"), cookie("xs")], origins: [] })).toEqual({ ok: true });
    expect(browserSessionGate(null, { cookies: [], origins: [] })).toMatchObject({ ok: false, code: "accountPlatformMissing" });
  });

  test("savePlatformSession writes the session, its state and when it was checked, and says so", async () => {
    const updates: Record<string, unknown>[] = [];
    const twenty = { update: async (_: string, __: string, fields: Record<string, unknown>) => void updates.push(fields) } as unknown as TwentyClient;
    const result = await savePlatformSession(twenty, "d1", { cookies: [], origins: token }, (state) => browserSessionGate("discord", state), new Date("2026-11-14T10:05:00.000Z"));
    expect(result).toMatchObject({ saved: true });
    expect(updates).toEqual([{ cookies: [], storageOrigins: token, sessionState: "loggedIn", sessionCheckedAt: "2026-11-14T10:05:00.000Z" }]);
  });

  test("a signed-out browser closing leaves the stored session untouched, and the outcome reaches the caller", async () => {
    const updates: unknown[] = [];
    const twenty = { update: async (...args: unknown[]) => void updates.push(args) } as unknown as TwentyClient;
    const account = { id: "localDiscordGuild", accountName: "fakeGuild", platform: "DISCORD" } as FacebookAccount;
    const run = { readStorageState: () => ({ cookies: [cookie("locale"), cookie("__dcfduid")], origins: [{ origin: "https://discord.com", localStorage: [] }] }) } as unknown as PreparedRun;
    const at = new Date("2026-11-14T10:05:00.000Z");
    const note = await keepSession({ twenty, now: () => at } as unknown as CommandContext, account, run);
    expect(updates).toEqual([]);
    expect(note).toContain("Kept fakeGuild's stored session");
    expect(readSessionSave("localDiscordGuild", "2026-11-14T10:00:00.000Z")).toMatchObject({ saved: false, code: "noPlatformSession" });
    expect(readSessionSave("localDiscordGuild", "2026-11-14T10:06:00.000Z")).toBeNull();
  });

  test("a signed-in browser closing saves its session and records it", async () => {
    const updates: unknown[] = [];
    const twenty = { update: async (...args: unknown[]) => void updates.push(args) } as unknown as TwentyClient;
    const account = { id: "localDiscordSaved", accountName: "fakeGuild", platform: "DISCORD" } as FacebookAccount;
    const run = { readStorageState: () => ({ cookies: [], origins: token }) } as unknown as PreparedRun;
    const at = new Date("2026-11-14T10:05:00.000Z");
    const note = await keepSession({ twenty, now: () => at } as unknown as CommandContext, account, run);
    expect(updates.length).toBe(1);
    expect(note).toContain("Saved fakeGuild's browser session");
    expect(readSessionSave("localDiscordSaved", "2026-11-14T10:00:00.000Z")).toMatchObject({ saved: true });
  });
});
