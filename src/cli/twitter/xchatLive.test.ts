import { describe, expect, test } from "bun:test";
import { inboxMessageOf, isChatMessage, liveLine } from "./helpers/chat.ts";
import { pushedTypeOf } from "../../inbox/relay/index.ts";

describe("X Chat live lines", () => {
  const message = { type: "message", id: "2119089067904425984", conversationId: "1974596626342686720:2039389784808853504", time: "2026-11-07T15:26:19.216000Z", senderId: "2039389784808853504", text: "I just woke up", fromMe: false, from: "deepman_1", box: "xchat", encrypted: false };

  test("a message waiting for its key is never a message", () => {
    const waiting = { type: "unopened", state: "waitingForKey", eventId: "2119089067904425984", conversationId: message.conversationId, error: "no matching key" };
    expect(isChatMessage(waiting)).toBe(false);
    expect(liveLine(waiting)).toStartWith("X live unopened");
  });

  test("a message with no text never reaches the inbox", () => {
    expect(isChatMessage({ ...message, text: "" })).toBe(false);
    expect(isChatMessage({ ...message, text: undefined })).toBe(false);
  });

  test("an opened message is one message, typed so the relay doesn't store a raw copy", () => {
    expect(isChatMessage(message)).toBe(true);
    expect(pushedTypeOf(message)).toBe("message");
    const { type: _, ...untyped } = message;
    expect(isChatMessage(untyped)).toBe(true);
    expect(pushedTypeOf(untyped)).toBe("message");
  });

  test("the relay keeps real event types and only an unnamed non-message is unknown", () => {
    expect(pushedTypeOf({ type: "unopened", state: "opened", eventId: "1" })).toBe("unopened");
    expect(pushedTypeOf({ kind: "like" })).toBe("like");
    expect(pushedTypeOf({ something: 1 })).toBe("unknown");
  });

  test("a message opened late keeps how long it waited and why", () => {
    const late = { tries: 5, waitedSeconds: 2600, firstError: "no matching key" };
    expect(inboxMessageOf("matthewsoldit", { ...message, openedLate: late }, new Date("2026-11-07T16:09:13Z")).openedLate).toEqual(late);
  });
});
