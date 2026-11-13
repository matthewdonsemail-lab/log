import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { migrate } from "../schema/client.ts";
import { accountIdentifiedEvent, identityLearnedEvent, insertEventRow, verifyDerived } from "./index.ts";
import type { EventInsert } from "./index.ts";

function fresh(): Database {
  const handle = new Database(":memory:");
  migrate(handle);
  return handle;
}

function message(over: Partial<EventInsert> = {}): EventInsert {
  return { platform: "discord", account: "me", conversationId: "c1", type: "message", with: "Dex", text: "hi", box: "dm", payload: { id: "1" }, sourceAt: "2026-11-08T01:00:00Z", receivedAt: "2026-11-08T01:00:01Z", source: "live", ...over };
}

const senders = (handle: Database) => (handle.prepare("SELECT senderUserId FROM messages ORDER BY seq").all() as { senderUserId: string }[]).map((r) => r.senderUserId);

describe("stable ids for people and accounts", () => {
  test("a person known only by handle is re-keyed to their real id once it is learned, and later messages use it", () => {
    const handle = fresh();
    insertEventRow(handle, message());
    expect(senders(handle)).toEqual(["@Dex"]);
    insertEventRow(handle, identityLearnedEvent("discord", "me", "555", "dex", "Deep", "2026-11-08T01:05:00Z"));
    expect(senders(handle)).toEqual(["555"]);
    insertEventRow(handle, message({ payload: { id: "2" }, text: "again", sourceAt: "2026-11-08T01:06:00Z" }));
    expect(senders(handle)).toEqual(["555", "555"]);
    expect(handle.prepare("SELECT userId, handle, displayName FROM identities WHERE platform = 'discord'").all()).toEqual([{ userId: "555", handle: "Dex", displayName: "Deep" }]);
    expect(handle.prepare("SELECT fromId, toId, reason FROM identityMerges").all()).toEqual([{ fromId: "@dex", toId: "555", reason: "identityLearned" }]);
  });

  test("the account's own messages move from self: to its real id, only in that account's chats", () => {
    const handle = fresh();
    insertEventRow(handle, message({ type: "ownMessage", payload: { id: "1", fromMe: true }, with: "me" }));
    insertEventRow(handle, message({ account: "other", type: "ownMessage", payload: { id: "1", fromMe: true }, with: "me" }));
    expect(senders(handle)).toEqual(["self:me", "self:other"]);
    insertEventRow(handle, accountIdentifiedEvent("discord", "me", "999", "2026-11-08T02:00:00Z"));
    expect(senders(handle)).toEqual(["999", "self:other"]);
    insertEventRow(handle, message({ type: "ownMessage", payload: { id: "3", fromMe: true }, with: "me", sourceAt: "2026-11-08T02:01:00Z" }));
    expect(senders(handle).at(-1)).toBe("999");
    expect(handle.prepare("SELECT ownerId FROM events WHERE type = 'ownMessage' ORDER BY seq DESC LIMIT 1").get()).toEqual({ ownerId: "999" });
  });

  test("learning the same alias twice is one event, and a rebuild lands on the same rows", () => {
    const handle = fresh();
    insertEventRow(handle, message());
    expect(insertEventRow(handle, identityLearnedEvent("discord", "me", "555", "Dex", null, "2026-11-08T01:05:00Z"))).not.toBeNull();
    expect(insertEventRow(handle, identityLearnedEvent("discord", "me", "555", "@dex", null, "2026-11-08T01:09:00Z"))).toBeNull();
    insertEventRow(handle, accountIdentifiedEvent("discord", "me", "999", "2026-11-08T02:00:00Z"));
    expect(verifyDerived(handle).ok).toBe(true);
  });
});
