import { describe, expect, test } from "bun:test";
import { conversationLine, linkedinInboxCommand, linkedinLikeCommand, linkedinMessageCommand, linkedinMessagesCommand, linkedinRepostCommand, messageLine } from "./helpers/index.ts";

describe("linkedin like, inbox and messages inputs", () => {
  test("like is a write that needs --approvedBy with --live, inbox and messages only read", async () => {
    expect(linkedinLikeCommand.effect).toBe("write");
    expect(linkedinInboxCommand.effect).toBe("read");
    expect(linkedinMessagesCommand.effect).toBe("read");
    const run = await linkedinLikeCommand.run({ err: () => {} } as never, ["--account", "a", "--post", "7526404006819139585", "--live"]);
    expect(run.code).toBe(1);
    expect(run.stderr ?? "").toContain("notApproved");
  });

  test("messages needs exactly one of --with and --conversation", async () => {
    const none = await linkedinMessagesCommand.run({ err: () => {} } as never, ["--account", "a"]);
    expect(none.code).toBe(1);
    const both = await linkedinMessagesCommand.run({ err: () => {} } as never, ["--account", "a", "--with", "jane", "--conversation", "urn"]);
    expect(both.code).toBe(1);
  });

  test("a conversation and a message read as one line each", () => {
    const line = conversationLine({ conversationUrn: "u", people: [{ name: "Jane Doe", profileId: "x", profileUrl: "", headline: "" }], groupChat: false, unreadCount: 2, lastActivityAt: "2026-11-13T15:12:03Z", url: "", last: { at: null, from: "Jane Doe", fromMe: false, text: "hi\nthere", messageUrn: "" } });
    expect(line).toBe('  2026-11-13T15:12:03Z Jane Doe [2 unread]: Jane Doe: "hi there"');
    expect(messageLine({ at: "t", from: "Jane", fromMe: true, text: "yo", messageUrn: "" })).toBe("  t you: yo");
  });
  test("repost and message are writes that need --approvedBy with --live", async () => {
    expect(linkedinRepostCommand.effect).toBe("write");
    expect(linkedinMessageCommand.effect).toBe("write");
    const repost = await linkedinRepostCommand.run({ err: () => {} } as never, ["--account", "a", "--post", "7526404006819139585", "--live"]);
    expect(repost.code).toBe(1);
    expect(repost.stderr ?? "").toContain("notApproved");
    const message = await linkedinMessageCommand.run({ err: () => {} } as never, ["--account", "a", "--with", "jane", "--text", "hi", "--live"]);
    expect(message.code).toBe(1);
    expect(message.stderr ?? "").toContain("notApproved");
  });

  test("a repost needs an activity, and a message needs its text and exactly one of --with and --conversation", async () => {
    const badPost = await linkedinRepostCommand.run({ err: () => {} } as never, ["--account", "a", "--post", "not a post"]);
    expect(badPost.code).toBe(1);
    const both = await linkedinMessageCommand.run({ err: () => {} } as never, ["--account", "a", "--with", "jane", "--conversation", "urn", "--text", "hi"]);
    expect(both.code).toBe(1);
    const blank = await linkedinMessageCommand.run({ err: () => {} } as never, ["--account", "a", "--with", "jane", "--text", "  "]);
    expect(blank.code).toBe(1);
  });
});
