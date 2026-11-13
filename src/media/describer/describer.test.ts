import { beforeEach, describe, expect, test } from "bun:test";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { chatContextOf } from "../../inbox/context/index.ts";
import { appendEvent, db, eventIdOf, vectorsFor } from "../../inbox/store/index.ts";
import { enqueueAttachments, enqueueMedia, kindOf, mediaLine, runDescriber } from "./index.ts";
import { QUEUE_LIMIT } from "./types.ts";

let dir = "";
beforeEach(() => {
  process.env.LOG_INBOX_STATE = mkdtempSync(join(tmpdir(), "describer"));
  dir = mkdtempSync(join(tmpdir(), "media"));
});

const file = (name: string) => {
  const path = join(dir, name);
  writeFileSync(path, "x");
  return path;
};

describe("one local model describes every image, meme and video (rule 138)", () => {
  test("media is sorted by what it is, and audio and files are never queued for the vision model", () => {
    expect(kindOf("a.png")).toBe("image");
    expect(kindOf("clip", "video/mp4")).toBe("video");
    expect(kindOf("x.gif")).toBe("gif");
    expect(kindOf("note.ogg")).toBe("audio");
    expect(enqueueMedia({ eventId: "e1", platform: "discord", account: "a", name: "note.ogg", path: file("note.ogg") })).toMatchObject({ kind: "audio", status: "notDescribed" });
    expect(enqueueMedia({ eventId: "e2", platform: "discord", account: "a", name: "pic.png", path: null })).toMatchObject({ status: "notDescribed", detail: "no local copy of the file yet" });
    expect(enqueueMedia({ eventId: "e3", platform: "discord", account: "a", name: "pic.png", path: file("pic.png") })).toMatchObject({ status: "pending" });
  });

  test("the queue is bounded: past it, media is marked not described yet and alerted, never dropped", () => {
    for (let i = 0; i < QUEUE_LIMIT; i++) enqueueMedia({ eventId: `e${i}`, platform: "slack", account: "a", name: `p${i}.png`, path: file(`p${i}.png`) });
    const over = enqueueMedia({ eventId: "over", platform: "slack", account: "a", name: "over.png", path: file("over.png") })!;
    expect(over.status).toBe("notDescribed");
    expect(mediaLine(over)).toContain("not described yet: the describer queue was full");
    expect(db().prepare("SELECT kind FROM alerts WHERE kind = 'mediaQueueFull'").all()).toHaveLength(1);
  });

  test("the one describer loads the model once, describes the queue in order, labels and embeds each, and a second is refused", async () => {
    enqueueMedia({ eventId: "e1", platform: "discord", account: "a", name: "meme.png", path: file("meme.png") });
    enqueueMedia({ eventId: "e2", platform: "discord", account: "a", name: "gone.png", path: join(dir, "missing.png") });
    let loads = 0;
    let rounds = 0;
    const run = await runDescriber({
      load: async () => (loads++, { model: "fakeVision", describe: async () => "a cat in sunglasses, text: deal with it" }),
      embed: async (texts) => texts.map(() => [1, 0]),
      embedModel: { model: "fakeEmbed", dimensions: 2 },
      sleep: async () => {},
      stopped: () => rounds++ > 3,
      memoryMb: () => 100,
    });
    expect(run).toEqual({ ok: true, described: 1 });
    expect(loads).toBe(1);
    const rows = db().prepare("SELECT name, status, description, model FROM media ORDER BY id").all();
    expect(rows).toEqual([{ name: "meme.png", status: "described", description: "image: a cat in sunglasses, text: deal with it", model: "fakeVision" }, { name: "gone.png", status: "failed", description: null, model: null }]);
    expect(vectorsFor("fakeEmbed", 2, ["image: a cat in sunglasses, text: deal with it"])[0]).not.toBeNull();
    db().prepare("UPDATE owners SET pid = ?, status = 'streaming' WHERE platform = 'model'").run(process.ppid);
    const second = await runDescriber({ load: async () => ({ model: "x", describe: async () => "" }) });
    expect(second.ok).toBe(false);
  });

  test("past its memory ceiling the describer stops loudly", async () => {
    const run = await runDescriber({ load: async () => ({ model: "m", describe: async () => "" }), sleep: async () => {}, memoryMb: () => 9999, ceilingMb: 10 });
    expect(run).toEqual({ ok: false, reason: "memory over 10 MB" });
    expect(db().prepare("SELECT kind FROM alerts WHERE kind = 'describerMemory'").all()).toHaveLength(1);
  });

  test("a message's media reaches its context, described or flagged as not described yet", () => {
    const message = { platform: "discord", account: "a", conversationId: "D1", with: "abby", text: "look at this", at: "2026-11-04T01:00:00Z", box: "dm", seenAt: "2026-11-04T01:00:01Z" };
    appendEvent({ platform: "discord", account: "a", conversationId: "D1", type: "message", with: "abby", text: message.text, sourceAt: message.at, receivedAt: message.seenAt, eventId: eventIdOf(message) });
    enqueueAttachments(message, [{ name: "clip.mp4", type: "video/mp4" }]);
    const [m] = chatContextOf("discord", "a", { conversationId: "D1" }).messages;
    expect(m.mediaLines).toEqual(["[video clip.mp4 not described yet: no local copy of the file yet]"]);
  });
});
