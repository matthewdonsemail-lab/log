import { describe, expect, test } from "bun:test";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { mergeCookieShape, twitterCookies } from "../../twitter/account/session/index.ts";
import type { TwitterEngineRun } from "../../twitter/account/session/index.ts";
import { runCli } from "../runner/index.ts";

function fixture() {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push({ id: "xTwo", accountName: "xTwo", platform: "TWITTER", cookies: [{ name: "auth_token", value: "a".repeat(40), domain: ".x.com" }, { name: "ct0", value: "b".repeat(40), domain: ".x.com" }], proxy: null });
  return twenty;
}

async function run(argv: string[], engine?: TwitterEngineRun, twenty = fixture()) {
  const out: string[] = [];
  const err: string[] = [];
  const calls: string[] = [];
  const code = await runCli(argv, {
    twenty,
    out: (l) => out.push(l),
    err: (l) => err.push(l),
    directTwitter: (account, spec) => {
      calls.push(`${account.accountName}:${spec.action}`);
      return engine ?? { answer: { ok: false, code: "notExpected" }, refreshed: null };
    },
  });
  const row = twenty.rows.socialAccounts!.find((r) => r.accountName === "xTwo")!;
  return { code, out: out.join("\n"), err: err.join("\n"), calls, row };
}

describe("log twitter session check", () => {
  test("loggedIn: on the direct-API engine with no proxy, sessionState and refreshed cookies go back to Twenty in the stored shape", async () => {
    const r = await run(["twitter", "session", "check", "--account", "xTwo"], { answer: { ok: true, loginState: "loggedIn", httpStatus: 404, userId: "42", screenName: "xtwo" }, refreshed: { ct0: "c".repeat(40), guest_id: "v1" } });
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["xTwo:ping"]);
    expect(r.out).toContain("xTwo is loggedIn as @xtwo (42)");
    expect(r.row.sessionState).toBe("loggedIn");
    const cookies = r.row.cookies as { name: string; value: string }[];
    expect(cookies.find((c) => c.name === "ct0")!.value).toBe("c".repeat(40));
    expect(cookies.find((c) => c.name === "guest_id")).toMatchObject({ value: "v1", domain: ".x.com" });
  });

  test("loggedOut: exit 1, sessionState written, cookies left as they were", async () => {
    const r = await run(["twitter", "session", "check", "--account", "xTwo", "--json"], { answer: { ok: false, code: "sessionDead", loginState: "loggedOut", httpStatus: 401, detail: "X answered HTTP 401 to the session check" }, refreshed: { ct0: "z" } });
    expect(r.code).toBe(1);
    expect(JSON.parse(r.out)).toMatchObject({ engine: "directApi", library: "twikit", loginState: "loggedOut", code: "sessionDead" });
    expect(r.row.sessionState).toBe("loggedOut");
    expect((r.row.cookies as { name: string; value: string }[]).find((c) => c.name === "ct0")!.value).toBe("b".repeat(40));
  });

  test("the gate: no auth_token + ct0 is refused before X is called; a Facebook account is refused", async () => {
    const noSession = await run(["twitter", "session", "check", "--account", "twitterOne"]);
    expect(noSession.code).toBe(1);
    expect(noSession.err).toContain("noTwitterSession");
    expect(noSession.calls).toEqual([]);
    const facebook = await run(["twitter", "session", "check", "--account", "galwayOne"]);
    expect(facebook.err).toContain("accountNotFound");
    expect(facebook.calls).toEqual([]);
  });

  test("the platform comes first and must match", async () => {
    const bare = await run(["session", "check", "--account", "xTwo"]);
    expect(bare.err).toContain("log twitter session check --account xTwo");
    const wrong = await run(["facebook", "session", "check", "--account", "xTwo"]);
    expect(wrong.err).toContain("session is twitter's, not facebook's");
  });
});

describe("cookies", () => {
  test("every shape Twenty may hold is read, and a merge keeps the stored shape", () => {
    expect(twitterCookies("auth_token=a; ct0=b")).toEqual({ auth_token: "a", ct0: "b" });
    expect(twitterCookies('{"auth_token":"a"}')).toEqual({ auth_token: "a" });
    expect(twitterCookies([{ name: "ct0", value: "b" }])).toEqual({ ct0: "b" });
    expect(mergeCookieShape({ a: "1" }, { b: "2" })).toEqual({ a: "1", b: "2" });
  });
});
