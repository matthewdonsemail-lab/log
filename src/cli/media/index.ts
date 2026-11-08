import { existsSync } from "node:fs";
import { basename, resolve } from "node:path";
import { db } from "../../inbox/store/index.ts";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describerEnv } from "../../inbox/watch/index.ts";
import { enqueueMedia, mediaLine, mediaView } from "../../media/describer/index.ts";
import type { MediaRow } from "../../media/describer/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const MEDIA_USAGE = [
  "Usage: log media describer [--json]",
  "       log media describe <path> [--wait <seconds>] [--json]",
  "       log media status [--json]",
  "       log media view <id> [--json]",
  "Every image, meme, gif and video sent or received becomes text any model can read, kept in log.db with a small preview (rules 138, 168). describer is the one warm process per machine (the session hook starts it; a second is refused): it loads the vision model once (onnx-community/LFM2.5-VL-450M-ONNX, q4, on this machine's transformers.js, the first of an ordered list that falls back to the next), takes one item at a time from a queue of at most 20 (the overflow waits and is described when there is room), and for each keeps its size, length, hash and a small JPEG preview (a contact sheet of frames for a video), describes an image with its text word for word, and a video scene by scene (ffmpeg scene changes, one keyframe per scene with its on-screen words, its sound transcribed through AssemblyAI) as timestamped lines, labels it, stores its jina-embeddings-v5-omni vector, then deletes the engine's downloaded copy, so no media file is kept. A voice note shows its transcript. describe puts one local file in the queue and waits for its description. status shows the queue. view shows one item's line, and over MCP returns its preview as an image for a model that can see.",
].join("\n");

export const MEDIA_INPUT: CommandInput = {
  forms: [
    { words: ["describer"], summary: "Run the one media describer on this machine: the vision model loaded once, describing the queue one item at a time", positionals: [], flags: [JSON_FLAG] },
    { words: ["describe"], summary: "Queue one local image or video for the describer and wait for its description", positionals: [{ name: "path", kind: "string", required: true, description: "The image or video file" }], flags: [{ name: "wait", kind: "string", description: "How long to wait for the description, in seconds, default 120" }, JSON_FLAG] },
    { words: ["status"], summary: "The media queue: how many wait, are described, not described yet or failed, and whether the describer runs", positionals: [], flags: [JSON_FLAG] },
    { words: ["view"], summary: "One media item: what it is as text, and its kept preview picture (returned as an image over MCP)", positionals: [{ name: "id", kind: "string", required: true, description: "The media id, from a line's (picture: media view <id>)" }], flags: [JSON_FLAG] },
  ],
};

const repoRoot = () => fileURLToPath(new URL("../../../", import.meta.url));

export const mediaDeps = { sleep: (ms: number) => new Promise<void>((done) => setTimeout(done, ms)) };

function counts(): Record<string, number> {
  return Object.fromEntries((db().prepare("SELECT status, COUNT(*) AS n FROM media GROUP BY status").all() as { status: string; n: number }[]).map((r) => [r.status, r.n]));
}

function describerRow(): { pid: number; heartbeat: string; status: string } | null {
  return (db().prepare("SELECT pid, heartbeat, status FROM owners WHERE platform = 'model' AND account = 'describer'").get() as { pid: number; heartbeat: string; status: string } | null) ?? null;
}

export const mediaCommand: Command = {
  usage: MEDIA_USAGE,
  platform: "any",
  name: "media",
  effect: "read",
  input: MEDIA_INPUT,
  summary: "Turn every image, meme and video into text any model reads, kept in the .db with a small preview, so replies read what was sent",
  args: "describer | describe <path> [--wait <s>] | status | view <id>",
  async run(context, argv) {
    const sub = argv[0] ?? "status";
    const form = MEDIA_INPUT.forms.find((f) => f.words[0] === sub);
    if (!form) return { code: 1, stderr: `log media: unknown subcommand "${sub}"\n${MEDIA_USAGE}` };
    const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...form, words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log media ${sub}: ${parsed.error}\n${MEDIA_USAGE}` };
    const json = parsed.flags["json"] === true;
    try {
      if (sub === "status") {
        const queue = counts();
        const owner = describerRow();
        if (json) return { code: 0, stdout: JSON.stringify({ queue, describer: owner }, null, 2) };
        return { code: 0, stdout: `log media status: ${Object.entries(queue).map(([k, n]) => `${n} ${k}`).join(", ") || "nothing queued yet"}; describer ${owner && owner.status !== "stopped" ? `pid ${owner.pid}, last beat ${owner.heartbeat}` : "not running"}` };
      }
      if (sub === "view") {
        const id = Number(parsed.positionals[0]);
        const found = Number.isInteger(id) ? mediaView(id) : null;
        if (!found) return refuse("media view", "mediaInvalid", `no media item ${String(parsed.positionals[0])}`);
        if (found.image) context.image?.(found.image.data, found.image.mimeType);
        const about = { id: found.row.id, platform: found.row.platform, account: found.row.account, kind: found.row.kind, name: found.row.name, status: found.row.status, line: found.line, durationMs: found.row.durationMs ?? null, width: found.row.width ?? null, height: found.row.height ?? null, scenes: found.row.scenes ? JSON.parse(found.row.scenes) : null, transcript: found.row.transcript ?? null, preview: found.image ? { mimeType: found.image.mimeType, bytes: found.row.preview!.length } : null };
        if (json) return { code: 0, stdout: JSON.stringify(about, null, 2) };
        return { code: 0, stdout: [`log media view: ${found.line}`, found.image ? `preview: ${Math.round(found.row.preview!.length / 1024)} KB ${found.image.mimeType}${context.image ? ", returned as an image" : ", returned as an image over MCP"}` : "no preview kept"].join("\n") };
      }
      if (sub === "describe") {
        const path = resolve(String(parsed.positionals[0] ?? ""));
        if (!existsSync(path)) return refuse("media describe", "mediaInvalid", `no file at ${path}`);
        const waitSeconds = typeof parsed.flags["wait"] === "string" ? Number(parsed.flags["wait"]) : 120;
        const row = enqueueMedia({ eventId: `file:${path}`, platform: "local", account: "", name: basename(path), path });
        if (!row) return refuse("media describe", "mediaInvalid", "the file could not be queued");
        context.err(`media describe: #${row.id} ${row.kind} ${row.name} ${row.status}`);
        let current: MediaRow = row;
        for (let waited = 0; current.status === "pending" || current.status === "describing"; waited += 1) {
          if (waited >= waitSeconds) return { code: 1, stdout: `log media describe: #${row.id} still ${current.status} after ${waitSeconds} s; ${describerRow()?.status === "streaming" ? "the describer is working through the queue" : "no describer is running: the session hook starts it, or run `log media describer`"}` };
          await mediaDeps.sleep(1000);
          current = db().prepare("SELECT * FROM media WHERE id = ?").get(row.id) as MediaRow;
        }
        if (json) return { code: current.status === "described" ? 0 : 1, stdout: JSON.stringify(current, null, 2) };
        return { code: current.status === "described" ? 0 : 1, stdout: current.status === "described" ? `log media describe: ${mediaLine(current)}` : `log media describe: #${row.id} ${current.status}${current.detail ? `: ${current.detail}` : ""}` };
      }
      context.err("media describer: runs in a process of its own (scripts/media/describer.ts), so only the vision model's image library is loaded in it");
      const run = spawnSync("bun", [join(repoRoot(), "scripts", "media", "describer.ts")], { cwd: repoRoot(), windowsHide: true, stdio: ["ignore", "inherit", "inherit"], env: describerEnv() });
      if (run.status !== 0) return refuse("media describer", "describerStopped", `the describer stopped with exit ${run.status ?? run.signal}: its last lines above say why`);
      return { code: 0, stdout: json ? JSON.stringify({ ok: true }, null, 2) : "log media describer: stopped" };
    } catch (error) {
      return refuseError(`media ${sub}`, error);
    }
  },
};
