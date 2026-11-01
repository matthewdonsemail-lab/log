import { describe, expect, test } from "bun:test";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { TwitterEngineRun, TwitterEngineSpec, TwitterSessionAnswer } from "../../twitter/account/session/index.ts";
import { notificationStorePath } from "../../twitter/notification/feed/index.ts";
import type { NotificationStore, TwitterNotification } from "../../twitter/notification/feed/index.ts";
import { runCli } from "../runner/index.ts";

const ROWS: TwitterNotification[] = [
  { key: "like:2:900", kind: "like", at: "2026-11-01T10:00:00Z", userId: "2", handle: "alice", followsYou: true, postId: "900", postText: "we got into YC", postUrl: "https://x.com/xTwo/status/900" },
  { key: "like:3:901", kind: "like", at: "2026-10-20T10:00:00Z", userId: "3", handle: "bob", postId: "901", postUrl: "https://x.com/xTwo/status/901" },
  { key: "reply:950", kind: "reply", at: "2026-11-01T11:00:00Z", userId: "4", handle: "carol", postId: "900", tweetId: "950", tweetUrl: "https://x.com/carol/status/950", text: "congrats mate" },
  { key: "follow:5:n9", kind: "follow", at: "2026-11-01T12:00:00Z", userId: "5", handle: "dave", postId: null },
];

function harness(script: (spec: TwitterEngineSpec) => TwitterSessionAnswer) {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push({ id: "xTwo", accountName: "xTwo", platform: "TWITTER", cookies: { auth_token: "a".repeat(40), ct0: "b".repeat(40) }, proxy: null });
  const storePath = notificationStorePath("xTwo");
  mkdirSync(dirname(storePath), { recursive: true });
  const store: NotificationStore = { version: 1, userId: "100", bottomCursor: "b2", historyDone: false, syncedAt: "2026-11-01T13:00:00Z", rows: Object.fromEntries(ROWS.map((r) => [r.key, r])) };
  writeFileSync(storePath, JSON.stringify(store));
  const calls: TwitterEngineSpec[] = [];
  const out: string[] = [];
  const err: string[] = [];
  const run = async (argv: string[]) => {
    out.length = 0;
    err.length = 0;
    const code = await runCli(argv, {
      twenty,
      out: (l) => out.push(l),
      err: (l) => err.push(l),
      now: () => new Date("2026-11-01T14:00:00Z"),
      directTwitter: (_account, spec): TwitterEngineRun => {
        calls.push(spec);
        return { answer: { loginState: "loggedIn", storePath, ...script(spec) }, refreshed: null };
      },
    });
    return { code, out: out.join("\n"), err: err.join("\n") };
  };
  return { run, calls, storePath };
}

const SYNCED: TwitterSessionAnswer = { ok: true, notificationSync: { mode: "newest", pages: 1, newRows: 2, total: 4, historyDone: false, stoppedBy: "caughtUp", syncedAt: "2026-11-01T13:00:00Z" } };

describe("log twitter notifications", () => {
  test("reads what is new once on the direct-API engine, sends nothing, and shows everyone newest first", async () => {
    const h = harness(() => SYNCED);
    const r = await h.run(["twitter", "notifications", "--account", "xTwo"]);
    expect(r.code).toBe(0);
    expect(h.calls).toEqual([{ action: "notifications", screenName: "xTwo" }]);
    expect(r.out).toContain("1 page read (newest), 2 new, 4 kept");
    expect(r.out).toContain("4 notifications: 2 like, 1 reply, 1 follow");
    expect(r.out.indexOf("@dave")).toBeLessThan(r.out.indexOf("@alice"));
    expect(r.out).toContain('like · @alice (follows you) on "we got into YC" https://x.com/xTwo/status/900');
    expect(r.out).toContain('"congrats mate" https://x.com/carol/status/950');
  });

  test("--full and --pages go to the engine; --type, --since and --post narrow what is shown", async () => {
    const h = harness(() => SYNCED);
    const r = await h.run(["twitter", "notifications", "--account", "xTwo", "--full", "--pages", "40", "--type", "likes", "--since", "2026-10-25", "--json"]);
    expect(h.calls).toEqual([{ action: "notifications", screenName: "xTwo", full: true, pages: 40 }]);
    const answer = JSON.parse(r.out);
    expect(answer.rows.map((x: TwitterNotification) => x.handle)).toEqual(["alice"]);
    expect(answer.counts).toEqual({ like: 1 });
    expect(answer.kept).toMatchObject({ total: 4, historyDone: false });
    const onPost = JSON.parse((await h.run(["twitter", "notifications", "--account", "xTwo", "--stored", "--post", "https://x.com/xTwo/status/900", "--json"])).out);
    expect(onPost.rows.map((x: TwitterNotification) => x.key)).toEqual(["reply:950", "like:2:900"]);
    expect(onPost.engagers.map((e: { handle: string }) => e.handle)).toEqual(["carol", "alice"]);
  });

  test("--stored answers from what is kept and calls nothing", async () => {
    const h = harness(() => ({ ok: false, code: "notExpected" }));
    const r = await h.run(["twitter", "notifications", "--account", "xTwo", "--stored", "--type", "follows"]);
    expect(r.code).toBe(0);
    expect(h.calls).toEqual([]);
    expect(r.out).toContain("from what is kept (nothing called)");
    expect(r.out).toContain("1 follows: 1 follow");
  });

  test("a 429 is said and what was kept is still shown", async () => {
    const h = harness(() => ({ ok: false, code: "rateLimited", event: "throttled", detail: "X answered 429 to a notifications page" }));
    const r = await h.run(["twitter", "notifications", "--account", "xTwo"]);
    expect(r.code).toBe(1);
    expect(r.out).toContain("rateLimited (loggedIn): X answered 429");
    expect(r.out).toContain("4 notifications");
  });

  test("a flag it doesn't read is refused before X is called", async () => {
    const h = harness(() => SYNCED);
    expect((await h.run(["twitter", "notifications", "--account", "xTwo", "--type", "bookmarks"])).err).toContain("notificationQueryInvalid");
    expect((await h.run(["twitter", "notifications", "--account", "xTwo", "--since", "yesterdayish"])).err).toContain("notificationQueryInvalid");
    expect((await h.run(["twitter", "notifications", "--account", "xTwo", "--post", "nope"])).err).toContain("notificationQueryInvalid");
    expect((await h.run(["twitter", "notifications", "--account", "xTwo", "--pages", "0"])).err).toContain("notificationQueryInvalid");
    expect((await h.run(["twitter", "notifications", "--account", "xTwo", "--limit", "0"])).err).toContain("limitInvalid");
    expect(h.calls).toEqual([]);
  });
});
