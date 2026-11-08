import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { migrate } from "../schema/client.ts";
import { BACKFILL_STEPS, runBackfill } from "../schema/helpers/index.ts";
import { attachmentsSeenEvent, countsOf, derivedFingerprint, insertEventRow, lastMessagesOf, PAYLOAD_INLINE_LIMIT, readBlob, rebuildDerived, saveConversationRows, verifyDerived } from "./index.ts";
import type { EventInsert } from "./index.ts";

function fresh(): Database {
  const handle = new Database(":memory:");
  migrate(handle);
  return handle;
}

function message(over: Partial<EventInsert> = {}): EventInsert {
  return { platform: "discord", account: "a", conversationId: "c1", type: "message", with: "jd", text: "hi", box: "dm", payload: { id: "1", senderId: "42" }, sourceAt: "2026-11-08T01:00:00Z", receivedAt: "2026-11-08T01:00:01Z", source: "live", ...over };
}

describe("the typed tables come only from events", () => {
  test("a conversation read appends events, and the typed rows are derived from them", () => {
    const handle = fresh();
    saveConversationRows(handle, [{ platform: "discord", account: "a", conversationId: "g1", box: "group", with: ["jd", "deepman"], messages: [{ id: "10", at: "2026-11-08T01:00:00Z", from: "jd", fromMe: false, text: "yo" }, { id: "11", at: "2026-11-08T01:01:00Z", from: null, fromMe: true, text: "sup" }] }]);
    const events = handle.prepare("SELECT type, source FROM events ORDER BY seq").all() as { type: string; source: string }[];
    expect(events).toEqual([{ type: "message", source: "read" }, { type: "ownMessage", source: "read" }, { type: "conversationSeen", source: "read" }]);
    expect(lastMessagesOf(handle, "discord:a:g1").map((m) => m.text)).toEqual(["yo", "sup"]);
    expect(handle.prepare("SELECT box FROM chats WHERE chatId = 'discord:a:g1'").get()).toEqual({ box: "group" });
    expect((handle.prepare("SELECT userId FROM memberships WHERE roomId = 'discord:a:g1' ORDER BY position").all() as { userId: string }[]).map((m) => m.userId)).toEqual(["@jd", "@deepman"]);
  });

  test("a changed text is a new event, never an edit of the old one", () => {
    const handle = fresh();
    const conversation = { platform: "discord", account: "a", conversationId: "d1", box: "dm", with: ["jd"], messages: [{ id: "5", at: "2026-11-08T01:00:00Z", from: "jd", fromMe: false, text: "first" }] };
    saveConversationRows(handle, [conversation]);
    saveConversationRows(handle, [{ ...conversation, messages: [{ ...conversation.messages[0], text: "first (voice note: hello)" }] }]);
    expect(handle.prepare("SELECT text FROM events WHERE type = 'message'").get()).toEqual({ text: "first" });
    expect(handle.prepare("SELECT text FROM events WHERE type = 'messageEdited'").get()).toEqual({ text: "first (voice note: hello)" });
    expect(lastMessagesOf(handle, "discord:a:d1")[0].text).toBe("first (voice note: hello)");
  });

  test("attachments seen later are their own event and land on the message", () => {
    const handle = fresh();
    insertEventRow(handle, message());
    insertEventRow(handle, attachmentsSeenEvent({ platform: "discord", account: "a", conversationId: "c1" }, "discord:a:c1:1", [{ name: "a.jpg", type: "image/jpeg", path: "/tmp/a.jpg" }]));
    expect(handle.prepare("SELECT name, path FROM attachments WHERE messageKey = 'discord:a:c1:1'").get()).toEqual({ name: "a.jpg", path: "/tmp/a.jpg" });
    expect(handle.prepare("SELECT payload FROM events WHERE type = 'message'").get()).toEqual({ payload: JSON.stringify({ id: "1", senderId: "42" }) });
  });

  test("a payload too big to keep inline is kept whole in blobs, and replays the same", () => {
    const handle = fresh();
    const long = "x".repeat(PAYLOAD_INLINE_LIMIT + 10);
    insertEventRow(handle, message({ payload: { id: "9", senderId: "42", raw: long } }));
    const row = handle.prepare("SELECT payload, rawHash FROM events").get() as { payload: string; rawHash: string };
    expect(row.rawHash).toHaveLength(64);
    expect(JSON.parse(readBlob(handle, row.rawHash)!).raw).toBe(long);
    expect(verifyDerived(handle).ok).toBe(true);
  });

  test("the account's own id is written into the event when it is appended", () => {
    const handle = fresh();
    for (const n of ["100", "200"]) insertEventRow(handle, message({ platform: "twitter", conversationId: `7:${n}`, payload: { id: n } }));
    insertEventRow(handle, message({ platform: "twitter", conversationId: "7:300", type: "ownMessage", payload: { id: "300" } }));
    expect(handle.prepare("SELECT ownerId FROM events WHERE type = 'ownMessage'").get()).toEqual({ ownerId: "7" });
  });
});

describe("rebuild and verify", () => {
  test("rebuilding from the events gives the same tables, and verify notices a row nothing derived", () => {
    const handle = fresh();
    insertEventRow(handle, message());
    insertEventRow(handle, message({ payload: { id: "2", senderId: "43" }, with: "deepman", text: "yo", sourceAt: "2026-11-08T01:02:00Z" }));
    const before = derivedFingerprint(handle);
    expect(verifyDerived(handle).ok).toBe(true);
    handle.exec("UPDATE messages SET text = 'tampered' WHERE platformMessageId = '2'");
    const check = verifyDerived(handle);
    expect(check.ok).toBe(false);
    expect(check.differs).toEqual(["messages"]);
    rebuildDerived(handle);
    expect(derivedFingerprint(handle)).toEqual(before);
    expect(countsOf(handle).messages).toBe(2);
  });

  test("the backfill gives a typed row with no event an import event, so a rebuild keeps it", () => {
    const handle = fresh();
    handle.exec("INSERT INTO chats (chatId, platform, account, conversationId, kind) VALUES ('slack:a:D1', 'slack', 'a', 'D1', 'dm')");
    handle.exec("INSERT INTO messages (messageKey, chatId, platformMessageId, senderPlatform, senderUserId, senderLabel, fromOwner, sentAt, text, source, receivedAt) VALUES ('slack:a:D1:1.5', 'slack:a:D1', '1.5', 'slack', 'U1', 'kim', 0, '2026-11-08T01:00:00Z', 'orphan', 'read', '2026-11-08T01:00:00Z')");
    handle.exec("INSERT INTO messages (messageKey, chatId, senderPlatform, senderUserId, fromOwner, sentAt, text, source, receivedAt) VALUES ('oddKey', 'slack:a:D1', 'slack', 'U1', 0, '2026-11-08T01:00:00Z', 'no chat prefix', 'read', '2026-11-08T01:00:00Z')");
    const done = runBackfill(handle, BACKFILL_STEPS, 1);
    expect(done.eventsForTypedRows).toBe(2);
    expect(handle.prepare("SELECT source, text FROM events WHERE type = 'message'").all()).toEqual([{ source: "import", text: "orphan" }]);
    rebuildDerived(handle);
    expect(lastMessagesOf(handle, "slack:a:D1").map((m) => m.text)).toEqual(["orphan"]);
    expect(runBackfill(handle).eventsForTypedRows).toBe(0);
  });
});
