import { beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../cli/runner/index.ts";
import { addPending } from "../watch/index.ts";
import { againstTheDb, behindLine, readPending } from "./index.ts";

beforeEach(() => {
  process.env.LOG_INBOX_STATE = mkdtempSync(join(tmpdir(), "pending"));
});

const heard = (text: string) => ({ platform: "discord", account: "fakeGuild", conversationId: "1234567890123456789", with: "fakeFriend", text, at: new Date().toISOString(), box: "dm", seenAt: new Date().toISOString() });

describe("one reader for what the watchers heard", () => {
  test("a new reader starts from now, then gets each message once, with what to do next", () => {
    addPending([heard("before the reader")]);
    expect(readPending("fakeHarness")).toMatchObject({ messages: [], text: null });
    addPending([heard("are you around")]);
    const first = readPending("fakeHarness");
    expect(first.messages.map((m) => m.text)).toEqual(["are you around"]);
    expect(first.text).toContain("NEW DISCORD MESSAGE");
    expect(readPending("fakeHarness").messages).toEqual([]);
  });

  test("each reader keeps its own place", () => {
    readPending("fakeOne");
    readPending("fakeTwo");
    addPending([heard("one message")]);
    expect(readPending("fakeOne").messages.length).toBe(1);
    expect(readPending("fakeTwo").messages.length).toBe(1);
  });

  test("log inbox pending is the same read for any harness, and a reader name with other characters is refused", async () => {
    const out: string[] = [];
    const err: string[] = [];
    const io = { out: (l: string) => out.push(l), err: (l: string) => err.push(l) };
    expect(await runCli(["inbox", "pending", "--reader", "fakeHarness"], io)).toBe(0);
    expect(out.join("\n")).toContain("nothing new for fakeHarness");
    addPending([heard("ping")]);
    out.length = 0;
    expect(await runCli(["inbox", "pending", "--reader", "fakeHarness", "--json"], io)).toBe(0);
    expect(JSON.parse(out.join("\n"))).toMatchObject({ reader: "fakeHarness", messages: [{ text: "ping" }] });
    expect(await runCli(["inbox", "pending", "--reader", "no spaces"], io)).toBe(1);
  });
});

const row = (at: string, fromMe: boolean, text: string) => ({ id: at, conversationId: "1234567890123456789", at, from: fromMe ? "me" : "fakeFriend", fromMe, text });
const at = (minute: number) => `2026-11-18T10:${String(minute).padStart(2, "0")}:00.000Z`;

describe("what the watchers heard, read against the .db", () => {
  test("a line that landed after the owner already wrote back is behind, not new, and gets one line", () => {
    const db = () => [row(at(1), false, "late one"), row(at(2), true, "owner answered"), row(at(3), false, "still new")];
    const { fresh, behind, conversations } = againstTheDb([{ ...heard("late one"), at: at(1) }, { ...heard("still new"), at: at(3) }], db);
    expect(fresh.map((m) => m.text)).toEqual(["still new"]);
    expect(behind.map((m) => m.text)).toEqual(["late one"]);
    expect(conversations).toHaveLength(1);
    expect(conversations[0]).toContain("THE CONVERSATION WITH fakeFriend NOW");
    expect(conversations[0]).toContain("the owner (by hand): owner answered");
    expect(behindLine(behind)).toContain("ALREADY BEHIND THE OWNER'S LAST MESSAGE (1)");
  });

  test("each of the owner's lines says whether log sent it or he typed it himself", () => {
    const db = () => [row(at(1), true, "queued opener"), row(at(2), true, "typed on the phone"), row(at(3), false, "new one")];
    const logSent = () => (id: string) => id === at(1);
    const { conversations } = againstTheDb([{ ...heard("new one"), at: at(3) }], db, () => null, logSent);
    expect(conversations[0]).toContain("the owner (sent by log): queued opener");
    expect(conversations[0]).toContain("the owner (by hand): typed on the phone");
  });

  test("what the owner wrote by hand reaches the reader with the rest", () => {
    addPending([]);
    readPending("fakeHand", { byHand: () => null });
    const read = readPending("fakeHand", { byHand: () => ">>> THE OWNER WROTE BY HAND (1)" });
    expect(read.text).toContain("THE OWNER WROTE BY HAND (1)");
  });

  test("a burst from one person is one conversation block, read once", () => {
    let reads = 0;
    const db = () => {
      reads += 1;
      return [row(at(1), true, "owner"), row(at(2), false, "a"), row(at(3), false, "b")];
    };
    const { fresh, conversations } = againstTheDb([{ ...heard("a"), at: at(2) }, { ...heard("b"), at: at(3) }], db);
    expect(fresh).toHaveLength(2);
    expect(conversations).toHaveLength(1);
    expect(reads).toBe(1);
  });

  test("a chat the .db can't read still shows the lines it heard", () => {
    const { fresh, behind, conversations } = againstTheDb([heard("hi")], () => {
      throw new Error("no db");
    });
    expect(fresh).toHaveLength(1);
    expect(behind).toEqual([]);
    expect(conversations).toEqual([]);
  });

  test("when every line is behind, the turn says so and asks for nothing", () => {
    addPending([]);
    readPending("fakeBehind");
    addPending([{ ...heard("old"), at: at(1) }]);
    const read = readPending("fakeBehind", { read: () => [row(at(1), false, "old"), row(at(2), true, "owner")] });
    expect(read.text).not.toContain("NEW DISCORD MESSAGE");
    expect(read.text).toContain("ALREADY BEHIND");
  });
});
