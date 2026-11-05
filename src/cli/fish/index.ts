import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { CHEAPEST_MODEL, CLONE_SECONDS, CLONE_TITLE, clonePath, createFishClient, FISH_MODELS, mattsRecordings, pickReferences, readClone, SPEAK_FORMATS, speakToFile, writeClone } from "../../extensions/fishAudio/index.ts";
import type { FishClient, FishModel, Recording, SpeakFormat } from "../../extensions/fishAudio/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const FISH_USAGE = [
  "Usage: log fish clone [--apply] [--json]   (matt's voice model, made once on Fish Audio from his own voice notes; without --apply it lists the recordings it would use)",
  '       log fish speak --text "<words>" [--model s2.1-pro-free|s2.1-pro] [--format mp3|wav] [--json]   (the words in his cloned voice, to a file under ~/.logCli/voiceNotes; nothing is played or sent)',
  "Fish Audio is an extension (docs/extensions/fishAudio.md). The clone is made only from the voice notes matt sent himself (fromMe in the conversation store or his ownMessage in the .db): Discord voice messages and Instagram voice clips the engines kept, the shortest first, 10 to 60 s in all. Its model id is kept in ~/.logCli/voice/fishClone.json. Speech uses the free s2.1-pro-free model unless --model says otherwise. The key is FISH_API_KEY in .env.local. A voice note goes out only when matt asks for one: log discord voice, log instagram voice or log slack voice (rule 142).",
].join("\n");

export const FISH_INPUT: CommandInput = {
  forms: [
    {
      words: ["clone"],
      summary: "matt's voice model on Fish Audio, made once from his own voice notes; without --apply it lists the recordings it would use",
      positionals: [],
      flags: [{ name: "apply", kind: "boolean", description: "Make the model on Fish Audio from the recordings listed" }, JSON_FLAG],
    },
    {
      words: ["speak"],
      summary: "Say words in matt's cloned voice, to a local audio file under ~/.logCli/voiceNotes; plays and sends nothing",
      positionals: [],
      flags: [
        { name: "text", kind: "string", required: true, description: "The words to say, as text; never an audio file" },
        { name: "model", kind: "enum", values: FISH_MODELS, description: "Fish's speech model: s2.1-pro-free (the default, free) or s2.1-pro" },
        { name: "format", kind: "enum", values: SPEAK_FORMATS, description: "mp3 (the default) or wav" },
        JSON_FLAG,
      ],
    },
  ],
};

export const fishDeps: { client: () => FishClient; recordings: () => Recording[]; read: (path: string) => Uint8Array } = {
  client: () => createFishClient(),
  recordings: () => mattsRecordings(),
  read: (path) => readFileSync(path),
};

const SUBS = ["clone", "speak"] as const;

function recordingLine(r: Recording): string {
  return `  ${r.platform} ${r.account} chat ${r.conversationId} message ${r.messageId}: ${r.seconds.toFixed(1)} s, ${r.path}`;
}

export const fishCommand: Command = {
  usage: FISH_USAGE,
  platform: "any",
  name: "fish",
  effect: "read",
  input: FISH_INPUT,
  summary: "The Fish Audio extension: matt's voice cloned once from his own voice notes, and words said in it to a local file",
  args: 'clone [--apply] | speak --text "<words>" [--model <m>] [--format mp3|wav] [--json]',
  async run(context, argv) {
    const sub = SUBS.find((s) => s === argv[0]);
    if (!sub) return { code: 1, stderr: `log fish: say clone or speak\n${FISH_USAGE}` };
    const form = FISH_INPUT.forms[SUBS.indexOf(sub)];
    const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...form, words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log fish ${sub}: ${parsed.error}\n${FISH_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log fish ${sub}: takes no words, only flags\n${FISH_USAGE}` };
    const json = parsed.flags["json"] === true;
    if (sub === "clone") {
      const existing = readClone();
      if (existing) {
        if (json) return { code: 0, stdout: JSON.stringify({ exists: true, clonePath: clonePath(), ...existing }, null, 2) };
        return { code: 0, stdout: [`log fish clone: matt's voice is already cloned (Fish model kept in ${clonePath()}, made ${existing.createdAt}, speaking with ${existing.model}), from:`, ...existing.references.map(recordingLine), "It is made once; nothing was sent to Fish."].join("\n") };
      }
      context.err("fish: finding the voice notes matt sent himself");
      const mine = fishDeps.recordings();
      const picked = pickReferences(mine);
      const total = picked.reduce((s, r) => s + r.seconds, 0);
      context.err(`fish: ${mine.length} of his own voice notes found, ${picked.length} picked, ${total.toFixed(1)} s`);
      if (total < CLONE_SECONDS.least) return refuse("fish clone", "voiceRecordingsMissing", `only ${total.toFixed(1)} s of matt's own voice notes between ${CLONE_SECONDS.shortest} and ${CLONE_SECONDS.most} s were found (${mine.length} of his in all); Fish needs about ${CLONE_SECONDS.least} s`);
      if (parsed.flags["apply"] !== true) {
        if (json) return { code: 0, stdout: JSON.stringify({ dryRun: true, seconds: total, references: picked }, null, 2) };
        return { code: 0, stdout: [`log fish clone: dry run: would make matt's voice model from ${picked.length} of his own voice notes, ${total.toFixed(1)} s:`, ...picked.map(recordingLine), "Nothing was sent to Fish. --apply makes it, once."].join("\n") };
      }
      context.err(`fish: making matt's voice model on Fish Audio from ${picked.length} recordings`);
      const made = await fishDeps.client().createModel(CLONE_TITLE, picked.map((r) => ({ name: basename(r.path), bytes: fishDeps.read(r.path), type: r.path.endsWith(".ogg") ? "audio/ogg" : "audio/mp4" })));
      if (!made.ok || !made.data) return refuse("fish clone", made.code === "fishKeyMissing" ? "fishKeyMissing" : "fishRefused", `Fish answered ${made.status || "nothing"}${made.code ? ` (${made.code})` : ""}${made.error ? `: ${made.error}` : ""}; no model was made`);
      const read = await fishDeps.client().getModel(made.data.id);
      const clone = { modelId: made.data.id, title: made.data.title || CLONE_TITLE, model: CHEAPEST_MODEL, createdAt: new Date().toISOString(), state: read.ok ? read.data?.state ?? null : made.data.state, references: picked };
      writeClone(clone);
      if (json) return { code: 0, stdout: JSON.stringify({ clonePath: clonePath(), ...clone }, null, 2) };
      return { code: 0, stdout: [`log fish clone: matt's voice model made on Fish Audio (state ${clone.state ?? "unknown"}), its id kept in ${clonePath()}, from:`, ...picked.map(recordingLine)].join("\n") };
    }
    const text = String(parsed.flags["text"] ?? "");
    const model = typeof parsed.flags["model"] === "string" ? (parsed.flags["model"] as FishModel) : null;
    const format = typeof parsed.flags["format"] === "string" ? (parsed.flags["format"] as SpeakFormat) : "mp3";
    context.err(`fish: saying ${text.trim().length} characters in matt's cloned voice`);
    const spoken = await speakToFile(fishDeps.client(), text, format, model);
    if (!spoken.ok) return refuse("fish speak", spoken.code, spoken.detail);
    if (spoken.model !== spoken.clone.model) writeClone({ ...spoken.clone, model: spoken.model });
    if (json) return { code: 0, stdout: JSON.stringify({ path: spoken.path, bytes: spoken.bytes, model: spoken.model, format }, null, 2) };
    return { code: 0, stdout: `log fish speak: ${spoken.path} (${format}, ${spoken.bytes} bytes, ${spoken.model}). Nothing was played or sent.` };
  },
};
