import { afterEach, describe, expect, test } from "bun:test";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { clonePath, createFishClient, readClone, writeClone } from "../../extensions/fishAudio/index.ts";
import type { FishFetch, Recording } from "../../extensions/fishAudio/index.ts";
import { runCli } from "../runner/index.ts";
import { fishDeps } from "./index.ts";

const original = { ...fishDeps };
afterEach(() => {
  Object.assign(fishDeps, original);
  rmSync(clonePath(), { force: true });
});

const rec = (messageId: string, seconds: number): Recording => ({ path: `C:/x/${messageId}_voice-message.ogg`, platform: "discord", account: "mattDiscord", conversationId: "1", messageId, seconds });

function withFish(answers: { status: number; body?: unknown; bytes?: number }[]) {
  const calls: { url: string; method: string; headers: Record<string, string>; body?: unknown }[] = [];
  const fetcher: FishFetch = async (url, init) => {
    calls.push({ url, ...init });
    const a = answers.shift() ?? { status: 500 };
    return { status: a.status, json: async () => a.body ?? {}, arrayBuffer: async () => new Uint8Array(a.bytes ?? 0).buffer };
  };
  fishDeps.client = () => createFishClient("fishTestKey", fetcher);
  fishDeps.read = () => new Uint8Array([1, 2, 3]);
  return calls;
}

async function run(argv: string[]) {
  const out: string[] = [];
  const err: string[] = [];
  const code = await runCli(argv, { out: (l) => out.push(l), err: (l) => err.push(l) });
  return { code, out: out.join("\n"), err: err.join("\n") };
}

describe("log fish (rule 142)", () => {
  test("clone without --apply lists matt's own recordings, shortest first up to 60 s, and calls nothing", async () => {
    const calls = withFish([]);
    fishDeps.recordings = () => [rec("a", 271.9), rec("b", 34.1), rec("c", 8.5), rec("d", 15.9), rec("e", 2)];
    const r = await run(["fish", "clone"]);
    expect(r.code).toBe(0);
    expect(r.out).toContain("dry run");
    expect(r.out).toContain("message c");
    expect(r.out).toContain("message d");
    expect(r.out).toContain("message b");
    expect(r.out).not.toContain("message a");
    expect(r.out).not.toContain("message e");
    expect(calls).toEqual([]);
  });

  test("too little of his own voice is refused", async () => {
    withFish([]);
    fishDeps.recordings = () => [rec("c", 6)];
    const r = await run(["fish", "clone", "--apply"]);
    expect(r.err + r.out).toContain("voiceRecordingsMissing");
  });

  test("clone --apply makes the model once with Fish's own fields and keeps its id", async () => {
    const calls = withFish([{ status: 201, body: { _id: "model123", title: "matt", state: "trained" } }, { status: 200, body: { _id: "model123", title: "matt", state: "trained" } }]);
    fishDeps.recordings = () => [rec("c", 8.5), rec("d", 15.9)];
    const r = await run(["fish", "clone", "--apply"]);
    expect(r.code).toBe(0);
    expect(calls[0].url).toBe("https://api.fish.audio/model");
    expect(calls[0].headers.Authorization).toBe("Bearer fishTestKey");
    const form = calls[0].body as FormData;
    expect([form.get("type"), form.get("train_mode"), form.get("visibility")]).toEqual(["tts", "fast", "private"]);
    expect(form.getAll("voices").length).toBe(2);
    expect(calls[1].url).toBe("https://api.fish.audio/model/model123");
    expect(readClone()?.modelId).toBe("model123");
    expect(readClone()?.model).toBe("s2.1-pro-free");
    const again = await run(["fish", "clone", "--apply"]);
    expect(again.out).toContain("already cloned");
    expect(calls.length).toBe(2);
  });

  test("speak says the text with the clone on the free model and writes a file, never an audio file as input", async () => {
    writeClone({ modelId: "model123", title: "matt", model: "s2.1-pro-free", createdAt: "2026-11-05T00:00:00.000Z", state: "trained", references: [] });
    const calls = withFish([{ status: 200, bytes: 64 }]);
    const r = await run(["fish", "speak", "--text", "yo whats good"]);
    expect(r.code).toBe(0);
    expect(calls[0].url).toBe("https://api.fish.audio/v1/tts");
    expect(calls[0].headers.model).toBe("s2.1-pro-free");
    expect(JSON.parse(String(calls[0].body))).toMatchObject({ text: "yo whats good", reference_id: "model123", format: "mp3" });
    const path = /log fish speak: (\S+)/.exec(r.out)?.[1] ?? "";
    expect(existsSync(path)).toBe(true);
    expect(readFileSync(path).length).toBe(64);
    const file = await run(["fish", "speak", "--text", "clip.ogg"]);
    expect(file.err + file.out).toContain("voiceNoteInvalid");
    expect(calls.length).toBe(1);
  });

  test("speak without a clone, or without a key, sends nothing", async () => {
    const calls = withFish([]);
    const noClone = await run(["fish", "speak", "--text", "yo"]);
    expect(noClone.err + noClone.out).toContain("voiceCloneMissing");
    writeClone({ modelId: "model123", title: "matt", model: "s2.1-pro-free", createdAt: "2026-11-05T00:00:00.000Z", state: "trained", references: [] });
    fishDeps.client = () => createFishClient(null);
    const noKey = await run(["fish", "speak", "--text", "yo"]);
    expect(noKey.err + noKey.out).toContain("fishKeyMissing");
    expect(calls).toEqual([]);
  });
});
