import { recentPass, recordPass } from "../../../voice/passes/index.ts";
import { timed, timedSync } from "../../../observability/timing/index.ts";
import { incomingSince } from "../../../inbox/watch/index.ts";
import { existsSync, readFileSync, statSync } from "node:fs";
import { roomOf } from "../../../voice/room/index.ts";
import type { Room, RoomKind } from "../../../voice/room/index.ts";
import { NOT_SAID, REACTION } from "../../../inbox/lastWord/index.ts";
import { join } from "node:path";
import { storedEmbedder, ownTextsSince, personOf } from "../../../inbox/store/index.ts";
import { SAMENESS_WINDOW_HOURS, samenessLine, samenessOf } from "../../../voice/sameness/index.ts";
import { firstClonedAt, mattsOwnVoiceNotes, mattsRecordings } from "../../../extensions/voiceClone/index.ts";
import { hashOf, readTranscript } from "../../../media/voiceNotes/index.ts";
import { chatContextOf } from "../../../inbox/context/index.ts";
import { watermarkLine } from "../../../twitter/copy/watermark/index.ts";
import { aiIndexDir, aiTellsLine, buildAiIndex, JINA_EMBED_MODEL, jinaEmbedder, openAiIndex, readAiTells } from "../../../voice/aiTells/index.ts";
import type { AiEmbedder, AiReading } from "../../../voice/aiTells/index.ts";
import { matchChat } from "../../../discord/chat/match/index.ts";
import type { DiscordChat } from "../../../discord/chat/match/index.ts";
import { loadConversations, localEmbedder } from "../../../search/conversations/index.ts";
import type { Conversation, Embedder } from "../../../search/conversations/index.ts";
import { createDecisionsClient } from "../../../subq/decisions/index.ts";
import { attachedOf, briefFailedParts, briefLine, readBrief } from "../../../voice/brief/index.ts";
import type { DecisionsClient } from "../../../subq/decisions/index.ts";
import { CONTEXT_PASS, guidePath, nobodyToAnswer, RANKED_CONTEXT, RANKED_SHORTLIST, readGuide, readVoice, VOICE_PASS } from "../../../twitter/copy/voice/index.ts";
import type { VoiceEvidence, VoiceReading } from "../../../twitter/copy/voice/index.ts";
import { buildVoiceIndex, closestWording, nearestPairs, offProfile, openVoiceIndex, profileFor, recentInChat, voiceDir } from "../../../voice/pairs/index.ts";
import type { VoicePair } from "../../../voice/pairs/index.ts";
import type { NearPair, VoiceProfile, VoiceTarget } from "../../../voice/pairs/index.ts";
import { buildPhraseIndex, openPhraseIndex, phrasesLine, readPhrases, writePhraseIndex } from "../../../voice/phrases/index.ts";
import type { PhraseReading } from "../../../voice/phrases/index.ts";
import { scramblerLine, scramblerReadingOf } from "../../../twitter/copy/scrambler/index.ts";
import type { ScramblerReading } from "../../../twitter/copy/scrambler/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput, CommandResult } from "../../runner/types.ts";


export const VOICE_USAGE = [
  "Usage: log voice --to <handle> [--text \"<draft>\"] [--context \"<what they said>\"] [--with <person or chat>] [--spoken] [--json]",
  "       log voice aiIndex [--json]   (builds the AI tells index: every literal phrase in vendor/aiTells, tbhb/vale-ai-tells first and then the other lists, embedded with Jina (JINA_API_KEY), with matt's own replies from the voice index measured against it for his p50 and p99 closeness, and the vale rules he uses himself muted; the gate builds it itself when it is missing or older than the voice index; rule 112)",
  "       log voice index [--json]   (builds matt's voice from every conversation log search already saved, reading nothing new: each of his replies paired with what was said just before it, embedded with log search's own model, and a profile per chat, person and platform counted from his own messages)",
  "Gates a draft before anything is sent as matt (his rule, 2026-10-27): SubQ reads it against matt's own writing guide (GUIDES/MATT_WRITING_STYLE.md, built from 256 of his tweets) and the dms he wrote himself, and answers whether it sounds like he typed it (voice, 0.8 to pass), whether it answers what they said (--context) or something specific about them, whether it reads like a mate texting, and, to someone matt has never talked with, whether it is only a relevant opener with no ask or pitch (openerOnly, matt 2026-10-31). A phrase matt never says (hit home, big swing, spot on, felt that…) fails it outright. Sends nothing.",
  "--with names the chat or person the way matt says it (\"the log group\", \"jilly\", a handle): log finds matt's real replies to things like --context, from that chat first, then that person, then that platform, then anywhere, and how he writes there (length, case, punctuation, his words). Without --text it shows them to draft from; with --text the gate also asks whether the draft reads like his real replies there (toThem, 0.7 to pass). Every gate also reads his nearest real replies, closest wording and style across all his conversations, every platform, beside the chat's own, never the writing guide alone.",
  "--spoken gates a voice note: it is graded as said out loud, so its length and punctuation never count against it, and it must build on what they are talking about across the whole chat, adding to it, never repeating what matt already told them (buildsOn, 0.7 to pass, rule 149). Every voice note send is gated this way.",
  "Exit 0 when it passes, 1 when it doesn't: rewrite and gate again.",
].join("\n");

export const VOICE_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Gate a draft against matt's own writing guide with SubQ before it is sent, sending nothing",
      positionals: [],
      flags: [
        { name: "to", kind: "string", required: true, description: "Who the draft is for (their handle)" },
        { name: "text", kind: "string", description: "The draft (leave it out with --with to see matt's real replies there first)" },
        { name: "context", kind: "string", description: "What they said, that the draft answers" },
        { name: "with", kind: "string", description: "The chat or person as matt says it, to write and gate it the way he writes there" },
        { name: "spoken", kind: "boolean", description: "The draft is a voice note: graded as said out loud, its length never counted against it, and it must build on what they are talking about across the whole chat instead of repeating what matt already said (rule 149)" },
        JSON_FLAG,
      ],
    },
    {
      words: ["aiIndex"],
      summary: "Build the AI tells index with Jina and measure matt's own messages against it",
      positionals: [],
      flags: [JSON_FLAG],
    },
    {
      words: ["index"],
      summary: "Build matt's voice per chat and person from the conversations log search saved",
      positionals: [],
      flags: [JSON_FLAG],
    },
  ],
};

let warmEmbedder: Embedder | null = null;

export const voiceDeps: { decisions: () => DecisionsClient; embedder: () => Embedder; aiEmbedder: () => AiEmbedder; scrambler: (text: string) => ScramblerReading; howMattTalks: () => string[] } = { decisions: () => createDecisionsClient(), embedder: () => (warmEmbedder ??= storedEmbedder(localEmbedder(), "voice")), aiEmbedder: () => jinaEmbedder(), scrambler: (text) => scramblerReadingOf(text), howMattTalks: () => howMattTalks() };

export function renderVoice(reading: VoiceReading & { notHere?: string[]; aiTells?: AiReading; phrases?: PhraseReading; scrambler?: ScramblerReading }): string {
  const scores = `voice ${reading.voice.toFixed(2)} · answers them ${reading.inContext.toFixed(2)} · reads like a mate ${reading.friendLike.toFixed(2)} · opener only ${reading.openerOnly.toFixed(2)}${reading.toThem === null ? "" : ` · like his replies there ${reading.toThem.toFixed(2)}`}${reading.buildsOn === null || reading.buildsOn === undefined ? "" : ` · builds on the chat ${reading.buildsOn.toFixed(2)}`}`;
  const never = reading.neverSays.length ? ` · matt never says: ${reading.neverSays.join(", ")}` : "";
  const notHere = reading.notHere?.length ? `\n  he never writes it here: ${reading.notHere.join("; ")}` : "";
  const watermark = reading.watermark ? `\n  ${watermarkLine(reading.watermark)}` : "";
  const ai = reading.aiTells ? `\n  ${aiTellsLine(reading.aiTells)}` : "";
  const phrases = reading.phrases ? `\n  ${phrasesLine(reading.phrases)}` : "";
  const scrambler = reading.scrambler ? `\n  ${scramblerLine(reading.scrambler)}` : "";
  return `log voice: @${reading.to.replace(/^@/, "")} ${reading.pass ? "PASS" : "FAIL"}: ${scores}${never}${notHere}${watermark}${ai}${phrases}${scrambler}${reading.pass ? "" : "\n  rewrite it in matt's words and gate it again"}`;
}

function chatsOf(conversations: readonly Conversation[]): (DiscordChat & { platform: string; target: VoiceTarget })[] {
  const seen = new Set<string>();
  return conversations.filter((c) => {
    const key = c.platform === "twitter" ? `twitter:${[...c.with].sort().join(",").toLowerCase()}` : `${c.platform}:${c.conversationId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((c) => {
    const named = /^group (.+)$/.exec(c.box)?.[1] ?? null;
    return { id: c.platform === "twitter" ? `twitter:${[...c.with].sort().join(",").toLowerCase()}` : `${c.platform}:${c.conversationId}`, kind: c.with.length > 1 || c.box.startsWith("group") ? "group" : "dm", name: named, members: c.with, platform: c.platform, target: c.platform === "twitter" ? { with: c.with } : { platform: c.platform, conversationId: c.conversationId, with: c.with } };
  });
}

export function profileLine(profile: VoiceProfile): string {
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return `${profile.replies} of his messages: median ${profile.medianWords} words, ${pct(profile.lowercase)} all lowercase, commas ${pct(profile.commas)}, full stops ${pct(profile.fullStops)}, questions ${pct(profile.questions)}, ! ${pct(profile.exclamations)}, emoji ${pct(profile.emoji)}; opens with ${profile.openers.join(", ") || "-"}; his words here: ${profile.words.join(", ") || "-"}`;
}

function nearLines(near: readonly NearPair[]): string[] {
  return near.flatMap((n) => [`  [${n.tier}] ${n.pair.chat} (${n.pair.platform}, ${String(n.pair.at ?? "").slice(0, 10)})`, ...(n.pair.said ? [`    ${n.pair.saidBy ?? "them"}: ${n.pair.said.replace(/\n/g, " / ").slice(0, 200)}`] : []), `    matt: ${n.pair.reply.replace(/\n/g, " / ").slice(0, 240)}`]);
}

async function evidenceFor(context: CommandContext, said: string, chat: string, draft = ""): Promise<{ ok: true; evidence: VoiceEvidence; near: NearPair[]; wording: NearPair[]; recent: VoicePair[]; profile: VoiceProfile | null; label: string } | { ok: false; result: CommandResult }> {
  const chats = chatsOf(loadConversations());
  const byId = /^\d{15,22}$/.test(chat) ? chats.find((c) => c.id.endsWith(`:${chat}`)) : undefined;
  const found = byId ? matchChat(chats, byId.id) : matchChat(chats, chat);
  if (!found.ok) return { ok: false, result: refuse("voice", found.code, [found.detail, ...found.candidates.map((c) => `  ${c.id}  ${c.label}`)].join("\n")) };
  const picked = chats.find((c) => c.id === found.chat.id)!;
  const label = `${found.label} (${picked.platform} ${picked.kind})`;
  context.err(`voice: "${chat}" is ${label}; finding matt's real replies there`);
  const index = await openVoiceIndex(voiceDeps.embedder());
  try {
    const near = await nearestPairs(index, said, picked.target);
    const wording = draft.trim() ? await closestWording(index, draft, picked.target) : [];
    const recent = recentInChat(index, picked.target);
    const profile = profileFor(index, picked.target);
    return {
      ok: true,
      near,
      wording,
      recent,
      profile,
      label,
      evidence: {
        chat: label,
        profile,
        replies: near.map((n) => ({ said: n.pair.said, reply: n.pair.reply, chat: n.pair.chat, tier: n.tier })),
        wording: wording.map((n) => ({ reply: n.pair.reply, chat: n.pair.chat, tier: n.tier })),
        recent: recent.map((p) => ({ said: p.said, reply: p.reply })),
      },
    };
  } finally {
    await index.close();
  }
}

export async function evidenceAnywhere(context: CommandContext, said: string, to: string, draft: string): Promise<VoiceEvidence | undefined> {
  const handle = to.replace(/^@/, "");
  const target: VoiceTarget = { with: [handle] };
  const index = await openVoiceIndex(voiceDeps.embedder()).catch(() => null);
  if (!index) {
    context.err("voice: no voice index yet, so matt's writing everywhere isn't compared: build it with `log voice index`");
    return undefined;
  }
  try {
    if (!index.pairs.length) return undefined;
    const near = await nearestPairs(index, said || draft, target);
    const wording = draft.trim() ? await closestWording(index, draft, target) : [];
    const label = `matt's writing across all his conversations, every platform (for @${handle})`;
    return {
      chat: label,
      profile: profileFor(index, target),
      replies: near.map((n) => ({ said: n.pair.said, reply: n.pair.reply, chat: n.pair.chat, tier: n.tier })),
      wording: wording.map((n) => ({ reply: n.pair.reply, chat: n.pair.chat, tier: n.tier })),
      recent: [],
    };
  } finally {
    await index.close();
  }
}

export function aiIndexStale(dir = aiIndexDir(), pairsFile = join(voiceDir(), "pairs.json"), model: string | null = null): boolean {
  const index = openAiIndex(dir, model);
  if (!index) return true;
  if (!existsSync(pairsFile)) return false;
  return statSync(pairsFile).mtimeMs > Date.parse(index.builtAt);
}

async function ensureAiIndex(context: CommandContext): Promise<void> {
  if (!aiIndexStale(aiIndexDir(), join(voiceDir(), "pairs.json"), JINA_EMBED_MODEL)) return;
  const pairsFile = join(voiceDir(), "pairs.json");
  const replies = existsSync(pairsFile) ? (JSON.parse(readFileSync(pairsFile, "utf8")) as VoicePair[]).map((p) => p.reply) : [];
  context.err(`voice: the AI tells index is ${openAiIndex(aiIndexDir(), JINA_EMBED_MODEL) ? "older than matt's voice index" : `missing for ${JINA_EMBED_MODEL}`}, so it is built now (rule 112)`);
  await buildAiIndex(voiceDeps.aiEmbedder(), replies, aiIndexDir(), undefined, undefined, (line) => context.err(line));
}

export function ensurePhraseIndex(context: CommandContext, dir = voiceDir()) {
  const existing = openPhraseIndex(dir);
  const pairsFile = join(dir, "pairs.json");
  if (existing && (!existsSync(pairsFile) || statSync(pairsFile).mtimeMs <= Date.parse(existing.builtAt))) return existing;
  if (!existsSync(pairsFile)) return null;
  context.err("voice: measuring how matt words things from every reply in the voice index (rule 127)");
  const built = buildPhraseIndex((JSON.parse(readFileSync(pairsFile, "utf8")) as VoicePair[]).map((p) => p.reply));
  writePhraseIndex(built, dir);
  return built;
}

export const voiceCommand: Command = {
  usage: VOICE_USAGE,
  platform: "any",
  name: "voice",
  effect: "read",
  input: VOICE_INPUT,
  summary: "Gate a draft against matt's own writing guide with SubQ before anything is sent as him, sending nothing",
  args: "--to <handle> [--text \"<draft>\"] [--context \"<what they said>\"] [--with <chat>] [--json] | index | aiIndex",
  async run(context, argv) {
    if (argv[0] === "aiIndex") {
      const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...VOICE_INPUT.forms[1], words: [] }] }));
      if (!parsed.ok) return { code: 1, stderr: `log voice aiIndex: ${parsed.error}\n${VOICE_USAGE}` };
      try {
        const pairsFile = join(voiceDir(), "pairs.json");
        const replies = existsSync(pairsFile) ? (JSON.parse(readFileSync(pairsFile, "utf8")) as VoicePair[]).map((p) => p.reply) : [];
        if (!replies.length) context.err("voice aiIndex: no voice index yet, so there is no baseline of matt's own messages: build it with `log voice index` first");
        const started = Date.now();
        const meta = await buildAiIndex(voiceDeps.aiEmbedder(), replies, aiIndexDir(), undefined, undefined, (line) => context.err(line));
        const line = `log voice aiIndex: ${meta.phrases.length} AI phrases embedded with ${meta.model}; matt's own ${meta.baseline.messages} messages sit at p50 ${meta.baseline.p50.toFixed(3)}, p99 ${meta.baseline.p99.toFixed(3)} from them; ${meta.baseline.mutedRules.length} vale rules muted because he uses them himself (${meta.baseline.mutedRules.join(", ") || "none"}); ${meta.baseline.mattsPhrases?.length ?? 0} phrases vale flags that he says himself in 5 or more messages, never held against a draft; ${((Date.now() - started) / 1000).toFixed(1)} s at ${aiIndexDir()}`;
        return { code: 0, stdout: parsed.flags["json"] ? JSON.stringify({ phrases: meta.phrases.length, model: meta.model, baseline: meta.baseline }, null, 2) : line };
      } catch (error) {
        return refuseError("voice aiIndex", error);
      }
    }
    if (argv[0] === "index") {
      const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...VOICE_INPUT.forms[2], words: [] }] }));
      if (!parsed.ok) return { code: 1, stderr: `log voice index: ${parsed.error}\n${VOICE_USAGE}` };
      try {
        const conversations = loadConversations();
        const embedder = voiceDeps.embedder();
        context.err(`voice: pairing matt's replies in ${conversations.length} saved conversations and embedding them with ${embedder.model}`);
        const built = await buildVoiceIndex(conversations, embedder);
        embedder.stop?.();
        const line = `log voice index: ${built.pairs} of matt's replies paired with what was said before them, ${built.profiles} profiles (chat, person, platform), in ${(built.ms / 1000).toFixed(1)} s at ${voiceDir()}`;
        return { code: 0, stdout: parsed.flags["json"] ? JSON.stringify(built, null, 2) : line };
      } catch (error) {
        return refuseError("voice index", error);
      }
    }
    const parsed = parseArgs(argv, parserSpecOf({ forms: [VOICE_INPUT.forms[0]] }));
    if (!parsed.ok) return { code: 1, stderr: `log voice: ${parsed.error}\n${VOICE_USAGE}` };
    const to = parsed.flags["to"];
    const text = typeof parsed.flags["text"] === "string" ? parsed.flags["text"] : "";
    const said = typeof parsed.flags["context"] === "string" ? parsed.flags["context"].trim() : "";
    const chat = typeof parsed.flags["with"] === "string" ? parsed.flags["with"].trim() : "";
    if (typeof to !== "string" || !to.trim()) return refuse("voice", "targetMissing", "--to names who the draft is for");
    if (!text.trim() && !chat) return refuse("voice", "textMissing", "--text is the draft to gate (or give --with to see matt's real replies there first)");
    const guide = readGuide();
    if (!guide) return refuse("voice", "voiceGuideMissing", `matt's writing guide isn't at ${guidePath()}`);
    try {
      let evidence: VoiceEvidence | undefined;
      if (chat) {
        const found = await evidenceFor(context, said || text, chat, text);
        if (!found.ok && !text.trim()) return found.result;
        if (found.ok) evidence = found.evidence;
        if (found.ok && !text.trim()) {
          if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ chat: found.label, profile: found.profile, replies: found.near }, null, 2) };
          return { code: 0, stdout: [`log voice: how matt writes in ${found.label}`, `  ${found.profile ? profileLine(found.profile) : "no messages of his there yet"}`, `his latest messages here:`, ...found.recent.map((p) => `    matt: ${p.reply.replace(/\n/g, " / ").slice(0, 240)}`), `his real replies to things like this, nearest first (same chat, same person, same platform, anywhere):`, ...nearLines(found.near), "Draft from these, then gate it: log voice --to <who> --with <chat> --context \"<what they said>\" --text \"<draft>\""].join("\n") };
        }
      }
      const reading = await gateReading(context, { to, text, said, guide, ...(evidence ? { evidence } : {}), ...(parsed.flags["spoken"] === true ? { spoken: true } : {}) });
      if (reading.pass && text.trim()) recordPass(text, to, reading.voice);
      if (parsed.flags["json"]) return { code: reading.pass ? 0 : 1, stdout: JSON.stringify(reading, null, 2) };
      return { code: reading.pass ? 0 : 1, stdout: renderVoice(reading) };
    } catch (error) {
      return refuseError("voice", error);
    }
  },
};

export type GateReading = VoiceReading & { notHere: string[]; aiTells?: AiReading; phrases?: PhraseReading; scrambler: ScramblerReading; ranked: RankedMoment[]; room?: Room };

export interface RankedMoment {
  from: string;
  text: string;
  at: string;
}

export async function rankedContext(platform: string, account: string, who: { conversationId?: string | null; handle?: string | null; userId?: string | null }, moment: string, top = RANKED_CONTEXT): Promise<RankedMoment[]> {
  const held = chatContextOf(platform, account, who);
  const lines = held.messages.filter((m) => m.text.trim() || m.mediaLines.length).map((m) => ({ from: m.fromMe ? "matt" : m.senderId, text: [m.text, ...m.mediaLines].filter(Boolean).join(" "), at: m.time }));
  if (!lines.length || !moment.trim()) return lines.slice(-top);
  const embedder = voiceDeps.aiEmbedder();
  const [query, ...vectors] = await embedder.embed([moment, ...lines.map((l) => l.text)]);
  const byMeaning = lines.map((l, i) => ({ l, c: cosineOf(query, vectors[i]) })).sort((a, b) => b.c - a.c).slice(0, RANKED_SHORTLIST).map((x) => x.l);
  const scores = await embedder.rerank(moment, byMeaning.map((l) => `${l.from}: ${l.text}`));
  return byMeaning.map((l, i) => ({ l, s: scores[i] ?? 0 })).sort((a, b) => b.s - a.s).slice(0, top).map((x) => x.l).sort((a, b) => a.at.localeCompare(b.at));
}

function cosineOf(a: ArrayLike<number>, b: ArrayLike<number>): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return na && nb ? dot / Math.sqrt(na * nb) : 0;
}

export async function gateReading(context: CommandContext, draft: { to: string; text: string; said: string; guide: string; evidence?: VoiceEvidence; ranked?: RankedMoment[]; spoken?: boolean; room?: Room }): Promise<GateReading> {
  const { to, text, said, guide, evidence } = draft;
  const ranked = draft.ranked ?? [];
  const everywhere = await evidenceAnywhere(context, said, to, text);
  context.err(`voice: SubQ reading the draft for @${to.replace(/^@/, "")} against matt's writing across all his conversations${evidence ? ` and his real replies in ${evidence.chat}` : ""}${ranked.length ? `, with ${ranked.length} moment(s) of this chat ranked against what is being answered` : ""}, with his writing guide`);
  const phraseIndex = ensurePhraseIndex(context);
  if (!phraseIndex) context.err("voice: no voice index yet, so matt's own phrasing isn't measured: build it with `log voice index`");
  const phrases = phraseIndex ? readPhrases(text, phraseIndex, said) : undefined;
  const scrambler = voiceDeps.scrambler(text);
  const scored = await readVoice({ to, text, ...(said ? { context: said } : {}), ...(evidence ? { evidence } : {}), ...(everywhere ? { everywhere } : {}), ...(phrases ? { phrasesNewToMatt: phrases.unfamiliar } : {}), ...(ranked.length ? { conversation: ranked } : {}), ...(draft.spoken ? { spoken: true, howMattTalks: voiceDeps.howMattTalks() } : {}), ...(draft.room ? { room: draft.room } : {}), ...(scrambler.ran ? { scrambler: { suspicious: scrambler.suspicious, kinds: [...new Set(scrambler.hits.map((h) => h.kind))] } } : {}) }, guide, voiceDeps.decisions());
  const notHere = evidence && !draft.spoken ? offProfile(text, evidence.profile as VoiceProfile | null) : [];
  await ensureAiIndex(context);
  const aiIndex = openAiIndex(aiIndexDir(), JINA_EMBED_MODEL);
  if (!aiIndex) context.err("voice: the AI tells index couldn't be built, so AI phrasing isn't checked");
  const aiTells = aiIndex ? await readAiTells(text, aiIndex, voiceDeps.aiEmbedder()) : undefined;
  return { ...scored, notHere, ...(aiTells ? { aiTells } : {}), ...(phrases ? { phrases } : {}), scrambler, ranked, ...(draft.room ? { room: draft.room } : {}), pass: scored.pass && !notHere.length && (aiTells?.pass ?? true) && (phrases?.pass ?? true) && scrambler.suspicious === 0 };
}

export function howMattTalks(): string[] {
  return mattsOwnVoiceNotes(mattsRecordings(), firstClonedAt()).flatMap((r) => {
    if (!existsSync(r.path)) return [];
    const text = readTranscript(hashOf(new Uint8Array(readFileSync(r.path))))?.text?.trim();
    return text ? [text.slice(0, 1500)] : [];
  });
}

export function failedParts(reading: GateReading): string[] {
  const out: string[] = [];
  if (reading.neverSays.length) out.push(`phrases matt never says: ${reading.neverSays.join(", ")}`);
  if (reading.watermark.level === "artifacts") out.push(`AI artifacts in the text: ${watermarkLine(reading.watermark)}`);
  if (reading.voice < VOICE_PASS) out.push(`doesn't sound like matt ${reading.buildsOn === null ? "typed" : "said"} it (voice ${reading.voice.toFixed(2)}, needs ${VOICE_PASS})`);
  if (reading.fitsTheRoom !== null && reading.fitsTheRoom !== undefined && reading.fitsTheRoom < CONTEXT_PASS) out.push(`talks to someone who isn't there, or as if the chat were live when it isn't (fitsTheRoom ${reading.fitsTheRoom.toFixed(2)})`);
  if (reading.buildsOn !== null && reading.buildsOn < CONTEXT_PASS) out.push(`repeats what matt already said instead of building on what they're talking about (buildsOn ${reading.buildsOn.toFixed(2)})`);
  if (reading.inContext < CONTEXT_PASS && !nobodyToAnswer({ room: reading.room })) out.push(`doesn't answer what they said (inContext ${reading.inContext.toFixed(2)})`);
  if (reading.friendLike < CONTEXT_PASS) out.push(`reads like a template or a pitch (friendLike ${reading.friendLike.toFixed(2)})`);
  if (reading.openerOnly < CONTEXT_PASS) out.push(`a first message with an ask in it (openerOnly ${reading.openerOnly.toFixed(2)})`);
  if (reading.toThem !== null && reading.toThem < CONTEXT_PASS) out.push(`not how matt writes in this chat (toThem ${reading.toThem.toFixed(2)})`);
  if (reading.notHere.length) out.push(`never used by matt here: ${reading.notHere.join(", ")}`);
  if (reading.aiTells && !reading.aiTells.pass) out.push(aiTellsLine(reading.aiTells));
  if (reading.phrases && !reading.phrases.pass) out.push(phrasesLine(reading.phrases));
  if (reading.scrambler.suspicious) out.push(scramblerLine(reading.scrambler));
  return out;
}

export function chatIdFor(conversations: readonly Conversation[], send: { platform: string; conversationId?: string | null; userId?: string | null; handle?: string | null }): string | null {
  const mine = conversations.filter((c) => c.platform === send.platform && (c.platform !== "twitter" || c.with.some(Boolean)));
  const parties = (id: string) => id.split(/[-:]/).filter(Boolean);
  const found = mine.find((c) => !!send.conversationId && c.conversationId === send.conversationId)
    ?? (send.platform === "twitter" && send.userId ? mine.find((c) => parties(c.conversationId).includes(String(send.userId))) : undefined)
    ?? (send.handle ? mine.find((c) => c.with.some((w) => w.replace(/^@/, "").toLowerCase() === String(send.handle).replace(/^@/, "").toLowerCase())) : undefined);
  if (!found) return null;
  return found.platform === "twitter" ? `twitter:${[...found.with].sort().join(",").toLowerCase()}` : `${found.platform}:${found.conversationId}`;
}

export async function chatEvidence(context: CommandContext, said: string, send: { platform: string; conversationId?: string | null; userId?: string | null; handle?: string | null }, draft: string): Promise<VoiceEvidence | undefined> {
  const id = chatIdFor(loadConversations(undefined, { platform: send.platform }), send);
  if (!id) return undefined;
  const found = await evidenceFor(context, said, id, draft).catch(() => null);
  return found?.ok ? found.evidence : undefined;
}

export function momentAnswered(messages: readonly { fromMe: boolean; text: string; time: string }[]): string {
  const sorted = [...messages].filter((m) => m.text.trim()).sort((a, b) => String(a.time).localeCompare(String(b.time)));
  const lastOfMine = sorted.map((m) => m.fromMe).lastIndexOf(true);
  return sorted.slice(lastOfMine + 1).map((m) => m.text).join("\n");
}

export function saidOnly<T extends { text?: string | null }>(messages: readonly T[]): T[] {
  return messages.filter((m) => !REACTION.test(String(m.text ?? "").trim()) && !NOT_SAID.test(String(m.text ?? "").trim()));
}

export function roomKindOf(send: { platform: string; conversationId?: string | null; handle?: string | null; userId?: string | null }): RoomKind {
  if (send.platform !== "twitter") return "unknown";
  if (send.conversationId?.startsWith("g")) return "group";
  return send.conversationId || send.handle || send.userId ? "dm" : "unknown";
}

type GateSend = { platform: string; account: string; to: string; text: string; conversationId?: string | null; handle?: string | null; userId?: string | null; said?: string; spoken?: boolean; room?: Room; readRoom?: () => Room | undefined; brief?: boolean; files?: readonly string[] };

export function gateSend(context: CommandContext, send: GateSend): Promise<{ ok: true; line: string } | { ok: false; refused: string }> {
  return timed("voice.gate", async (span) => {
    const result = await gateSendNow(context, send);
    span.attrs.passed = result.ok;
    return result;
  }, { platform: send.platform, brief: send.brief === true, spoken: send.spoken === true });
}

async function gateSendNow(context: CommandContext, send: GateSend): Promise<{ ok: true; line: string } | { ok: false; refused: string }> {
  const same = timedSync("voice.sameness", () => gateDeps.same({ platform: send.platform, account: send.account, to: send.to, text: send.text }));
  if (!same.ok) return { ok: false, refused: same.refused };
  if (send.brief) return gateBrief(send);
  const prior = recentPass(send.text);
  if (prior && send.conversationId && !incomingSince(send.platform, send.account, send.conversationId, prior.at).length) return { ok: true, line: `voice gate: this exact text passed at ${prior.at} (voice ${prior.voice.toFixed(2)}) and nobody has written in the chat since, so SubQ wasn't asked again` };
  const guide = readGuide();
  if (!guide) return { ok: false, refused: `>>> VOICE GATE: matt's writing guide isn't at ${guidePath()}, so nothing is sent until it is back` };
  const handle = send.handle || (send.userId ? personOf(send.platform, send.account, String(send.userId)) : null);
  const who = { conversationId: send.conversationId ?? null, handle, userId: send.userId ?? null };
  const held = timedSync("voice.chatContext", () => saidOnly(chatContextOf(send.platform, send.account, who).messages));
  const said = send.said ?? momentAnswered(held);
  const room = send.room ?? timedSync("voice.room", () => send.readRoom?.()) ?? roomOf(send.to, roomKindOf(send), held.map((m) => ({ from: m.fromMe ? "matt" : String(m.senderId ?? "them"), fromMe: !!m.fromMe, at: String(m.time ?? "") })));
  const ranked = await timed("voice.rankedContext", () => rankedContext(send.platform, send.account, who, [said, send.text].filter((t) => t.trim()).join("\n"))).catch(() => []);
  const evidence = await timed("voice.evidence", () => chatEvidence(context, said, { platform: send.platform, conversationId: send.conversationId, userId: send.userId, handle }, send.text));
  const reading = await timed("voice.reading", () => gateReading(context, { to: handle || send.to, text: send.text, said, guide, ranked, ...(evidence ? { evidence } : {}), ...(send.spoken ? { spoken: true } : {}), room }));
  if (reading.pass) {
    recordPass(send.text, send.to, reading.voice);
    return { ok: true, line: `voice gate: passed for ${handle ? `@${handle}` : send.to} (voice ${reading.voice.toFixed(2)})` };
  }
  return { ok: false, refused: [`>>> VOICE GATE FAILED for ${handle ? `@${handle}` : send.to}, nothing was sent; rewrite it in matt's words and send again:`, ...failedParts(reading).map((p) => `  - ${p}`), ...rewriteSteps({ to: handle || send.to, said })].join("\n") };
}

export async function gateBrief(send: { platform: string; account: string; to: string; text: string; conversationId?: string | null; handle?: string | null; userId?: string | null; room?: Room; readRoom?: () => Room | undefined; files?: readonly string[] }): Promise<{ ok: true; line: string } | { ok: false; refused: string }> {
  const scrambler = voiceDeps.scrambler(send.text);
  if (scrambler.suspicious) return { ok: false, refused: `>>> BRIEF GATE FAILED for ${send.to}, nothing was sent: ${scramblerLine(scrambler)}` };
  const who = { conversationId: send.conversationId ?? null, handle: send.handle ?? null, userId: send.userId ?? null };
  const held = saidOnly(chatContextOf(send.platform, send.account, who).messages);
  const room = send.room ?? send.readRoom?.() ?? roomOf(send.to, roomKindOf(send), held.map((m) => ({ from: m.fromMe ? "matt" : String(m.senderId ?? "them"), fromMe: !!m.fromMe, at: String(m.time ?? "") })));
  const conversation = await timed("voice.rankedContext", () => rankedContext(send.platform, send.account, who, [momentAnswered(held), send.text].filter((t) => t.trim()).join("\n"))).catch(() => []);
  const guide = readGuide();
  const reading = await timed("voice.briefReading", () => readBrief({ to: send.to, text: send.text, conversation, ...(room ? { room } : {}), attached: attachedOf(send.files ?? []), ...(guide ? { howMattWrites: guide } : {}) }, voiceDeps.decisions()));
  if (reading.pass) return { ok: true, line: briefLine(reading) };
  return { ok: false, refused: [`>>> BRIEF GATE FAILED for ${send.to}, nothing was sent; a task has to say what to do, why, what done looks like and by when, kindly, and how to ask when stuck (rule 162):`, ...briefFailedParts(reading).map((p) => `  - ${p}`)].join("\n") };
}

export function sameAsSent(send: { platform: string; account: string; to: string; text: string }, now: Date = new Date()): { ok: true } | { ok: false; refused: string } {
  const since = new Date(now.getTime() - SAMENESS_WINDOW_HOURS * 3600_000).toISOString();
  const reading = samenessOf(send.text, ownTextsSince(send.platform, send.account, since).map((s) => ({ to: s.to, text: s.text })));
  if (reading.pass) return { ok: true };
  return { ok: false, refused: [`>>> SAME AS ANOTHER SEND, nothing was sent to ${send.to}: ${samenessLine(reading)}`, ...rewriteSteps({ to: send.to })].join("\n") };
}

export function rewriteSteps(send: { to: string; said?: string }): string[] {
  const about = (send.said ?? "").replace(/\s+/g, " ").trim().slice(0, 80);
  return [
    "Before you rewrite it, look, don't guess (rule 158):",
    `  1. \`voice\` { to: "${send.to}", with: "${send.to}"${about ? `, context: "${about}"` : ""} } with no text: matt's own latest lines to them and his real replies to things like it.`,
    `  2. \`search\` { query: "${about || "what they said"}" }: how matt answered the same kind of thing anywhere, every platform.`,
    "  3. Write it from those, in his words and his length, answering what they actually said. Make it read unlike anything else you have sent today: a platform reads a run of near-copies as automation.",
  ];
}

export const gateDeps: { gate: typeof gateSend; same: typeof sameAsSent } = { gate: (context, send) => gateSend(context, send), same: (send) => sameAsSent(send) };
