import { describe, expect, test } from "bun:test";
import { Database } from "bun:sqlite";
import { afterGap, appendEvent, db, eventIdOf } from "../../inbox/store/index.ts";
import { lastMessagesOf, messageTimeOf, msOf } from "../platform/index.ts";
import { migrate } from "./client.ts";
import { BACKFILL_STEPS, runBackfill } from "./helpers/index.ts";

describe("times as integer milliseconds", () => {
  test("every shape log has stored parses to the same instant", () => {
    expect(msOf("2026-11-07T20:39:26.011000+00:00")).toBe(Date.UTC(2026, 10, 7, 20, 39, 26, 11));
    expect(msOf("2026-11-07T20:39:26.011Z")).toBe(Date.UTC(2026, 10, 7, 20, 39, 26, 11));
    expect(msOf("2026-11-07T20:39:26.011000Z")).toBe(Date.UTC(2026, 10, 7, 20, 39, 26, 11));
    expect(msOf("1794083966.011")).toBe(1794083966011);
    expect(msOf(1794083966011)).toBe(1794083966011);
    expect(msOf("")).toBeNull();
    expect(msOf("not a time")).toBeNull();
  });

  test("a message with no platform time says it fell back to when log received it", () => {
    expect(messageTimeOf("2026-11-07T20:39:26Z", "2026-11-07T20:40:00Z")).toEqual({ sentAtMs: Date.UTC(2026, 10, 7, 20, 39, 26), timeSource: "platform" });
    expect(messageTimeOf("", "2026-11-07T20:40:00Z")).toEqual({ sentAtMs: Date.UTC(2026, 10, 7, 20, 40, 0), timeSource: "received" });
  });

  test("messages in mixed time formats come back in real time order", () => {
    const conversationId = `order${Date.now()}`;
    appendEvent({ platform: "discord", account: "times", conversationId, type: "message", with: "a", text: "second", payload: { id: "2" }, sourceAt: "2026-11-07T20:39:27.000000+00:00" });
    appendEvent({ platform: "discord", account: "times", conversationId, type: "message", with: "a", text: "first", payload: { id: "1" }, sourceAt: "2026-11-07T20:39:26.5Z" });
    appendEvent({ platform: "discord", account: "times", conversationId, type: "message", with: "a", text: "third", payload: { id: "3" }, sourceAt: "2026-11-07T20:39:28Z" });
    const texts = lastMessagesOf(db(), `discord:times:${conversationId}`).map((m) => m.text);
    expect(texts).toEqual(["first", "second", "third"]);
  });

  test("a catch-up compares instants, not text", () => {
    expect(afterGap("2026-11-07T20:39:26.500000+00:00", "2026-11-07T20:39:26Z")).toBe(true);
    expect(afterGap("2026-11-07T20:39:25.9Z", "2026-11-07T20:39:26.000000+00:00")).toBe(false);
    expect(afterGap(null, "2026-11-07T20:39:26Z")).toBe(true);
  });
});

describe("one stable key per message", () => {
  test("the same message from the watch, the catch-up and a read is stored once", () => {
    const conversationId = `key${Date.now()}`;
    const first = appendEvent({ platform: "discord", account: "keys", conversationId, type: "message", with: "jd", text: "hi", payload: { id: "999" }, sourceAt: "2026-11-07T20:39:26.011000+00:00", source: "live" });
    const again = appendEvent({ platform: "discord", account: "keys", conversationId, type: "message", with: "jd", text: "hi (audio: note.ogg)", payload: { id: "999" }, sourceAt: "2026-11-07T20:39:26.011Z", source: "catchUp" });
    expect(first).not.toBeNull();
    expect(again).toBeNull();
    const row = db().prepare("SELECT messageKey, sourceAtMs FROM events WHERE eventId = ?").get(first!.eventId) as { messageKey: string; sourceAtMs: number };
    expect(row.messageKey).toBe(`discord:keys:${conversationId}:999`);
    expect(row.sourceAtMs).toBe(Date.UTC(2026, 10, 7, 20, 39, 26, 11));
  });

  test("two different messages with the same time and text are kept apart", () => {
    const conversationId = `twin${Date.now()}`;
    const a = appendEvent({ platform: "discord", account: "keys", conversationId, type: "message", with: "jd", text: "ok", payload: { id: "1" }, sourceAt: "2026-11-07T20:39:26Z" });
    const b = appendEvent({ platform: "discord", account: "keys", conversationId, type: "message", with: "jd", text: "ok", payload: { id: "2" }, sourceAt: "2026-11-07T20:39:26Z" });
    expect(a && b && a.eventId !== b.eventId).toBe(true);
  });

  test("a message with no platform id falls back to its instant, whatever the format", () => {
    const base = { platform: "slack", account: "a", conversationId: "D1", text: "yo" };
    expect(eventIdOf({ ...base, at: "2026-11-07T20:39:26.000000+00:00" })).toBe(eventIdOf({ ...base, at: "2026-11-07T20:39:26Z" }));
  });
});

describe("the backfill", () => {
  test("fills every old row in batches, resumes where it stopped and leaves the first copy keyed", () => {
    const handle = new Database(":memory:");
    migrate(handle);
    const insertEvent = handle.prepare("INSERT INTO events (eventId, platform, account, conversationId, type, payload, sourceAt, receivedAt, appendedAt) VALUES (?, 'discord', 'old', 'c1', 'message', ?, ?, '2026-11-01T00:00:00Z', '2026-11-01T00:00:00Z')");
    insertEvent.run("e1", JSON.stringify({ id: "m1" }), "2026-11-01T00:00:01.000000+00:00");
    insertEvent.run("e2", JSON.stringify({ id: "m1" }), "2026-11-01T00:00:01Z");
    insertEvent.run("e3", JSON.stringify({ id: "m2" }), "2026-11-01T00:00:02Z");
    const insertMessage = handle.prepare("INSERT INTO messages (messageKey, chatId, senderPlatform, senderUserId, fromOwner, sentAt, text, source, receivedAt) VALUES (?, 'discord:old:c1', 'discord', 'u', 0, ?, '', 'live', '2026-11-01T00:00:00Z')");
    for (let i = 0; i < 5; i++) insertMessage.run(`k${i}`, i === 4 ? "" : `2026-11-01T00:00:0${i}.5Z`);
    const done = runBackfill(handle, BACKFILL_STEPS, 2);
    expect(done.messageTimes).toBe(5);
    expect(done.eventTimesAndKeys).toBe(3);
    expect((handle.prepare("SELECT COUNT(*) n FROM messages WHERE sentAtMs IS NULL").get() as { n: number }).n).toBe(0);
    expect(handle.prepare("SELECT timeSource FROM messages WHERE messageKey = 'k4'").get()).toEqual({ timeSource: "received" });
    const keyed = handle.prepare("SELECT eventId, messageKey FROM events ORDER BY seq").all() as { eventId: string; messageKey: string | null }[];
    expect(keyed).toEqual([
      { eventId: "e1", messageKey: "discord:old:c1:m1" },
      { eventId: "e2", messageKey: null },
      { eventId: "e3", messageKey: "discord:old:c1:m2" },
    ]);
    expect(runBackfill(handle).messageTimes).toBe(0);
  });
});
