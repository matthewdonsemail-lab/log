import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { openDatabase } from "../../storage/schema/index.ts";
import { handLines, ownerLabel, readByHand, sentByLogIds } from "./index.ts";

let dir = "";
let path = "";
let handle: Database;
let clock = Date.parse("2026-11-26T17:00:00.000Z");
const deps = { handle: () => handle, now: () => clock };
const iso = (ms: number) => new Date(ms).toISOString();

function chat(platform: string, conversationId: string, name: string): string {
  const chatId = `${platform}:fakeAccount:${conversationId}`;
  handle.prepare("INSERT OR IGNORE INTO chats (chatId, platform, account, conversationId, kind, name) VALUES (?, ?, 'fakeAccount', ?, 'dm', ?)").run(chatId, platform, conversationId, name);
  return chatId;
}

function message(chatId: string, platformMessageId: string, fromOwner: boolean, text: string, receivedMs: number): void {
  handle.prepare("INSERT INTO messages (messageKey, chatId, platformMessageId, senderPlatform, senderUserId, fromOwner, sentAt, text, source, receivedAt) VALUES (?, ?, ?, 'twitter', ?, ?, ?, ?, 'live', ?)").run(`${chatId}:${platformMessageId}`, chatId, platformMessageId, fromOwner ? "1" : "2", fromOwner ? 1 : 0, iso(receivedMs), text, iso(receivedMs));
}

function logSent(platform: string, messageId: string): void {
  handle.prepare("INSERT INTO actions (platform, account, conversationId, kind, detail, at, holder) VALUES (?, 'fakeAccount', 'x', 'partSent', ?, ?, 1)").run(platform, JSON.stringify({ op: "op", part: 0, hash: "h", messageId }), iso(clock));
}

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "byHand"));
  path = join(dir, "log.db");
  handle = openDatabase(path);
});

afterAll(() => {
  handle.close();
  Bun.gc(true);
  rmSync(dir, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
});

describe("what the owner sent himself, outside log", () => {
  test("a new reader starts from now and sees nothing old", () => {
    const c = chat("twitter", "100-200", "grace_ships");
    message(c, "m1", true, "old line by hand", clock - 60_000);
    expect(readByHand("fakeReader", deps)).toEqual({ sends: [], text: null });
  });

  test("a line he typed himself is told once, a line log sent is not, nor what they wrote", () => {
    const c = chat("twitter", "100-200", "grace_ships");
    message(c, "m2", true, "typed on the phone", clock + 1_000);
    message(c, "m3", true, "sent by the queue", clock + 2_000);
    message(c, "m4", false, "their answer", clock + 3_000);
    logSent("twitter", "m3");
    clock += 60_000;
    const read = readByHand("fakeReader", deps);
    expect(read.sends.map((s) => s.text)).toEqual(["typed on the phone"]);
    expect(read.text).toContain("THE OWNER WROTE BY HAND (1)");
    expect(read.text).toContain('to grace_ships (chat 100-200): "typed on the phone"');
    expect(readByHand("fakeReader", deps).sends).toEqual([]);
  });

  test("a line not settled yet waits, so log's own echo isn't called by hand before its send is recorded", () => {
    const c = chat("discord", "300", "linus_k");
    message(c, "d1", true, "just landed", clock - 1_000);
    expect(readByHand("fakeReader", deps).sends).toEqual([]);
    logSent("discord", "d1");
    clock += 60_000;
    expect(readByHand("fakeReader", deps).sends).toEqual([]);
  });

  test("a dm with no stored name is named by the other person's handle, and a line X couldn't decrypt is left out", () => {
    const c = chat("twitter", "1:777", "1:777");
    handle.prepare("UPDATE chats SET name = NULL WHERE chatId = ?").run(c);
    handle.prepare("INSERT INTO identities (platform, userId, handle, firstSeenAt, lastSeenAt) VALUES ('twitter', '777', 'linus_k', ?, ?)").run(iso(clock), iso(clock));
    message(c, "n1", true, "(could not open: no key)", clock + 1_000);
    message(c, "n2", true, "yo whats good", clock + 2_000);
    clock += 60_000;
    const read = readByHand("fakeReader", deps);
    expect(read.sends.map((s) => [s.with, s.text])).toEqual([["linus_k", "yo whats good"]]);
  });

  test("labels and the id set are per platform", () => {
    const ids = sentByLogIds(handle, ["twitter"]);
    expect(ownerLabel(ids, "twitter", "m3")).toBe("the owner (sent by log)");
    expect(ownerLabel(ids, "twitter", "m2")).toBe("the owner (by hand)");
    expect(ownerLabel(ids, "discord", "m3")).toBe("the owner (by hand)");
    expect(handLines([])).toBeNull();
  });
});
