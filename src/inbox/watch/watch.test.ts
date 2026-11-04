import { beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { addPending, claimPoll, claimWatcher, ensureLiveWatchers, hookReaderOf, inboxContext, localTime, newMessages, pollReaders, releasePoll, releaseWatcher, storedInboxContext, storedWaiting, takeAlerts, takePending, watchHolder } from "./index.ts";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import type { InboxReader, InboxThread } from "./index.ts";

const thread = (id: string, who: string, at: string, fromMe: boolean, box = "inbox", text: string | null = "hey"): InboxThread => ({ conversationId: id, with: who, lastAt: at, lastFromMe: fromMe, lastText: text, box });

beforeEach(() => {
  process.env.LOG_INBOX_STATE = mkdtempSync(join(tmpdir(), "inbox"));
  delete process.env.LOG_INBOX_POLL;
});

describe("one watcher per account, never two (rule 131)", () => {
  test("the first watcher takes the account and a second one is refused loudly while the first lives", () => {
    const alive = (pid: number) => pid === 111 || pid === 222;
    expect(claimWatcher("twitter", "matthewsoldit", 111, alive)).toEqual({ ok: true });
    expect(watchHolder("twitter", "matthewsoldit", alive)).toBe(111);
    expect(claimWatcher("twitter", "matthewsoldit", 222, alive)).toEqual({ ok: false, holder: 111 });
    const alerts = takeAlerts("sessionA");
    expect(alerts.join("\n")).toContain("DUPLICATEWATCHER twitter matthewsoldit");
    expect(alerts.join("\n")).toContain("pid 222");
  });

  test("a dead holder's lock is taken over, and only the holder can release it", () => {
    expect(claimWatcher("discord", "acct", 111, () => false)).toEqual({ ok: true });
    expect(claimWatcher("discord", "acct", 333, (pid) => pid === 333)).toEqual({ ok: true });
    releaseWatcher("discord", "acct", 111);
    expect(watchHolder("discord", "acct", (pid) => pid === 333)).toBe(333);
    releaseWatcher("discord", "acct", 333);
    expect(watchHolder("discord", "acct", () => true)).toBe(0);
  });

  test("the hook never starts a second watcher while one holds the account", () => {
    const alive = (pid: number) => pid === 111;
    expect(claimWatcher("slack", "mattSlack", 111, alive)).toEqual({ ok: true });
    rmSync(join(process.env.LOG_INBOX_STATE!, "slack", "mattSlack", "watch.pid"), { force: true });
    let started = 0;
    expect(ensureLiveWatchers("slack", ["mattSlack"], () => ++started, alive)).toEqual([]);
    expect(started).toBe(0);
  });
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

  test("each session and each subagent gets every new message once, so a subagent never takes the session's", () => {
    const main = hookReaderOf(JSON.stringify({ session_id: "s1" }));
    const sub = hookReaderOf(JSON.stringify({ session_id: "s1", agent_id: "a9" }));
    expect(main).toBe("s1");
    expect(sub).toBe("s1_a9");
    expect(takePending(main)).toEqual([]);
    expect(takePending(sub)).toEqual([]);
    addPending([{ platform: "twitter", account: "acct", conversationId: "c", with: "nefer", text: "what up G", at: "2026-11-02T18:57:46Z", box: "xchat", seenAt: "2026-11-02T18:57:48Z" }]);
    expect(takePending(sub).map((m) => m.with)).toEqual(["nefer"]);
    expect(takePending(main).map((m) => m.with)).toEqual(["nefer"]);
    expect(takePending(main)).toEqual([]);
    expect(takePending(sub)).toEqual([]);
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
    expect(text).toContain("`discordSendLive` { account: \"sourcedandsoldtothehighestbidder\", channel: \"<channel>\"");
  });

  test("a Slack message pushed by the workspace's websocket is told with the Slack steps", () => {
    addPending([{ platform: "slack", account: "mattSlack", conversationId: "D0EXAMPLE01", with: "Sam", text: "yo hows it going", at: "2026-11-03T07:00:00Z", box: "dm", seenAt: "2026-11-03T07:00:01Z", workspace: "acme" }]);
    const text = inboxContext(takePending())!;
    expect(text).toContain(">>> NEW SLACK MESSAGE (1)");
    expect(text).toContain("Sam on slack mattSlack in acme (DM)");
    expect(text).toContain("(chat D0EXAMPLE01)");
    expect(text).toContain("`slackSendLive` { account: \"mattSlack\"");
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
    expect(found.waiting.map((w) => [w.with, w.text])).toEqual([["@eight", "(not loaded yet: twitterDms with their handle opens it)"], ["@seven", "sounds good"]]);
    const text = storedInboxContext(["acct", "nobody"], root)!;
    expect(text).toContain(`synced ${localTime("2026-10-30T03:50:00Z")}`);
    expect(text).toContain(`@seven at ${localTime("2026-10-30T01:00:00Z")}: "sounds good"`);
    expect(text).not.toContain("9:100");
    expect(storedInboxContext(["nobody"], root)).toBeNull();
  });
});


describe("an inbox watcher for an account gone from Twenty", () => {
  test("is not started again once its own log ends on accountNotFound", () => {
    const root = process.env.LOG_INBOX_STATE as string;
    mkdirSync(join(root, "discord", "gone"), { recursive: true });
    writeFileSync(join(root, "discord", "gone", "watch.log"), "log discord watch: accountNotFound: No socialAccount with that accountName or id in Twenty.\nlog facebook accounts lists the Facebook accounts.\n");
    const started: string[] = [];
    const out = ensureLiveWatchers("discord", ["gone", "live"], (account) => (started.push(account), 4242), () => false);
    expect(started).toEqual(["live"]);
    expect(out).toEqual(["live"]);
  });
});
