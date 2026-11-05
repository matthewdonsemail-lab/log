import { afterEach, describe, expect, test } from "bun:test";
import { copyFileSync, existsSync, readFileSync, rmSync } from "node:fs";
import { fishAudioProvider } from "../../extensions/fishAudio/index.ts";
import { inworldProvider } from "../../extensions/inworld/index.ts";
import { clonePath, paceOf, readClone, readClones, speedOf, voiceSettingsOf, voiceSteps, wordsOf, writeClone } from "../../extensions/voiceClone/index.ts";
import type { Recording, VoiceFetch, VoiceProvider } from "../../extensions/voiceClone/index.ts";
import { runCli } from "../runner/index.ts";
import { cloneDeps, namedRecordings } from "./index.ts";

const original = { ...cloneDeps };
const originalSteps = { ...voiceSteps };
let heardAs: (text: string) => string = (text) => text;
let lastText = "";
afterEach(() => {
  Object.assign(cloneDeps, original);
  Object.assign(voiceSteps, originalSteps);
  heardAs = (text) => text;
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
  voiceSteps.process = (from, to) => (copyFileSync(from, to), { ok: true });
  voiceSteps.encode = (from, to) => (copyFileSync(from, to), { ok: true });
  voiceSteps.listen = async () => ({ ok: true, words: wordsOf(heardAs(lastText)).map((text, i) => ({ text, start: i * 300, end: i * 300 + 200, confidence: 0.99 })) });
  return calls;
}

async function run(argv: string[]) {
  const at = argv.indexOf("--text");
  if (at >= 0) lastText = argv[at + 1];
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
    expect(readClone("inworld")).toMatchObject({ voiceId: "ws__matt", model: "inworld-tts-2" });
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
    expect(JSON.parse(String(calls[0].body))).toEqual({ text: "yo whats good", voiceId: "ws__matt", modelId: "inworld-tts-2-flash", audioConfig: { audioEncoding: "WAV", speakingRate: paceOf(1.15, "yo whats good") } });
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

  test("the accent and language come from LOG_VOICE_ACCENT and LOG_VOICE_LANGUAGE, Irish and en-IE by default, en-GB the fallback (rules 145, 147)", () => {
    expect(voiceSettingsOf({ LOG_VOICE_ACCENT: "Scottish", LOG_VOICE_LANGUAGE: "en-GB" })).toEqual({ accent: "Scottish", language: "en-GB", fallback: "en-GB", speed: 1.15 });
    expect(voiceSettingsOf({ LOG_VOICE_ACCENT: "Northern Irish", LOG_VOICE_LANGUAGE: "en-IE" })).toEqual({ accent: "Northern Irish", language: "en-IE", fallback: "en-GB", speed: 1.15 });
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

  test("speak says it in the clone's language with no accent steer; inworld-tts-2 gets breaths between phrases but never at the start, flash nothing (rules 147, 149)", async () => {
    writeClone({ provider: "inworld", voiceId: "ws__matt", title: "matt", model: "inworld-tts-2-flash", createdAt: "2026-11-05T00:00:00.000Z", state: "ready", references: [], language: "en-IE", accent: "Irish" });
    const audio = { status: 200, body: { audioContent: Buffer.from("abcd").toString("base64") } };
    const calls = withProvider([audio, audio]);
    const said = "yo whats the craic. ye im good bro, been locked in building the whole thing all week long. it posts and replies on its own on every platform now. call me later.";
    await run(["clone", "speak", "--text", said]);
    await run(["clone", "speak", "--text", said, "--model", "inworld-tts-2"]);
    const [flash, full] = calls.map((c) => JSON.parse(String(c.body)));
    expect(flash).toMatchObject({ text: said, language: "en-IE", modelId: "inworld-tts-2-flash" });
    expect(full).toMatchObject({ language: "en-IE", modelId: "inworld-tts-2" });
    expect(full.text.startsWith("[breathe]")).toBe(false);
    expect(full.text).toContain("[breathe]");
    expect(full.text.replace(/\[breathe\] /g, "")).toBe(said);
  });

  test("a lexicon word is written the way the clone says it right, and a note that says it wrong is refused (rule 147)", async () => {
    clone("inworld", "ws__matt", "inworld-tts-2-flash");
    const audio = { status: 200, body: { audioContent: Buffer.from("abcd").toString("base64") } };
    const calls = withProvider([audio, audio]);
    const ok = await run(["clone", "speak", "--text", "its actually so op when it works"]);
    expect(ok.code).toBe(0);
    expect(JSON.parse(String(calls[0].body)).text).toBe("its actually so OP when it works");
    heardAs = (text) => text.replace("op", "up");
    const wrong = await run(["clone", "speak", "--text", "its actually so op when it works"]);
    expect(wrong.code).not.toBe(0);
    expect(wrong.err).toContain("spokenMismatch");
    expect(wrong.err).toContain('"op" was heard as "up"');
  });

  test("an acronym not in the lexicon is refused before anything is spoken (rule 147)", async () => {
    clone("inworld", "ws__matt", "inworld-tts-2-flash");
    const calls = withProvider([]);
    const r = await run(["clone", "speak", "--text", "we got into YC bro"]);
    expect(r.err).toContain("pronunciationUnknown");
    expect(r.err).toContain('"YC"');
    expect(calls).toEqual([]);
  });

  test("log fish is refused with the form it became", async () => {
    const r = await run(["fish", "speak", "--text", "yo"]);
    expect(r.code).toBe(1);
    expect(r.err).toContain("log clone speak --provider fishAudio --text yo");
  });
});

describe("matt's own recordings and how fast his clone talks (rule 146)", () => {
  test("--from takes his own recordings, each one's words from the .txt beside it", () => {
    const named = namedRecordings(["C:/clips/cap1.wav", "C:/clips/cap2.wav"], (path) => (path.endsWith("1.wav") ? 14 : 11.6));
    expect(named).toEqual([{ path: "C:/clips/cap1.wav", platform: "file", account: "matt", conversationId: "", messageId: "cap1.wav", seconds: 14 }, { path: "C:/clips/cap2.wav", platform: "file", account: "matt", conversationId: "", messageId: "cap2.wav", seconds: 11.6 }]);
    expect(namedRecordings(["C:/clips/notAudio.txt"], () => null)).toContain("isn't an audio file");
  });

  test("the speed is LOG_VOICE_SPEED, 1.15 by default, kept between 0.8 and 1.5", () => {
    expect(speedOf(null)).toBe(1.15);
    expect(speedOf("1.3")).toBe(1.3);
    expect(speedOf("3")).toBe(1.5);
    expect(speedOf("0.2")).toBe(0.8);
    expect(speedOf("fast")).toBe(1.15);
  });
});
