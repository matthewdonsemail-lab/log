import { beforeEach, describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { clearDeadQueueLocks, inboxContext, localTime, stopStaleWatchers } from "./index.ts";
import { clearDeadLock, liveLock } from "../../twitter/queue/plan/index.ts";

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

  test("a queue lock whose run died is cleared, a live one is kept", () => {
    const dir = mkdtempSync(join(tmpdir(), "queues"));
    writeFileSync(join(dir, "dead.lock"), "24444");
    writeFileSync(join(dir, "live.lock"), "555");
    expect(clearDeadQueueLocks(dir, (pid) => pid === 555)).toEqual(["dead.lock"]);
    expect(existsSync(join(dir, "live.lock"))).toBe(true);
  });

  test("queue run, add and nudge take over a dead run's lock", () => {
    const dir = mkdtempSync(join(tmpdir(), "queue"));
    const queue = join(dir, "q.json");
    writeFileSync(join(dir, "q.lock"), "24444");
    expect(liveLock(queue, () => false)).toBe(false);
    writeFileSync(join(dir, "q.lock"), String(process.pid));
    expect(liveLock(queue)).toBe(true);
    expect(clearDeadLock(join(dir, "q.lock"))).toBe(false);
  });

  test("a new message says reply straight away when it fits, and the time is matt's own clock", () => {
    const text = inboxContext([{ platform: "twitter", account: "acct", conversationId: "1:2", with: "sam", text: "nice one", at: "2026-11-01T16:08:00Z", box: "xchat", seenAt: "2026-11-01T16:08:05Z" }])!;
    expect(text).toContain("Send it straight away when it answers what they said");
    expect(text).not.toContain("send only when he says");
    expect(text).toContain(localTime("2026-11-01T16:08:00Z"));
    expect(text).not.toContain(" UTC:");
  });
});
