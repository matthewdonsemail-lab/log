import { afterEach, describe, expect, test } from "bun:test";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineRun } from "../../platformKit/session/index.ts";
import { runCli } from "../runner/index.ts";
import { linkedinCookiesDeps, publicIdOf } from "./helpers/index.ts";

const realDeps = { ...linkedinCookiesDeps };

afterEach(() => {
  linkedinCookiesDeps.prompts = realDeps.prompts;
  linkedinCookiesDeps.tty = realDeps.tty;
});

function typed(values: unknown[]) {
  const said: string[] = [];
  linkedinCookiesDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
  linkedinCookiesDeps.prompts = {
    intro: (t) => said.push(t),
    outro: (t) => said.push(t ?? ""),
    cancel: (t) => said.push(t ?? ""),
    password: async () => values.shift(),
  };
  return said;
}

async function run(argv: string[], engine: PlatformEngineRun | null, twenty = marketplaceFixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const calls: unknown[] = [];
  const code = await runCli(argv, {
    twenty,
    out: (l) => out.push(l),
    err: (l) => err.push(l),
    directLinkedin: (account, spec) => {
      calls.push({ account: account.accountName, action: spec.action, cookies: account.cookies });
      return engine ?? { answer: { ok: false, code: "notExpected" }, refreshed: null };
    },
  });
  return { code, out: out.join("\n"), err: err.join("\n"), calls, twenty };
}

const LI_AT = "AQEDA".padEnd(120, "x");
const JSESSION = "ajax:1234567890123456789";
const LOGGED_IN = (screenName: string): PlatformEngineRun => ({ answer: { ok: true, loginState: "loggedIn", screenName, userId: "ACoAAB" }, refreshed: null });

describe("log linkedin cookies save", () => {
  test("a new profile: checked with LinkedIn first, then a LINKEDIN row loggedIn; nothing secret printed", async () => {
    const said = typed([LI_AT, JSESSION]);
    const r = await run(["linkedin", "cookies", "save", "--account", "https://www.linkedin.com/in/mandeepSingh/"], LOGGED_IN("mandeepSingh"));
    expect(r.code).toBe(0);
    expect(r.calls).toEqual([{ account: "mandeepSingh", action: "ping", cookies: { li_at: LI_AT, JSESSIONID: `"${JSESSION}"` } }]);
    const row = r.twenty.rows.socialAccounts!.find((x) => x.accountName === "mandeepSingh")!;
    expect(row).toMatchObject({ platform: "LINKEDIN", sessionState: "loggedIn", cookies: { li_at: LI_AT, JSESSIONID: `"${JSESSION}"` } });
    expect(r.out).toContain("added in Twenty as a LINKEDIN socialAccount");
    for (const text of [r.out, r.err, ...said]) {
      expect(text).not.toContain(LI_AT);
      expect(text).not.toContain(JSESSION);
    }
  });

  test("cookies LinkedIn refuses, or for another profile, save nothing", async () => {
    typed([LI_AT, JSESSION]);
    const refused = await run(["linkedin", "cookies", "save", "--account", "mandeepSingh"], { answer: { ok: false, code: "sessionDead", loginState: "loggedOut" }, refreshed: null });
    expect(refused.code).toBe(1);
    expect(refused.err).toContain("linkedinCookiesRefused");
    expect(refused.twenty.rows.socialAccounts!.some((x) => x.platform === "LINKEDIN")).toBe(false);
    typed([LI_AT, JSESSION]);
    const wrong = await run(["linkedin", "cookies", "save", "--account", "mandeepSingh"], LOGGED_IN("someoneElse"));
    expect(wrong.err).toContain("linkedinCookiesWrongAccount");
    expect(wrong.twenty.rows.socialAccounts!.some((x) => x.platform === "LINKEDIN")).toBe(false);
  });

  test("it needs a terminal, and a public id is read from a profile url", async () => {
    linkedinCookiesDeps.tty = () => ({ stdinTTY: false, stdoutTTY: false });
    const r = await run(["linkedin", "cookies", "save", "--account", "mandeepSingh"], null);
    expect(r.code).toBe(1);
    expect(r.err).toContain("interactive terminal");
    expect(r.calls).toEqual([]);
    expect(publicIdOf("https://www.linkedin.com/in/mandeepSingh/?trk=x")).toBe("mandeepSingh");
    expect(publicIdOf("@mandeep")).toBe("mandeep");
  });
});
