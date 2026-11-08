import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { clonePath, forgetClones, voiceNotesDir, writeClone } from "../../extensions/voiceClone/index.ts";
import type { Rendered, VoiceNotePlatform, VoiceProvider } from "../../extensions/voiceClone/index.ts";
import type { PlatformEngineRun, PlatformEngineSpec } from "../../platformKit/session/index.ts";
import { marketplaceFixture } from "../../twenty/graphql/index.ts";
import { runCli } from "../runner/index.ts";
import { gateDeps } from "../twitter/helpers/voice.ts";
import { voiceNoteDeps } from "./index.ts";

const CHANNEL = "1434928149904228392";
const originalRender = voiceNoteDeps.render;
const originalGate = gateDeps.gate;
let rendered: string[] = [];
let gated: string[] = [];
let gateRefuses = false;

function fixture() {
  const twenty = marketplaceFixture();
  twenty.rows.socialAccounts!.push({ id: "discordOne", accountName: "discordOne", platform: "DISCORD", cookies: [], storageOrigins: [{ origin: "https://discord.com", localStorage: [{ name: "token", value: JSON.stringify("x".repeat(30)) }] }], proxy: null } as never);
  twenty.rows.socialAccounts!.push({ id: "instagramOne", accountName: "instagramOne", platform: "INSTAGRAM", cookies: { sessionid: "x".repeat(20), ds_user_id: "x".repeat(20), csrftoken: "x".repeat(20) }, proxy: null } as never);
  twenty.rows.socialAccounts!.push({ id: "slackOne", accountName: "slackOne", platform: "SLACK", cookies: { d: "x".repeat(20) }, proxy: null } as never);
  twenty.rows.socialAccounts!.push({ id: "xOne", accountName: "xOne", platform: "TWITTER", cookies: { auth_token: "x".repeat(40), ct0: "y".repeat(40) }, messengerPin: "2580", proxy: null } as never);
  twenty.rows.socialAccounts!.push({ id: "xNoPin", accountName: "xNoPin", platform: "TWITTER", cookies: { auth_token: "x".repeat(40), ct0: "y".repeat(40) }, proxy: null } as never);
  return twenty;
}

async function run(argv: string[], answer: PlatformEngineRun["answer"] = { ok: false, code: "notExpected" }) {
  const out: string[] = [];
  const err: string[] = [];
  const specs: PlatformEngineSpec[] = [];
  const engine = (_account: unknown, spec: PlatformEngineSpec) => {
    specs.push(spec);
    return { answer, refreshed: null };
  };
  const code = await runCli(argv, { twenty: fixture(), out: (l) => out.push(l), err: (l) => err.push(l), directDiscord: engine, directInstagram: engine, directSlack: engine, directTwitter: engine as never });
  return { code, out: out.join("\n"), err: err.join("\n"), specs };
}

beforeEach(() => {
  rendered = [];
  gated = [];
  gateRefuses = false;
  gateDeps.gate = async (_context, send) => {
    gated.push(send.text);
    return gateRefuses ? { ok: false, refused: "the gate graded it as typed text" } : { ok: true, line: "voice gate passed" };
  };
  voiceNoteDeps.render = async (provider: VoiceProvider, platform: VoiceNotePlatform, text: string, language?: string): Promise<Rendered> => {
    rendered.push(`${provider}:${platform}:${text}${language ? `:${language}` : ""}`);
    return { ok: true, note: { path: join(voiceNotesDir(), `note${platform === "discord" ? ".ogg" : ".m4a"}`), platform, seconds: 2.5, waveform: "AAAA", levels: [0.5, 1], provider, model: "inworld-tts-2-flash" } };
  };
  writeClone({ provider: "inworld", voiceId: "ws__matt", title: "matt", model: "inworld-tts-2-flash", createdAt: "2026-11-05T00:00:00.000Z", state: "ready", references: [] });
});

afterEach(() => {
  voiceNoteDeps.render = originalRender;
  gateDeps.gate = originalGate;
  forgetClones();
});

describe("log discord|instagram|slack voice (rule 142)", () => {
  test("without --live it is a dry run: nothing is generated and the engine is never called", async () => {
    for (const argv of [["discord", "voice", "--account", "discordOne", "--channel", CHANNEL], ["instagram", "voice", "--account", "instagramOne", "--with", "someone"], ["slack", "voice", "--account", "slackOne", "--chat", "D0123456789"]]) {
      const r = await run([...argv, "--text", "yo how was the gym"]);
      expect(r.code).toBe(0);
      expect(r.out).toContain("dry run");
      expect(r.out).toContain("yo how was the gym");
      expect(r.specs).toEqual([]);
    }
    expect(rendered).toEqual([]);
  });

  test("--live needs --approvedBy, calling nothing", async () => {
    const r = await run(["discord", "voice", "--account", "discordOne", "--channel", CHANNEL, "--text", "yo", "--live"]);
    expect(r.code).toBe(1);
    expect(r.err + r.out).toContain("notApproved");
    expect(r.specs).toEqual([]);
    expect(rendered).toEqual([]);
  });

  test("an audio file is never accepted: not as the text, and there is no flag for one", async () => {
    mkdirSync(voiceNotesDir(), { recursive: true });
    const existing = join(voiceNotesDir(), "theirs.txt");
    writeFileSync(existing, "x");
    for (const text of ["C:/Users/0/clip.ogg", "voice_123.m4a", existing]) {
      const r = await run(["discord", "voice", "--account", "discordOne", "--channel", CHANNEL, "--text", text, "--approvedBy", "matt", "--live"]);
      expect(r.err + r.out).toContain("voiceNoteInvalid");
    }
    const flag = await run(["discord", "voice", "--account", "discordOne", "--channel", CHANNEL, "--text", "yo", "--audio", "clip.ogg"]);
    expect(flag.code).toBe(1);
    expect(rendered).toEqual([]);
  });

  test("--live with no clone is refused before anything is made", async () => {
    forgetClones();
    const r = await run(["discord", "voice", "--account", "discordOne", "--channel", CHANNEL, "--text", "yo", "--approvedBy", "matt", "--live"]);
    expect(r.err + r.out).toContain("voiceCloneMissing");
    expect(rendered).toEqual([]);
    expect(r.specs).toEqual([]);
  });

  test("--live makes it from the text and hands the engine its own file, waveform and duration", async () => {
    const r = await run(["discord", "voice", "--account", "discordOne", "--channel", CHANNEL, "--text", "yo how was the gym", "--approvedBy", "matt", "--live"], { ok: true, event: "sent", loginState: "loggedIn", messageId: "99" });
    expect(r.code).toBe(0);
    expect(rendered).toEqual(["inworld:discord:yo how was the gym"]);
    expect(r.specs).toEqual([{ action: "voice", channel: CHANNEL, path: join(voiceNotesDir(), "note.ogg"), seconds: 2.5, waveform: "AAAA", live: true, approvedBy: "matt" }]);
    expect(r.out).toContain("voice note in matt's voice (message 99)");
    const ig = await run(["instagram", "voice", "--account", "instagramOne", "--with", "someone", "--text", "yo", "--approvedBy", "matt", "--live"], { ok: true, event: "sent", loginState: "loggedIn" });
    expect(ig.specs[0]).toMatchObject({ action: "voice", with: "someone", levels: [0.5, 1] });
    const slack = await run(["slack", "voice", "--account", "slackOne", "--chat", "D0123456789", "--text", "yo", "--approvedBy", "matt", "--live"], { ok: true, event: "sent", loginState: "loggedIn" });
    expect(slack.specs[0]).toMatchObject({ action: "voice", chat: "D0123456789" });
  });

  test("--provider picks who says it, and the clone must be on that provider", async () => {
    const r = await run(["discord", "voice", "--account", "discordOne", "--channel", CHANNEL, "--text", "yo", "--provider", "fishAudio", "--approvedBy", "matt", "--live"]);
    expect(r.err + r.out).toContain("voiceCloneMissing");
    expect(rendered).toEqual([]);
  });

  test("a refusal is said with its code and nothing is retried", async () => {
    const r = await run(["discord", "voice", "--account", "discordOne", "--channel", CHANNEL, "--text", "yo", "--approvedBy", "matt", "--live"], { ok: false, code: "voiceNoteRefused", detail: "Discord refused it" });
    expect(r.code).toBe(1);
    expect(r.out).toContain("voiceNoteRefused");
    expect(r.specs.length).toBe(1);
  });

  test("an X voice note is a dry run without --live and contacts nothing", async () => {
    const r = await run(["twitter", "voice", "--account", "xOne", "--with", "@AjeetVermai", "--text", "yo"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("dry run");
    expect(r.specs.length).toBe(0);
    expect(rendered.length).toBe(0);
  });

  test("an X voice note goes to the engine as xchatVoice with the handle, the file, its seconds and the saved PIN (rule 151)", async () => {
    const r = await run(["twitter", "voice", "--account", "xOne", "--with", "@AjeetVermai", "--text", "yo", "--approvedBy", "matt", "--live"], { ok: true, event: "sent", mode: "xchatVoice", messageId: "m1" });
    expect(r.code).toBe(0);
    expect(rendered).toEqual(["inworld:twitter:yo"]);
    expect(r.specs).toHaveLength(1);
    expect(r.specs[0]).toMatchObject({ action: "xchatVoice", screenName: "AjeetVermai", seconds: 2.5, live: true, approvedBy: "matt", chatPin: "2580" });
    expect(String(r.specs[0]!.path)).toEndWith(".m4a");
  });

  test("an X voice note without a saved X Chat PIN is refused before anything is made", async () => {
    const r = await run(["twitter", "voice", "--account", "xNoPin", "--with", "123456789", "--text", "yo", "--approvedBy", "matt", "--live"]);
    expect(r.code).not.toBe(0);
    expect(r.out + r.err).toContain("xchatPinMissing");
    expect(r.specs.length).toBe(0);
  });
});

const MATTS_WORDS = "my phone screen is broken the phone is fine like theres two big green lines going down the side of it and that but it still works thank the lord";

describe("--mattsWords: matt's own dictated words (rule 144)", () => {
  test("a dry run with --mattsWords says the gate's read is skipped and calls nothing", async () => {
    const r = await run(["discord", "voice", "--account", "discordOne", "--channel", CHANNEL, "--text", MATTS_WORDS, "--mattsWords"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("dry run");
    expect(r.out).toContain("--mattsWords");
    expect(r.specs).toEqual([]);
    expect(rendered).toEqual([]);
    expect(gated).toEqual([]);
  });

  test("live with --mattsWords never calls the voice gate, and sends his words", async () => {
    const r = await run(["discord", "voice", "--account", "discordOne", "--channel", CHANNEL, "--text", MATTS_WORDS, "--mattsWords", "--approvedBy", "matt", "--live"], { ok: true, event: "sent", loginState: "loggedIn", messageId: "1567811929500811294" });
    expect(r.code).toBe(0);
    expect(gated).toEqual([]);
    expect(rendered).toEqual([`inworld:discord:${MATTS_WORDS}`]);
    expect(r.specs[0]).toMatchObject({ action: "voice", channel: CHANNEL });
  });

  test("without --mattsWords the voice gate still runs while the note is said, and its refusal stops the send", async () => {
    gateRefuses = true;
    const r = await run(["discord", "voice", "--account", "discordOne", "--channel", CHANNEL, "--text", MATTS_WORDS, "--approvedBy", "matt", "--live"], { ok: true, event: "sent", loginState: "loggedIn" });
    expect(r.code).toBe(1);
    expect(r.err + r.out).toContain("voiceGateFailed");
    expect(gated).toEqual([MATTS_WORDS]);
    expect(rendered).toEqual([`inworld:discord:${MATTS_WORDS}`]);
    expect(r.specs).toEqual([]);
  });

  test("--translationOf gates the original words and speaks the translation in --language (rule 148)", async () => {
    const original = "this is what im on about bro";
    const chinese = "兄弟，这就是我说的那个";
    const r = await run(["discord", "voice", "--account", "discordOne", "--channel", CHANNEL, "--text", chinese, "--translationOf", original, "--language", "zh-CN", "--approvedBy", "matt", "--live"], { ok: true, event: "sent", loginState: "loggedIn", messageId: "1" });
    expect(r.code).toBe(0);
    expect(gated).toEqual([original]);
    expect(rendered).toEqual([`inworld:discord:${chinese}:zh-CN`]);
  });

  test("--translationOf needs --language, can't be paired with --mattsWords, and refuses a bad code, calling nothing", async () => {
    const base = ["discord", "voice", "--account", "discordOne", "--channel", CHANNEL, "--text", "兄弟", "--approvedBy", "matt", "--live"];
    for (const extra of [["--translationOf", "bro"], ["--translationOf", "bro", "--language", "zh-CN", "--mattsWords"], ["--language", "chinese"]]) {
      const r = await run([...base, ...extra], { ok: true, event: "sent", loginState: "loggedIn" });
      expect(r.code).not.toBe(0);
      expect(r.err + r.out).toContain("voiceNoteInvalid");
    }
    expect(gated).toEqual([]);
    expect(rendered).toEqual([]);
  });

  test("AI artifacts are still refused with --mattsWords", async () => {
    const r = await run(["discord", "voice", "--account", "discordOne", "--channel", CHANNEL, "--text", "my phone​ screen is broken", "--mattsWords", "--approvedBy", "matt", "--live"], { ok: true, event: "sent", loginState: "loggedIn" });
    expect(r.code).toBe(1);
    expect(r.err + r.out).toContain("aiArtifacts");
    expect(gated).toEqual([]);
    expect(rendered).toEqual([]);
    expect(r.specs).toEqual([]);
  });
});

const python = process.env.LOG_PYTHON || "python";
const root = join(import.meta.dir, "..", "..", "..", "python");

function py(script: string): unknown {
  const out = spawnSync(python, ["-c", `import sys, json; sys.path.insert(0, ${JSON.stringify(root)})\n${script}`], { encoding: "utf8", env: { ...process.env, PYTHONUTF8: "1" } });
  if (out.status !== 0) throw new Error(out.stderr);
  return JSON.parse(out.stdout);
}

describe("the engines' voice writes", () => {
  test("each refuses audio log didn't make before calling the platform, and counts voice as a write", () => {
    mkdirSync(voiceNotesDir(), { recursive: true });
    const made = join(voiceNotesDir(), "made.m4a");
    writeFileSync(made, "x");
    const outside = join(voiceNotesDir(), "..", "outside.m4a");
    writeFileSync(outside, "x");
    const got = py(`import asyncio
from discordApi import engine as discord
from instagramApi import engine as instagram
from slackApi import engine as slack
from platformKit import media
made, outside = ${JSON.stringify(made)}, ${JSON.stringify(outside)}
print(json.dumps([
  asyncio.run(discord.voice({"channel": "${CHANNEL}", "path": outside.replace(".m4a", ".ogg"), "seconds": 2, "waveform": "AA"}, {"token": "t"}))["code"],
  asyncio.run(discord.voice({"channel": "${CHANNEL}", "path": made, "seconds": 2, "waveform": "AA"}, {"token": "t"}))["code"],
  asyncio.run(instagram.voice({"with": "someone", "path": outside}, {"sessionid": "s"}))["code"],
  asyncio.run(slack.voice({"chat": "D1", "path": outside}, {"d": "d"}))["code"],
  media.voice_note_path(made, ".m4a") is not None,
  media.voice_note_path(outside, ".m4a") is None,
  all("voice" in e.WRITES for e in (discord, instagram, slack)),
]))`);
    expect(got).toEqual(["voiceNoteInvalid", "voiceNoteInvalid", "voiceNoteInvalid", "voiceNoteInvalid", true, true, true]);
    rmSync(outside, { force: true });
  });
});
