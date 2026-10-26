import { beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { claimPoll, inboxContext, newMessages, pollReaders, releasePoll, takePending } from "./index.ts";
import type { InboxReader, InboxThread } from "./index.ts";

const thread = (id: string, who: string, at: string, fromMe: boolean, box = "inbox", text: string | null = "hey"): InboxThread => ({ conversationId: id, with: who, lastAt: at, lastFromMe: fromMe, lastText: text, box });

beforeEach(() => {
  process.env.LOG_INBOX_STATE = mkdtempSync(join(tmpdir(), "inbox"));
  delete process.env.LOG_INBOX_POLL;
});

describe("inbox watch", () => {
  test("only a thread whose newest message is theirs and newer than last look is new", () => {
    const now = new Date("2026-10-26T05:00:00Z");
    const seen = { a: "2026-10-26T01:00:00Z", b: "2026-10-26T01:00:00Z" };
    const { messages, seen: next } = newMessages("twitter", "acct", [thread("a", "alice", "2026-10-26T02:00:00Z", false), thread("b", "bob", "2026-10-26T01:00:00Z", false), thread("c", "carol", "2026-10-26T02:30:00Z", true)], seen, now);
    expect(messages.map((m) => m.with)).toEqual(["alice"]);
    expect(next.c).toBe("2026-10-26T02:30:00Z");
  });

  test("an X Chat reply with encrypted text still surfaces, labelled", () => {
    let threads = [thread("x1", "shwetasd19", "2026-10-26T03:00:00Z", true, "xchat", null)];
    const reader: InboxReader = { platform: "twitter", accounts: () => ["acct"], read: () => threads };
    expect(pollReaders([reader])).toEqual([]);
    threads = [thread("x1", "shwetasd19", "2026-10-26T04:12:00Z", false, "xchat", null)];
    const found = pollReaders([reader]);
    expect(found.map((m) => m.with)).toEqual(["shwetasd19"]);
    const text = inboxContext(takePending());
    expect(text).toContain("(X Chat)");
    expect(text).toContain("@shwetasd19");
  });

  test("the first look learns what's there; the next says what arrived, once", () => {
    let threads = [thread("a", "alice", "2026-10-26T01:00:00Z", false)];
    const reader: InboxReader = { platform: "twitter", accounts: () => ["acct"], read: () => threads };
    expect(pollReaders([reader])).toEqual([]);
    threads = [thread("a", "alice", "2026-10-26T02:00:00Z", false, "inbox", "sounds good")];
    expect(pollReaders([reader]).map((m) => m.with)).toEqual(["alice"]);
    expect(takePending().map((m) => m.with)).toEqual(["alice"]);
    expect(takePending()).toEqual([]);
  });

  test("a poll is claimed at most once per gap, never while one runs, never when off", () => {
    const t0 = new Date("2026-10-26T05:00:00Z");
    expect(claimPoll(t0, () => 0)).toBe(true);
    releasePoll();
    expect(claimPoll(new Date(t0.getTime() + 3 * 60_000), () => 0)).toBe(false);
    expect(claimPoll(new Date(t0.getTime() + 5 * 60_000), () => 1)).toBe(true);
    releasePoll();
    process.env.LOG_INBOX_POLL = "off";
    expect(claimPoll(new Date(t0.getTime() + 60 * 60_000))).toBe(false);
  });
});
