import { twitterAccounts } from "../../inbox/watch/client.ts";
import { platformStateRoot } from "../../directApi/engine/index.ts";
import { discordGate, findDiscordAccount } from "../../discord/account/session/index.ts";
import { benchmark, buildIndex, chunkPlace, linearScan, placeFromBox, whereSaid, loadConversations, localEmbedder, openIndex, saveConversations, search, twitterConversationOf, updateIndex } from "../../search/conversations/index.ts";
import type { Conversation, ConversationAttachment, Embedder, SearchHit } from "../../search/conversations/index.ts";
import { JSON_FLAG, numberOf, parseArgs, parserSpecOf, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput } from "../runner/types.ts";
import { openTwitterAccount } from "../twitter/helpers/account.ts";
import { graphPriorFor } from "../../relate/graph/index.ts";
import { chatIdOf } from "../../storage/platform/helpers/ids.ts";

export const SEARCH_USAGE = [
  "Usage: log search \"<query>\" [--limit <n>] [--fusion <rrf|bayes>] [--platform <p>] [--account <a>] [--with <handle>] [--after <YYYY-MM-DD>] [--kind <k>] [--server <s>] [--channel <c>] [--full] [--json]",
  "       log search index [--platform <twitter|discord>] [--account <a>] [--saved] [--rebuild]   (embeds only new or changed chunks, --rebuild all; --saved indexes what log.db holds, else reads every DM and group through the platform's engine first)",
  "       log search bench [--rounds <n>]   (times realistic queries on the built index, cold and warm, and prints p50, p95 and p99 beside a plain linear scan)",
  "Hybrid search across every conversation: BM25 keyword ranking (bm25s) and meaning ranking (verso-db HNSW over local all-MiniLM-L6-v2 embeddings) run in parallel and are fused with reciprocal rank fusion. Each hit names where it was said (DM, group or channel), when, and its matching lines.",
].join("\n");

const FILTERS = [
  { name: "platform", kind: "string", description: "Only this platform's conversations (twitter, discord)" },
  { name: "account", kind: "string", description: "Only this account's conversations" },
  { name: "with", kind: "string", description: "Only conversations with this handle" },
  { name: "after", kind: "string", format: "date", description: "Only chunks from this day on, YYYY-MM-DD" },
  { name: "kind", kind: "string", description: "dm, group, channel, thread, forumPost, replies, post" },
  { name: "server", kind: "string", description: "Only this server, workspace or subreddit" },
  { name: "channel", kind: "string", description: "Only this channel, thread or post" },
] as const;

export const SEARCH_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Find where someone talked about something: every conversation by keyword and meaning, before reading whole chats; --with, --platform and --after narrow it",
      positionals: [{ name: "query", kind: "string", required: true, description: "What to look for, in plain words" }],
      flags: [{ name: "limit", kind: "integer", min: 1, max: 100, description: "How many hits, default 10, at most 100" }, { name: "fusion", kind: "string", description: "How the keyword and meaning lists are combined: bayes (the default) or rrf (reciprocal rank fusion, keyword and meaning only). bayes is BayesRAG: Dempster-Shafer over keyword, meaning and a relationship retriever from the Relate graph, which votes for the chats of the people the query names and of the people near them" }, ...FILTERS, { name: "full", kind: "boolean", description: "Each hit's whole chunk, not its matching lines" }, JSON_FLAG],
    },
    {
      words: ["index"],
      summary: "Read every conversation through the platform's engine (X Chat decrypted with the saved PIN, Discord DMs and groups) and build the search indexes",
      positionals: [],
      flags: [{ name: "platform", kind: "string", description: "Only this platform (twitter or discord; default both)" }, { name: "account", kind: "string", description: "Only this account (default: every signed-in X and Discord account)" }, { name: "saved", kind: "boolean", description: "Index the conversations already saved, reading nothing from the platforms" }, { name: "rebuild", kind: "boolean", description: "Embed every chunk again instead of only what changed" }, JSON_FLAG],
    },
    {
      words: ["bench"],
      summary: "Time realistic queries on the built index, cold and warm, with p50, p95 and p99 beside a linear scan",
      positionals: [],
      flags: [{ name: "rounds", kind: "integer", min: 1, max: 1000, description: "Warm rounds over the queries, default 20, at most 1000" }, JSON_FLAG],
    },
  ],
};

export const searchDeps: { embedder: () => Embedder } = { embedder: () => localEmbedder() };

const BENCH_QUERIES = ["affiliate deal", "interview for a role", "consulting work", "enrichment for pool companies", "referral fee call", "where are you based", "open source agency", "treg", "subq tokens", "can we hop on a call"];

interface DiscordExported {
  id: string;
  kind: string;
  name: string | null;
  members: string[];
  messages: { id: string; at: string | null; from: string | null; fromMe: boolean; text: string; attachments?: ConversationAttachment[] }[];
}

function discordConversationOf(account: string, c: DiscordExported): Conversation {
  return {
    platform: "discord",
    account,
    conversationId: c.id,
    box: c.name ? `${c.kind} ${c.name}` : c.kind,
    with: c.members,
    place: placeFromBox("discord", c.name ? `${c.kind} ${c.name}` : c.kind, c.id),
    messages: c.messages.map((m) => ({ id: m.id, at: m.at, from: m.from, fromMe: m.fromMe, text: m.text, ...(m.attachments?.length ? { attachments: m.attachments } : {}) })),
  };
}

async function indexDiscord(context: CommandContext, only: string | undefined, lines: string[], conversations: Conversation[]): Promise<void> {
  for (const name of only ? [only] : twitterAccounts(platformStateRoot("discord"))) {
    const account = await findDiscordAccount(context.twenty, name).catch(() => null);
    if (!account) {
      if (!only) lines.push(`discord ${name}: skipped, no DISCORD socialAccount`);
      continue;
    }
    const gate = discordGate(account);
    if (!gate.ok || !context.directDiscord) {
      lines.push(`discord ${name}: skipped, ${gate.ok ? "the direct-API engine isn't wired" : gate.detail}`);
      continue;
    }
    context.err(`discord ${name}: reading every DM and group through vendor/endcord`);
    const run = context.directDiscord(account, { action: "export", limit: 20000, streamProgress: true });
    const found = ((run.answer.conversations as DiscordExported[] | undefined) ?? []).filter((c) => c.messages.length).map((c) => discordConversationOf(account.accountName, c));
    if (found.length) saveConversations(found);
    conversations.push(...found);
    if (!run.answer.ok) {
      lines.push(`discord ${name}: ${run.answer.code}: ${run.answer.detail ?? ""}${found.length ? `; kept the ${found.length} conversation(s) read before it, ${found.reduce((n, c) => n + c.messages.length, 0)} messages, and read nothing more` : ""}`);
      continue;
    }
    const problems = (run.answer.problems as unknown[] | undefined)?.length ?? 0;
    lines.push(`discord ${name}: ${found.length} conversations, ${found.reduce((n, c) => n + c.messages.length, 0)} messages${problems ? `, ${problems} chat(s) not fully read` : ""}`);
  }
}

export const SNIPPET_LINES = 3;
export const SNIPPET_WIDTH = 160;

export function snippetOf(text: string, query: string, lines: number = SNIPPET_LINES, width: number = SNIPPET_WIDTH): string {
  const all = text.split("\n").filter((l) => l.trim());
  const words = [...new Set(query.toLowerCase().match(/[\p{L}\p{N}']{3,}/gu) ?? [])];
  const scored = all.map((line, at) => ({ line, at, score: words.filter((w) => line.toLowerCase().includes(w)).length }));
  const picked = scored.some((s) => s.score) ? [...scored].sort((a, b) => b.score - a.score || a.at - b.at).slice(0, lines).sort((a, b) => a.at - b.at) : scored.slice(0, lines);
  const cut = (line: string) => (line.length > width ? `${line.slice(0, width - 1)}…` : line);
  const left = all.length - picked.length;
  return [...picked.map((s) => cut(s.line)), ...(left > 0 ? [`(${left} more line(s) in this chunk: --full)`] : [])].join("\n");
}

export function compactChunk(chunk: SearchHit["chunk"], query: string): Omit<SearchHit["chunk"], "messageIds"> & { messages: number; firstMessageId: string | null; lastMessageId: string | null } {
  const { messageIds, ...rest } = chunk;
  return { ...rest, text: snippetOf(chunk.text, query), messages: messageIds.length, firstMessageId: messageIds[0] ?? null, lastMessageId: messageIds.at(-1) ?? null };
}

function hitLine(hit: SearchHit, query: string, full: boolean): string {
  const c = hit.chunk;
  const belief = hit.likelihood === undefined ? null : `likelihood ${hit.likelihood.toFixed(2)} × prior ${(hit.prior ?? 1).toFixed(2)}${(hit.conflict ?? 0) > 0.2 ? `, conflict ${hit.conflict!.toFixed(2)}` : ""}`;
  const ranks = [hit.keywordRank ? `keyword #${hit.keywordRank}` : null, hit.meaningRank ? `meaning #${hit.meaningRank}` : null, hit.relationRank ? `relationship #${hit.relationRank}` : null, belief].filter(Boolean).join(", ");
  const body = full ? c.text.split("\n").map((l) => l.slice(0, 220)) : snippetOf(c.text, query).split("\n");
  return [`  ${hit.rank}. ${whereSaid(c.platform, chunkPlace(c), c.with, c.account)} · ${c.account} · ${c.at ?? "?"} · ${ranks} · conversation ${c.conversationId}`, ...body.map((l) => `     ${l}`)].join("\n");
}

async function indexAll(context: CommandContext, only: string | undefined, platform: string | undefined): Promise<{ lines: string[]; conversations: Conversation[] }> {
  const lines: string[] = [];
  const conversations: Conversation[] = [];
  if (!platform || platform === "discord") await indexDiscord(context, only, lines, conversations);
  if (platform && platform !== "twitter") return { lines, conversations };
  for (const account of only ? [only] : twitterAccounts()) {
    const opened = await openTwitterAccount(context, "search index", account);
    if (!opened.ok) {
      lines.push(`${account}: skipped, ${opened.result.stderr ?? "not usable"}`);
      continue;
    }
    const secrets = await context.twenty.loginSecrets(opened.account.id).catch(() => null);
    const chatPin = secrets?.messengerPin ?? undefined;
    context.err(`${account}: reading every conversation${chatPin ? ", X Chat opened with the saved PIN" : ", X Chat stays encrypted (no PIN saved)"}`);
    const run = await opened.engine({ action: "inbox", limit: 200, export: true, ...(chatPin ? { chatPin } : {}) });
    if (!run.answer.ok) {
      lines.push(`${account}: ${run.answer.code}: ${run.answer.detail ?? ""}`);
      continue;
    }
    const found = (run.answer.conversations ?? []).map((c) => twitterConversationOf(opened.account.accountName, c));
    saveConversations(found);
    conversations.push(...found);
    lines.push(`${account}: ${found.length} conversations, ${found.reduce((n, c) => n + c.messages.length, 0)} messages`);
  }
  return { lines, conversations };
}

export const searchCommand: Command = {
  usage: SEARCH_USAGE,
  platform: "any",
  name: "search",
  effect: "read",
  input: SEARCH_INPUT,
  summary: "Hybrid search across every conversation (BM25 keyword + vector meaning, fused with RRF), and building its indexes",
  args: "\"<query>\"|index|bench [--limit <n>] [--platform <p>] [--account <a>] [--with <handle>] [--after <day>] [--kind <kind>] [--server <s>] [--channel <c>] [--json]",
  async run(context, argv) {
    const [first] = argv;
    const sub = first === "index" || first === "bench" ? first : "query";
    const form = SEARCH_INPUT.forms[sub === "index" ? 1 : sub === "bench" ? 2 : 0];
    const parsed = parseArgs(sub === "query" ? argv : argv.slice(1), parserSpecOf({ forms: [{ ...form, words: [] }] }));
    if (!parsed.ok) return refuseInput("search", parsed.error, SEARCH_USAGE);
    const json = parsed.flags["json"] === true;
    const embedder = searchDeps.embedder();
    try {
      if (sub === "index") {
        const account = typeof parsed.flags["account"] === "string" ? parsed.flags["account"] : undefined;
        const { lines } = parsed.flags["saved"] === true ? { lines: [] as string[] } : await indexAll(context, account, typeof parsed.flags["platform"] === "string" ? parsed.flags["platform"] : undefined);
        const all = loadConversations();
        const rebuild = parsed.flags["rebuild"] === true;
        context.err(`search: ${rebuild ? "embedding and indexing" : "updating the index with what changed in"} ${all.length} conversations with ${embedder.model}`);
        const started = performance.now();
        const { embedConversations } = await import("../../indexPass/index.ts");
        const built = rebuild ? { ...(await buildIndex(all, embedder)), rebuilt: true, embedded: 0, removed: 0 } : { ...(await embedConversations(all, embedder)), rebuilt: false };
        const changed = rebuild ? "" : `, ${built.embedded} chunks embedded, ${built.removed} removed`;
        const done = `search: ${built.rebuilt ? "indexed" : "index holds"} ${built.chunks} chunks from ${all.length} conversations${changed} in ${((performance.now() - started) / 1000).toFixed(1)} s`;
        return { code: 0, stdout: json ? JSON.stringify({ accounts: lines, ...built }, null, 2) : [...lines, done].join("\n") };
      }
      const index = await openIndex(embedder);
      try {
        if (sub === "bench") {
          const rounds = numberOf(parsed, "rounds") ?? 20;
          const conversations = loadConversations();
          const scan: number[] = [];
          for (const q of BENCH_QUERIES) {
            const t = performance.now();
            linearScan(conversations, q);
            scan.push(performance.now() - t);
          }
          const timed = await benchmark(index, BENCH_QUERIES, rounds);
          const scanAvg = scan.reduce((a, b) => a + b, 0) / scan.length;
          const fmt = (l: { p50: number; p95: number; p99: number; runs: number }) => `p50 ${l.p50.toFixed(2)} ms · p95 ${l.p95.toFixed(2)} ms · p99 ${l.p99.toFixed(2)} ms (${l.runs} queries)`;
          if (json) return { code: 0, stdout: JSON.stringify({ chunks: index.chunks.length, ...timed, linearScanAvgMs: scanAvg }, null, 2) };
          return { code: 0, stdout: [`log search bench: ${index.chunks.length} chunks, ${embedder.model}`, `  cold: ${fmt(timed.cold)}`, `  warm: ${fmt(timed.warm)}`, `  linear scan (keyword only, no ranking): ${scanAvg.toFixed(2)} ms a query`].join("\n") };
        }
        const query = parsed.positionals.join(" ").trim();
        if (!query) return { code: 1, stderr: `log search: say what to look for\n${SEARCH_USAGE}` };
        const limit = numberOf(parsed, "limit") ?? 10;
        const after = typeof parsed.flags["after"] === "string" ? parsed.flags["after"] : undefined;
        const pick = (name: string) => (typeof parsed.flags[name] === "string" ? (parsed.flags[name] as string) : undefined);
        const fusion = pick("fusion") ?? "bayes";
        if (fusion !== "rrf" && fusion !== "bayes") return refuseInput("search", `--fusion is rrf or bayes, not ${fusion}`, SEARCH_USAGE);
        const started = performance.now();
        const graph = fusion === "bayes" ? await graphPriorFor(query) : null;
        const relation = graph ? (chunk: { platform: string; account: string; conversationId: string }) => graph.strength(chatIdOf(chunk.platform, chunk.account, chunk.conversationId)) : undefined;
        const hits = await search(index, query, { limit, fusion, relation, platform: pick("platform"), account: pick("account"), with: pick("with"), after, kind: pick("kind"), server: pick("server"), channel: pick("channel") });
        const ms = performance.now() - started;
        const priorOf = graph ? { people: graph.people.map((p) => `${p.platform} ${p.handle ?? p.key}`), behind: graph.behind } : null;
        const full = parsed.flags["full"] === true;
        if (json) return { code: 0, stdout: JSON.stringify({ query, ms, fusion, relationship: priorOf, hits: full ? hits : hits.map((h) => ({ ...h, chunk: compactChunk(h.chunk, query) })) }, null, full ? 2 : undefined) };
        const how = fusion === "bayes" ? `keyword + meaning, Dempster-Shafer${priorOf ? `, relationship retriever from ${priorOf.people.join(", ")}` : ", no one named so the relationship retriever abstains"}` : "keyword + meaning, RRF";
        return { code: 0, stdout: [`log search "${query}": ${hits.length} hit${hits.length === 1 ? "" : "s"} in ${ms.toFixed(1)} ms (${how})`, ...hits.map((h) => hitLine(h, query, full))].join("\n") };
      } finally {
        await index.close();
      }
    } catch (error) {
      return { code: 1, stderr: `log search: ${(error as Error).message}` };
    } finally {
      embedder.stop?.();
    }
  },
};
