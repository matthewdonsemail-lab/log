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

  test("a check that changes nothing within the hour skips the Twenty write, and a changed cookie still writes", async () => {
    const twenty = fixture();
    const same = { answer: { ok: true, loginState: "loggedIn" as const, httpStatus: 404, userId: "42", screenName: "xtwo" }, refreshed: { ct0: "b".repeat(40) } };
    const first = await run(["twitter", "session", "check", "--account", "xTwo"], same, twenty);
    expect(first.err).toContain("Twenty: xTwo sessionState loggedIn");
    const checkedAt = first.row.sessionCheckedAt;
    const second = await run(["twitter", "session", "check", "--account", "xTwo"], same, twenty);
    expect(second.err).not.toContain("Twenty:");
    expect(second.row.sessionCheckedAt).toBe(checkedAt);
    const third = await run(["twitter", "session", "check", "--account", "xTwo"], { ...same, refreshed: { ct0: "d".repeat(40) } }, twenty);
    expect(third.err).toContain("its refreshed cookies merged back");
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

describe("log twitter list (rule 141)", () => {
  const lists = { answer: { ok: true, loginState: "loggedIn", lists: [{ id: "77", name: "Go-Getters", mode: "Public", memberCount: 0, description: "" }] }, refreshed: null } as unknown as TwitterEngineRun;

  test("show lists the account's lists and sends nothing", async () => {
    const r = await run(["twitter", "list", "show", "--account", "xTwo"], lists);
    expect(r.code).toBe(0);
    expect(r.calls).toEqual(["xTwo:lists"]);
    expect(r.out).toContain("77  Go-Getters");
  });

  test("create is a dry run without --live, a list already there is never made twice, and --live needs --approvedBy", async () => {
    const dry = await run(["twitter", "list", "create", "--account", "xTwo", "--name", "Builders"], lists);
    expect(dry.out).toContain('would make the public list "Builders"');
    expect(dry.calls).toEqual(["xTwo:lists"]);
    const again = await run(["twitter", "list", "create", "--account", "xTwo", "--name", "GO-GETTERS"], lists);
    expect(again.out).toContain('already has the list "Go-Getters"');
    const unapproved = await run(["twitter", "list", "create", "--account", "xTwo", "--name", "Builders", "--live"], lists);
    expect(unapproved.code).toBe(1);
    expect(unapproved.calls).toEqual([]);
  });

  test("add finds the list by name and refuses one the account doesn't have", async () => {
    const dry = await run(["twitter", "list", "add", "--account", "xTwo", "--list", "GO-GETTERS", "--handle", "shaw_gtm"], lists);
    expect(dry.out).toContain('would put @shaw_gtm on "Go-Getters" (77)');
    const missing = await run(["twitter", "list", "add", "--account", "xTwo", "--list", "nope", "--handle", "shaw_gtm"], lists);
    expect(missing.err + missing.out).toContain("listInvalid");
  });
});
