import { existsSync } from "node:fs";
import { basename } from "node:path";
import { platformStateRoot, twitterStateRoot } from "../../directApi/engine/index.ts";
import { discordGate, findDiscordAccount } from "../../discord/account/session/index.ts";
import { applyTranscripts, assemblyAiKey, AUDIO_LEFTOVER, createAssemblyAiClient, discordNoteOf, NO_KEY_NOTE, discordStoredNotes, transcribeFile, transcribeNotes, twitterVoiceNotes, voiceNoteText, whoSaid, withDiscordNotes } from "../../media/voiceNotes/index.ts";
import type { AssemblyAiClient, DiscordFoundNote, NoteResult, VoiceNote } from "../../media/voiceNotes/index.ts";
import { isAudio } from "../../platformKit/media/index.ts";
import type { MessageAttachment } from "../../platformKit/media/index.ts";
import { loadConversations, saveConversations, updateIndex } from "../../search/conversations/index.ts";
import type { Conversation } from "../../search/conversations/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput } from "../runner/types.ts";
import { searchDeps } from "../search/index.ts";
import { openTwitterAccount } from "../twitter/helpers/account.ts";

export const TRANSCRIBE_USAGE = [
  "Usage: log transcribe [--platform twitter|discord] [--account <a>] [--list] [--noIndex] [--json]",
  "       log transcribe file <path> [--json]   (one audio file, transcribed and kept by its hash)",
  "Transcribes every voice note in the saved conversations with AssemblyAI (upload, transcript, polled until done) and writes each into the conversation store as (voice note: \"<what was said>\") in place of its (audio: <name>) marker, so log search, voice and SubQ matrices see what was said. X voice notes come from the X Chat files the account's one session saved, and a missing one is fetched through that session (the conversation read again, its audio events reopened). Discord voice notes are found with Discord's own sound search, one chat at a time through log's Discord engine, and each file is fetched from its fresh attachment url there; any refusal stops it (rule 94). Each transcript is kept once by its file's hash in ~/.logCli/transcripts, so nothing is sent to AssemblyAI twice. The search index is then updated with what changed (--noIndex skips it).",
  "--list only lists the voice notes the store holds and which have their file, calling nothing. The key is ASSEMBLYAI_API_KEY or ASSEMBLY_AI_KEY (the environment, .env.local, ~/.buzz/.env.local or ~/filmcraft/.env.local), never printed; without it the command refuses with assemblyAiKeyMissing.",
].join("\n");

const PLATFORMS = ["twitter", "discord"] as const;

export const TRANSCRIBE_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Transcribe every voice note in the saved X and Discord conversations with AssemblyAI and write them into the conversation store",
      positionals: [],
      flags: [
        { name: "platform", kind: "enum", values: PLATFORMS, description: "Only this platform's voice notes (default both)" },
        { name: "account", kind: "string", description: "Only this account's voice notes" },
        { name: "list", kind: "boolean", description: "Only list the voice notes the store holds and which have their file, calling nothing" },
        { name: "noIndex", kind: "boolean", description: "Leave the search index as it is" },
        JSON_FLAG,
      ],
    },
    {
      words: ["file"],
      summary: "Transcribe one audio file with AssemblyAI, kept by its hash",
      positionals: [{ name: "path", kind: "string", required: true, description: "The audio file" }],
      flags: [JSON_FLAG],
    },
  ],
};

export const transcribeDeps: { client: () => AssemblyAiClient } = {
  client: () => createAssemblyAiClient({ key: assemblyAiKey() }),
};

export async function transcribeInline(notes: readonly VoiceNote[], progress: (line: string) => void): Promise<Map<string, string>> {
  const out = new Map<string, string>();
  const ready = notes.filter((n) => n.path);
  if (!ready.length) return out;
  const client = transcribeDeps.client();
  if (!client.hasKey) {
    progress(NO_KEY_NOTE);
    return out;
  }
  for (const { note, answer } of await transcribeNotes(ready, client, progress)) if (answer?.ok) out.set(`${note.messageId}:${note.name}`, voiceNoteText(answer.transcript));
  return out;
}

export type AudioOf = MessageAttachment;

export async function withVoiceNotes<T extends { id: string; text: string }>(where: { platform: string; account: string; conversationId: string }, messages: readonly T[], audioOf: (m: T) => readonly AudioOf[], progress: (line: string) => void): Promise<T[]> {
  const notes: VoiceNote[] = messages.flatMap((m) => audioOf(m).filter((a) => a.name && isAudio(a)).map((a) => ({ ...where, messageId: m.id, from: null, fromMe: false, at: null, name: a.name!, path: a.path ?? null })));
  if (!notes.length) return [...messages];
  const said = await transcribeInline(notes, progress);
  if (!said.size) return [...messages];
  return messages.map((m) => {
    let text = m.text;
    for (const a of audioOf(m)) {
      const found = a.name ? said.get(`${m.id}:${a.name}`) : undefined;
      if (found) text = text.includes(`(audio: ${a.name})`) ? text.replace(`(audio: ${a.name})`, found) : `${text} ${found}`.trim();
    }
    return text === m.text ? m : { ...m, text: text.replace(AUDIO_LEFTOVER, "").trim() };
  });
}

const accountsOf = (conversations: readonly Conversation[], platform: string, only?: string) => [...new Set(conversations.filter((c) => c.platform === platform).map((c) => c.account))].filter((a) => !only || a === only);

async function fetchTwitter(context: CommandContext, account: string, missing: VoiceNote[], lines: string[]): Promise<VoiceNote[]> {
  if (!missing.length) return [];
  const opened = await openTwitterAccount(context, "transcribe", account);
  if (!opened.ok) {
    lines.push(`twitter ${account}: ${missing.length} voice note file(s) missing and not fetched: ${opened.result.stderr ?? "the account isn't usable"}`);
    return [];
  }
  const secrets = await context.twenty.loginSecrets(opened.account.id).catch(() => null);
  const chatPin = secrets?.messengerPin ?? undefined;
  if (!chatPin) {
    lines.push(`twitter ${account}: ${missing.length} voice note file(s) missing and not fetched: no X Chat PIN saved (log twitter chat pin)`);
    return [];
  }
  const byConversation = new Map<string, VoiceNote[]>();
  for (const n of missing) byConversation.set(n.conversationId, [...(byConversation.get(n.conversationId) ?? []), n]);
  const fetched: VoiceNote[] = [];
  let index = 0;
  for (const [conversationId, notes] of byConversation) {
    index++;
    context.err(`transcribe: twitter ${account} ${index}/${byConversation.size}: fetching ${notes.length} voice note file(s) of conversation ${conversationId} through its one X session`);
    const run = await opened.engine({ action: "inbox", conversationId, mediaEvents: notes.map((n) => n.messageId), olderPages: 0, limit: 200, chatPin });
    if (!run.answer.ok) {
      lines.push(`twitter ${account}: stopped at conversation ${conversationId}: ${run.answer.code}: ${run.answer.detail ?? ""}; nothing more fetched (rule 94)`);
      break;
    }
    const media = new Map((run.answer.messages ?? []).flatMap((m) => (m.media ?? []).filter((a) => a.path && a.filename).map((a) => [`${m.id}:${a.filename}`, a.path!] as const)));
    for (const n of notes) {
      const path = media.get(`${n.messageId}:${n.name}`);
      if (path && existsSync(path)) fetched.push({ ...n, path });
    }
  }
  return fetched;
}

async function findDiscord(context: CommandContext, account: string, conversations: Conversation[], lines: string[]): Promise<{ notes: VoiceNote[]; conversations: Conversation[] }> {
  const found = await findDiscordAccount(context.twenty, account).catch(() => null);
  const gate = found ? discordGate(found) : null;
  if (!found || !gate?.ok || !context.directDiscord) {
    lines.push(`discord ${account}: not searched, ${!found ? "no DISCORD socialAccount" : !gate?.ok ? gate?.detail ?? "not usable" : "the direct-API engine isn't wired"}`);
    return { notes: [], conversations };
  }
  const channels = conversations.filter((c) => c.platform === "discord" && c.account === account).map((c) => c.conversationId);
  context.err(`transcribe: discord ${account}: searching ${channels.length} chat(s) for voice notes with Discord's sound search, one at a time`);
  const run = context.directDiscord(found, { action: "voiceNotes", channels, streamProgress: true });
  const raw = (run.answer.notes as DiscordFoundNote[] | undefined) ?? [];
  if (!run.answer.ok) lines.push(`discord ${account}: stopped: ${run.answer.code}: ${run.answer.detail ?? ""}; kept the ${raw.length} voice note(s) found before it (rule 94)`);
  const problems = (run.answer.problems as unknown[] | undefined)?.length ?? 0;
  if (problems) lines.push(`discord ${account}: ${problems} chat(s) couldn't be searched yet (Discord's search index not ready, or the network dropped)`);
  const patched = withDiscordNotes(conversations, found.accountName, raw);
  if (patched.changed.length) saveConversations(patched.changed);
  return { notes: raw.map((n) => discordNoteOf(found.accountName, n)), conversations: patched.conversations };
}

function byPerson(results: readonly NoteResult[], ownName: string): string[] {
  const counts = new Map<string, number>();
  for (const r of results.filter((r) => r.answer?.ok)) counts.set(`${r.note.platform} ${whoSaid(r.note, ownName)}`, (counts.get(`${r.note.platform} ${whoSaid(r.note, ownName)}`) ?? 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1]).map(([who, n]) => `  ${who}: ${n}`);
}

const unique = (notes: readonly VoiceNote[]) => [...new Map(notes.map((n) => [`${n.platform}:${n.account}:${n.messageId}:${n.name}`, n])).values()];

export const transcribeCommand: Command = {
  usage: TRANSCRIBE_USAGE,
  platform: "any",
  name: "transcribe",
  effect: "read",
  input: TRANSCRIBE_INPUT,
  summary: "Transcribe every voice note in the saved X and Discord conversations with AssemblyAI, written into the conversation store for search, voice and SubQ",
  args: "[file <path>] [--platform twitter|discord] [--account <a>] [--list] [--noIndex] [--json]",
  async run(context, argv) {
    const sub = argv[0] === "file" ? "file" : "all";
    const form = TRANSCRIBE_INPUT.forms[sub === "file" ? 1 : 0];
    const parsed = parseArgs(sub === "file" ? argv.slice(1) : argv, parserSpecOf({ forms: [{ ...form, words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log transcribe: ${parsed.error}\n${TRANSCRIBE_USAGE}` };
    const json = parsed.flags["json"] === true;
    try {
      if (sub === "file") {
        const path = parsed.positionals.join(" ").trim();
        if (!path || !existsSync(path)) return { code: 1, stderr: `log transcribe file: there is no file at ${path || "(none given)"}` };
        const client = transcribeDeps.client();
        if (!client.hasKey) return refuse("transcribe", "assemblyAiKeyMissing");
        const answer = await transcribeFile(path, basename(path), client);
        if (!answer.ok) return refuse("transcribe", answer.code, `${answer.status ? `HTTP ${answer.status}: ` : ""}${answer.error}`);
        return { code: 0, stdout: json ? JSON.stringify(answer, null, 2) : `log transcribe: ${basename(path)} (${answer.cached ? "cached" : "transcribed"}, ${Math.round(answer.transcript.seconds ?? 0)} s, ${answer.transcript.languageCode ?? "?"}):\n${answer.transcript.text}` };
      }
      if (parsed.positionals.length) return { code: 1, stderr: `log transcribe: takes no words, only flags (or file <path>)\n${TRANSCRIBE_USAGE}` };
      const platform = typeof parsed.flags["platform"] === "string" ? parsed.flags["platform"] : undefined;
      const only = typeof parsed.flags["account"] === "string" ? parsed.flags["account"] : undefined;
      let conversations = loadConversations();
      const wants = (p: string) => !platform || platform === p;
      const stored = [
        ...(wants("twitter") ? twitterVoiceNotes(conversations, twitterStateRoot()) : []),
        ...(wants("discord") ? discordStoredNotes(conversations, platformStateRoot("discord")) : []),
      ].filter((n) => !only || n.account === only);
      if (parsed.flags["list"] === true) {
        if (json) return { code: 0, stdout: JSON.stringify({ notes: stored }, null, 2) };
        return { code: 0, stdout: [`log transcribe: ${stored.length} voice note(s) in the store, ${stored.filter((n) => n.path).length} with their file`, ...stored.map((n) => `  ${n.platform} ${n.account} ${n.at ?? "?"} ${whoSaid(n, n.account)} · ${n.name} · ${n.path ? "file kept" : "file missing"}`)].join("\n") };
      }
      const client = transcribeDeps.client();
      if (!client.hasKey) return refuse("transcribe", "assemblyAiKeyMissing", "nothing was read or sent");
      const lines: string[] = [];
      const notes: VoiceNote[] = stored.filter((n) => n.path);
      if (wants("twitter")) {
        for (const account of accountsOf(conversations, "twitter", only)) notes.push(...(await fetchTwitter(context, account, stored.filter((n) => n.platform === "twitter" && n.account === account && !n.path), lines)));
      }
      if (wants("discord")) {
        for (const account of accountsOf(conversations, "discord", only)) {
          const found = await findDiscord(context, account, conversations, lines);
          conversations = found.conversations;
          notes.push(...found.notes.filter((n) => n.path));
          const lost = found.notes.filter((n) => !n.path);
          if (lost.length) lines.push(`discord ${account}: ${lost.length} voice note file(s) didn't download from Discord's CDN`);
        }
      }
      const todo = unique(notes);
      const missing = unique(stored.filter((n) => !n.path)).filter((n) => !todo.some((t) => t.platform === n.platform && t.messageId === n.messageId && t.name === n.name));
      context.err(`transcribe: ${todo.length} voice note file(s) to transcribe with AssemblyAI (each kept by its hash, so one already done isn't sent again)`);
      const results = await transcribeNotes(todo, client, context.err);
      const applied = applyTranscripts(loadConversations());
      if (applied.changed.length) saveConversations(applied.changed);
      let indexed: string | null = null;
      if (parsed.flags["noIndex"] !== true && applied.changed.length) {
        const embedder = searchDeps.embedder();
        try {
          context.err(`transcribe: updating the search index with the ${applied.changed.length} conversation(s) that changed`);
          const built = await updateIndex(loadConversations(), embedder);
          indexed = `search index: ${built.embedded} chunk(s) embedded, ${built.chunks} in all`;
        } finally {
          embedder.stop?.();
        }
      }
      const done = results.filter((r) => r.answer?.ok);
      const fresh = done.filter((r) => r.answer?.ok && !r.answer.cached).length;
      const failed = results.filter((r) => r.answer && !r.answer.ok);
      if (json) return { code: failed.length ? 1 : 0, stdout: JSON.stringify({ transcribed: done.length, new: fresh, cached: done.length - fresh, failed: failed.map((r) => ({ note: r.note, answer: r.answer })), missing, conversationsChanged: applied.changed.length, notes: done.map((r) => ({ ...r.note, transcript: r.answer?.ok ? r.answer.transcript.text : null })), lines, indexed }, null, 2) };
      return {
        code: failed.length ? 1 : 0,
        stdout: [
          `log transcribe: ${done.length} voice note(s) transcribed (${fresh} new with AssemblyAI, ${done.length - fresh} from the cache), ${failed.length} failed, ${missing.length} without their file; ${applied.changed.length} conversation(s) rewritten in the store`,
          ...(done.length ? ["by who said it:", ...byPerson(results, "matt")] : []),
          ...failed.map((r) => `  failed: ${r.note.platform} ${r.note.account} ${r.note.messageId} ${r.note.name}: ${r.answer && !r.answer.ok ? `${r.answer.code}: ${r.answer.error}` : ""}`),
          ...lines,
          ...(indexed ? [indexed] : []),
        ].join("\n"),
      };
    } catch (error) {
      return refuseError("transcribe", error);
    }
  },
};

