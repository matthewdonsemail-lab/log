import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { CLONE_TITLE, clonePath, mattsRecordings, pickReferences, providerOf, readClone, SPEAK_FORMATS, speakToFile, VOICE_PROVIDERS, voiceProvider, wavOf, writeClone } from "../../extensions/voiceClone/index.ts";
import type { ReferenceAudio, Recording, SpeakFormat, VoiceProvider, VoiceProviderClient } from "../../extensions/voiceClone/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse } from "../runner/helpers/index.ts";
import type { Command, CommandInput, FlagSpec } from "../runner/types.ts";

export const CLONE_USAGE = [
  "Usage: log clone voice [--provider inworld|fishAudio] [--apply] [--json]   (matt's voice, cloned once per provider from his own voice notes; without --apply it lists the recordings it would use)",
  '       log clone speak --text "<words>" [--provider inworld|fishAudio] [--model <model>] [--format mp3|wav] [--json]   (the words in his cloned voice, to a file under ~/.logCli/voiceNotes; nothing is played or sent)',
  "Voice cloning is provider-agnostic (docs/extensions/voiceClone.md): the provider is --provider, else LOG_VOICE_PROVIDER in .env.local, else inworld. Each provider is an extension of its own (src/extensions/inworld, src/extensions/fishAudio) behind one interface (src/extensions/voiceClone). The clone is made only from the voice notes matt sent himself (fromMe in the conversation store or his ownMessage in the .db), the shortest first, within the provider's limit (Inworld 3 to 30 s, Fish 10 to 60 s). Each provider's voice id is kept in ~/.logCli/voice/clone.json. Speech uses the provider's cheapest model unless --model says otherwise. A voice note goes out only when matt asks for one: log discord voice, log instagram voice or log slack voice (rules 142, 143).",
].join("\n");

const PROVIDER: FlagSpec = { name: "provider", kind: "enum", values: VOICE_PROVIDERS, description: "Which voice provider: inworld or fishAudio (default: LOG_VOICE_PROVIDER, else inworld)" };

export const CLONE_INPUT: CommandInput = {
  forms: [
    {
      words: ["voice"],
      summary: "matt's voice cloned once on the voice provider from his own voice notes; without --apply it lists the recordings it would use",
      positionals: [],
      flags: [PROVIDER, { name: "apply", kind: "boolean", description: "Make the clone on the provider from the recordings listed" }, JSON_FLAG],
    },
    {
      words: ["speak"],
      summary: "Say words in matt's cloned voice, to a local audio file under ~/.logCli/voiceNotes; plays and sends nothing",
      positionals: [],
      flags: [
        { name: "text", kind: "string", required: true, description: "The words to say, as text; never an audio file" },
        PROVIDER,
        { name: "model", kind: "string", description: "The provider's speech model (Inworld inworld-tts-2-flash or inworld-tts-2, Fish s2.1-pro-free or s2.1-pro); default its cheapest" },
        { name: "format", kind: "enum", values: SPEAK_FORMATS, description: "mp3 (the default) or wav" },
        JSON_FLAG,
      ],
    },
  ],
};

export const cloneDeps: { provider: (provider: VoiceProvider) => VoiceProviderClient; recordings: () => Recording[]; read: (path: string) => Uint8Array; wav: (path: string) => Uint8Array | null } = {
  provider: (provider) => voiceProvider(provider),
  recordings: () => mattsRecordings(),
  read: (path) => readFileSync(path),
  wav: (path) => wavOf(path),
};

const SUBS = ["voice", "speak"] as const;

function recordingLine(r: Recording): string {
  return `  ${r.platform} ${r.account} chat ${r.conversationId} message ${r.messageId}: ${r.seconds.toFixed(1)} s, ${r.path}`;
}

function referencesFor(client: VoiceProviderClient, picked: Recording[]): ReferenceAudio[] | string {
  const refs: ReferenceAudio[] = [];
  for (const r of picked) {
    if (client.referenceFormat === "asIs") {
      refs.push({ name: basename(r.path), bytes: cloneDeps.read(r.path), type: r.path.endsWith(".ogg") ? "audio/ogg" : "audio/mp4" });
      continue;
    }
    const wav = cloneDeps.wav(r.path);
    if (!wav) return `ffmpeg couldn't turn ${r.path} into wav for ${client.provider}`;
    refs.push({ name: basename(r.path).replace(/\.[^.]+$/, ".wav"), bytes: wav, type: "audio/wav" });
  }
  return refs;
}

export const cloneCommand: Command = {
  usage: CLONE_USAGE,
  platform: "any",
  name: "clone",
  effect: "read",
  input: CLONE_INPUT,
  summary: "matt's voice, cloned once per provider (Inworld or Fish Audio) from his own voice notes, and words said in it to a local file",
  args: 'voice [--provider <p>] [--apply] | speak --text "<words>" [--provider <p>] [--model <m>] [--format mp3|wav] [--json]',
  async run(context, argv) {
    const sub = SUBS.find((s) => s === argv[0]);
    if (!sub) return { code: 1, stderr: `log clone: say voice or speak\n${CLONE_USAGE}` };
    const form = CLONE_INPUT.forms[SUBS.indexOf(sub)];
    const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...form, words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log clone ${sub}: ${parsed.error}\n${CLONE_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log clone ${sub}: takes no words, only flags\n${CLONE_USAGE}` };
    const label = `clone ${sub}`;
    const chosen = providerOf(parsed.flags["provider"]);
    if (!chosen.ok) return refuse(label, "voiceProviderUnknown", chosen.detail);
    const provider = chosen.provider;
    const json = parsed.flags["json"] === true;
    const client = cloneDeps.provider(provider);
    if (sub === "voice") {
      const existing = readClone(provider);
      if (existing) {
        if (json) return { code: 0, stdout: JSON.stringify({ exists: true, clonePath: clonePath(), ...existing }, null, 2) };
        return { code: 0, stdout: [`log clone voice: matt's voice is already cloned on ${provider} (its voice id kept in ${clonePath()}, made ${existing.createdAt}, speaking with ${existing.model}), from:`, ...existing.references.map(recordingLine), `It is made once per provider; nothing was sent to ${provider}.`].join("\n") };
      }
      context.err(`clone: ${provider} (${chosen.from}): finding the voice notes matt sent himself`);
      const mine = cloneDeps.recordings();
      const picked = pickReferences(mine, client.limits);
      const total = picked.reduce((s, r) => s + r.seconds, 0);
      context.err(`clone: ${mine.length} of his own voice notes found, ${picked.length} picked, ${total.toFixed(1)} s (${provider} takes ${client.limits.least} to ${client.limits.most} s)`);
      if (total < client.limits.least) return refuse(label, "voiceRecordingsMissing", `only ${total.toFixed(1)} s of matt's own voice notes fit ${provider}'s ${client.limits.least} to ${client.limits.most} s (${mine.length} of his in all)`);
      if (parsed.flags["apply"] !== true) {
        if (json) return { code: 0, stdout: JSON.stringify({ dryRun: true, provider, seconds: total, references: picked }, null, 2) };
        return { code: 0, stdout: [`log clone voice: dry run: would clone matt's voice on ${provider} from ${picked.length} of his own voice notes, ${total.toFixed(1)} s:`, ...picked.map(recordingLine), `Nothing was sent to ${provider}. --apply makes it, once.`].join("\n") };
      }
      const refs = referencesFor(client, picked);
      if (typeof refs === "string") return refuse(label, "voiceNoteConvertFailed", refs);
      context.err(`clone: cloning matt's voice on ${provider} from ${refs.length} recordings`);
      const made = await client.clone(CLONE_TITLE, refs);
      if (!made.ok || !made.data) return refuse(label, made.code === "voiceKeyMissing" ? "voiceKeyMissing" : "voiceProviderRefused", `${provider} answered ${made.status || "nothing"}${made.code ? ` (${made.code})` : ""}${made.error ? `: ${made.error}` : ""}; no clone was made`);
      const clone = { provider, voiceId: made.data.voiceId, title: CLONE_TITLE, model: client.cheapest, createdAt: new Date().toISOString(), state: made.data.state, references: picked };
      writeClone(clone);
      if (json) return { code: 0, stdout: JSON.stringify({ clonePath: clonePath(), ...clone }, null, 2) };
      return { code: 0, stdout: [`log clone voice: matt's voice cloned on ${provider} (state ${clone.state ?? "unknown"}), its voice id kept in ${clonePath()}, from:`, ...picked.map(recordingLine)].join("\n") };
    }
    const text = String(parsed.flags["text"] ?? "");
    const model = typeof parsed.flags["model"] === "string" && parsed.flags["model"].trim() ? parsed.flags["model"].trim() : null;
    if (model && !client.models.includes(model)) return refuse(label, "voiceProviderUnknown", `${provider}'s speech models are ${client.models.join(", ")}`);
    const format = typeof parsed.flags["format"] === "string" ? (parsed.flags["format"] as SpeakFormat) : "mp3";
    context.err(`clone: ${provider}: saying ${text.trim().length} characters in matt's cloned voice`);
    const spoken = await speakToFile(client, text, format, model);
    if (!spoken.ok) return refuse(label, spoken.code, spoken.detail);
    if (spoken.model !== spoken.clone.model) writeClone({ ...spoken.clone, model: spoken.model });
    if (json) return { code: 0, stdout: JSON.stringify({ provider, path: spoken.path, bytes: spoken.bytes, model: spoken.model, format }, null, 2) };
    return { code: 0, stdout: `log clone speak: ${spoken.path} (${provider}, ${format}, ${spoken.bytes} bytes, ${spoken.model}). Nothing was played or sent.` };
  },
};
