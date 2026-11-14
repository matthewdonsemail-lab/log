import { existsSync, readFileSync } from "node:fs";
import { basename } from "node:path";
import { CLONE_TITLE, clonePath, mattsRecordings, pickReferences, providerOf, readClone, replacedClone, secondsOf, SPEAK_FORMATS, speakToFile, VOICE_PROVIDERS, voiceProvider, voiceSettingsOf, wavOf, writeClone } from "../../extensions/voiceClone/index.ts";
import { hashOf, readTranscript } from "../../media/voiceNotes/index.ts";
import type { ReferenceAudio, Recording, SpeakFormat, VoiceProvider, VoiceProviderClient } from "../../extensions/voiceClone/index.ts";
import { JSON_FLAG, listOf, parseArgs, parserSpecOf, refuse } from "../runner/helpers/index.ts";
import type { Command, CommandInput, FlagSpec } from "../runner/types.ts";
import { liveThroughAction } from "../../platformKit/action/index.ts";

export const CLONE_USAGE = [
  "Usage: log clone voice [--provider inworld|fishAudio] [--from <file>[,<file>]] [--apply] [--replace] [--json]   (the owner's voice, cloned once per provider from their own voice notes, or from recordings of their own they name with --from, each one's words read from a .txt beside it; without --apply it lists the recordings it would use; --replace makes it again and keeps the old voice id under previous)",
  '       log clone speak --text "<words>" [--provider inworld|fishAudio] [--model <model>] [--format mp3|wav] [--json]   (the words in his cloned voice, to a file under ~/.logCli/voiceNotes; nothing is played or sent)',
  "Voice cloning is provider-agnostic (docs/extensions/voiceClone.md): the provider is --provider, else LOG_VOICE_PROVIDER in .env.local, else inworld. Each provider is an extension of its own (src/extensions/inworld, src/extensions/fishAudio) behind one interface (src/extensions/voiceClone). The clone is made only from the voice notes matt sent himself (fromMe in the conversation store or his ownMessage in the .db), the shortest first, within the provider's limit (Inworld 3 to 30 s, Fish 10 to 60 s). Each provider's voice id is kept in log.db. A clone speaks with the provider's preferred model (Inworld inworld-tts-2, which takes emotion tags), else its cheapest, unless --model says otherwise, at LOG_VOICE_SPEED (default 1.15). The clone is made in matt's accent: LOG_VOICE_ACCENT (default Irish) as its description and LOG_VOICE_LANGUAGE (default en-IE, en-GB when Inworld refuses it) as its language, with each sample's AssemblyAI transcript when ~/.logCli/transcripts has one; no accent instruction is sent with the text. Every spoken file is shaped like matt's own voice notes (his room tone from his notes, phone squash, mic drift, saturation; breaths on inworld-tts-2) and listened back with AssemblyAI: a lexicon word said wrong is refused spokenMismatch, an acronym not in the lexicon pronunciationUnknown. A voice note goes out only when matt asks for one: log discord voice, log instagram voice or log slack voice (rules 142, 143, 145, 146, 147).",
].join("\n");

const PROVIDER: FlagSpec = { name: "provider", kind: "enum", values: VOICE_PROVIDERS, description: "Which voice provider: inworld or fishAudio (default: LOG_VOICE_PROVIDER, else inworld)" };

export const CLONE_INPUT: CommandInput = {
  forms: [
    {
      words: ["voice"],
      summary: "the owner's voice cloned once on the voice provider from their own voice notes; without --apply it lists the recordings it would use",
      positionals: [],
      flags: [PROVIDER, { name: "from", kind: "list", description: "the owner's own recordings to clone from instead of his voice notes (his voiceovers, comma separated), each one's exact words in a .txt of the same name beside it when there is one (rule 146)" }, { name: "apply", kind: "boolean", live: true, description: "Make the clone on the provider from the recordings listed" }, { name: "replace", kind: "boolean", description: "Make the clone again though one exists; the old voice id is kept in the clone file under previous, never deleted (rule 145)" }, JSON_FLAG],
    },
    {
      words: ["speak"],
      summary: "Say words in the owner's cloned voice, to a local audio file under ~/.logCli/voiceNotes; plays and sends nothing",
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

export const cloneDeps: { provider: (provider: VoiceProvider) => VoiceProviderClient; recordings: () => Recording[]; read: (path: string) => Uint8Array; wav: (path: string) => Uint8Array | null; transcript: (bytes: Uint8Array) => string | null; sidecar: (path: string) => string | null; seconds: (path: string) => number | null } = {
  provider: (provider) => voiceProvider(provider),
  recordings: () => mattsRecordings(),
  read: (path) => readFileSync(path),
  wav: (path) => wavOf(path),
  transcript: (bytes) => readTranscript(hashOf(bytes))?.text?.trim() || null,
  sidecar: (path) => {
    const txt = path.replace(/\.[^.\/]+$/, ".txt");
    return existsSync(txt) ? readFileSync(txt, "utf8").trim() || null : null;
  },
  seconds: (path) => secondsOf(path),
};

export function namedRecordings(paths: readonly string[], seconds: (path: string) => number | null): Recording[] | string {
  const out: Recording[] = [];
  for (const path of paths) {
    const length = seconds(path);
    if (length === null) return `${path} isn't an audio file ffprobe can read`;
    out.push({ path, platform: "file", account: "matt", conversationId: "", messageId: basename(path), seconds: length });
  }
  return out;
}

const SUBS = ["voice", "speak"] as const;

function recordingLine(r: Recording): string {
  if (r.platform === "file") return `  ${r.path}: ${r.seconds.toFixed(1)} s`;
  return `  ${r.platform} ${r.account} chat ${r.conversationId} message ${r.messageId}: ${r.seconds.toFixed(1)} s, ${r.path}`;
}

function referencesFor(client: VoiceProviderClient, picked: Recording[]): ReferenceAudio[] | string {
  const refs: ReferenceAudio[] = [];
  for (const r of picked) {
    const original = cloneDeps.read(r.path);
    const transcription = cloneDeps.sidecar(r.path) ?? cloneDeps.transcript(original);
    const said = transcription ? { transcription } : {};
    if (client.referenceFormat === "asIs") {
      refs.push({ name: basename(r.path), bytes: original, type: r.path.endsWith(".ogg") ? "audio/ogg" : "audio/mp4", ...said });
      continue;
    }
    const wav = cloneDeps.wav(r.path);
    if (!wav) return `ffmpeg couldn't turn ${r.path} into wav for ${client.provider}`;
    refs.push({ name: basename(r.path).replace(/\.[^.]+$/, ".wav"), bytes: wav, type: "audio/wav", ...said });
  }
  return refs;
}

export const cloneCommand: Command = liveThroughAction<Command>({
  usage: CLONE_USAGE,
  platform: "any",
  name: "clone",
  effect: "read",
  input: CLONE_INPUT,
  summary: "the owner's voice, cloned once per provider (Inworld or Fish Audio) from their own voice notes, and words said in it to a local file",
  args: 'voice [--provider <p>] [--apply] [--replace] | speak --text "<words>" [--provider <p>] [--model <m>] [--format mp3|wav] [--json]',
  async run(context, argv) {
    const sub = SUBS.find((s) => s === argv[0]);
    if (!sub) return { code: 1, stderr: `log clone: say voice or speak\n${CLONE_USAGE}` };
    const form = CLONE_INPUT.forms[SUBS.indexOf(sub)];
    const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...form, words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log clone ${sub}: ${parsed.error}\n${CLONE_USAGE}` };
    if (parsed.positionals.length) return { code: 1, error: "inputInvalid", stderr: `log clone ${sub}: takes no words, only flags\n${CLONE_USAGE}` };
    const label = `clone ${sub}`;
    const chosen = providerOf(parsed.flags["provider"]);
    if (!chosen.ok) return refuse(label, "voiceProviderUnknown", chosen.detail);
    const provider = chosen.provider;
    const json = parsed.flags["json"] === true;
    const client = cloneDeps.provider(provider);
    if (sub === "voice") {
      const existing = readClone(provider);
      const replace = parsed.flags["replace"] === true;
      const settings = voiceSettingsOf();
      if (existing && !replace) {
        if (json) return { code: 0, stdout: JSON.stringify({ exists: true, clonePath: clonePath(), ...existing }, null, 2) };
        return { code: 0, stdout: [`log clone voice: matt's voice is already cloned on ${provider} (its voice id kept in log.db, made ${existing.createdAt}, speaking with ${existing.model}), from:`, ...existing.references.map(recordingLine), `It is made once per provider; nothing was sent to ${provider}.`].join("\n") };
      }
      const named = listOf(parsed, "from") ?? [];
      context.err(`clone: ${provider} (${chosen.from}): ${named.length ? `${named.length} recording(s) of matt's own named with --from` : "finding the voice notes matt sent himself"}`);
      const fromFiles = named.length ? namedRecordings(named, cloneDeps.seconds) : null;
      if (typeof fromFiles === "string") return refuse(label, "voiceRecordingsMissing", fromFiles);
      const mine = fromFiles ?? cloneDeps.recordings();
      const picked = pickReferences(mine, client.limits);
      const total = picked.reduce((s, r) => s + r.seconds, 0);
      context.err(`clone: ${mine.length} of his own voice notes found, ${picked.length} picked, ${total.toFixed(1)} s (${provider} takes ${client.limits.least} to ${client.limits.most} s)`);
      if (total < client.limits.least) return refuse(label, "voiceRecordingsMissing", `only ${total.toFixed(1)} s of matt's own voice notes fit ${provider}'s ${client.limits.least} to ${client.limits.most} s (${mine.length} of his in all)`);
      if (parsed.flags["apply"] !== true) {
        if (json) return { code: 0, stdout: JSON.stringify({ dryRun: true, provider, ...settings, replaces: existing?.voiceId ?? null, seconds: total, references: picked }, null, 2) };
        return { code: 0, stdout: [`log clone voice: dry run: would ${existing ? `replace ${existing.voiceId} with a new clone of` : "clone"} matt's voice on ${provider}, ${settings.accent} accent, language ${settings.language} (${settings.fallback} if refused), from ${picked.length} of his own voice notes, ${total.toFixed(1)} s:`, ...picked.map(recordingLine), `Nothing was sent to ${provider}. --apply makes it${existing ? ", keeping the old voice id under previous" : ", once"}.`].join("\n") };
      }
      const refs = referencesFor(client, picked);
      if (typeof refs === "string") return refuse(label, "voiceNoteConvertFailed", refs);
      context.err(`clone: cloning matt's voice on ${provider} from ${refs.length} recordings (${refs.filter((r) => r.transcription).length} with transcripts), ${settings.accent} accent, language ${settings.language}`);
      const made = await client.clone(CLONE_TITLE, refs, settings);
      if (!made.ok || !made.data) return refuse(label, made.code === "voiceKeyMissing" ? "voiceKeyMissing" : "voiceProviderRefused", `${provider} answered ${made.status || "nothing"}${made.code ? ` (${made.code})` : ""}${made.error ? `: ${made.error}` : ""}; no clone was made`);
      const clone = replacedClone({ provider, voiceId: made.data.voiceId, title: CLONE_TITLE, model: client.preferred ?? client.cheapest, createdAt: new Date().toISOString(), state: made.data.state, references: picked, accent: settings.accent, ...(made.data.language ? { language: made.data.language } : {}) }, existing);
      writeClone(clone);
      if (json) return { code: 0, stdout: JSON.stringify({ clonePath: clonePath(), ...clone }, null, 2) };
      return { code: 0, stdout: [`log clone voice: matt's voice cloned on ${provider} (state ${clone.state ?? "unknown"}, ${settings.accent} accent, language ${clone.language ?? "not said"}), its voice id ${clone.voiceId} kept in log.db${existing ? `, the old one ${existing.voiceId} under previous` : ""}, from:`, ...picked.map(recordingLine)].join("\n") };
    }
    const text = String(parsed.flags["text"] ?? "");
    const model = typeof parsed.flags["model"] === "string" && parsed.flags["model"].trim() ? parsed.flags["model"].trim() : null;
    if (model && !client.models.includes(model)) return refuse(label, "voiceProviderUnknown", `${provider}'s speech models are ${client.models.join(", ")}`);
    const format = typeof parsed.flags["format"] === "string" ? (parsed.flags["format"] as SpeakFormat) : "mp3";
    context.err(`clone: ${provider}: saying ${text.trim().length} characters in the owner's cloned voice`);
    const spoken = await speakToFile(client, text, format, model);
    if (!spoken.ok) return refuse(label, spoken.code, spoken.detail);
    if (spoken.model !== spoken.clone.model) writeClone({ ...spoken.clone, model: spoken.model });
    if (json) return { code: 0, stdout: JSON.stringify({ provider, path: spoken.path, bytes: spoken.bytes, model: spoken.model, format }, null, 2) };
    return { code: 0, stdout: `log clone speak: ${spoken.path} (${provider}, ${format}, ${spoken.bytes} bytes, ${spoken.model}). Nothing was played or sent.` };
  },
}, ["apply"]);
