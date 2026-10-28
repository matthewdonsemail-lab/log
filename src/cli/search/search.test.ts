import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { hashEmbedder, loadConversations } from "../../search/conversations/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineSpec } from "../../platformKit/session/index.ts";
import { runCli } from "../runner/index.ts";
import { searchDeps } from "./index.ts";

let dir = "";
const kept = { ...process.env };
const embedder = searchDeps.embedder;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "searchDiscord"));
  process.env.LOG_CONVERSATIONS_DIR = join(dir, "conversations");
  process.env.LOG_SEARCH_DIR = join(dir, "search");
  process.env.LOG_PLATFORM_STATE = join(dir, "state");
  mkdirSync(join(dir, "state", "discord", "discordOne"), { recursive: true });
  writeFileSync(join(dir, "state", "discord", "discordOne", "session.json"), JSON.stringify({ sessionState: "loggedIn" }));
  searchDeps.embedder = () => hashEmbedder();
});

afterEach(() => {
  process.env = { ...kept };
  searchDeps.embedder = embedder;
  rmSync(dir, { recursive: true, force: true });
});

function fixture() {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push({ id: "discordOne", accountName: "discordOne", platform: "DISCORD", cookies: [], storageOrigins: [{ origin: "https://discord.com", localStorage: [{ name: "token", value: JSON.stringify("x".repeat(30)) }] }], proxy: null } as never);
  return twenty;
}

const EXPORTED = [
  { id: "1547936265436012645", kind: "group", name: "log", members: ["QuadScorpion", "John"], messages: [{ id: "1", at: "2026-10-28T08:00:11Z", from: "sourcedandsoldtothehighestbidder", fromMe: true, text: "Yo, this is Stump from the MCP" }, { id: "2", at: "2026-10-28T08:01:00Z", from: "John", fromMe: false, text: "the inference saver setup is live" }] },
  { id: "1555254123148873869", kind: "dm", name: null, members: ["Jilly"], messages: [] },
];

describe("log search index on Discord", () => {
  test("every Discord DM and group with messages is read through the engine, kept and searchable", async () => {
    const calls: PlatformEngineSpec[] = [];
    const out: string[] = [];
    const context = {
      twenty: fixture(),
      out: (l: string) => out.push(l),
      err: () => {},
      directDiscord: (_account: unknown, spec: PlatformEngineSpec) => {
        calls.push(spec);
        return { answer: { ok: true, conversations: EXPORTED, problems: [] }, refreshed: null };
      },
    };
    expect(await runCli(["search", "index", "--platform", "discord"], context as never)).toBe(0);
    expect(calls).toMatchObject([{ action: "export", limit: 200 }]);
    expect(out.join("\n")).toContain("discord discordOne: 1 conversations, 2 messages");
    const saved = loadConversations();
    expect(saved).toMatchObject([{ platform: "discord", account: "discordOne", conversationId: "1547936265436012645", box: "group log", with: ["QuadScorpion", "John"] }]);
    out.length = 0;
    expect(await runCli(["search", "inference saver setup", "--platform", "discord"], context as never)).toBe(0);
    expect(out.join("\n")).toContain("conversation 1547936265436012645");
  });
});
