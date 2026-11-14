import { beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../cli/runner/index.ts";
import { addPending } from "../watch/index.ts";
import { readPending } from "./index.ts";

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
