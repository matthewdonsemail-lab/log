import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { fishAudioProvider } from "../../extensions/fishAudio/index.ts";
import { inworldProvider } from "../../extensions/inworld/index.ts";
import { accentSteerOf } from "../../extensions/inworld/index.ts";
import { clonePath, readClone, readClones, voiceSettingsOf, writeClone } from "../../extensions/voiceClone/index.ts";
import type { Recording, VoiceFetch, VoiceProvider } from "../../extensions/voiceClone/index.ts";
import { runCli } from "../runner/index.ts";
import { cloneDeps } from "./index.ts";

const original = { ...cloneDeps };
afterEach(() => {
  Object.assign(cloneDeps, original);
  rmSync(clonePath(), { force: true });
  delete process.env.LOG_VOICE_PROVIDER;
  delete process.env.LOG_VOICE_ACCENT;
  delete process.env.LOG_VOICE_LANGUAGE;
});

const rec = (messageId: string, seconds: number): Recording => ({ path: `C:/x/${messageId}_voice-message.ogg`, platform: "discord", account: "mattDiscord", conversationId: "1", messageId, seconds });
const MINE = [rec("a", 271.9), rec("b", 34.1), rec("c", 8.5), rec("d", 15.9), rec("e", 2)];

function withProvider(answers: { status: number; body?: unknown; bytes?: number }[], key: string | null = "testKey") {
  const calls: { url: string; method: string; headers: Record<string, string>; body?: unknown }[] = [];
  const fetcher: VoiceFetch = async (url, init) => {
    calls.push({ url, ...init });
    const a = answers.shift() ?? { status: 500 };
    return { status: a.status, json: async () => a.body ?? {}, arrayBuffer: async () => new Uint8Array(a.bytes ?? 0).buffer };
  };
  cloneDeps.provider = (p: VoiceProvider) => (p === "inworld" ? inworldProvider(key, fetcher) : fishAudioProvider(key, fetcher));
  cloneDeps.read = () => new Uint8Array([1, 2, 3]);
  cloneDeps.wav = () => new Uint8Array([4, 5, 6]);
  cloneDeps.recordings = () => MINE;
  cloneDeps.transcript = () => null;
  return calls;
}

async function run(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

const clone = (provider: VoiceProvider, voiceId: string, model: string) => writeClone({ provider, voiceId, title: "matt", model, createdAt: "2026-11-05T00:00:00.000Z", state: "ready", references: [] });

describe("log clone (rules 142, 143)", () => {
  test("clone voice lists matt's own recordings within the provider's limit and calls nothing", async () => {
    const calls = withProvider([]);
    const inworld = await run(["clone", "voice"]);
    expect(inworld.code).toBe(0);
    expect(inworld.out).toContain("on inworld");
    expect(inworld.out).toContain("message c");
    expect(inworld.out).toContain("message d");
    expect(inworld.out).not.toContain("message b");
    const fish = await run(["clone", "voice", "--provider", "fishAudio"]);
    expect(fish.out).toContain("message b");
    expect(fish.out).not.toContain("message a");
    expect(calls).toEqual([]);
  });

  test("LOG_VOICE_PROVIDER picks the provider, and an unknown one is refused", async () => {
    withProvider([]);
    process.env.LOG_VOICE_PROVIDER = "fishAudio";
    expect((await run(["clone", "voice"])).out).toContain("on fishAudio");
    process.env.LOG_VOICE_PROVIDER = "nope";
    expect((await run(["clone", "voice"])).err).toContain("voiceProviderUnknown");
  });

  test("clone voice --apply on Inworld sends its samples as base64 wav with Basic auth and keeps the voice id", async () => {
    const calls = withProvider([{ status: 200, body: { voice: { voiceId: "ws__matt" } } }]);
    const r = await run(["clone", "voice", "--apply"]);
    expect(r.code).toBe(0);
    expect(calls[0].url).toBe("https://api.inworld.ai/voices/v1/voices:clone");
    expect(calls[0].headers.Authorization).toBe("Basic testKey");
    const body = JSON.parse(String(calls[0].body));
    expect(body.displayName).toBe("matt");
    expect(body.voiceSamples).toEqual([{ audioData: "BAUG" }, { audioData: "BAUG" }]);
    expect(readClone("inworld")).toMatchObject({ voiceId: "ws__matt", model: "inworld-tts-2-flash" });
    const again = await run(["clone", "voice", "--apply"]);
    expect(again.out).toContain("already cloned on inworld");
    expect(calls.length).toBe(1);
  });

  test("clone voice --apply on Fish makes the model with Fish's own fields", async () => {
    const calls = withProvider([{ status: 201, body: { _id: "model123", state: "trained" } }, { status: 200, body: { _id: "model123", state: "trained" } }]);
    const r = await run(["clone", "voice", "--provider", "fishAudio", "--apply"]);
    expect(r.code).toBe(0);
    const form = calls[0].body as FormData;
    expect([form.get("type"), form.get("train_mode"), form.get("visibility")]).toEqual(["tts", "fast", "private"]);
    expect(readClone("fishAudio")?.voiceId).toBe("model123");
    expect(readClone("inworld")).toBeNull();
  });

  test("speak says the text with the clone on the cheapest model, and never takes an audio file", async () => {
    clone("inworld", "ws__matt", "inworld-tts-2-flash");
    const calls = withProvider([{ status: 200, body: { audioContent: Buffer.from("abcd").toString("base64") } }]);
    const r = await run(["clone", "speak", "--text", "yo whats good"]);
    expect(r.code).toBe(0);
    expect(calls[0].url).toBe("https://api.inworld.ai/tts/v1/voice");
    expect(JSON.parse(String(calls[0].body))).toEqual({ text: "yo whats good", voiceId: "ws__matt", modelId: "inworld-tts-2-flash", audioConfig: { audioEncoding: "MP3" } });
    const path = /log clone speak: (\S+)/.exec(r.out)?.[1] ?? "";
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path, "utf8")).toBe("abcd");
    expect((await run(["clone", "speak", "--text", "clip.ogg"])).err).toContain("voiceNoteInvalid");
    expect((await run(["clone", "speak", "--text", "yo", "--model", "s2.1-pro"])).err).toContain("voiceProviderUnknown");
    expect(calls.length).toBe(1);
  });

  test("speak without a clone, or without a key, sends nothing", async () => {
    const calls = withProvider([], null);
    expect((await run(["clone", "speak", "--text", "yo"])).err).toContain("voiceCloneMissing");
    clone("inworld", "ws__matt", "inworld-tts-2-flash");
    expect((await run(["clone", "speak", "--text", "yo"])).err).toContain("voiceKeyMissing");
    expect(calls).toEqual([]);
  });

  test("the accent and language come from LOG_VOICE_ACCENT and LOG_VOICE_LANGUAGE, Northern Irish and en-IE by default, en-GB the fallback (rule 145)", () => {
    expect(voiceSettingsOf({ LOG_VOICE_ACCENT: "Scottish", LOG_VOICE_LANGUAGE: "en-GB" })).toEqual({ accent: "Scottish", language: "en-GB", fallback: "en-GB" });
    expect(voiceSettingsOf({ LOG_VOICE_ACCENT: "Northern Irish", LOG_VOICE_LANGUAGE: "en-IE" })).toEqual({ accent: "Northern Irish", language: "en-IE", fallback: "en-GB" });
  });

  test("clone voice --apply sends the language, a description naming the accent and each sample's transcript", async () => {
    process.env.LOG_VOICE_ACCENT = "Northern Irish";
    process.env.LOG_VOICE_LANGUAGE = "en-IE";
    const calls = withProvider([{ status: 200, body: { voice: { voiceId: "ws__matt2", languageCode: "en-IE" } } }]);
    cloneDeps.transcript = () => "brother answer your phone";
    const r = await run(["clone", "voice", "--apply"]);
    expect(r.code).toBe(0);
    const body = JSON.parse(String(calls[0].body));
    expect(body.languageCode).toBe("en-IE");
    expect(body.description).toContain("Northern Irish accent");
    expect(body.voiceSamples).toEqual([{ audioData: "BAUG", transcription: "brother answer your phone" }, { audioData: "BAUG", transcription: "brother answer your phone" }]);
    expect(readClone("inworld")).toMatchObject({ voiceId: "ws__matt2", language: "en-IE", accent: "Northern Irish" });
  });

  test("when Inworld refuses en-IE as INVALID_ARGUMENT the clone is made in en-GB", async () => {
    process.env.LOG_VOICE_ACCENT = "Northern Irish";
    process.env.LOG_VOICE_LANGUAGE = "en-IE";
    const calls = withProvider([{ status: 400, body: { code: 3, message: "INVALID_ARGUMENT: unsupported language en-IE" } }, { status: 200, body: { voice: { voiceId: "ws__mattGb" } } }]);
    const r = await run(["clone", "voice", "--apply"]);
    expect(r.code).toBe(0);
    expect(calls.map((c) => JSON.parse(String(c.body)).languageCode)).toEqual(["en-IE", "en-GB"]);
    expect(readClone("inworld")).toMatchObject({ voiceId: "ws__mattGb", language: "en-GB" });
  });

  test("--replace makes the clone again and keeps the old voice id under previous", async () => {
    process.env.LOG_VOICE_LANGUAGE = "en-IE";
    clone("inworld", "ws__matt", "inworld-tts-2-flash");
    const calls = withProvider([{ status: 200, body: { voice: { voiceId: "ws__mattNew", languageCode: "en-IE" } } }]);
    const dry = await run(["clone", "voice", "--replace"]);
    expect(dry.out).toContain("would replace ws__matt");
    expect(calls).toEqual([]);
    const r = await run(["clone", "voice", "--apply", "--replace"]);
    expect(r.code).toBe(0);
    const kept = readClones().clones.inworld;
    expect(kept?.voiceId).toBe("ws__mattNew");
    expect(kept?.previous?.map((c) => c.voiceId)).toEqual(["ws__matt"]);
  });

  test("speak says it in the clone's language; only inworld-tts-2 gets the accent steer, which flash would ignore", async () => {
    writeClone({ provider: "inworld", voiceId: "ws__matt", title: "matt", model: "inworld-tts-2-flash", createdAt: "2026-11-05T00:00:00.000Z", state: "ready", references: [], language: "en-IE", accent: "Northern Irish" });
    const audio = { status: 200, body: { audioContent: Buffer.from("abcd").toString("base64") } };
    const calls = withProvider([audio, audio]);
    await run(["clone", "speak", "--text", "yo"]);
    await run(["clone", "speak", "--text", "yo", "--model", "inworld-tts-2"]);
    const [flash, full] = calls.map((c) => JSON.parse(String(c.body)));
    expect(flash).toMatchObject({ text: "yo", language: "en-IE", modelId: "inworld-tts-2-flash" });
    expect(full).toMatchObject({ text: "[say it in a Northern Irish accent] yo", language: "en-IE", modelId: "inworld-tts-2" });
    expect(accentSteerOf("inworld-tts-2-flash", "Northern Irish")).toBe("");
  });

  test("log fish is refused with the form it became", async () => {
    const r = await run(["fish", "speak", "--text", "yo"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("log clone speak --provider fishAudio --text yo");
  });
});
