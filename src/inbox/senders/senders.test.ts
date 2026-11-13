import { afterAll, describe, expect, test } from "bun:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { reportCommand, reportDeps, sendersText } from "../../cli/report/index.ts";
import { saveConversations } from "../../search/conversations/index.ts";
import type { Conversation } from "../../search/conversations/index.ts";
import { readTwitterSenders, sendersOf, sinceOf } from "./index.ts";

const NOW = new Date("2026-11-13T12:00:00Z");
const msg = (id: string, at: string, fromMe: boolean, text: string, from: string | null = null) => ({ id, at, fromMe, text, from });

const CONVERSATIONS: Conversation[] = [
  { platform: "twitter", account: "testAccount", conversationId: "100-200", box: "inbox", with: ["fakeOne"], messages: [msg("a1", "2026-11-10T09:00:00.000Z", false, "hi", "200"), msg("a2", "2026-11-10T09:01:00.000Z", true, "hey"), msg("a3", "2026-11-12T10:00:00.000Z", false, "ping", "200")] },
  { platform: "twitter", account: "testAccount", conversationId: "100:200", box: "inbox", with: ["fakeOne"], messages: [msg("b1", "2026-11-12T10:00:02.000Z", false, "ping", "200"), msg("b2", "2026-11-12T11:00:00.000Z", false, "you there?", "200")] },
  { platform: "twitter", account: "testAccount", conversationId: "100-300", box: "inbox", with: ["fakeTwo"], messages: [msg("c1", "2026-11-01T08:00:00.000Z", false, "old one", "300"), msg("c2", "2026-11-11T08:00:00.000Z", false, "new one", "300")] },
  { platform: "twitter", account: "testAccount", conversationId: "groupChat", box: "inbox", with: ["fakeOne", "fakeTwo"], messages: [msg("g1", "2026-11-11T08:00:00.000Z", false, "group hi", "300")] },
  { platform: "twitter", account: "otherAccount", conversationId: "400-500", box: "inbox", with: ["fakeThree"], messages: [msg("d1", "2026-11-11T08:00:00.000Z", false, "elsewhere", "500")] },
  { platform: "discord", account: "testAccount", conversationId: "dmOne", box: "inbox", with: ["fakeFour"], messages: [msg("e1", "2026-11-11T08:00:00.000Z", false, "not x", "600")] },
];

describe("who messaged an X account, from log.db", () => {
  test("one person's old DM and X Chat threads count as one, a mirrored message once, group chats and other platforms left out", () => {
    const report = sendersOf(CONVERSATIONS, { account: "testAccount", now: NOW }, new Map([["fakeone", "Fake One"]]));
    expect(report.senders.map((s) => [s.handle, s.name, s.count])).toEqual([
      ["fakeOne", "Fake One", 3],
      ["fakeTwo", "fakeTwo", 2],
    ]);
    expect(report).toMatchObject({ source: "twitterDmsBySender", readFrom: "log.db", account: "testAccount", messages: 5, people: 2, since: null });
    expect(report.senders[0]).toMatchObject({ firstAt: "2026-11-10T09:00:00.000Z", lastAt: "2026-11-12T11:00:00.000Z" });
  });

  test("since keeps the newer messages, days with none are filled as 0, limit cuts the list but not the totals", () => {
    const report = sendersOf(CONVERSATIONS, { since: "4d", limit: 1, now: NOW });
    expect(report.since).toBe("2026-11-09T12:00:00.000Z");
    expect(report.accounts).toEqual(["otherAccount", "testAccount"]);
    expect(report.people).toBe(3);
    expect(report.senders).toHaveLength(1);
    expect(report.byDay).toEqual([
      { day: "2026-11-09", count: 0 },
      { day: "2026-11-10", count: 1 },
      { day: "2026-11-11", count: 2 },
      { day: "2026-11-12", count: 2 },
    ]);
  });

  test("since reads spans and dates and refuses anything else", () => {
    expect(sinceOf("2w", NOW)).toBe("2026-10-30T12:00:00.000Z");
    expect(sinceOf("12h", NOW)).toBe("2026-11-13T00:00:00.000Z");
    expect(sinceOf("2026-11-01", NOW)).toBe("2026-11-01T00:00:00.000Z");
    expect(sinceOf("", NOW)).toBeNull();
    expect(() => sinceOf("lately", NOW)).toThrow(/sinceInvalid/);
  });

  describe("from a fake log.db", () => {
    const dir = mkdtempSync(join(tmpdir(), "senders-"));
    const path = join(dir, "log.db");
    afterAll(() => rmSync(dir, { recursive: true, force: true }));

    test("readTwitterSenders reads the stored conversations, and reportData answers its text and json", async () => {
      saveConversations(CONVERSATIONS, path);
      const report = readTwitterSenders({ account: "testAccount", now: NOW }, path);
      expect(report.senders.map((s) => [s.handle, s.count])).toEqual([
        ["fakeOne", 3],
        ["fakeTwo", 2],
      ]);
      const previous = reportDeps.read;
      reportDeps.read = (options) => readTwitterSenders({ ...options, now: NOW }, path);
      try {
        const context = { out: () => {}, err: () => {} } as never;
        const json = await reportCommand.run(context, ["data", "--source", "twitterDmsBySender", "--account", "testAccount", "--json"]);
        expect(JSON.parse(String(json.stdout)).messages).toBe(5);
        const text = await reportCommand.run(context, ["data", "--source", "twitterDmsBySender", "--account", "testAccount"]);
        expect(text.stdout).toBe(sendersText(report));
        expect(text.stdout).toContain("5 messages from 2 people");
        const refused = await reportCommand.run(context, ["data", "--source", "twitterDmsBySender", "--since", "lately"]);
        expect(refused.code).toBe(1);
        expect(refused.stderr).toContain("sinceInvalid");
      } finally {
        reportDeps.read = previous;
      }
    });
  });
});
