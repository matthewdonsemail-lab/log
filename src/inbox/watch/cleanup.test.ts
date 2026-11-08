import { beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { WATCHER_CODE, clearDeadQueueLocks, coolingDown, inboxContext, localTime, stopStaleWatchers } from "./index.ts";
import { liveLock } from "../../twitter/queue/plan/index.ts";
import { releaseQueueLock, takeQueueLock } from "../../twitter/queue/store/index.ts";

beforeEach(() => {
  process.env.LOG_INBOX_STATE = mkdtempSync(join(tmpdir(), "inbox"));
});

describe("nothing runs stale (rule 108)", () => {
  test("a watcher started before the newest code is stopped, a fresh one is left", () => {
    const root = process.env.LOG_INBOX_STATE!;
    for (const account of ["old", "fresh"]) {
      mkdirSync(join(root, "twitter", account), { recursive: true });
      writeFileSync(join(root, "twitter", account, "watch.pid"), account === "old" ? "111" : "222");
    }
    utimesSync(join(root, "twitter", "old", "watch.pid"), new Date(1000), new Date(1000));
    const killed: number[] = [];
    const stopped = stopStaleWatchers("twitter", ["old", "fresh"], Date.now() - 60_000, () => true, (pid) => killed.push(pid));
    expect(stopped).toEqual(["old"]);
    expect(killed).toEqual([111]);
    expect(existsSync(join(root, "twitter", "old", "watch.pid"))).toBe(false);
    expect(existsSync(join(root, "twitter", "fresh", "watch.pid"))).toBe(true);
  });

  test("an account in its governor cool-off gets no watcher restarts until it ends", () => {
    const root = mkdtempSync(join(tmpdir(), "state"));
    mkdirSync(join(root, "acct"), { recursive: true });
    writeFileSync(join(root, "acct", "governor_state.json"), JSON.stringify({ cooldown_until: Date.now() / 1000 + 600 }));
    expect(coolingDown(root, "acct")).toBe(true);
    expect(coolingDown(root, "acct", new Date(Date.now() + 700_000))).toBe(false);
    expect(coolingDown(root, "nobody")).toBe(false);
  });

  test("an account whose governor spent its daily cap gets no watcher restarts until its next local day", () => {
    const root = mkdtempSync(join(tmpdir(), "state"));
    mkdirSync(join(root, "acct"), { recursive: true });
    const now = new Date(2026, 10, 2, 13, 50);
    writeFileSync(join(root, "acct", "governor_state.json"), JSON.stringify({ day: "2026-11-02", day_count: 500 }));
    expect(coolingDown(root, "acct", now, 500)).toBe(true);
    expect(coolingDown(root, "acct", new Date(2026, 10, 3, 8, 0), 500)).toBe(false);
    writeFileSync(join(root, "acct", "governor_state.json"), JSON.stringify({ day: "2026-11-02", day_count: 499 }));
    expect(coolingDown(root, "acct", now, 500)).toBe(false);
  });

  test("a queue lock whose run died is cleared, a live one is kept", () => {
    const dir = mkdtempSync(join(tmpdir(), "queues"));
    takeQueueLock(join(dir, "dead.json"), 24444, () => false);
    takeQueueLock(join(dir, "live.json"), 555, () => false);
    const cleared = clearDeadQueueLocks(dir, (pid) => pid === 555 || pid === process.pid);
    expect(cleared.some((name) => name.endsWith("/dead"))).toBe(true);
    expect(liveLock(join(dir, "live.json"), (pid) => pid === 555)).toBe(true);
  });

  test("queue run, add and nudge take over a dead run's lock", () => {
    const dir = mkdtempSync(join(tmpdir(), "queue"));
    const queue = join(dir, "q.json");
    takeQueueLock(queue, 24444, () => false);
    expect(liveLock(queue, () => false)).toBe(false);
    expect(takeQueueLock(queue, process.pid, () => false)).toEqual({ ok: true });
    expect(liveLock(queue)).toBe(true);
    expect(takeQueueLock(queue, 31337, (pid) => pid === process.pid)).toEqual({ ok: false, holder: process.pid });
    releaseQueueLock(queue, process.pid);
    expect(liveLock(queue)).toBe(false);
  });

  test("a new message says reply straight away when it fits, and the time is matt's own clock", () => {
    const text = inboxContext([{ platform: "twitter", account: "acct", conversationId: "1:2", with: "sam", text: "nice one", at: "2026-11-01T16:08:00Z", box: "xchat", seenAt: "2026-11-01T16:08:05Z" }])!;
    expect(text).toContain("Send it straight away when it answers what they said");
    expect(text).not.toContain("send only when he says");
    expect(text).toContain(localTime("2026-11-01T16:08:00Z"));
    expect(text).not.toContain(" UTC:");
  });
});

describe("each platform's watcher restarts only on its own code", () => {
  test("Reddit's engine never restarts the X, Discord, Slack or Instagram watcher", () => {
    for (const dirs of Object.values(WATCHER_CODE)) {
      expect(dirs.some((d) => d.includes("redditApi"))).toBe(false);
      expect(dirs).not.toContain("python");
    }
    expect(Object.keys(WATCHER_CODE).sort()).toEqual(["discord", "instagram", "slack", "twitter"]);
  });
});
