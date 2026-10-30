import { beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { addPending, claimPoll, inboxContext, newMessages, pollReaders, releasePoll, storedInboxContext, storedWaiting, takePending } from "./index.ts";
import { mkdirSync, writeFileSync } from "node:fs";
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
  test("a Discord message pushed by the gateway is told with the Discord steps, beside X's", () => {
    addPending([{ platform: "discord", account: "sourcedandsoldtothehighestbidder", conversationId: "1316963626611118161", with: "VIBE BOT", text: "look beyond x", at: "2026-10-28T08:48:50Z", box: "reply", seenAt: "2026-10-28T08:48:51Z" }]);
    addPending([{ platform: "twitter", account: "matthewsoldit", conversationId: "1-2", with: "alice", text: "hey", at: "2026-10-28T08:49:00Z", box: "xchat", seenAt: "2026-10-28T08:49:01Z" }]);
    const text = inboxContext(takePending())!;
    expect(text).toContain(">>> NEW MESSAGE (1)");
    expect(text).toContain(">>> NEW DISCORD MESSAGE (1)");
    expect(text).toContain("VIBE BOT on discord sourcedandsoldtothehighestbidder (replied to you in a server channel)");
    expect(text).toContain("log discord send --account sourcedandsoldtothehighestbidder --channel <channel>");
  });
});

describe("who is waiting, read from the local inbox store with no network", () => {
  test("lists the conversations where they wrote last, newest first, and says when the store was synced", () => {
    const root = mkdtempSync(join(tmpdir(), "store"));
    mkdirSync(join(root, "acct"), { recursive: true });
    writeFileSync(join(root, "acct", "inboxSync.json"), JSON.stringify({
      version: 1, maxSequenceId: "9", syncedAt: "2026-10-30T03:50:00Z", userId: "100",
      xchat: {
        "7:100": { participants: ["7"], handles: { "7": "seven" }, lastMs: Date.parse("2026-10-30T01:00:00Z"), lastSender: "7", messages: [{ time_ms: Date.parse("2026-10-30T01:00:00Z"), text: "sounds good" }] },
        "8:100": { participants: ["8"], handles: { "8": "eight" }, lastMs: Date.parse("2026-10-30T02:00:00Z"), lastSender: "8", messages: [{ time_ms: Date.parse("2026-10-30T02:00:00Z"), text: null }] },
        "9:100": { participants: ["9"], handles: {}, lastMs: Date.parse("2026-10-30T03:00:00Z"), lastSender: "100", messages: [] },
      },
      legacy: { conversations: {}, users: {}, messages: [], boxes: {} },
    }));
    const found = storedWaiting("acct", root);
    expect(found.total).toBe(2);
    expect(found.waiting.map((w) => [w.with, w.text])).toEqual([["@eight", "(could not decrypt)"], ["@seven", "sounds good"]]);
    const text = storedInboxContext(["acct", "nobody"], root)!;
    expect(text).toContain("synced 2026-10-30 03:50 UTC");
    expect(text).toContain('@seven at 2026-10-30 01:00 UTC: "sounds good"');
    expect(text).not.toContain("9:100");
    expect(storedInboxContext(["nobody"], root)).toBeNull();
  });
});

