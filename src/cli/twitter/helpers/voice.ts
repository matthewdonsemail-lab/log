import { recentPass, recordPass } from "../../../voice/passes/index.ts";
import { timed, timedSync } from "../../../observability/timing/index.ts";
import { incomingSince } from "../../../inbox/watch/index.ts";
import { existsSync, readFileSync, statSync } from "node:fs";
import { roomOf } from "../../../voice/room/index.ts";
import type { Room, RoomKind } from "../../../voice/room/index.ts";
import { NOT_SAID, REACTION } from "../../../inbox/lastWord/index.ts";
import { join } from "node:path";
import { db, storedEmbedder, ownTextsSince, personOf } from "../../../inbox/store/index.ts";
import { alreadyPromisedBlock, factsForChats, openPromises, promiseLines, repeatedPromise } from "../../../people/facts/index.ts";
import type { FactRow } from "../../../people/facts/index.ts";
import { answerOwed, cardFor, renderCard, scopedToThisChat } from "../../../inbox/card/index.ts";
import type { ConversationCard } from "../../../inbox/card/index.ts";
import { SAMENESS_WINDOW_HOURS, samenessLine, samenessOf } from "../../../voice/sameness/index.ts";
import { firstClonedAt, ownersOwnVoiceNotes, ownersRecordings } from "../../../extensions/voiceClone/index.ts";
import { hashOf, readTranscript } from "../../../media/voiceNotes/index.ts";
import { chatContextOf } from "../../../inbox/context/index.ts";
import { watermarkLine } from "../../../twitter/copy/watermark/index.ts";
import { aiIndexDir, aiTellsLine, buildAiIndex, cosineOf, embedBounded, JINA_EMBED_MODEL, JINA_GATE_MS, jinaEmbedder, openAiIndex, readAiTells, rerankBounded } from "../../../voice/aiTells/index.ts";
import type { AiEmbedder, AiIndex, AiReading } from "../../../voice/aiTells/index.ts";
import { currentThreshold, hardBlocks, recordVerdict, scoreOf, scoreTable, signalsOf, verdictFor } from "../../../voice/score/index.ts";
import type { VoiceScore } from "../../../voice/score/index.ts";
import { BASELINE_REPLIES, convergenceOf } from "../../../voice/converge/index.ts";
import type { Convergence } from "../../../voice/converge/index.ts";
import { calibrate, chatWho, gradeOptions, lastMessageIdOf, openLinesOf, OPTIONS_MAX, packFor, renderPackResult } from "./voiceOptions.ts";
import { aiTellsMode, ensureConventions, recordDrafts, runVoiceTrain } from "./voiceTrain.ts";
import { conventionsLine, ownedConventions, readConventionsOf } from "../../../voice/conventions/index.ts";
import { ownersSentMatches, ownLineSummary, partsOf } from "../../../voice/owned/index.ts";
import type { OwnMatch } from "../../../voice/owned/index.ts";
import { sameChatId, sameXConversation, xPartiesOf } from "../../../twitter/dm/person/index.ts";
import type { ConventionsReading } from "../../../voice/conventions/index.ts";
import { matchChat } from "../../../discord/chat/match/index.ts";
import type { DiscordChat } from "../../../discord/chat/match/index.ts";
import { loadConversations, localEmbedder } from "../../../search/conversations/index.ts";
import type { Conversation, Embedder } from "../../../search/conversations/index.ts";
import { createDecisionsClient } from "../../../subq/decisions/index.ts";
import { attachedOf, briefFailedParts, briefLine, readBrief } from "../../../voice/brief/index.ts";
import type { DecisionsClient } from "../../../subq/decisions/index.ts";
import { CONTEXT_PASS, guidePath, nobodyToAnswer, RANKED_CONTEXT, RANKED_POOL, RANKED_SHORTLIST, readGuide, readVoices, VOICE_PASS } from "../../../twitter/copy/voice/index.ts";
import type { VoiceEvidence, VoiceReading } from "../../../twitter/copy/voice/index.ts";
import { closestWording, NEAR_PAIRS, nearestPairs, offProfile, openSharedVoiceIndex, profileFor, recentInChat, voiceDir } from "../../../voice/pairs/index.ts";
import { updateVoiceFor } from "../../../indexPass/helpers/voice.ts";
import type { VoicePair } from "../../../voice/pairs/index.ts";
import type { NearPair, VoiceProfile, VoiceTarget } from "../../../voice/pairs/index.ts";
import { buildPhraseIndex, openPhraseIndex, phrasesLine, readPhrases, writePhraseIndex } from "../../../voice/phrases/index.ts";
import type { PhraseReading } from "../../../voice/phrases/index.ts";
import { scramblerLine, scramblerReadingOf } from "../../../twitter/copy/scrambler/index.ts";
import type { ScramblerReading } from "../../../twitter/copy/scrambler/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError, refuseInput } from "../../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput, CommandResult } from "../../runner/types.ts";


export const VOICE_USAGE = [
  "Usage: log voice --to <handle> [--text \"<draft>\"] [--options \"<option>\" ...] [--context \"<what they said>\"] [--with <person or chat>] [--spoken] [--json]",
  "       log voice calibrate [--count <n>] [--json]   (sets the score's pass threshold so 95% of his held-out replies pass, stored dated)",
  "       log voice train [--fresh <n>] [--spend <usd>] [--drafts <file>] [--json]",
  "       log voice aiIndex [--json]   (old Jina index, LOG_AI_TELLS=jina)",
  "       log voice index [--json]   (builds his voice from the saved conversations: each reply paired with what came before, and a profile per chat, person and platform)",
  "Gates a draft before anything is sent as the owner, sending nothing: one score over his phrasing, his nearest real reply, AI conventions, SubQ's voice and whether it answers them, against a calibrated threshold; a never-said phrase, watermark characters or an ask in a first message fail it outright.",
  "--with names the chat or person. Without --text it returns the grounding pack (his real replies, this chat first; how he and they talk; his facts; the ask for 3-5 options). --options grades them in one call, ranked, with the fix for the best when none passes.",
  "--spoken gates a voice note: its length never counts, and it must build on the chat, not repeat it (rule 137).",
  "Exit 0 when it passes, 1 when it doesn't.",
].join("\n");

export const VOICE_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Gate a draft against the owner's own writing guide with SubQ before it is sent, sending nothing",
      positionals: [],
      flags: [
        { name: "to", kind: "string", required: true, description: "Who the draft is for (their handle)" },
        { name: "text", kind: "string", description: "The draft (leave it out with --with to get the grounding pack first)" },
        { name: "options", kind: "list", whole: true, description: "3-5 drafts to grade in one call, ranked" },
        { name: "context", kind: "string", description: "What they said, that the draft answers" },
        { name: "with", kind: "string", description: "The chat or person as the owner says it, to write and gate it the way he writes there" },
        { name: "spoken", kind: "boolean", description: "The draft is a voice note: graded as said out loud, its length never counted against it, and it must build on what they are talking about across the whole chat instead of repeating what the owner already said (rule 149)" },
        JSON_FLAG,
      ],
      groups: [{ rule: "atLeastOne", names: ["text", "with", "options"], refusal: "textMissing" }],
    },
    {
      words: ["aiIndex"],
      summary: "Build the old Jina AI tells index (LOG_AI_TELLS=jina)",
      positionals: [],
      flags: [JSON_FLAG],
    },
    {
      words: ["index"],
      summary: "Build the owner's voice per chat and person from the conversations log search saved",
      positionals: [],
      flags: [JSON_FLAG],
    },
    {
      words: ["train"],
      summary: "Retrain the AI-conventions check on the owner's messages",
      positionals: [],
      flags: [
        { name: "fresh", kind: "integer", min: 1, max: 1000, description: "Moments for frontier models to answer" },
        { name: "spend", kind: "number", description: "USD cap for --fresh (3)" },
        { name: "drafts", kind: "string", description: "JSON file of AI drafts" },
        JSON_FLAG,
      ],
    },
    {
      words: ["calibrate"],
      summary: "Set the voice score's pass threshold from the owner's own held-out replies",
      positionals: [],
      flags: [{ name: "count", kind: "integer", min: 5, max: 200, description: "How many of his replies to hold out (default 40)" }, JSON_FLAG],
    },
  ],
};

let warmEmbedder: Embedder | null = null;

export const voiceDeps: { decisions: () => DecisionsClient; embedder: () => Embedder; aiEmbedder: () => AiEmbedder; aiBuilder: () => AiEmbedder; scrambler: (text: string) => ScramblerReading; howOwnerTalks: () => string[]; owned: (texts: readonly string[]) => (OwnMatch | null)[]; facts: (card: ConversationCard) => FactRow[]; jinaMs: number } = { jinaMs: JINA_GATE_MS, facts: (card) => factsOfCard(card), owned: (texts) => ownersSentMatches(db(), texts), decisions: () => createDecisionsClient(), embedder: () => (warmEmbedder ??= storedEmbedder(localEmbedder(), "voice")), aiEmbedder: () => jinaEmbedder(undefined, undefined, { timeoutMs: JINA_GATE_MS, retries: 0 }), aiBuilder: () => jinaEmbedder(), scrambler: (text) => scramblerReadingOf(text), howOwnerTalks: () => howOwnerTalks() };

export function renderVoice(reading: VoiceReading & { notHere?: string[]; aiTells?: AiReading; conventions?: ConventionsReading; phrases?: PhraseReading; scrambler?: ScramblerReading; score?: VoiceScore }): string {
  const scores = `voice ${reading.voice.toFixed(2)} · answers them ${reading.inContext.toFixed(2)} · reads like a mate ${reading.friendLike.toFixed(2)} · opener only ${reading.openerOnly.toFixed(2)}${reading.toThem === null ? "" : ` · like his replies there ${reading.toThem.toFixed(2)}`}${reading.buildsOn === null || reading.buildsOn === undefined ? "" : ` · builds on the chat ${reading.buildsOn.toFixed(2)}`}`;
  const never = reading.neverSays.length ? ` · the owner never says: ${reading.neverSays.join(", ")}` : "";
  const notHere = reading.notHere?.length ? `\n  he never writes it here: ${reading.notHere.join("; ")}` : "";
  const watermark = reading.watermark ? `\n  ${watermarkLine(reading.watermark)}` : "";
  const ai = reading.aiTells ? `\n  ${aiTellsLine(reading.aiTells)}` : reading.conventions ? `\n  ${conventionsLine(reading.conventions)}` : "";
  const phrases = reading.phrases ? `\n  ${phrasesLine(reading.phrases)}` : "";
  const scrambler = reading.scrambler ? `\n  ${scramblerLine(reading.scrambler)}` : "";
  const table = reading.score ? `\n${scoreTable(reading.score)}` : "";
  return `log voice: @${reading.to.replace(/^@/, "")} ${reading.pass ? "PASS" : "FAIL"}: ${scores}${never}${notHere}${watermark}${ai}${phrases}${scrambler}${table}${reading.pass ? "" : `${reading.firstContact ? `\n  ${firstContactLine(reading.to)}` : ""}\n  rewrite it in the owner's words and gate it again`}`;
}

function chatKeyOf(c: Pick<Conversation, "platform" | "conversationId" | "with">): string {
  return c.platform === "twitter" ? `twitter:${[...c.with].sort().join(",").toLowerCase()}` : `${c.platform}:${c.conversationId}`;
}

type VoiceChat = DiscordChat & { platform: string; account: string; conversationId: string; target: VoiceTarget };

function chatsOf(conversations: readonly Conversation[]): VoiceChat[] {
  const seen = new Set<string>();
  return conversations.filter((c) => {
    const key = chatKeyOf(c);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).map((c) => {
    const named = /^group (.+)$/.exec(c.box)?.[1] ?? null;
    return { id: chatKeyOf(c), kind: c.with.length > 1 || c.box.startsWith("group") ? "group" : "dm", name: named, members: c.with, platform: c.platform, account: c.account, conversationId: c.conversationId, target: c.platform === "twitter" ? { with: c.with } : { platform: c.platform, conversationId: c.conversationId, with: c.with } };
  });
}

const NEAR_WHEN_SCOPED = 4;
const NEAREST_REPLIES = 4;
const HIS_HERE_MAX = 200;
const CHAT_REPLIES_FOR_FEATURES = 200;

function cardOrNull(platform: string, account: string, who: { conversationId?: string | null; userId?: string | null; handle?: string | null }): ConversationCard | null {
  try {
    return cardFor(db(), platform, account, who);
  } catch {
    return null;
  }
}

function factsOfCard(card: ConversationCard): FactRow[] {
  try {
    return factsForChats(db(), card.key.split("|"));
  } catch {
    return [];
  }
}

function cardFacts(card: ConversationCard | null | undefined, facts: readonly FactRow[] = []): { card?: string; cardAnswerOwed?: boolean } {
  if (!card) return {};
  return { card: [renderCard(card), ...promiseLines(facts)].join("\n"), ...(card.fromOwner > 0 ? { cardAnswerOwed: answerOwed(card) } : {}) };
}

export function profileLine(profile: VoiceProfile): string {
  const pct = (n: number) => `${Math.round(n * 100)}%`;
  return `${profile.replies} of his messages: median ${profile.medianWords} words, ${pct(profile.lowercase)} all lowercase, commas ${pct(profile.commas)}, full stops ${pct(profile.fullStops)}, questions ${pct(profile.questions)}, ! ${pct(profile.exclamations)}, emoji ${pct(profile.emoji)}; opens with ${profile.openers.join(", ") || "-"}; his words here: ${profile.words.join(", ") || "-"}`;
}

function nearLines(near: readonly NearPair[]): string[] {
  return near.flatMap((n) => [`  [${n.tier}] ${n.pair.chat} (${n.pair.platform}, ${String(n.pair.at ?? "").slice(0, 10)})`, ...(n.pair.said ? [`    ${n.pair.saidBy ?? "them"}: ${n.pair.said.replace(/\n/g, " / ").slice(0, 200)}`] : []), `    the owner: ${n.pair.reply.replace(/\n/g, " / ").slice(0, 240)}`]);
}

export type ChatEvidence = { ok: true; evidence: VoiceEvidence; near: NearPair[]; wording: NearPair[]; recent: VoicePair[]; profile: VoiceProfile | null; label: string; card: ConversationCard | null; chat: { platform: string; account: string; conversationId: string; target: VoiceTarget }; chatReplies: string[]; hisHere: string[] };

export function chatIdIn(conversations: readonly Conversation[], chats: readonly VoiceChat[], said: string): string | null {
  const text = said.trim();
  if (!text) return null;
  if (chats.some((c) => c.id === text)) return text;
  if (xPartiesOf(text).length) {
    const named = conversations.filter((c) => c.platform === "twitter" && c.with.some(Boolean) && sameXConversation(c.conversationId, text));
    return named.length ? chatKeyOf(named[0]) : null;
  }
  const exact = conversations.find((c) => c.conversationId === text && (c.platform !== "twitter" || c.with.some(Boolean)));
  if (exact) return chatKeyOf(exact);
  return /^\d{15,22}$/.test(text) ? chats.find((c) => c.id.endsWith(`:${text}`))?.id ?? null : null;
}

export function chatOfHandle(chats: readonly VoiceChat[], handle: string): string | null {
  const wanted = handle.replace(/^@/, "").trim().toLowerCase();
  if (!wanted) return null;
  const dms = chats.filter((c) => c.kind === "dm" && c.members.length === 1 && c.members[0].replace(/^@/, "").toLowerCase() === wanted);
  return (dms.find((c) => c.platform === "twitter") ?? dms[0])?.id ?? null;
}

export function resolveVoiceChat(context: CommandContext, chat: string, to: string, conversations: readonly Conversation[] = loadConversations()): string {
  const chats = chatsOf(conversations);
  if (chat) {
    const byId = chatIdIn(conversations, chats, chat);
    if (byId) return byId;
    if (!xPartiesOf(chat).length && matchChat(chats, chat).ok) return chat;
  }
  const byHandle = chatOfHandle(chats, to);
  if (byHandle && chat) context.err(`voice: "${chat}" names no chat log holds, so the chat is read from @${to.replace(/^@/, "")} instead`);
  return byHandle ?? chat;
}

function hisMessagesIn(chat: Pick<VoiceChat, "platform" | "account" | "conversationId" | "target">): string[] {
  try {
    return chatContextOf(chat.platform, chat.account, { conversationId: chat.conversationId, handle: null, userId: null }).messages.filter((m) => m.fromMe && m.text.trim()).map((m) => m.text);
  } catch {
    return [];
  }
}

export function cardOfHandle(to: string): ConversationCard | null {
  const handle = to.replace(/^@/, "").trim();
  if (!handle) return null;
  try {
    const accounts = db().prepare("SELECT DISTINCT platform, account FROM chats").all() as { platform: string; account: string }[];
    return accounts.map((a) => cardOrNull(a.platform, a.account, { handle })).filter((c): c is ConversationCard => !!c && c.messages > 0).sort((a, b) => b.messages - a.messages)[0] ?? null;
  } catch {
    return null;
  }
}

export async function evidenceFor(context: CommandContext, said: string, chat: string, draft = "", nearLimit = NEAR_PAIRS): Promise<ChatEvidence | { ok: false; result: CommandResult }> {
  const conversations = timedSync("voice.conversations", () => loadConversations());
  const chats = timedSync("voice.chats", () => chatsOf(conversations));
  const byId = chatIdIn(conversations, chats, chat);
  const found = matchChat(chats, byId ?? chat);
  if (!found.ok) return { ok: false, result: refuse("voice", found.code, [found.detail, ...found.candidates.map((c) => `  ${c.id}  ${c.label}`)].join("\n")) };
  const picked = chats.find((c) => c.id === found.chat.id)!;
  const label = `${found.label} (${picked.platform} ${picked.kind})`;
  context.err(`voice: "${chat}" is ${label}; reading its conversation card and the owner's real replies there`);
  const card = cardOrNull(picked.platform, picked.account, { conversationId: picked.conversationId });
  const index = await timed("voice.openIndex", () => openSharedVoiceIndex(voiceDeps.embedder()));
  try {
    const [near, wording] = await timed("voice.near", () => Promise.all([nearestPairs(index, said, picked.target, nearLimit), draft.trim() ? closestWording(index, draft, picked.target) : Promise.resolve([] as NearPair[])]));
    const recent = recentInChat(index, picked.target);
    const chatReplies = recentInChat(index, picked.target, CHAT_REPLIES_FOR_FEATURES).map((p) => p.reply);
    const profile = profileFor(index, picked.target);
    const hisHere = timedSync("voice.hisHere", () => hisMessagesIn(picked));
    return {
      ok: true,
      hisHere,
      near,
      wording,
      recent,
      profile,
      label,
      card,
      chat: { platform: picked.platform, account: picked.account, conversationId: picked.conversationId, target: picked.target },
      chatReplies,
      evidence: {
        chat: label,
        platform: picked.platform,
        kind: picked.kind,
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
  const index = await timed("voice.openIndex", () => openSharedVoiceIndex(voiceDeps.embedder())).catch(() => null);
  if (!index) {
    context.err("voice: no voice index yet, so the owner's writing everywhere isn't compared: build it with `log voice index`");
    return undefined;
  }
  try {
    if (!index.pairs.length) return undefined;
    const [near, wording] = await timed("voice.near", () => Promise.all([nearestPairs(index, said || draft, target), draft.trim() ? closestWording(index, draft, target) : Promise.resolve([] as NearPair[])]));
    const label = `the owner's writing across all his conversations, every platform (for @${handle})`;
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

async function ensureAiIndex(context: CommandContext): Promise<boolean> {
  if (!aiIndexStale(aiIndexDir(), join(voiceDir(), "pairs.json"), JINA_EMBED_MODEL) && openAiIndex(aiIndexDir(), JINA_EMBED_MODEL)) return true;
  context.err("voice: the AI tells index is older than the owner's voice index, so AI phrasing isn't checked on this gate; it is rebuilt in the background by `log voice aiIndex`, never inline (a gate must not stall the send)");
  return false;
}

export function ensurePhraseIndex(context: CommandContext, dir = voiceDir()) {
  const existing = openPhraseIndex(dir);
  const pairsFile = join(dir, "pairs.json");
  if (existing && (!existsSync(pairsFile) || statSync(pairsFile).mtimeMs <= Date.parse(existing.builtAt))) return existing;
  if (!existsSync(pairsFile)) return null;
  context.err("voice: measuring how the owner words things from every reply in the voice index (rule 127)");
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
  summary: "Gate a draft against the owner's own writing guide with SubQ before anything is sent as the owner, sending nothing",
  args: "--to <handle> [--text \"<draft>\"] [--options <o> ...] [--context \"<what they said>\"] [--with <chat>] [--json] | index | train | aiIndex | calibrate",
  async run(context, argv) {
    if (argv[0] === "calibrate") {
      const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...VOICE_INPUT.forms[4], words: [] }] }));
      if (!parsed.ok) return refuseInput("voice calibrate", parsed.error, VOICE_USAGE);
      const guide = readGuide();
      if (!guide) return refuse("voice calibrate", "voiceGuideMissing", `the owner's writing guide isn't at ${guidePath()}`);
      try {
        return await calibrate(context, { guide, ...(typeof parsed.values["count"] === "number" ? { count: parsed.values["count"] } : {}), json: parsed.flags["json"] === true });
      } catch (error) {
        return refuseError("voice calibrate", error);
      }
    }
    if (argv[0] === "train") {
      const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...VOICE_INPUT.forms[3], words: [] }] }));
      if (!parsed.ok) return refuseInput("voice train", parsed.error, VOICE_USAGE);
      const fresh = typeof parsed.values["fresh"] === "number" ? parsed.values["fresh"] : undefined;
      const spend = typeof parsed.values["spend"] === "number" ? parsed.values["spend"] : undefined;
      const drafts = typeof parsed.flags["drafts"] === "string" ? parsed.flags["drafts"] : undefined;
      try {
        return await runVoiceTrain(context, { ...(fresh ? { fresh } : {}), ...(spend !== undefined ? { spend } : {}), ...(drafts ? { drafts } : {}), json: parsed.flags["json"] === true });
      } catch (error) {
        return refuseError("voice train", error);
      }
    }
    if (argv[0] === "aiIndex") {
      const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...VOICE_INPUT.forms[1], words: [] }] }));
      if (!parsed.ok) return refuseInput("voice aiIndex", parsed.error, VOICE_USAGE);
      try {
        const pairsFile = join(voiceDir(), "pairs.json");
        const replies = existsSync(pairsFile) ? (JSON.parse(readFileSync(pairsFile, "utf8")) as VoicePair[]).map((p) => p.reply) : [];
        if (!replies.length) context.err("voice aiIndex: no voice index yet, so there is no baseline of the owner's own messages: build it with `log voice index` first");
        const started = Date.now();
        const meta = await buildAiIndex(voiceDeps.aiBuilder(), replies, aiIndexDir(), undefined, undefined, (line) => context.err(line));
        const line = `log voice aiIndex: ${meta.phrases.length} AI phrases embedded with ${meta.model}; the owner's own ${meta.baseline.messages} messages sit at p50 ${meta.baseline.p50.toFixed(3)}, p99 ${meta.baseline.p99.toFixed(3)} from them; ${meta.baseline.mutedRules.length} vale rules muted because he uses them himself (${meta.baseline.mutedRules.join(", ") || "none"}); ${meta.baseline.ownersPhrases?.length ?? 0} phrases vale flags that he says himself in 5 or more messages, never held against a draft; ${((Date.now() - started) / 1000).toFixed(1)} s at ${aiIndexDir()}`;
        return { code: 0, stdout: parsed.flags["json"] ? JSON.stringify({ phrases: meta.phrases.length, model: meta.model, baseline: meta.baseline }, null, 2) : line };
      } catch (error) {
        return refuseError("voice aiIndex", error);
      }
    }
    if (argv[0] === "index") {
      const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...VOICE_INPUT.forms[2], words: [] }] }));
      if (!parsed.ok) return refuseInput("voice index", parsed.error, VOICE_USAGE);
      try {
        const conversations = loadConversations();
        const embedder = voiceDeps.embedder();
        context.err(`voice: pairing the owner's replies in ${conversations.length} saved conversations and embedding them with ${embedder.model}`);
        const built = await updateVoiceFor(conversations, embedder);
        embedder.stop?.();
        const line = built.embedded === 0 && !built.created
          ? `log voice index: already current, so nothing was re-paired: ${built.pairs} messages indexed across every chat the owner has written in, ${built.profiles} profiles, at ${voiceDir()}`
          : `log voice index: ${built.pairs} messages indexed across every chat the owner has written in, each of the owner's replies paired with what was said before it, ${built.embedded} new pair(s) embedded, ${built.profiles} profiles (chat, person, platform), in ${(built.ms / 1000).toFixed(1)} s at ${voiceDir()}`;
        return { code: 0, stdout: parsed.flags["json"] ? JSON.stringify(built, null, 2) : line };
      } catch (error) {
        return refuseError("voice index", error);
      }
    }
    const parsed = parseArgs(argv, parserSpecOf({ forms: [VOICE_INPUT.forms[0]] }));
    if (!parsed.ok) return refuseInput("voice", parsed.error, VOICE_USAGE);
    const to = parsed.flags["to"];
    const text = typeof parsed.flags["text"] === "string" ? parsed.flags["text"] : "";
    let said = typeof parsed.flags["context"] === "string" ? parsed.flags["context"].trim() : "";
    const asked = typeof parsed.flags["with"] === "string" ? parsed.flags["with"].trim() : "";
    if (typeof to !== "string" || !to.trim()) return refuse("voice", "targetMissing", "--to names who the draft is for");
    const options = [...(Array.isArray(parsed.values["options"]) ? (parsed.values["options"] as string[]) : []), ...(text.trim() && Array.isArray(parsed.values["options"]) ? [text] : [])].map((o) => o.trim()).filter(Boolean);
    if (options.length > OPTIONS_MAX) return refuseInput("voice", `inputInvalid: --options got ${options.length}; it takes at most ${OPTIONS_MAX}`, VOICE_USAGE);
    if (!text.trim() && !asked && !options.length) return refuse("voice", "textMissing", "--text is the draft to gate (or give --with to get the grounding pack first)");
    const guide = readGuide();
    if (!guide) return refuse("voice", "voiceGuideMissing", `the owner's writing guide isn't at ${guidePath()}`);
    try {
      const chat = timedSync("voice.resolveChat", () => resolveVoiceChat(context, asked, to));
      if (options.length) return await gradeOptions(context, { to, said, chat, options, guide, ...(parsed.flags["spoken"] === true ? { spoken: true } : {}), json: parsed.flags["json"] === true });
      let evidence: VoiceEvidence | undefined;
      let card: ConversationCard | null = null;
      let gated: { platform: string; account: string; conversationId: string; target: VoiceTarget } | null = null;
      let hisHere: string[] = [];
      if (chat) {
        const found = await evidenceFor(context, said || text, chat, text);
        if (!found.ok && !text.trim()) return found.result;
        if (found.ok) {
          evidence = found.evidence;
          card = found.card;
          gated = found.chat;
          hisHere = found.hisHere;
          if (!said && text.trim()) said = openLinesOf(found.chat);
        }
        if (found.ok && !text.trim()) {
          const packed = await packFor(context, { said, chat });
          if (!packed.ok) return packed.result;
          if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ chat: packed.label, card: packed.card, said: packed.said, profile: found.profile, pack: packed.pack }, null, 2) };
          return { code: 0, stdout: renderPackResult(packed, to, chat) };
        }
      }
      card ??= timedSync("voice.cardOfHandle", () => cardOfHandle(to));
      const reading = await gateReading(context, { to, text, said, guide, card, hisHere, ...(evidence ? { evidence } : {}), ...(parsed.flags["spoken"] === true ? { spoken: true } : {}) });
      if (!parsed.flags["spoken"] && !reading.owned) recordDrafts([text], chat || to, null);
      if (reading.pass && text.trim()) recordPass(text, to, reading.voice);
      if (gated) recordVerdict(text, lastMessageIdOf(gated.platform, gated.account, chatWho(gated)), { pass: reading.pass, score: reading.score?.score ?? 0, threshold: reading.score?.threshold ?? 0, voice: reading.voice });
      if (parsed.flags["json"]) return { code: reading.pass ? 0 : 1, stdout: JSON.stringify(reading, null, 2) };
      return { code: reading.pass ? 0 : 1, stdout: renderVoice(reading) };
    } catch (error) {
      return refuseError("voice", error);
    }
  },
};

export type GateReading = VoiceReading & { alreadyPromised?: { factId: string; quote: string; at: string; how: string }; owned?: OwnMatch; notHere: string[]; aiTells?: AiReading; conventions?: ConventionsReading; phrases?: PhraseReading; scrambler: ScramblerReading; ranked: RankedMoment[]; room?: Room; strictPass?: boolean; score?: VoiceScore; nearest?: { cosine: number; reply: string } | null; convergence?: Convergence };

export interface RankedMoment {
  from: string;
  text: string;
  at: string;
}

export async function rankedContext(platform: string, account: string, who: { conversationId?: string | null; handle?: string | null; userId?: string | null }, moment: string, top = RANKED_CONTEXT): Promise<RankedMoment[]> {
  const held = chatContextOf(platform, account, who);
  const lines = held.messages.filter((m) => m.text.trim() || m.mediaLines.length).map((m) => ({ from: m.fromMe ? "the owner" : m.senderId, text: [m.text, ...m.mediaLines].filter(Boolean).join(" "), at: m.time })).slice(-RANKED_POOL);
  if (!lines.length || !moment.trim()) return lines.slice(-top);
  const embedded = await embedBounded([moment, ...lines.map((l) => l.text)], () => voiceDeps.aiEmbedder(), () => voiceDeps.embedder(), voiceDeps.jinaMs);
  const [query, ...vectors] = embedded.vectors;
  const shortlist = lines.map((l, i) => ({ l, c: cosineOf(query, vectors[i]) })).sort((a, b) => b.c - a.c).slice(0, RANKED_SHORTLIST);
  const byMeaning = shortlist.map((x) => x.l);
  const scores = embedded.fellBack ? null : await rerankBounded(moment, byMeaning.map((l) => `${l.from}: ${l.text}`), () => voiceDeps.aiEmbedder(), voiceDeps.jinaMs);
  const picked = byMeaning.map((l, i) => ({ l, s: scores ? scores[i] ?? 0 : shortlist[i].c })).sort((a, b) => b.s - a.s).slice(0, top).map((x) => x.l);
  const latest = lines.reduce((a, b) => (b.at.localeCompare(a.at) > 0 ? b : a));
  return (picked.includes(latest) || top < 2 ? picked : [...picked.slice(0, top - 1), latest]).sort((a, b) => a.at.localeCompare(b.at));
}

export type GateDraft = { to: string; text: string; said: string; guide: string; evidence?: VoiceEvidence; ranked?: RankedMoment[]; spoken?: boolean; room?: Room; card?: ConversationCard | null; publicReply?: boolean; leaveOut?: { id?: string; reply: string }; skipEverywhere?: boolean; hisHere?: readonly string[] };

export async function gateReading(context: CommandContext, draft: GateDraft): Promise<GateReading> {
  const [reading] = await gateReadings(context, draft, [draft.text]);
  return reading;
}

export async function nearestHere(text: string, hisHere: readonly string[], leaveOut?: { id?: string; reply: string }): Promise<{ cosine: number; reply: string } | null> {
  const here = [...new Set(hisHere.map((t) => t.trim()).filter((t) => t && t !== leaveOut?.reply.trim()))].slice(-HIS_HERE_MAX);
  const parts = partsOf(text);
  if (!here.length || !parts.length) return null;
  const vectors = await voiceDeps.embedder().embed([...parts, ...here]);
  const best = parts.map((_, p) => here.map((reply, i) => ({ reply, cosine: cosineOf(vectors[p], vectors[parts.length + i]) })).sort((a, b) => b.cosine - a.cosine)[0]);
  return { cosine: best.reduce((sum, b) => sum + b.cosine, 0) / best.length, reply: best.map((b) => b.reply).join(" / ") };
}

export async function nearestReplyOf(text: string, leaveOut?: { id?: string; reply: string }, hisHere: readonly string[] = []): Promise<{ cosine: number; reply: string } | null> {
  if (!text.trim()) return null;
  const here = await nearestHere(text, hisHere, leaveOut);
  if (here) return here;
  const index = await openSharedVoiceIndex(voiceDeps.embedder()).catch(() => null);
  if (!index?.pairs.length) return null;
  const found = (await closestWording(index, text, {}, NEAREST_REPLIES + 2)).filter((n) => n.pair.id !== leaveOut?.id && n.pair.reply.trim() !== leaveOut?.reply.trim()).sort((a, b) => a.rank - b.rank).slice(0, NEAREST_REPLIES);
  if (!found.length) return null;
  const [mine, ...theirs] = await index.embedder.embed([text, ...found.map((n) => n.pair.reply)]);
  return found.map((n, i) => ({ reply: n.pair.reply, cosine: cosineOf(mine, theirs[i]) })).sort((a, b) => b.cosine - a.cosine)[0] ?? null;
}

async function localReading(text: string, draft: Omit<GateDraft, "text">, phraseIndex: ReturnType<typeof ensurePhraseIndex>, aiIndex: AiIndex | null) {
  const phrases = phraseIndex ? readPhrases(text, phraseIndex, draft.said, draft.leaveOut?.reply ?? "") : undefined;
  const scrambler = voiceDeps.scrambler(text);
  const aiTelling = aiIndex ? timed("voice.aiTells", () => readAiTells(text, aiIndex, voiceDeps.aiEmbedder(), undefined, undefined, undefined, voiceDeps.jinaMs)).catch(() => undefined) : Promise.resolve(undefined);
  const nearest = timed("voice.nearestReply", () => nearestReplyOf(text, draft.leaveOut, draft.hisHere ?? [])).catch(() => null);
  const notHere = draft.evidence && !draft.spoken ? offProfile(text, draft.evidence.profile as VoiceProfile | null) : [];
  return { phrases, scrambler, notHere, aiTells: await aiTelling, nearest: await nearest };
}

export async function baselinePairs(): Promise<{ said: string; reply: string }[]> {
  const index = await openSharedVoiceIndex(voiceDeps.embedder()).catch(() => null);
  return index ? index.pairs.filter((p) => p.reply.trim()).slice(-BASELINE_REPLIES).map((p) => ({ said: p.said, reply: p.reply })) : [];
}

export async function baselineReplies(): Promise<string[]> {
  return (await baselinePairs()).map((p) => p.reply);
}

export async function gateReadings(context: CommandContext, draft: Omit<GateDraft, "text"> & { text?: string }, texts: readonly string[]): Promise<GateReading[]> {
  const { to, said, guide, evidence } = draft;
  const ranked = draft.ranked ?? [];
  const scoped = scopedToThisChat(draft.card ?? null);
  const everywhere = scoped || draft.skipEverywhere ? undefined : await timed("voice.everywhere", () => evidenceAnywhere(context, said, to, texts[0] ?? ""));
  context.err(`voice: SubQ reading ${texts.length > 1 ? `${texts.length} options in one request` : "the draft"} for @${to.replace(/^@/, "")}${draft.card ? " against this chat's conversation card" : ""}${everywhere ? " and the owner's writing across all his conversations" : ""}${evidence ? ` and his real replies in ${evidence.chat}` : ""}${ranked.length ? `, with ${ranked.length} moment(s) of this chat ranked against what is being answered` : ""}, with his writing guide`);
  const phraseIndex = timedSync("voice.phraseIndex", () => ensurePhraseIndex(context));
  if (!phraseIndex) context.err("voice: no voice index yet, so the owner's own phrasing isn't measured: build it with `log voice index`");
  const jina = aiTellsMode() === "jina";
  if (jina) await ensureAiIndex(context);
  const aiIndex = jina ? openAiIndex(aiIndexDir(), JINA_EMBED_MODEL) : null;
  if (jina && !aiIndex) context.err("voice: the AI tells index couldn't be built, so AI phrasing isn't checked");
  const conventions = jina ? null : timedSync("voice.conventionsOpen", () => ensureConventions(context));
  const conventionReadings = conventions ? timed("voice.conventions", () => readConventionsOf(conventions, texts, (batch) => voiceDeps.embedder().embed(batch))).catch(() => null) : Promise.resolve(null);
  const locals = await Promise.all(texts.map((text) => localReading(text, draft, phraseIndex, aiIndex)));
  const conventionsRead = await conventionReadings;
  const owned = draft.leaveOut ? texts.map(() => null) : timedSync("voice.owned", () => ownedOf(texts));
  const baseline = (await baselinePairs()).filter((p) => p.reply.trim() !== draft.leaveOut?.reply.trim());
  const hisBaseline = baseline.map((p) => p.reply);
  const hisHere = [...(evidence?.recent ?? []), ...(evidence?.replies ?? []).filter((r) => r.tier === "sameChat")].filter((p) => p.reply.trim() !== draft.leaveOut?.reply.trim());
  const theirLast = said.trim() ? said.split("\n") : ranked.filter((m) => m.from !== "the owner").slice(-3).map((m) => m.text);
  const converging = texts.map((text) => convergenceOf({ draft: text, theirLast, hisHere, hisBaseline, baselinePairs: baseline }));
  const facts = draft.card ? voiceDeps.facts(draft.card) : [];
  const promises = openPromises(facts);
  const repeats = await Promise.all(texts.map((text) => repeatedPromise(text, promises, (batch) => voiceDeps.embedder().embed(batch))));
  const shared = { to, text: texts[0] ?? "", ...(draft.card?.fromOwner ? { ownerWroteHere: draft.card.fromOwner } : {}), ...(draft.card?.messages ? { messagesHere: draft.card.messages } : {}), ...cardFacts(draft.card, facts), ...(said ? { context: said } : {}), ...(evidence ? { evidence } : {}), ...(everywhere ? { everywhere } : {}), ...(ranked.length ? { conversation: ranked } : {}), ...(draft.spoken ? { spoken: true, howOwnerTalks: voiceDeps.howOwnerTalks() } : {}), ...(draft.publicReply ? { publicReply: true } : {}), ...(draft.room ? { room: draft.room } : {}) };
  const options = texts.map((text, i) => ({ text, ...(locals[i].phrases ? { phrasesNewToOwner: locals[i].phrases!.newPhrasing } : {}), ...(locals[i].scrambler.ran ? { scrambler: { suspicious: locals[i].scrambler.suspicious, kinds: [...new Set(locals[i].scrambler.hits.map((h) => h.kind))] } } : {}) }));
  const readings = await readVoices(shared, options, guide, voiceDeps.decisions());
  const threshold = currentThreshold();
  return readings.map((scored, i) => {
    const local = locals[i];
    const read = conventionsRead?.[i];
    const mine = owned[i];
    const convention = read && mine ? ownedConventions(read, ownLineSummary(mine)) : read;
    const strictPass = scored.pass && !local.notHere.length && (local.aiTells?.pass ?? true) && !convention?.flagged && (local.phrases?.pass ?? true) && local.scrambler.suspicious === 0;
    const input = { ...scored, nobodyToAnswer: nobodyToAnswer({ room: draft.room }), scrambler: local.scrambler, notHere: local.notHere, nearestCosine: local.nearest?.cosine ?? null, convergence: converging[i].signal, theyWrote: theirLast.some((t) => t.trim().length > 0), ...(local.phrases ? { phrases: local.phrases } : {}), ...(local.aiTells ? { aiTells: local.aiTells } : {}), ...(convention ? { conventions: convention } : {}) };
    const repeat = repeats[i];
    const score = scoreOf(signalsOf(input), [...hardBlocks(input, CONTEXT_PASS), ...(repeat ? [alreadyPromisedBlock(repeat)] : [])], threshold);
    return { ...scored, ...(repeat ? { alreadyPromised: { factId: repeat.fact.factId, quote: repeat.fact.quote, at: repeat.fact.validFrom, how: repeat.how } } : {}), ...(mine ? { owned: mine } : {}), notHere: local.notHere, ...(local.aiTells ? { aiTells: local.aiTells } : {}), ...(convention ? { conventions: convention } : {}), ...(local.phrases ? { phrases: local.phrases } : {}), scrambler: local.scrambler, ranked, ...(draft.room ? { room: draft.room } : {}), nearest: local.nearest, convergence: converging[i], strictPass, score, pass: score.pass };
  });
}

function ownedOf(texts: readonly string[]): (OwnMatch | null)[] {
  try {
    return voiceDeps.owned(texts);
  } catch {
    return texts.map(() => null);
  }
}

export function howOwnerTalks(): string[] {
  return ownersOwnVoiceNotes(ownersRecordings(), firstClonedAt()).flatMap((r) => {
    if (!existsSync(r.path)) return [];
    const text = readTranscript(hashOf(new Uint8Array(readFileSync(r.path))))?.text?.trim();
    return text ? [text.slice(0, 1500)] : [];
  });
}

export function firstContactLine(to: string): string {
  const them = to.replace(/^@/, "");
  return `first message: the owner has never messaged @${them}, so this is a cold opener and there is no chat of theirs to answer. Open it the cold way (getGuide({ useCase: \"twitter/engagerDms\" }), how a cold DM opens): one of their own recent posts first (twitterPosts { user: \"${them}\" }), then one informal line about it, with no ask and no stock thanks`;
}

export function failedParts(reading: GateReading): string[] {
  const out: string[] = [];
  if (reading.score && !reading.score.pass) out.push(`voice score ${reading.score.score.toFixed(2)}, needs ${reading.score.threshold.toFixed(2)}${reading.score.blocks.length ? `; blocked: ${reading.score.blocks.join("; ")}` : ""}`);
  if (reading.firstContact && !reading.pass) out.push(firstContactLine(reading.to));
  if (reading.neverSays.length) out.push(`phrases the owner never says: ${reading.neverSays.join(", ")}`);
  if (reading.watermark.level === "artifacts") out.push(`AI artifacts in the text: ${watermarkLine(reading.watermark)}`);
  if (reading.voice < VOICE_PASS) out.push(`doesn't sound like the owner ${reading.buildsOn === null ? "typed" : "said"} it (voice ${reading.voice.toFixed(2)}, needs ${VOICE_PASS})`);
  if (reading.fitsTheRoom !== null && reading.fitsTheRoom !== undefined && reading.fitsTheRoom < CONTEXT_PASS) out.push(`talks to someone who isn't there, or as if the chat were live when it isn't (fitsTheRoom ${reading.fitsTheRoom.toFixed(2)})`);
  if (reading.buildsOn !== null && reading.buildsOn < CONTEXT_PASS) out.push(`repeats what the owner already said instead of building on what they're talking about (buildsOn ${reading.buildsOn.toFixed(2)})`);
  if (reading.inContext < CONTEXT_PASS && reading.answerRequired !== false && !nobodyToAnswer({ room: reading.room })) out.push(`doesn't answer what they said (inContext ${reading.inContext.toFixed(2)})`);
  if (reading.friendLike < CONTEXT_PASS) out.push(`reads like a template or a pitch (friendLike ${reading.friendLike.toFixed(2)})`);
  if (reading.openerOnly < CONTEXT_PASS) out.push(`a first message with an ask in it (openerOnly ${reading.openerOnly.toFixed(2)})`);
  if (reading.toThem !== null && reading.toThem < CONTEXT_PASS) out.push(`not how the owner writes in this chat (toThem ${reading.toThem.toFixed(2)})`);
  if (reading.notHere.length) out.push(`never used by the owner here: ${reading.notHere.join(", ")}`);
  if (reading.aiTells && !reading.aiTells.pass) out.push(aiTellsLine(reading.aiTells));
  if (reading.conventions?.flagged) out.push(conventionsLine(reading.conventions));
  if (reading.phrases && !reading.phrases.pass) out.push(phrasesLine(reading.phrases));
  if (reading.scrambler.suspicious) out.push(scramblerLine(reading.scrambler));
  return out;
}

export function chatIdFor(conversations: readonly Conversation[], send: { platform: string; conversationId?: string | null; userId?: string | null; handle?: string | null }): string | null {
  const mine = conversations.filter((c) => c.platform === send.platform && (c.platform !== "twitter" || c.with.some(Boolean)));
  const found = mine.find((c) => !!send.conversationId && sameChatId(c.platform, c.conversationId, send.conversationId))
    ?? (send.platform === "twitter" && send.userId ? mine.find((c) => xPartiesOf(c.conversationId).includes(String(send.userId))) : undefined)
    ?? (send.handle ? mine.find((c) => c.with.some((w) => w.replace(/^@/, "").toLowerCase() === String(send.handle).replace(/^@/, "").toLowerCase())) : undefined);
  return found ? chatKeyOf(found) : null;
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

type GateSend = { platform: string; account: string; to: string; text: string; conversationId?: string | null; handle?: string | null; userId?: string | null; said?: string; spoken?: boolean; room?: Room; readRoom?: () => Room | undefined; brief?: boolean; files?: readonly string[]; followUp?: boolean; publicReply?: boolean };

export function gateSend(context: CommandContext, send: GateSend): Promise<{ ok: true; line: string } | { ok: false; refused: string }> {
  return timed("voice.gate", async (span) => {
    const result = await gateSendNow(context, send);
    span.attrs.passed = result.ok;
    return result;
  }, { platform: send.platform, brief: send.brief === true, spoken: send.spoken === true });
}

export const ALREADY_ANSWERED_MS = 3 * 60 * 60 * 1000;

export function alreadyAnswered(messages: readonly { fromMe?: boolean; time?: string | null; text?: string | null }[], nowMs: number = Date.now()): { at: string; text: string } | null {
  const timed = messages.filter((m) => !Number.isNaN(Date.parse(String(m.time ?? "")))).sort((a, b) => Date.parse(String(a.time)) - Date.parse(String(b.time)));
  const lastTheirs = [...timed].reverse().find((m) => !m.fromMe);
  const lastMine = [...timed].reverse().find((m) => m.fromMe);
  if (!lastMine) return null;
  const mineAt = Date.parse(String(lastMine.time));
  if (lastTheirs && Date.parse(String(lastTheirs.time)) > mineAt) return null;
  return nowMs - mineAt <= ALREADY_ANSWERED_MS ? { at: String(lastMine.time), text: String(lastMine.text ?? "") } : null;
}

async function gateSendNow(context: CommandContext, send: GateSend): Promise<{ ok: true; line: string } | { ok: false; refused: string }> {
  const answered = send.followUp ? null : alreadyAnswered(saidOnly(chatContextOf(send.platform, send.account, { conversationId: send.conversationId ?? null, handle: send.handle ?? null, userId: send.userId ?? null }).messages));
  if (answered) return { ok: false, refused: `>>> ALREADY ANSWERED in ${send.to}: the owner's message "${answered.text.slice(0, 120)}" went out at ${answered.at} and they haven't written since, so this one wasn't sent. Another session or an earlier send already answered them: read the chat (inboxActions { chat }) and send only what the owner asks for on top of it; when he asked for a follow-up on top of it, send again with followUp.` };
  const same = timedSync("voice.sameness", () => gateDeps.same({ platform: send.platform, account: send.account, to: send.to, text: send.text }));
  if (!same.ok) return { ok: false, refused: same.refused };
  if (send.brief) return gateBrief(send);
  const lastId = lastMessageIdOf(send.platform, send.account, { conversationId: send.conversationId ?? null, handle: send.handle ?? null, userId: send.userId ?? null });
  const cached = verdictFor(send.text, lastId);
  if (cached?.pass) return { ok: true, line: `voice gate: this exact text passed at ${cached.at} (score ${cached.score.toFixed(2)}, needs ${cached.threshold.toFixed(2)}) and the chat's last message is still the same, so that verdict stands` };
  if (cached) return { ok: false, refused: [`>>> VOICE GATE FAILED for ${send.to}, nothing was sent: this exact text failed at ${cached.at} (score ${cached.score.toFixed(2)}, needs ${cached.threshold.toFixed(2)}) and nobody has written since, so that verdict stands; send a passing option or rewrite it:`, ...rewriteSteps({ to: send.to })].join("\n") };
  const prior = recentPass(send.text);
  if (prior && send.conversationId && !incomingSince(send.platform, send.account, send.conversationId, prior.at).length) return { ok: true, line: `voice gate: this exact text passed at ${prior.at} (voice ${prior.voice.toFixed(2)}) and nobody has written in the chat since, so SubQ wasn't asked again` };
  const guide = readGuide();
  if (!guide) return { ok: false, refused: `>>> VOICE GATE: the owner's writing guide isn't at ${guidePath()}, so nothing is sent until it is back` };
  const handle = send.handle || (send.userId ? personOf(send.platform, send.account, String(send.userId)) : null);
  const who = { conversationId: send.conversationId ?? null, handle, userId: send.userId ?? null };
  const held = timedSync("voice.chatContext", () => saidOnly(chatContextOf(send.platform, send.account, who).messages));
  const said = send.said ?? momentAnswered(held);
  const room = send.room ?? timedSync("voice.room", () => send.readRoom?.()) ?? roomOf(send.to, roomKindOf(send), held.map((m) => ({ from: m.fromMe ? "the owner" : String(m.senderId ?? "them"), fromMe: !!m.fromMe, at: String(m.time ?? "") })));
  const card = timedSync("voice.card", () => cardOrNull(send.platform, send.account, who));
  const ranked = await timed("voice.rankedContext", () => rankedContext(send.platform, send.account, who, [said, send.text].filter((t) => t.trim()).join("\n"))).catch(() => []);
  const evidence = await timed("voice.evidence", () => chatEvidence(context, said, { platform: send.platform, conversationId: send.conversationId, userId: send.userId, handle }, send.text));
  const reading = await timed("voice.reading", () => gateReading(context, { to: handle || send.to, text: send.text, said, guide, ranked, card, hisHere: held.filter((m) => m.fromMe).map((m) => m.text), ...(evidence ? { evidence } : {}), ...(send.spoken ? { spoken: true } : {}), ...(send.publicReply ? { publicReply: true } : {}), room }));
  recordVerdict(send.text, lastId, { pass: reading.pass, score: reading.score?.score ?? 0, threshold: reading.score?.threshold ?? 0, voice: reading.voice });
  if (reading.pass) {
    recordPass(send.text, send.to, reading.voice);
    return { ok: true, line: `voice gate: passed for ${handle ? `@${handle}` : send.to} (voice ${reading.voice.toFixed(2)})` };
  }
  return { ok: false, refused: [`>>> VOICE GATE FAILED for ${handle ? `@${handle}` : send.to}, nothing was sent; rewrite it in the owner's words and send again:`, ...failedParts(reading).map((p) => `  - ${p}`), ...rewriteSteps({ to: handle || send.to, said })].join("\n") };
}

export async function gateBrief(send: { platform: string; account: string; to: string; text: string; conversationId?: string | null; handle?: string | null; userId?: string | null; room?: Room; readRoom?: () => Room | undefined; files?: readonly string[] }): Promise<{ ok: true; line: string } | { ok: false; refused: string }> {
  const scrambler = voiceDeps.scrambler(send.text);
  if (scrambler.suspicious) return { ok: false, refused: `>>> BRIEF GATE FAILED for ${send.to}, nothing was sent: ${scramblerLine(scrambler)}` };
  const who = { conversationId: send.conversationId ?? null, handle: send.handle ?? null, userId: send.userId ?? null };
  const held = saidOnly(chatContextOf(send.platform, send.account, who).messages);
  const room = send.room ?? send.readRoom?.() ?? roomOf(send.to, roomKindOf(send), held.map((m) => ({ from: m.fromMe ? "the owner" : String(m.senderId ?? "them"), fromMe: !!m.fromMe, at: String(m.time ?? "") })));
  const conversation = await timed("voice.rankedContext", () => rankedContext(send.platform, send.account, who, [momentAnswered(held), send.text].filter((t) => t.trim()).join("\n"))).catch(() => []);
  const guide = readGuide();
  const reading = await timed("voice.briefReading", () => readBrief({ to: send.to, text: send.text, conversation, ...(room ? { room } : {}), attached: attachedOf(send.files ?? []), ...(guide ? { howOwnerWrites: guide } : {}) }, voiceDeps.decisions()));
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
    `  1. \`voice\` { to: "${send.to}", with: "${send.to}"${about ? `, context: "${about}"` : ""} } with no text: this chat's conversation card (what they said that is still open, what the owner already asked and said there) and his real replies in this chat.`,
    "  2. Answer only what is open on the card, in one or two short lines in his words from this chat: never a list of questions, never what he already asked, nothing from another conversation.",
    "  3. Make it read unlike anything else you have sent today: a platform reads a run of near-copies as automation.",

  ];
}

export const gateDeps: { gate: typeof gateSend; same: typeof sameAsSent } = { gate: (context, send) => gateSend(context, send), same: (send) => sameAsSent(send) };
