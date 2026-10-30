import { twitterAccounts } from "../../inbox/watch/client.ts";
import { platformStateRoot } from "../../directApi/engine/index.ts";
import { discordGate, findDiscordAccount } from "../../discord/account/session/index.ts";
import { benchmark, buildIndex, linearScan, loadConversations, localEmbedder, openIndex, saveConversations, search, twitterConversationOf, updateIndex } from "../../search/conversations/index.ts";
import type { Conversation, Embedder, SearchHit } from "../../search/conversations/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandContext, CommandInput } from "../runner/types.ts";
import { openTwitterAccount } from "../twitter/helpers/account.ts";

export const SEARCH_USAGE = [
  "Usage: log search \"<query>\" [--limit <n>] [--platform <p>] [--account <a>] [--with <handle>] [--after <YYYY-MM-DD>] [--json]",
  "       log search index [--platform <twitter|discord>] [--account <a>] [--saved] [--rebuild]   (only the chunks that are new or changed are embedded, and the ones gone are removed, so the index stays deduplicated; --rebuild embeds everything again. --saved indexes the conversations already kept, reading nothing; otherwise reads every conversation through the platform's engine: X's DMs with X Chat decrypted with the saved PIN, and every Discord DM and group through vendor/endcord (its whole history, up to 20,000 messages each), keeps them in ~/.logCli/conversations, and builds the keyword and meaning indexes in ~/.logCli/search)",
  "       log search bench [--rounds <n>]   (times realistic queries on the built index, cold and warm, and prints p50, p95 and p99 beside a plain linear scan)",
  "Hybrid search across every conversation: BM25 keyword ranking (bm25s) and meaning ranking (verso-db HNSW over local all-MiniLM-L6-v2 embeddings) run in parallel and are fused with reciprocal rank fusion. Each hit names the conversation, who it was with, when, and the messages it covers.",
].join("\n");

const FILTERS = [
  { name: "platform", kind: "string", description: "Only this platform's conversations (twitter, discord)" },
  { name: "account", kind: "string", description: "Only this account's conversations" },
  { name: "with", kind: "string", description: "Only conversations with this handle" },
  { name: "after", kind: "string", description: "Only chunks from this day on, YYYY-MM-DD" },
] as const;

export const SEARCH_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Search every conversation by keyword and meaning at once, fused with reciprocal rank fusion",
      positionals: [{ name: "query", kind: "string", required: true, description: "What to look for, in plain words" }],
      flags: [{ name: "limit", kind: "string", description: "How many hits, default 10, at most 100" }, ...FILTERS, JSON_FLAG],
    },
    {
      words: ["index"],
      summary: "Read every conversation through the platform's engine (X Chat decrypted with the saved PIN, Discord DMs and groups through endcord) and build the search indexes",
      positionals: [],
      flags: [{ name: "platform", kind: "string", description: "Only this platform (twitter or discord; default both)" }, { name: "account", kind: "string", description: "Only this account (default: every signed-in X and Discord account)" }, { name: "saved", kind: "boolean", description: "Index the conversations already saved, reading nothing from the platforms" }, { name: "rebuild", kind: "boolean", description: "Embed every chunk again instead of only what changed" }, JSON_FLAG],
    },
    {
      words: ["bench"],
      summary: "Time realistic queries on the built index, cold and warm, with p50, p95 and p99 beside a linear scan",
      positionals: [],
      flags: [{ name: "rounds", kind: "string", description: "Warm rounds over the queries, default 20" }, JSON_FLAG],
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
  messages: { id: string; at: string | null; from: string | null; fromMe: boolean; text: string }[];
}

function discordConversationOf(account: string, c: DiscordExported): Conversation {
  return {
    platform: "discord",
    account,
    conversationId: c.id,
    box: c.name ? `${c.kind} ${c.name}` : c.kind,
    with: c.members,
    messages: c.messages.map((m) => ({ id: m.id, at: m.at, from: m.from, fromMe: m.fromMe, text: m.text })),
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
    if (!run.answer.ok) {
      lines.push(`discord ${name}: ${run.answer.code}: ${run.answer.detail ?? ""}`);
      continue;
    }
    const found = ((run.answer.conversations as DiscordExported[] | undefined) ?? []).filter((c) => c.messages.length).map((c) => discordConversationOf(account.accountName, c));
    saveConversations(found);
    conversations.push(...found);
    const problems = (run.answer.problems as unknown[] | undefined)?.length ?? 0;
    lines.push(`discord ${name}: ${found.length} conversations, ${found.reduce((n, c) => n + c.messages.length, 0)} messages${problems ? `, ${problems} chat(s) not fully read` : ""}`);
  }
}

function hitLine(hit: SearchHit): string {
  const c = hit.chunk;
  const ranks = [hit.keywordRank ? `keyword #${hit.keywordRank}` : null, hit.meaningRank ? `meaning #${hit.meaningRank}` : null].filter(Boolean).join(", ");
  return [`  ${hit.rank}. ${c.platform} ${c.account} with @${c.with.join(", @")} · ${c.at ?? "?"} · ${ranks} · conversation ${c.conversationId}`, ...c.text.split("\n").map((l) => `     ${l.slice(0, 220)}`)].join("\n");
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
  args: "\"<query>\"|index|bench [--limit <n>] [--platform <p>] [--account <a>] [--with <handle>] [--after <day>] [--json]",
  async run(context, argv) {
    const [first] = argv;
    const sub = first === "index" || first === "bench" ? first : "query";
    const form = SEARCH_INPUT.forms[sub === "index" ? 1 : sub === "bench" ? 2 : 0];
    const parsed = parseArgs(sub === "query" ? argv : argv.slice(1), parserSpecOf({ forms: [{ ...form, words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log search: ${parsed.error}\n${SEARCH_USAGE}` };
    const json = parsed.flags["json"] === true;
    const embedder = searchDeps.embedder();
    try {
      if (sub === "index") {
        const account = typeof parsed.flags["account"] === "string" ? parsed.flags["account"] : undefined;
        const { lines } = parsed.flags["saved"] === true ? { lines: [] as string[] } : await indexAll(context, account, typeof parsed.flags["platform"] === "string" ? parsed.flags["platform"] : undefined);
        const all = loadConversations();
        const rebuild = parsed.flags["rebuild"] === true;
        context.err(`search: ${rebuild ? "embedding and indexing" : "updating the index with what changed in"} ${all.length} conversations with ${embedder.model}`);
        const built = rebuild ? { ...(await buildIndex(all, embedder)), rebuilt: true } : await updateIndex(all, embedder);
        const changed = "embedded" in built && !built.rebuilt ? `, ${built.embedded} chunks embedded, ${built.removed} removed` : "";
        const done = `search: ${built.rebuilt ? "indexed" : "index holds"} ${built.chunks} chunks from ${built.conversations} conversations${changed} in ${(built.ms / 1000).toFixed(1)} s`;
        return { code: 0, stdout: json ? JSON.stringify({ accounts: lines, ...built }, null, 2) : [...lines, done].join("\n") };
      }
      const index = await openIndex(embedder);
      try {
        if (sub === "bench") {
          const rounds = Number(parsed.flags["rounds"] ?? 20);
          if (!Number.isInteger(rounds) || rounds < 1 || rounds > 1000) return { code: 1, stderr: "log search bench: --rounds is a whole number from 1 to 1000" };
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
        const limit = Number(parsed.flags["limit"] ?? 10);
        if (!Number.isInteger(limit) || limit < 1 || limit > 100) return { code: 1, stderr: "log search: --limit is a whole number from 1 to 100" };
        const after = parsed.flags["after"];
        if (after !== undefined && (typeof after !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(after))) return { code: 1, stderr: "log search: --after takes a day, YYYY-MM-DD" };
        const pick = (name: string) => (typeof parsed.flags[name] === "string" ? (parsed.flags[name] as string) : undefined);
        const started = performance.now();
        const hits = await search(index, query, { limit, platform: pick("platform"), account: pick("account"), with: pick("with"), after });
        const ms = performance.now() - started;
        if (json) return { code: 0, stdout: JSON.stringify({ query, ms, hits }, null, 2) };
        return { code: 0, stdout: [`log search "${query}": ${hits.length} hit${hits.length === 1 ? "" : "s"} in ${ms.toFixed(1)} ms (keyword + meaning, RRF)`, ...hits.map(hitLine)].join("\n") };
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
