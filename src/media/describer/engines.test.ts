import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const python = process.env.LOG_PYTHON || "python";
const root = join(import.meta.dir, "..", "..", "..", "python");

function run(script: string): unknown {
  const out = spawnSync(python, ["-c", `import sys, json; sys.path.insert(0, ${JSON.stringify(root)})\n${script}`], { encoding: "utf8", env: { ...process.env, PYTHONUTF8: "1" } });
  if (out.status !== 0) throw new Error(out.stderr);
  return JSON.parse(out.stdout);
}

describe("the engines keep a local copy of what the describer needs (rule 139)", () => {
  test("images and videos are visual, audio and documents are not", () => {
    const got = run(`from platformKit import media
print(json.dumps([media.is_visual(a) for a in [{"name": "a.png"}, {"name": "x", "type": "video/mp4"}, {"name": "v.ogg", "type": "audio/ogg"}, {"name": "clip.webm", "type": "video/webm"}, {"name": "doc.pdf"}]]))`);
    expect(got).toEqual([true, true, false, true, false]);
  });

  test("Instagram's realtime item names its image, video or gif to keep", () => {
    if (spawnSync(python, ["-c", "import instagrapi"], { encoding: "utf8" }).status !== 0) return;
    const got = run(`from instagramApi import engine
items = [
  {"item_id": "1", "item_type": "media", "media": {"image_versions2": {"candidates": [{"url": "https://cdn/p.jpg"}]}}},
  {"item_id": "2", "item_type": "raven_media", "visual_media": {"media": {"video_versions": [{"url": "https://cdn/v.mp4"}]}}},
  {"item_id": "3", "item_type": "animated_media", "animated_media": {"images": {"fixed_height": {"url": "https://cdn/g.gif"}}}},
  {"item_id": "4", "item_type": "text", "text": "yo"},
]
print(json.dumps([engine.media_ref_of(i) for i in items]))`);
    expect(got).toEqual([{ url: "https://cdn/p.jpg", name: "1.jpg", type: "image/jpeg" }, { url: "https://cdn/v.mp4", name: "2.mp4", type: "video/mp4" }, { url: "https://cdn/g.gif", name: "3.gif", type: "image/gif" }, null]);
  });
});
