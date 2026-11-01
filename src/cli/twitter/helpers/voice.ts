import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { watermarkLine } from "../../../twitter/copy/watermark/index.ts";
import { aiIndexDir, aiTellsLine, buildAiIndex, jinaEmbedder, openAiIndex, readAiTells } from "../../../voice/aiTells/index.ts";
import type { AiEmbedder, AiReading } from "../../../voice/aiTells/index.ts";
import { matchChat } from "../../../discord/chat/match/index.ts";
import type { DiscordChat } from "../../../discord/chat/match/index.ts";
import { loadConversations, localEmbedder } from "../../../search/conversations/index.ts";
import type { Conversation, Embedder } from "../../../search/conversations/index.ts";
import { createDecisionsClient } from "../../../subq/decisions/index.ts";
import type { DecisionsClient } from "../../../subq/decisions/index.ts";
import { guidePath, readGuide, readVoice } from "../../../twitter/copy/voice/index.ts";
import type { VoiceEvidence, VoiceReading } from "../../../twitter/copy/voice/index.ts";
import { buildVoiceIndex, closestWording, nearestPairs, offProfile, openVoiceIndex, profileFor, recentInChat, voiceDir } from "../../../voice/pairs/index.ts";
import type { VoicePair } from "../../../voice/pairs/index.ts";
import type { NearPair, VoiceProfile, VoiceTarget } from "../../../voice/pairs/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuse, refuseError } from "../../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput, CommandResult } from "../../runner/types.ts";

export const VOICE_USAGE = [
  "Usage: log voice --to <handle> [--text \"<draft>\"] [--context \"<what they said>\"] [--with <person or chat>] [--json]",
  "       log voice aiIndex [--json]   (builds the AI tells index: every literal phrase in vendor/aiTells, tbhb/vale-ai-tells first and then the other lists, embedded with Jina (JINA_API_KEY), with matt's own replies from the voice index measured against it for his p50 and p99 closeness, and the vale rules he uses himself muted; rule 112)",
  "       log voice index [--json]   (builds matt's voice from every conversation log search already saved, reading nothing new: each of his replies paired with what was said just before it, embedded with log search's own model, and a profile per chat, person and platform counted from his own messages)",
  "Gates a draft before anything is sent as matt (his rule, 2026-10-27): SubQ reads it against matt's own writing guide (GUIDES/MATT_WRITING_STYLE.md, built from 256 of his tweets) and the dms he wrote himself, and answers whether it sounds like he typed it (voice, 0.8 to pass), whether it answers what they said (--context) or something specific about them, whether it reads like a mate texting, and, to someone matt has never talked with, whether it is only a relevant opener with no ask or pitch (openerOnly, matt 2026-10-31). A phrase matt never says (hit home, big swing, spot on, felt that…) fails it outright. Sends nothing.",
  "--with names the chat or person the way matt says it (\"the log group\", \"jilly\", a handle): log finds matt's real replies to things like --context, from that chat first, then that person, then that platform, then anywhere, and how he writes there (length, case, punctuation, his words). Without --text it shows them to draft from; with --text the gate also asks whether the draft reads like his real replies there (toThem, 0.7 to pass).",
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

export const voiceDeps: { decisions: () => DecisionsClient; embedder: () => Embedder; aiEmbedder: () => AiEmbedder } = { decisions: () => createDecisionsClient(), embedder: () => localEmbedder(), aiEmbedder: () => jinaEmbedder() };

export function renderVoice(reading: VoiceReading & { notHere?: string[]; aiTells?: AiReading }): string {
  const scores = `voice ${reading.voice.toFixed(2)} · answers them ${reading.inContext.toFixed(2)} · reads like a mate ${reading.friendLike.toFixed(2)} · opener only ${reading.openerOnly.toFixed(2)}${reading.toThem === null ? "" : ` · like his replies there ${reading.toThem.toFixed(2)}`}`;
  const never = reading.neverSays.length ? ` · matt never says: ${reading.neverSays.join(", ")}` : "";
  const notHere = reading.notHere?.length ? `\n  he never writes it here: ${reading.notHere.join("; ")}` : "";
  const watermark = reading.watermark ? `\n  ${watermarkLine(reading.watermark)}` : "";
  const ai = reading.aiTells ? `\n  ${aiTellsLine(reading.aiTells)}` : "";
  return `log voice: @${reading.to.replace(/^@/, "")} ${reading.pass ? "PASS" : "FAIL"}: ${scores}${never}${notHere}${watermark}${ai}${reading.pass ? "" : "\n  rewrite it in matt's words and gate it again"}`;
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
        const line = `log voice aiIndex: ${meta.phrases.length} AI phrases embedded with ${meta.model}; matt's own ${meta.baseline.messages} messages sit at p50 ${meta.baseline.p50.toFixed(3)}, p99 ${meta.baseline.p99.toFixed(3)} from them; ${meta.baseline.mutedRules.length} vale rules muted because he uses them himself (${meta.baseline.mutedRules.join(", ") || "none"}); ${((Date.now() - started) / 1000).toFixed(1)} s at ${aiIndexDir()}`;
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
        if (!found.ok) context.err(`voice: matt has no saved chat with "${chat}" yet, so the draft is gated on his writing guide alone`);
        else evidence = found.evidence;
        if (found.ok && !text.trim()) {
          if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ chat: found.label, profile: found.profile, replies: found.near }, null, 2) };
          return { code: 0, stdout: [`log voice: how matt writes in ${found.label}`, `  ${found.profile ? profileLine(found.profile) : "no messages of his there yet"}`, `his latest messages here:`, ...found.recent.map((p) => `    matt: ${p.reply.replace(/\n/g, " / ").slice(0, 240)}`), `his real replies to things like this, nearest first (same chat, same person, same platform, anywhere):`, ...nearLines(found.near), "Draft from these, then gate it: log voice --to <who> --with <chat> --context \"<what they said>\" --text \"<draft>\""].join("\n") };
        }
      }
      context.err(`voice: SubQ reading the draft for @${to.replace(/^@/, "")} against matt's writing guide${evidence ? ` and his real replies in ${evidence.chat}` : ""}`);
      const scored = await readVoice({ to, text, ...(said ? { context: said } : {}), ...(evidence ? { evidence } : {}) }, guide, voiceDeps.decisions());
      const notHere = evidence ? offProfile(text, evidence.profile as VoiceProfile | null) : [];
      const aiIndex = openAiIndex();
      if (!aiIndex) context.err("voice: no AI tells index yet, so AI phrasing isn't checked: build it with `log voice aiIndex`");
      const aiTells = aiIndex ? await readAiTells(text, aiIndex, voiceDeps.aiEmbedder()) : undefined;
      const reading = { ...scored, notHere, ...(aiTells ? { aiTells } : {}), pass: scored.pass && !notHere.length && (aiTells?.pass ?? true) };
      if (parsed.flags["json"]) return { code: reading.pass ? 0 : 1, stdout: JSON.stringify(reading, null, 2) };
      return { code: reading.pass ? 0 : 1, stdout: renderVoice(reading) };
    } catch (error) {
      return refuseError("voice", error);
    }
  },
};
