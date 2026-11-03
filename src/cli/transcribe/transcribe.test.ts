import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createAssemblyAiClient } from "../../media/voiceNotes/index.ts";
import type { AssemblyAiClient } from "../../media/voiceNotes/index.ts";
import { hashEmbedder, loadConversations, saveConversations } from "../../search/conversations/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import type { PlatformEngineSpec } from "../../platformKit/session/index.ts";
import { runCli } from "../runner/index.ts";
import { searchDeps } from "../search/index.ts";
import { transcribeDeps } from "./index.ts";

let dir = "";
const kept = { ...process.env };
const client = transcribeDeps.client;
const embedder = searchDeps.embedder;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "transcribe"));
  process.env.LOG_CONVERSATIONS_DIR = join(dir, "conversations");
  process.env.LOG_SEARCH_DIR = join(dir, "search");
  process.env.LOG_PLATFORM_STATE = join(dir, "state");
  process.env.LOG_TWITTER_STATE = join(dir, "twitter");
  process.env.LOG_TRANSCRIPTS_DIR = join(dir, "transcripts");
  searchDeps.embedder = () => hashEmbedder();
});

afterEach(() => {
  process.env = { ...kept };
  transcribeDeps.client = client;
  searchDeps.embedder = embedder;
  rmSync(dir, { recursive: true, force: true });
});

function fakeClient(said: string[]): AssemblyAiClient {
  return {
    hasKey: true,
    async transcribe(_bytes, file, hash) {
      said.push(file);
      return { ok: true, cached: false, transcript: { hash, text: `words of ${file}`, languageCode: "en", seconds: 3, transcriptId: "t", file, transcribedAt: "2026-11-03T00:00:00Z" } };
    },
  };
}

function fixture() {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push({ id: "discordOne", accountName: "discordOne", platform: "DISCORD", cookies: [], storageOrigins: [{ origin: "https://discord.com", localStorage: [{ name: "token", value: JSON.stringify("x".repeat(30)) }] }], proxy: null } as never);
  return twenty;
}

function seed() {
  saveConversations([
    { platform: "twitter", account: "matt", conversationId: "1:2", box: "xchat", with: ["nefer"], messages: [{ id: "10", at: "2026-11-01T00:00:00Z", from: "nefer", fromMe: false, text: "(audio: v.m4a)" }] },
    { platform: "discord", account: "discordOne", conversationId: "55", box: "dm", with: ["A"], messages: [{ id: "9", at: "2026-11-02T00:00:00Z", from: "A", fromMe: false, text: "" }] },
  ]);
  const media = { type: "audio", filename: "v.m4a", media_hash_key: "abc" };
  mkdirSync(join(dir, "twitter", "matt", "media", "1_2"), { recursive: true });
  writeFileSync(join(dir, "twitter", "matt", "inboxSync.json"), JSON.stringify({ xchat: { "1:2": { messages: [{ event_id: "10", media: [media] }] } } }));
  writeFileSync(join(dir, "twitter", "matt", "media", "1_2", "abc.m4a"), "x audio");
  mkdirSync(join(dir, "state", "discord", "discordOne", "media", "55"), { recursive: true });
  writeFileSync(join(dir, "state", "discord", "discordOne", "media", "55", "9_voice-message.ogg"), "d audio");
}

async function run(argv: string[], directDiscord?: (spec: PlatformEngineSpec) => { answer: Record<string, unknown>; refreshed: null }) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { twenty: fixture(), out: (l: string) => out.push(l), err: (l: string) => err.push(l), ...(directDiscord ? { directDiscord: (_a: unknown, spec: PlatformEngineSpec) => directDiscord(spec) } : {}) } as never);
  return { code, out: out.join("\n"), err: err.join("\n") };
}

describe("log transcribe", () => {
  test("no key: it refuses with assemblyAiKeyMissing and reads nothing", async () => {
    seed();
    transcribeDeps.client = () => createAssemblyAiClient({ key: null });
    const calls: PlatformEngineSpec[] = [];
    const r = await run(["transcribe"], (spec) => {
      calls.push(spec);
      return { answer: { ok: true }, refreshed: null };
    });
    expect(r.code).toBe(2);
    expect(r.err).toContain("assemblyAiKeyMissing");
    expect(calls).toEqual([]);
  });

  test("--list shows the voice notes the store holds, calling nothing", async () => {
    seed();
    transcribeDeps.client = () => {
      throw new Error("not called");
    };
    const r = await run(["transcribe", "--list", "--platform", "twitter"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("1 voice note(s) in the store, 1 with their file");
  });

  test("every voice note is transcribed and written into the store, Discord's found by its sound search", async () => {
    seed();
    const said: string[] = [];
    transcribeDeps.client = () => fakeClient(said);
    const calls: PlatformEngineSpec[] = [];
    const r = await run(["transcribe"], (spec) => {
      calls.push(spec);
      return { answer: { ok: true, notes: [{ channelId: "55", messageId: "9", at: "2026-11-02T00:00:00Z", from: "A", fromMe: false, text: "(audio: voice-message.ogg)", name: "voice-message.ogg", type: "audio/ogg", path: join(dir, "state", "discord", "discordOne", "media", "55", "9_voice-message.ogg") }], searched: ["55"], problems: [] }, refreshed: null };
    });
    expect(r.code).toBe(0);
    expect(calls).toMatchObject([{ action: "voiceNotes", channels: ["55"] }]);
    expect(said.sort()).toEqual(["v.m4a", "voice-message.ogg"]);
    expect(r.out).toContain("2 voice note(s) transcribed (2 new with AssemblyAI, 0 from the cache)");
    expect(r.out).toContain("twitter @nefer: 1");
    expect(r.out).toContain("discord A: 1");
    const texts = loadConversations().map((c) => c.messages[0].text).sort();
    expect(texts).toEqual(['(voice note: "words of v.m4a")', '(voice note: "words of voice-message.ogg")']);
    const again = await run(["transcribe", "--platform", "twitter"]);
    expect(again.out).toContain("0 voice note(s) transcribed");
    expect(said).toHaveLength(2);
  });

  test("a Discord refusal stops the search and keeps what was found", async () => {
    seed();
    transcribeDeps.client = () => fakeClient([]);
    const r = await run(["transcribe", "--platform", "discord", "--noIndex"], () => ({ answer: { ok: false, code: "rateLimited", detail: "Discord answered 429", notes: [], problems: [] }, refreshed: null }));
    expect(r.out).toContain("discord discordOne: stopped: rateLimited");
  });
});
