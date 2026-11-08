import { beforeEach, describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../cli/runner/index.ts";
import { db } from "../../inbox/store/index.ts";
import { hashOf } from "../voiceNotes/client.ts";
import { writeTranscript } from "../voiceNotes/helpers/store.ts";
import { describeRow, describeWith, enqueueMedia, mediaLine, mediaView, nextMedia, spansOf, speechIn, timelineOf } from "./index.ts";
import type { Describer, MediaRow, Transcriber } from "./types.ts";

const hasFfmpeg = spawnSync("ffmpeg", ["-version"], { windowsHide: true }).status === 0;

let mediaDir = "";
beforeEach(() => {
  process.env.LOG_INBOX_STATE = mkdtempSync(join(tmpdir(), "understanding"));
  mediaDir = join(mkdtempSync(join(tmpdir(), "spool")), "discord", "a", "media", "D1");
  mkdirSync(mediaDir, { recursive: true });
});

const ffmpeg = (args: string[]) => expect(spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { windowsHide: true }).status).toBe(0);
const row = (id: number) => db().prepare("SELECT * FROM media WHERE id = ?").get(id) as MediaRow;

const seen: (string | Uint8Array)[] = [];
const vision: Describer = { model: "fakeVision", describe: async (input) => (seen.push(input), `scene ${seen.length}`) };

describe("media becomes text any model reads, kept small in log.db (rule 169)", () => {
  test("scene cuts become spans: too-close cuts are dropped and at most the limit is kept", () => {
    expect(spansOf([], 10)).toEqual([{ start: 0, end: 10 }]);
    expect(spansOf([0.5, 4, 4.3, 9.7], 10)).toEqual([{ start: 0, end: 4 }, { start: 4, end: 10 }]);
    expect(spansOf([2, 4, 6, 8], 10, 3)).toHaveLength(3);
  });

  test("speech is placed in the scene it was said in, and the timeline reads as screen and speech", () => {
    const words = [{ text: "hello", start: 500, end: 800 }, { text: "there", start: 4500, end: 4800 }];
    expect(speechIn(words, { start: 0, end: 4 }, false)).toBe("hello");
    expect(speechIn(words, { start: 4, end: 6 }, true)).toBe("there");
    expect(timelineOf([{ start: 0, end: 4, screen: "a red card", speech: "hello" }, { start: 4, end: 6, screen: "a blue card", speech: "" }])).toBe('[0:00-0:04] screen: a red card | speech: "hello" · [0:04-0:06] screen: a blue card | speech: none');
  });

  test("describers are tried in order and the next one is used when one fails", async () => {
    const broken: Describer = { model: "down", describe: async () => { throw new Error("timeout"); } };
    const working: Describer = { model: "up", describe: async () => "a cat" };
    expect(await describeWith([broken, working], "x.png")).toMatchObject({ text: "a cat", model: "up" });
    expect(describeWith([broken], "x.png")).rejects.toThrow("no describer could describe it (down: timeout)");
  });

  test("a voice note shows what was said once it is transcribed", () => {
    const path = join(mediaDir, "note.ogg");
    writeFileSync(path, "audio bytes");
    writeTranscript({ hash: hashOf(readFileSync(path)), text: "see you at six", languageCode: "en", seconds: 14, transcriptId: "t1", file: "note.ogg", transcribedAt: "2026-11-08T00:00:00Z" });
    const audio = enqueueMedia({ eventId: "e1", platform: "discord", account: "a", name: "note.ogg", path })!;
    expect(mediaLine(audio)).toBe('[audio note.ogg 0:14: "see you at six"]');
  });

  test.skipIf(!hasFfmpeg)("an image keeps a small preview, is described, its downloaded file is removed, and it can be described again from the preview", async () => {
    const path = join(mediaDir, "card.png");
    ffmpeg(["-f", "lavfi", "-i", "color=c=red:s=640x480", "-frames:v", "1", path]);
    const queued = enqueueMedia({ eventId: "e2", platform: "discord", account: "a", name: "card.png", path })!;
    seen.length = 0;
    await describeRow(queued, { describers: [vision] });
    const done = row(queued.id);
    expect(done.status).toBe("described");
    expect(done.description).toBe("image: scene 1");
    expect([...new Uint8Array(done.preview!).slice(0, 2)]).toEqual([0xff, 0xd8]);
    expect(done.width).toBe(640);
    expect(existsSync(path)).toBe(false);
    expect(done.fileRemovedAt).not.toBeNull();
    expect(mediaLine(done)).toBe(`[image card.png: image: scene 1] (picture: media view ${done.id})`);
    db().prepare("UPDATE media SET status = 'pending' WHERE id = ?").run(done.id);
    await describeRow(row(done.id), { describers: [vision] });
    expect(row(done.id).description).toBe("image: scene 2 (described from its kept preview)");
    expect(seen[1]).toBeInstanceOf(Uint8Array);
    const view = mediaView(done.id)!;
    expect(view.image?.mimeType).toBe("image/jpeg");
    const images: string[] = [];
    const out: string[] = [];
    expect(await runCli(["media", "view", String(done.id)], { image: (data) => images.push(data), out: (l) => out.push(l), err: () => {} })).toBe(0);
    expect(images).toEqual([view.image!.data]);
    expect(out.join("\n")).toContain("returned as an image");
  });

  test.skipIf(!hasFfmpeg)("a silent video is told scene by scene from what is on screen, and a video with sound gets what was said in each scene", async () => {
    const silent = join(mediaDir, "motion.mp4");
    ffmpeg(["-f", "lavfi", "-i", "color=c=red:s=320x240:d=3", "-f", "lavfi", "-i", "color=c=blue:s=320x240:d=3", "-filter_complex", "[0][1]concat=n=2:v=1:a=0", "-pix_fmt", "yuv420p", silent]);
    const first = enqueueMedia({ eventId: "e3", platform: "discord", account: "a", name: "motion.mp4", type: "video/mp4", path: silent })!;
    seen.length = 0;
    await describeRow(first, { describers: [vision] });
    const told = row(first.id);
    expect(told.description).toBe('video 0:06, 2 scenes, no sound: [0:00-0:03] screen: scene 1 | speech: none · [0:03-0:06] screen: scene 2 | speech: none');
    expect(JSON.parse(told.scenes!)).toHaveLength(2);
    expect(told.durationMs).toBeGreaterThan(5000);
    expect(told.preview).not.toBeNull();
    expect(existsSync(silent)).toBe(false);

    const loud = join(mediaDir, "talk.mp4");
    ffmpeg(["-f", "lavfi", "-i", "color=c=green:s=320x240:d=4", "-f", "lavfi", "-i", "sine=frequency=440:duration=4", "-shortest", "-pix_fmt", "yuv420p", loud]);
    const heard: Uint8Array[] = [];
    const ears: Transcriber = { model: "fakeEars", transcribe: async (bytes) => (heard.push(bytes), { text: "welcome to the demo", words: [{ text: "welcome", start: 100, end: 400 }, { text: "to", start: 500, end: 600 }, { text: "the", start: 700, end: 800 }, { text: "demo", start: 900, end: 1200 }], model: "fakeEars" }) };
    const second = enqueueMedia({ eventId: "e4", platform: "discord", account: "a", name: "talk.mp4", type: "video/mp4", path: loud })!;
    await describeRow(second, { describers: [vision], transcriber: ears });
    const spoken = row(second.id);
    expect(heard).toHaveLength(1);
    expect(spoken.transcript).toBe("welcome to the demo");
    expect(spoken.description).toContain('speech: "welcome to the demo"');
    expect(JSON.parse(spoken.providers!)).toEqual(["fakeEars", "fakeVision"]);
  });

  test("a local file a person asked about is never deleted, and an item the queue was too full for is described when there is room", async () => {
    const path = join(mkdtempSync(join(tmpdir(), "mine")), "mine.png");
    writeFileSync(path, "x");
    const local = enqueueMedia({ eventId: "file:mine", platform: "local", account: "", name: "mine.png", path })!;
    await describeRow(local, { describers: [vision] }).catch(() => {});
    expect(existsSync(path)).toBe(true);
    db().prepare("UPDATE media SET status = 'notDescribed', detail = 'the describer queue was full (20 waiting); it is described when the queue has room' WHERE id = ?").run(local.id);
    expect(nextMedia()?.id).toBe(local.id);
  });
});
