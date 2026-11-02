import { createMemelordClient, IMAGE_TOOL_CATEGORIES, MEME_TYPES, SEARCH_METHOD_FLAGS, TRENDING_MEDIA } from "../../extensions/memelord/index.ts";
import type { ImageToolCategory, MemelordAnswer, MemelordClient, MemeTemplate, MemeType, SearchMethodFlag } from "../../extensions/memelord/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const MEMELORD_USAGE = [
  "Usage: log memelord search \"<what the moment is>\" [--type meme|video|sticker] [--method context|combined|media|fulltext|fuzzy] [--limit <n>] [--json]",
  "       log memelord template <id> [--json]   (one template: its name, media url, text slots and what it means)",
  "       log memelord trending [--limit <n>] [--media image|video] [--json]   (what is trending now, with its cultural context)",
  "       log memelord tools [--category imageToImage|imageTextToImage|textToImage] [--json]   (the catalog of one-shot image tools; log never runs them)",
  "Memelord is an extension (docs/extensions/memelord.md): only its four free discovery tools are reachable from log, so nothing here spends money (rule 41). The key is MEMELORD_API_KEY in .env.local. A meme goes out on Discord as its media url on a line of its own, which Discord shows inline.",
].join("\n");

export const MEMELORD_INPUT: CommandInput = {
  forms: [
    {
      words: ["search"],
      summary: "Search Memelord's template library (memes, videos, stickers) by meaning or keyword, for a meme that fits the moment",
      positionals: [{ name: "query", kind: "rest", required: true, description: "The moment in plain words, e.g. what was just said in the chat" }],
      flags: [
        { name: "type", kind: "enum", values: MEME_TYPES, description: "Only memes (images), videos or stickers" },
        { name: "method", kind: "enum", values: Object.keys(SEARCH_METHOD_FLAGS), description: "How to match: context (default, by meaning), combined, media, fulltext or fuzzy" },
        { name: "limit", kind: "string", description: "How many, default 5, at most 100" },
        JSON_FLAG,
      ],
    },
    {
      words: ["template"],
      summary: "One Memelord template by its id: name, media url, text slots and what it means",
      positionals: [{ name: "id", kind: "string", required: true, description: "A template id from search or trending" }],
      flags: [JSON_FLAG],
    },
    {
      words: ["trending"],
      summary: "Memelord's trending templates right now, each with its cultural context",
      positionals: [],
      flags: [{ name: "limit", kind: "string", description: "How many, default 5, at most 12" }, { name: "media", kind: "enum", values: TRENDING_MEDIA, description: "Only still images or only video clips" }, JSON_FLAG],
    },
    {
      words: ["tools"],
      summary: "Memelord's catalog of one-shot image tools (face swaps, filters, generators); log lists them and never runs them",
      positionals: [],
      flags: [{ name: "category", kind: "enum", values: Object.keys(IMAGE_TOOL_CATEGORIES), description: "Only tools that take this input" }, JSON_FLAG],
    },
  ],
};

export const memelordDeps: { client: () => MemelordClient } = { client: () => createMemelordClient() };

const SUBS = ["search", "template", "trending", "tools"] as const;

function templateLines(t: MemeTemplate, n?: number): string {
  const about = (t.context ?? (typeof t.raw.description === "string" ? t.raw.description : "")).replace(/\s+/g, " ").slice(0, 220);
  return [`  ${n ? `${n}. ` : ""}${t.name} (${t.type ?? "?"}${t.textSlots !== null ? `, ${t.textSlots} text slot${t.textSlots === 1 ? "" : "s"}` : ""})`, `     id ${t.id}`, `     ${t.mediaUrl ?? "no media url"}`, about ? `     ${about}` : ""].filter(Boolean).join("\n");
}

function refused(sub: string, answer: MemelordAnswer<unknown>) {
  return { code: 1, stderr: `log memelord ${sub}: ${answer.code}${answer.status ? ` (HTTP ${answer.status})` : ""}: ${answer.error ?? "no reason given"}` };
}

function whole(value: unknown, fallback: number, max: number): number | null {
  const n = value === undefined ? fallback : Number(value);
  return Number.isInteger(n) && n >= 1 && n <= max ? n : null;
}

export const memelordCommand: Command = {
  usage: MEMELORD_USAGE,
  platform: "any",
  name: "memelord",
  effect: "read",
  input: MEMELORD_INPUT,
  summary: "The Memelord extension: search memes for a moment, read one template, see what is trending, list the image tools (free tools only)",
  args: "search \"<moment>\"|template <id>|trending|tools [--type <t>] [--limit <n>] [--json]",
  async run(context, argv) {
    const sub = SUBS.find((s) => s === argv[0]);
    if (!sub) return { code: 1, stderr: `log memelord: say search, template, trending or tools\n${MEMELORD_USAGE}` };
    const form = MEMELORD_INPUT.forms[SUBS.indexOf(sub)];
    const parsed = parseArgs(argv.slice(1), parserSpecOf({ forms: [{ ...form, words: [] }] }));
    if (!parsed.ok) return { code: 1, stderr: `log memelord ${sub}: ${parsed.error}\n${MEMELORD_USAGE}` };
    const json = parsed.flags["json"] === true;
    const client = memelordDeps.client();
    if (sub === "search") {
      const query = parsed.positionals.join(" ").trim();
      if (!query) return { code: 1, stderr: `log memelord search: say what the moment is\n${MEMELORD_USAGE}` };
      const limit = whole(parsed.flags["limit"], 5, 100);
      if (limit === null) return { code: 1, stderr: "log memelord search: --limit is a whole number from 1 to 100" };
      const method = typeof parsed.flags["method"] === "string" ? SEARCH_METHOD_FLAGS[parsed.flags["method"] as SearchMethodFlag] : undefined;
      const type = typeof parsed.flags["type"] === "string" ? (parsed.flags["type"] as MemeType) : undefined;
      context.err(`memelord: searching templates for "${query}"`);
      const answer = await client.searchMemes({ query, type, method, limit });
      if (!answer.ok) return refused(sub, answer);
      const found = answer.data ?? [];
      if (json) return { code: 0, stdout: JSON.stringify({ query, templates: found }, null, 2) };
      return { code: 0, stdout: [`log memelord search "${query}": ${found.length} template${found.length === 1 ? "" : "s"}`, ...found.map((t, i) => templateLines(t, i + 1))].join("\n") };
    }
    if (sub === "template") {
      const id = parsed.positionals[0] ?? "";
      const answer = await client.getMemeTemplate(id);
      if (!answer.ok || !answer.data) return refused(sub, answer);
      if (json) return { code: 0, stdout: JSON.stringify(answer.data, null, 2) };
      return { code: 0, stdout: templateLines(answer.data) };
    }
    if (sub === "trending") {
      const limit = whole(parsed.flags["limit"], 5, 12);
      if (limit === null) return { code: 1, stderr: "log memelord trending: --limit is a whole number from 1 to 12" };
      const media = typeof parsed.flags["media"] === "string" ? (parsed.flags["media"] as string) : undefined;
      const answer = await client.getTrendingMemes(limit, media);
      if (!answer.ok) return refused(sub, answer);
      const found = answer.data ?? [];
      if (json) return { code: 0, stdout: JSON.stringify({ trending: found }, null, 2) };
      return { code: 0, stdout: [`log memelord trending: ${found.length} template${found.length === 1 ? "" : "s"}`, ...found.map((t, i) => templateLines(t, i + 1))].join("\n") };
    }
    const category = typeof parsed.flags["category"] === "string" ? IMAGE_TOOL_CATEGORIES[parsed.flags["category"] as ImageToolCategory] : undefined;
    const answer = await client.listImageTools(category);
    if (!answer.ok) return refused(sub, answer);
    if (json) return { code: 0, stdout: JSON.stringify(answer.data, null, 2) };
    const tools = ((answer.data as { tools?: { tool_id?: string; name?: string; description?: string; category?: string }[] } | null)?.tools ?? []);
    return { code: 0, stdout: [`log memelord tools: ${tools.length} image tool${tools.length === 1 ? "" : "s"} (listed only: log never runs them, rule 41)`, ...tools.map((t) => `  ${t.name} (${t.tool_id}, ${t.category}): ${t.description ?? ""}`)].join("\n") };
  },
};
