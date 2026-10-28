import { afterEach, describe, expect, test } from "bun:test";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { TwitterEngineRun } from "../../twitter/account/session/index.ts";
import { runCli } from "../runner/index.ts";
import { cookiesDeps } from "./helpers/index.ts";

const realDeps = { ...cookiesDeps };

afterEach(() => {
  cookiesDeps.prompts = realDeps.prompts;
  cookiesDeps.tty = realDeps.tty;
});

function typed(values: unknown[]) {
  const said: string[] = [];
  cookiesDeps.tty = () => ({ stdinTTY: true, stdoutTTY: true });
  cookiesDeps.prompts = {
    intro: (t) => said.push(t),
    outro: (t) => said.push(t ?? ""),
    cancel: (t) => said.push(t ?? ""),
    password: async () => values.shift(),
  };
  return said;
}

async function run(argv: string[], engine: TwitterEngineRun | null, twenty = marketplaceFixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const calls: unknown[] = [];
  const code = await runCli(argv, {
    twenty,
    out: (l) => out.push(l),
    err: (l) => err.push(l),
    directTwitter: (account, spec) => {
      calls.push({ account: account.accountName, action: spec.action, cookies: account.cookies });
      return engine ?? { answer: { ok: false, code: "notExpected" }, refreshed: null };
    },
  });
  return { code, out: out.join("\n"), err: err.join("\n"), calls, twenty };
}

const TOKEN = "a".repeat(40);
const CT0 = "b".repeat(64);
const LOGGED_IN = (screenName: string): TwitterEngineRun => ({ answer: { ok: true, loginState: "loggedIn", httpStatus: 404, userId: "77", screenName }, refreshed: { guest_id: "v1" } });

describe("log twitter cookies save", () => {
  test("a new handle: checked with X first, then a TWITTER row with the cookies, loggedIn and its style; nothing secret printed", async () => {
    const said = typed([TOKEN, CT0]);
    const r = await run(["twitter", "cookies", "save", "--account", "@newOne", "--style", "house"], LOGGED_IN("newone"));
    expect(r.code).toBe(0);
    expect(r.calls).toEqual([{ account: "newOne", action: "ping", cookies: { auth_token: TOKEN, ct0: CT0 } }]);
    const row = r.twenty.rows.socialAccounts!.find((x) => x.accountName === "newOne")!;
    expect(row).toMatchObject({ platform: "TWITTER", name: "newOne", sessionState: "loggedIn", copyStyle: "house", cookies: { auth_token: TOKEN, ct0: CT0, guest_id: "v1" } });
    expect(r.out).toContain("@newOne added in Twenty");
    for (const text of [r.out, r.err, ...said]) {
      expect(text).not.toContain(TOKEN);
      expect(text).not.toContain(CT0);
    }
  });

  test("an existing handle has its cookies replaced, not a second row", async () => {
    typed([TOKEN, CT0]);
    const twenty = marketplaceFixture();
    twenty.rows.socialAccounts!.push({ id: "xOld", accountName: "oldOne", platform: "TWITTER", cookies: { auth_token: "z".repeat(40), ct0: "y".repeat(40) }, proxy: null });
    const r = await run(["twitter", "cookies", "save", "--account", "oldOne"], LOGGED_IN("OldOne"), twenty);
    expect(r.code).toBe(0);
    const rows = r.twenty.rows.socialAccounts!.filter((x) => x.accountName === "oldOne");
    expect(rows).toHaveLength(1);
    expect((rows[0].cookies as Record<string, string>).auth_token).toBe(TOKEN);
    expect(r.out).toContain("updated");
  });

  test("cookies X refuses, or for another handle, save nothing", async () => {
    typed([TOKEN, CT0]);
    const refused = await run(["twitter", "cookies", "save", "--account", "newOne"], { answer: { ok: false, code: "sessionDead", loginState: "loggedOut" }, refreshed: null });
    expect(refused.code).toBe(1);
    expect(refused.err).toContain("twitterCookiesRefused");
    expect(refused.twenty.rows.socialAccounts!.some((x) => x.accountName === "newOne")).toBe(false);
    typed([TOKEN, CT0]);
    const wrong = await run(["twitter", "cookies", "save", "--account", "newOne"], LOGGED_IN("someoneElse"));
    expect(wrong.err).toContain("twitterCookiesWrongAccount");
    expect(wrong.twenty.rows.socialAccounts!.some((x) => x.accountName === "newOne")).toBe(false);
  });

  test("an unknown style and a missing terminal are refused before anything is asked", async () => {
    const style = await run(["twitter", "cookies", "save", "--account", "newOne", "--style", "shouty"], null);
    expect(style.err).toContain("copyStyleUnknown");
    cookiesDeps.tty = () => ({ stdinTTY: false, stdoutTTY: false });
    const noTty = await run(["twitter", "cookies", "save", "--account", "newOne"], null);
    expect(noTty.code).toBe(1);
    expect(noTty.err).toContain("interactive terminal");
    expect(noTty.calls).toEqual([]);
  });
});
