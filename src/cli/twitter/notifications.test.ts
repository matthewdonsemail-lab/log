import { describe, expect, test } from "bun:test";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
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

function unrolled(storePath: string, spec: TwitterEngineSpec, userIds: string[]): TwitterSessionAnswer {
  const store = JSON.parse(readFileSync(storePath, "utf8")) as NotificationStore;
  const kind = spec.kind!;
  let newRows = 0;
  for (const id of userIds) {
    const key = `${kind}:${id}:${spec.postId}`;
    if (store.rows[key]) continue;
    store.rows[key] = { key, kind, at: null, userId: id, handle: `user${id}`, postId: spec.postId!, postUrl: `https://x.com/xTwo/status/${spec.postId}`, source: "engagements" };
    newRows += 1;
  }
  store.engagements = { ...store.engagements, [spec.postId!]: { ...store.engagements?.[spec.postId!], [kind]: { cursor: null, done: true, pages: 1, seen: userIds.length, added: newRows, syncedAt: "2026-11-01T13:30:00Z" } } };
  writeFileSync(storePath, JSON.stringify(store));
  return { ok: true, postId: spec.postId, kind, engagerSync: { postId: spec.postId!, kind, pages: 1, newRows, resumed: false, done: true, stoppedBy: "end", counts: { fromNotifications: 0, addedByUnroll: newRows, total: newRows }, syncedAt: "2026-11-01T13:30:00Z" } };
}

describe("log twitter notifications unrolls a post's likers and reposters", () => {
  test("--post reads the feed, then that post's likers and reposters, and says per post what came from notifications and what unrolling added", async () => {
    const h = harness((spec) => (spec.action === "notifications" ? SYNCED : unrolled(h.storePath, spec, spec.kind === "like" ? ["2", "8", "9"] : ["6"])));
    const r = await h.run(["twitter", "notifications", "--account", "xTwo", "--post", "900", "--type", "likes"]);
    expect(r.code).toBe(0);
    expect(h.calls).toEqual([
      { action: "notifications", screenName: "xTwo" },
      { action: "postEngagers", screenName: "xTwo", postId: "900", kind: "like", pages: 5 },
      { action: "postEngagers", screenName: "xTwo", postId: "900", kind: "repost", pages: 5 },
    ]);
    expect(r.out).toContain("3 likes on post 900: 3 like");
    expect(r.out).toContain("  post 900: likers 1 from notifications + 2 added by unrolling = 3 (read to the end); reposters 0 from notifications + 1 added by unrolling = 1 (read to the end)");
    expect(r.out).not.toContain("stopped before the end");
    expect(r.out).toContain("unknown time · like · @user8");
    expect(r.err).toContain("post 900 likers: 1 page read, 2 added, read to the end");
    const kept = JSON.parse((await h.run(["twitter", "notifications", "--account", "xTwo", "--stored", "--post", "900", "--type", "likes", "--json"])).out);
    expect(kept.engagerPosts).toMatchObject([{ postId: "900", likes: { fromNotifications: 1, addedByUnroll: 2, total: 3, state: "readToTheEnd" } }]);
    expect(kept.rows.filter((x: TwitterNotification) => x.userId === "2")).toHaveLength(1);
    expect(h.calls).toHaveLength(3);
  });

  test("a 429 on the reposters stops the run, says so plainly, exits 1 and still shows what the likers read kept; --json carries the same", async () => {
    const script = (h: ReturnType<typeof harness>) => (spec: TwitterEngineSpec): TwitterSessionAnswer =>
      spec.action === "notifications" ? SYNCED : spec.kind === "like" ? unrolled(h.storePath, spec, ["8"]) : { ok: false, code: "rateLimited", event: "throttled", detail: "X answered 429 to a page of the reposters of post 900", postId: "900", kind: "repost" };
    const h: ReturnType<typeof harness> = harness((spec) => script(h)(spec));
    const r = await h.run(["twitter", "notifications", "--account", "xTwo", "--post", "900"]);
    expect(r.code).toBe(1);
    expect(h.calls.map((c) => c.kind ?? c.action)).toEqual(["notifications", "like", "repost"]);
    expect(r.out).toContain("rateLimited (loggedIn): X answered 429 to a page of the reposters");
    expect(r.out).toContain("likers 1 from notifications + 1 added by unrolling = 2 (read to the end); reposters 0 from notifications + 0 added by unrolling = 0 (not unrolled)");
    expect(r.out).toContain("the unroll stopped before the end at post 900: rateLimited: X answered 429");
    const answer = JSON.parse((await h.run(["twitter", "notifications", "--account", "xTwo", "--post", "900", "--json"])).out);
    expect(answer).toMatchObject({ ok: false, code: "rateLimited", notificationSync: { mode: "newest" }, unroll: { state: "stopped", stoppedBeforeTheEnd: true, stop: { stage: "reposters", code: "rateLimited", postId: "900" }, posts: [{ postId: "900", likes: { total: 2, state: "readToTheEnd" }, reposts: { state: "notUnrolled" } }] } });
  });

  test("--full unrolls each of the account's posts with an aggregated like, and --stored --post says a post is not unrolled yet", async () => {
    const h = harness((spec) => (spec.action === "notifications" ? SYNCED : unrolled(h.storePath, spec, ["8"])));
    const before = await h.run(["twitter", "notifications", "--account", "xTwo", "--stored", "--post", "900"]);
    expect(before.out).toContain("post 900: likers 1 from notifications + 0 added by unrolling = 1 (not unrolled)");
    const store = JSON.parse(readFileSync(h.storePath, "utf8")) as NotificationStore;
    store.rows["like:2:900"]!.message = "alice and 3 others liked your post";
    writeFileSync(h.storePath, JSON.stringify(store));
    const r = await h.run(["twitter", "notifications", "--account", "xTwo", "--full", "--json"]);
    expect(h.calls).toEqual([{ action: "notifications", screenName: "xTwo", full: true }, { action: "postEngagers", screenName: "xTwo", postId: "900", kind: "like", pages: 5 }]);
    expect(JSON.parse(r.out).unroll).toMatchObject({ state: "done", stoppedBeforeTheEnd: false, pagesRead: 1, posts: [{ postId: "900", likes: { fromNotifications: 1, addedByUnroll: 1, total: 2 } }] });
  });
});
