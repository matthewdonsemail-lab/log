import { describe, expect, test } from "bun:test";
import { checkSession, checkSessions, nextStepOf, sessionsText, verdictOf } from "./index.ts";
import type { SessionCheckAccount, SessionToolAnswer } from "./index.ts";

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
    const failed = verdictOf({ isError: true, structuredContent: { exit: 1, stderr: "log discord session check: twentyNotConfigured: TWENTY_BASE_URL or TWENTY_API_KEY is not set." } });
    expect(failed).toMatchObject({ verdict: "unknown", code: "twentyNotConfigured" });
  });
});

describe("nextStepOf", () => {
  test("a browser platform opens the account's browser on its sign-in page", () => {
    const next = nextStepOf(discord, "signInNeeded");
    expect(next?.tool).toEqual({ name: "inspectStart", input: { account: "fakeGuild", url: "https://discord.com/login", detach: true, goal: expect.any(String) } });
    expect(next?.cli).toBe("log inspect start --account fakeGuild --url https://discord.com/login --detach");
  });
  test("X signs in again from its cookie prompt", () => {
    expect(nextStepOf(twitter, "signInNeeded")?.cli).toBe("log twitter cookies save --account fakeBird");
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
    expect(report).toMatchObject({ verdict: "browserCheck", code: "browserCheckRequired" });
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
    const reports = await checkSessions(accounts, { platform: "x" }, async () => signedIn);
    expect(reports.map((report) => report.account)).toEqual(["fakeBird"]);
  });
  test("an unknown account is refused", async () => {
    await expect(checkSessions(accounts, { account: "nobody" }, async () => signedIn)).rejects.toThrow("accountNotFound");
  });
  test("an unknown platform is refused", async () => {
    await expect(checkSessions(accounts, { platform: "myspace" }, async () => signedIn)).rejects.toThrow("sessionPlatformInvalid");
  });
  test("checks one after another and writes a summary", async () => {
    const seen: string[] = [];
    const reports = await checkSessions(accounts, {}, async (name) => (name === "discordSessionCheck" ? dead401 : signedIn), (report) => seen.push(report.account));
    expect(seen).toEqual(["fakeGuild", "fakeBird"]);
    const text = sessionsText(reports);
    expect(text).toContain("2 accounts: 1 needs signing in, 1 signed in");
    expect(text).toContain("discord fakeGuild: needs signing in (sessionDead, HTTP 401)");
  });
});

describe("sign-in route per platform", () => {
  test("linkedin and slack sign in with cookies, like the console and the launcher say", () => {
    expect(nextStepOf({ name: "fakeLink", platform: "linkedin" }, "signInNeeded")?.cli).toBe("log linkedin cookies save --account fakeLink");
    expect(nextStepOf({ name: "fakeSlack", platform: "slack" }, "signInNeeded")?.tool).toBeNull();
  });
  test("reddit and instagram open the account's browser", () => {
    expect(nextStepOf({ name: "fakeRed", platform: "reddit" }, "signInNeeded")?.tool?.name).toBe("inspectStart");
    expect(nextStepOf({ name: "fakeGram", platform: "instagram" }, "signInNeeded")?.tool?.name).toBe("inspectStart");
  });
});
