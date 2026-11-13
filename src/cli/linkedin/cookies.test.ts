import { afterEach, describe, expect, test } from "bun:test";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineRun } from "../../platformKit/session/index.ts";
import { runCli } from "../runner/index.ts";
import { linkedinCookiesDeps, publicIdOf } from "./helpers/index.ts";

const realDeps = { ...linkedinCookiesDeps };

afterEach(() => {
  linkedinCookiesDeps.prompts = realDeps.prompts;
  linkedinCookiesDeps.tty = realDeps.tty;
  linkedinCookiesDeps.clipboard = realDeps.clipboard;
  linkedinCookiesDeps.stateRoot = realDeps.stateRoot;
});

const LI_AT = "AQEDA".padEnd(120, "x");
const JSESSION = "ajax:1234567890123456789";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";
const CURL = [
  "curl 'https://www.linkedin.com/voyager/api/me' \\",
  "  -H 'accept: application/vnd.linkedin.normalized+json+2.1' \\",
  `  -b 'bcookie="v=2&abc"; bscookie="v=1&def"; li_rm=ghi; li_at=${LI_AT}; JSESSIONID="${JSESSION}"; lidc="b=VB"' \\`,
  "  -H 'sec-ch-ua: \"Chromium\";v=\"142\"' \\",
  "  -H 'sec-ch-ua-platform: \"Windows\"' \\",
  `  -H 'user-agent: ${UA}' \\`,
  "  -H 'x-li-track: {\"clientVersion\":\"1.13\"}'",
].join("\n");

function typed(clip: string, ready: unknown = true) {
  const said: string[] = [];
  const state = { cleared: 0, root: mkdtempSync(join(tmpdir(), "linkedinState")) };
  linkedinCookiesDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
  linkedinCookiesDeps.clipboard = { read: () => clip, clear: () => void state.cleared++ };
  linkedinCookiesDeps.stateRoot = () => state.root;
  linkedinCookiesDeps.prompts = {
    intro: (t) => said.push(t),
    outro: (t) => said.push(t ?? ""),
    cancel: (t) => said.push(t ?? ""),
    confirm: async () => ready,
  };
  return { said, state };
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

const LOGGED_IN = (screenName: string): PlatformEngineRun => ({ answer: { ok: true, loginState: "loggedIn", screenName, userId: "ACoAAB" }, refreshed: null });

describe("log linkedin cookies save", () => {
  test("a new profile: checked with LinkedIn first, then a LINKEDIN row loggedIn; nothing secret printed", async () => {
    const { said, state } = typed(CURL);
    const r = await run(["linkedin", "cookies", "save", "--account", "https://www.linkedin.com/in/mandeepSingh/"], LOGGED_IN("mandeepSingh"));
    expect(r.code).toBe(0);
    const all = { bcookie: '"v=2&abc"', bscookie: '"v=1&def"', li_rm: "ghi", li_at: LI_AT, JSESSIONID: `"${JSESSION}"`, lidc: '"b=VB"' };
    expect(r.calls).toEqual([{ account: "mandeepSingh", action: "ping", cookies: all }]);
    const row = r.twenty.rows.socialAccounts!.find((x) => x.accountName === "mandeepSingh")!;
    expect(row).toMatchObject({ platform: "LINKEDIN", sessionState: "loggedIn", cookies: all });
    expect(JSON.parse(readFileSync(join(state.root, "mandeepSingh", "browser.json"), "utf8"))).toEqual({ userAgent: UA, secChUa: '"Chromium";v="142"', secChUaPlatform: '"Windows"', xLiTrack: '{"clientVersion":"1.13"}' });
    expect(state.cleared).toBe(1);
    expect(r.out).toContain("added in Twenty as a LINKEDIN socialAccount");
    for (const text of [r.out, r.err, ...said]) {
      expect(text).not.toContain(LI_AT);
      expect(text).not.toContain(JSESSION);
    }
  });

  test("cookies LinkedIn refuses, or for another profile, save nothing", async () => {
    typed(CURL);
    const refused = await run(["linkedin", "cookies", "save", "--account", "mandeepSingh"], { answer: { ok: false, code: "sessionDead", loginState: "loggedOut" }, refreshed: null });
    expect(refused.code).toBe(1);
    expect(refused.err).toContain("linkedinCookiesRefused");
    expect(refused.twenty.rows.socialAccounts!.some((x) => x.platform === "LINKEDIN")).toBe(false);
    typed(CURL);
    const wrong = await run(["linkedin", "cookies", "save", "--account", "mandeepSingh"], LOGGED_IN("someoneElse"));
    expect(wrong.err).toContain("linkedinCookiesWrongAccount");
    expect(wrong.twenty.rows.socialAccounts!.some((x) => x.platform === "LINKEDIN")).toBe(false);
  });

  test("a copy without the browser's cookies or user agent, or not from linkedin.com, is refused before LinkedIn is called", async () => {
    for (const [clip, why] of [
      [CURL.replace(/bcookie="v=2&abc"; bscookie="v=1&def"; /, ""), "no bcookie or bscookie"],
      [CURL.replace(/ {2}-H 'user-agent: [^']+' \\\n/, ""), "no user-agent"],
      [CURL.replace("https://www.linkedin.com/", "https://example.com/"), "isn't to linkedin.com"],
      ["li_at=x; JSESSIONID=y", "doesn't hold a request copied as cURL"],
    ] as const) {
      const { state } = typed(clip);
      const r = await run(["linkedin", "cookies", "save", "--account", "mandeepSingh"], LOGGED_IN("mandeepSingh"));
      expect(r.code).toBe(1);
      expect(r.err).toContain("linkedinRequestUnusable");
      expect(r.err).toContain(why);
      expect(r.calls).toEqual([]);
      expect(state.cleared).toBe(1);
      expect(r.err).not.toContain(LI_AT);
    }
  });

  test("--har takes the session and browser headers from a recording of the account's own browser, with no prompt or clipboard", async () => {
    const { state } = typed("");
    linkedinCookiesDeps.tty = () => ({ stdinTTY: false, stdoutTTY: false });
    const dir = mkdtempSync(join(tmpdir(), "linkedinHar"));
    const har = join(dir, "step.har");
    const entry = (url: string, cookie: string) => ({ request: { url, headers: [{ name: "cookie", value: cookie }, { name: "user-agent", value: UA }, { name: "sec-ch-ua-platform", value: '"Windows"' }], cookies: [] } });
    writeFileSync(har, JSON.stringify({ log: { entries: [entry("https://static.licdn.com/x.js", "a=b"), entry("https://www.linkedin.com/voyager/api/me", `bcookie="v=2&abc"; bscookie="v=1&def"; li_at=${LI_AT}; JSESSIONID="${JSESSION}"`)] } }));
    const r = await run(["linkedin", "cookies", "save", "--account", "mandeepSingh", "--har", har], LOGGED_IN("mandeepSingh"));
    expect(r.code).toBe(0);
    expect((r.calls[0] as { cookies: Record<string, string> }).cookies).toMatchObject({ li_at: LI_AT, bcookie: '"v=2&abc"' });
    expect(JSON.parse(readFileSync(join(state.root, "mandeepSingh", "browser.json"), "utf8"))).toEqual({ userAgent: UA, secChUaPlatform: '"Windows"' });
    expect(state.cleared).toBe(0);
    expect(r.out).not.toContain(LI_AT);
    writeFileSync(har, JSON.stringify({ log: { entries: [entry("https://www.linkedin.com/feed/", "bcookie=a; lang=en")] } }));
    const signedOut = await run(["linkedin", "cookies", "save", "--account", "mandeepSingh", "--har", har], LOGGED_IN("mandeepSingh"));
    expect(signedOut.err).toContain("linkedinRequestUnusable");
    expect(signedOut.calls).toEqual([]);
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
