import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { countByKind, engagersOf, postIdOf, queryNotifications } from "./index.ts";
import type { NotificationStore, TwitterNotification } from "./index.ts";

const python = join(import.meta.dir, "..", "..", "..", "..", "python");

const SCRIPT = String.raw`
import asyncio, json, os, sys
sys.path.insert(0, os.path.join(os.getcwd(), "twitterApi"))
import engine
from twikit.notification import parse_notifications_page
from twikit.errors import TooManyRequests
from twitterApi import notifications as feed

ME = "100"

def users(*ids):
    return {i: {"id_str": i, "screen_name": f"user{i}", "name": f"User {i}", "followers_count": int(i), "followed_by": i == "2", "following": False} for i in ids}

def tweets():
    return {
        "900": {"id_str": "900", "user_id_str": ME, "full_text": "we got into YC"},
        "901": {"id_str": "901", "user_id_str": ME, "full_text": "the video"},
        "950": {"id_str": "950", "user_id_str": "4", "full_text": "congrats mate", "in_reply_to_status_id_str": "900", "in_reply_to_user_id_str": ME},
        "951": {"id_str": "951", "user_id_str": "5", "full_text": "watch this", "quoted_status_id_str": "901"},
        "952": {"id_str": "952", "user_id_str": "7", "full_text": "@xtwo hey"},
    }

def note(nid, icon, from_ids, target=None, ms=1761998400000):
    return {"id": nid, "timestampMs": str(ms), "icon": {"id": icon}, "message": {"text": f"{icon} note"}, "template": {"aggregateUserActionsV1": {"targetObjects": [{"tweet": {"id": target}}] if target else [], "fromUsers": [{"user": {"id": i}} for i in from_ids]}}}

def raw(notes, tweet_ids, bottom):
    entries = [{"entryId": "cursor-top-1", "content": {"operation": {"cursor": {"value": "top", "cursorType": "Top"}}}}]
    entries += [{"entryId": f"notification-{n['id']}", "sortIndex": n["timestampMs"], "content": {"item": {"content": {"notification": {"id": n["id"]}}}}} for n in notes]
    entries += [{"entryId": f"tweet-{t}", "sortIndex": "1761998500000", "content": {"item": {"content": {"tweet": {"id": t}}}}} for t in tweet_ids]
    if bottom:
        entries.append({"entryId": "cursor-bottom-1", "content": {"operation": {"cursor": {"value": bottom, "cursorType": "Bottom"}}}})
    return {"globalObjects": {"users": users("2", "3", "4", "5", "6", "7", ME), "tweets": tweets(), "notifications": {n["id"]: n for n in notes}}, "timeline": {"instructions": [{"addEntries": {"entries": entries}}]}}

PAGES = {
    None: raw([note("n1", "heart_icon", ["2", "3"], "900"), note("n2", "person_icon", ["6"])], [], "b1"),
    "b1": raw([], ["950", "951", "952"], "b2"),
    "b2": raw([note("n3", "retweet_icon", ["6", ME], "901", 1761900000000)], [], "b3"),
    "b3": raw([], [], None),
}

calls = []

class FakeClient:
    def __init__(self, fail_on="never"):
        self.fail_on = fail_on
    async def get_notifications_page(self, type, count, cursor):
        calls.append(cursor)
        if cursor == self.fail_on:
            raise TooManyRequests("429")
        return parse_notifications_page(PAGES[cursor])

class FakeGovernor:
    paced = 0
    def before_request(self, is_mutation=False, quiet=False):
        FakeGovernor.paced += 1

async def no_sleep(_):
    return None

engine.asyncio.sleep = no_sleep
cookies = {"twid": "u%3D100"}
out = {"parsed": parse_notifications_page(PAGES[None])}

async def main():
    spec = {"account": "xTwo", "screenName": "xtwo", "pages": 2}
    out["first"] = await engine.notifications(FakeClient(), cookies, spec, FakeGovernor())
    out["firstCalls"] = list(calls); calls.clear()
    out["paced"] = FakeGovernor.paced
    out["again"] = await engine.notifications(FakeClient(), cookies, {"account": "xTwo", "screenName": "xtwo"}, FakeGovernor())
    out["againCalls"] = list(calls); calls.clear()
    out["full"] = await engine.notifications(FakeClient(), cookies, {"account": "xTwo", "screenName": "xtwo", "full": True}, FakeGovernor())
    out["fullCalls"] = list(calls); calls.clear()
    out["store"] = feed.read_store(engine.notifications_path("xTwo"))
    out["throttled"] = await engine.notifications(FakeClient(fail_on="b1"), cookies, {"account": "fresh", "screenName": "xtwo"}, FakeGovernor())

asyncio.run(main())
print(json.dumps(out, default=str))
`;

describe("log twitter notifications reads X's notifications whole and keeps them, new first, then back through the history", () => {
  const state = mkdtempSync(join(tmpdir(), "notifications"));
  const run = spawnSync(process.env.LOG_PYTHON || "python", ["-c", SCRIPT], { cwd: python, encoding: "utf8", env: { ...process.env, LOG_TWITTER_STATE: state } });
  const out = JSON.parse(run.stdout.trim().split("\n").pop() || "{}");

  test("a page keeps every person behind an aggregated notification and both cursors", () => {
    expect(run.status).toBe(0);
    expect(out.parsed.notifications[0]).toMatchObject({ kind: "like", users: [{ user_id: "2" }, { user_id: "3" }], targets: [{ id: "900", text: "we got into YC" }] });
    expect(out.parsed.notifications[1]).toMatchObject({ kind: "follow", targets: [] });
    expect([out.parsed.cursor_top, out.parsed.cursor_bottom]).toEqual(["top", "b1"]);
  });

  test("the first read takes the newest pages up to --pages, one governor check between pages, and keeps one row per person per thing", () => {
    expect(out.firstCalls).toEqual([null, "b1"]);
    expect(out.paced).toBe(1);
    expect(out.first.notificationSync).toMatchObject({ mode: "first", pages: 2, newRows: 6, total: 6, historyDone: false, stoppedBy: "newestCap" });
    const rows = Object.values(out.store.rows) as TwitterNotification[];
    expect(rows.find((r) => r.key === "like:2:900")).toMatchObject({ handle: "user2", followsYou: true, postUrl: "https://x.com/xtwo/status/900", postText: "we got into YC" });
    expect(rows.find((r) => r.kind === "reply")).toMatchObject({ userId: "4", postId: "900", tweetId: "950", text: "congrats mate", tweetUrl: "https://x.com/user4/status/950" });
    expect(rows.find((r) => r.kind === "quote")).toMatchObject({ userId: "5", postId: "901" });
    expect(rows.find((r) => r.kind === "mention")).toMatchObject({ userId: "7", postId: null });
    expect(rows.find((r) => r.kind === "follow")).toMatchObject({ userId: "6", postId: null });
  });

  test("a read with nothing new stops at the first page it already holds", () => {
    expect(out.againCalls).toEqual([null]);
    expect(out.again.notificationSync).toMatchObject({ mode: "newest", pages: 1, newRows: 0, stoppedBy: "caughtUp" });
  });

  test("--full goes on from where the first read stopped to the end of what X gives, and never keeps the account's own action", () => {
    expect(out.fullCalls).toEqual([null, "b2", "b3"]);
    expect(out.full.notificationSync).toMatchObject({ mode: "full", newRows: 1, total: 7, historyDone: true, stoppedBy: "historyDone" });
    expect(out.store.rows["repost:6:901"]).toMatchObject({ at: "2025-10-31T08:40:00Z" });
    expect(out.store.rows["repost:100:901"]).toBeUndefined();
  });

  test("a 429 stops the read there and keeps what came before it", () => {
    expect(out.throttled).toMatchObject({ ok: false, code: "rateLimited", event: "throttled" });
    expect(out.throttled.detail).toContain("3 rows are kept");
  });
});

const ROWS: TwitterNotification[] = [
  { key: "like:2:900", kind: "like", at: "2026-11-01T10:00:00Z", userId: "2", handle: "a", postId: "900" },
  { key: "like:3:900", kind: "like", at: "2026-10-30T10:00:00Z", userId: "3", handle: "b", postId: "900" },
  { key: "repost:2:901", kind: "repost", at: "2026-11-01T11:00:00Z", userId: "2", handle: "a", postId: "901" },
  { key: "follow:4:n", kind: "follow", at: "2026-11-01T12:00:00Z", userId: "4", handle: "c", postId: null },
];
const STORE: NotificationStore = { version: 1, userId: "100", bottomCursor: null, historyDone: true, syncedAt: null, rows: Object.fromEntries(ROWS.map((r) => [r.key, r])) };

describe("querying the kept notifications", () => {
  test("filters by kind, date and post, newest first", () => {
    expect(queryNotifications(STORE, { kinds: ["like"] }).map((r) => r.key)).toEqual(["like:2:900", "like:3:900"]);
    expect(queryNotifications(STORE, { kinds: ["like", "repost", "follow"], since: "2026-11-01" }).map((r) => r.key)).toEqual(["follow:4:n", "repost:2:901", "like:2:900"]);
    expect(queryNotifications(STORE, { kinds: ["like", "repost"], postId: "901" }).map((r) => r.key)).toEqual(["repost:2:901"]);
    expect(queryNotifications(null, { kinds: ["like"] })).toEqual([]);
  });

  test("counts by kind and ranks the people who engaged most", () => {
    expect(countByKind(ROWS)).toEqual({ like: 2, repost: 1, follow: 1 });
    expect(engagersOf(ROWS)[0]).toMatchObject({ userId: "2", kinds: { like: 1, repost: 1 }, lastAt: "2026-11-01T11:00:00Z" });
  });

  test("a post is its id or its url", () => {
    expect(postIdOf("https://x.com/matthewsoldit/status/2116868115028120050")).toBe("2116868115028120050");
    expect(postIdOf("2116868115028120050")).toBe("2116868115028120050");
    expect(postIdOf("not a post")).toBeNull();
  });
});
