import { createMemelordClient, IMAGE_TOOL_CATEGORIES, MEME_TYPES, SEARCH_METHOD_FLAGS, TRENDING_MEDIA } from "../../extensions/memelord/index.ts";
import type { ImageToolCategory, MemelordAnswer, MemelordClient, MemeTemplate, MemeType, SearchMethodFlag } from "../../extensions/memelord/index.ts";
import { readFileSync } from "node:fs";
import { buildTaste, candidatesFromXPosts, FIT_AT, imageOf, readRatings, readTaste, replyProfile, replyProfileSummary, tasteCounts, tasteFit, tastePath, tasteSummary, writeTaste } from "../../extensions/memeTaste/index.ts";
import type { TasteFit, TasteIndex, TasteRating } from "../../extensions/memeTaste/index.ts";
import { createDecisionsClient } from "../../subq/decisions/index.ts";
import type { DecisionsClient } from "../../subq/decisions/index.ts";
import { JSON_FLAG, numberOf, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const MEMELORD_USAGE = [
  "Usage: log memelord search \"<what the moment is>\" [--type meme|video|sticker] [--method context|combined|media|fulltext|fuzzy] [--limit <n>] [--json]",
  "       log memelord template <id> [--json]   (one template: its name, media url, text slots and what it means)",
  "       log memelord trending [--limit <n>] [--media image|video] [--json]   (what is trending now, with its cultural context)",
  "       log memelord tools [--category imageToImage|imageTextToImage|textToImage] [--json]   (the catalog of one-shot image tools; log never runs them)",
  "       log memelord taste [--build --from <posts.json>] [--json]   (matt's meme taste: the styles he named and the memes he has sent, each read by SubQ from its picture; --build reads a file of his X media posts)",
  "Search ranks what it finds by matt's taste (--noTaste turns it off): SubQ reads each template's picture against the styles he named (deep fried, larping, streamer reacts like FlightReacts, Zias and Bloo, shitposts) and the memes he has sent, and the taste line leads the answer.",
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
        { name: "limit", kind: "integer", min: 1, max: 100, description: "How many, default 5, at most 100" },
        { name: "noTaste", kind: "boolean", description: "Leave the results in Memelord's order instead of ranking them by matt's taste" },
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
      flags: [{ name: "limit", kind: "integer", min: 1, max: 12, description: "How many, default 5, at most 12" }, { name: "media", kind: "enum", values: TRENDING_MEDIA, description: "Only still images or only video clips" }, JSON_FLAG],
    },
    {
      words: ["tools"],
      summary: "Memelord's catalog of one-shot image tools (face swaps, filters, generators); log lists them and never runs them",
      positionals: [],
      flags: [{ name: "category", kind: "enum", values: Object.keys(IMAGE_TOOL_CATEGORIES), description: "Only tools that take this input" }, JSON_FLAG],
    },
    {
      words: ["taste"],
      summary: "matt's meme taste: the styles he named and the memes he has sent, each read by SubQ from its picture; --build makes it from a file of his X media posts",
      positionals: [],
      flags: [{ name: "build", kind: "boolean", description: "Read every post in --from and keep the memes, with their style" }, { name: "from", kind: "string", description: "A JSON file of his X media posts (the timeline items of treg tikhub.x.twitter-web-fetch-user-media pages)" }, JSON_FLAG],
    },
  ],
};

export const memelordDeps: { client: () => MemelordClient; decide: () => DecisionsClient; taste: () => TasteIndex | null; ratings: () => TasteRating[]; fetcher: () => typeof fetch } = {
  client: () => createMemelordClient(),
  decide: () => createDecisionsClient(),
  taste: () => readTaste(),
  ratings: () => readRatings(),
  fetcher: () => fetch,
};

const SUBS = ["search", "template", "trending", "tools", "taste"] as const;

export async function rankByTaste(found: MemeTemplate[], index: TasteIndex | null, progress: (line: string) => void): Promise<{ template: MemeTemplate; taste: TasteFit | null }[]> {
  const decide = memelordDeps.decide();
  const ranked: { template: MemeTemplate; taste: TasteFit | null }[] = [];
  for (const template of found) {
    const preview = typeof template.raw.preview_url === "string" ? template.raw.preview_url : template.mediaUrl;
    const image = preview && !/[.]mp4([?]|$)/.test(preview) ? await imageOf(preview, memelordDeps.fetcher()) : null;
    const taste = image ? await tasteFit(decide, index, { name: template.name, description: typeof template.raw.description === "string" ? template.raw.description : "" }, image, memelordDeps.ratings()).catch(() => null) : null;
    progress(`memelord: taste ${template.name}: ${taste ? `${taste.fit.toFixed(2)} ${taste.style}` : "no picture to read"}`);
    ranked.push({ template, taste });
  }
  return ranked.sort((a, b) => (b.taste?.fit ?? -1) - (a.taste?.fit ?? -1));
}

function tasteTag(taste: TasteFit | null): string {
  if (!taste) return "";
  return ` · taste ${taste.fit.toFixed(2)}${taste.fit >= FIT_AT ? " his kind" : ""}, ${taste.style}`;
}

function templateLines(t: MemeTemplate, n?: number, taste: TasteFit | null = null): string {
  const about = (t.context ?? (typeof t.raw.description === "string" ? t.raw.description : "")).replace(/\s+/g, " ").slice(0, 220);
  return [`  ${n ? `${n}. ` : ""}${t.name} (${t.type ?? "?"}${t.textSlots !== null ? `, ${t.textSlots} text slot${t.textSlots === 1 ? "" : "s"}` : ""})${tasteTag(taste)}`, `     id ${t.id}`, `     ${t.mediaUrl ?? "no media url"}`, about ? `     ${about}` : ""].filter(Boolean).join("\n");
}

function refused(sub: string, answer: MemelordAnswer<unknown>) {
  return { code: 1, stderr: `log memelord ${sub}: ${answer.code}${answer.status ? ` (HTTP ${answer.status})` : ""}: ${answer.error ?? "no reason given"}` };
}

function whole(value: number | undefined, fallback: number, max: number): number | null {
  const n = value ?? fallback;
  return n >= 1 && n <= max ? n : null;
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
      const limit = whole(numberOf(parsed, "limit"), 5, 100);
      if (limit === null) return { code: 1, stderr: "log memelord search: --limit is a whole number from 1 to 100" };
      const method = typeof parsed.flags["method"] === "string" ? SEARCH_METHOD_FLAGS[parsed.flags["method"] as SearchMethodFlag] : undefined;
      const type = typeof parsed.flags["type"] === "string" ? (parsed.flags["type"] as MemeType) : undefined;
      context.err(`memelord: searching templates for "${query}"`);
      const answer = await client.searchMemes({ query, type, method, limit });
      if (!answer.ok) return refused(sub, answer);
      const found = answer.data ?? [];
      const index = memelordDeps.taste();
      const noTaste = parsed.flags["noTaste"] === true;
      const ranked = noTaste ? found.map((template) => ({ template, taste: null as TasteFit | null })) : await rankByTaste(found, index, context.err);
      const summary = tasteSummary(index);
      if (json) return { code: 0, stdout: JSON.stringify({ query, taste: summary, templates: ranked.map((r) => ({ ...r.template, taste: r.taste })) }, null, 2) };
      return { code: 0, stdout: [summary, `log memelord search "${query}": ${found.length} template${found.length === 1 ? "" : "s"}${noTaste ? "" : ", ranked by his taste"}`, ...ranked.map((r, i) => templateLines(r.template, i + 1, r.taste))].join("\n") };
    }
    if (sub === "template") {
      const id = parsed.positionals[0] ?? "";
      const answer = await client.getMemeTemplate(id);
      if (!answer.ok || !answer.data) return refused(sub, answer);
      if (json) return { code: 0, stdout: JSON.stringify(answer.data, null, 2) };
      return { code: 0, stdout: templateLines(answer.data) };
    }
    if (sub === "trending") {
      const limit = whole(numberOf(parsed, "limit"), 5, 12);
      if (limit === null) return { code: 1, stderr: "log memelord trending: --limit is a whole number from 1 to 12" };
      const media = typeof parsed.flags["media"] === "string" ? (parsed.flags["media"] as string) : undefined;
      const answer = await client.getTrendingMemes(limit, media);
      if (!answer.ok) return refused(sub, answer);
      const found = answer.data ?? [];
      if (json) return { code: 0, stdout: JSON.stringify({ trending: found }, null, 2) };
      return { code: 0, stdout: [`log memelord trending: ${found.length} template${found.length === 1 ? "" : "s"}`, ...found.map((t, i) => templateLines(t, i + 1))].join("\n") };
    }
    if (sub === "taste") {
      if (parsed.flags["build"] === true) {
        const from = typeof parsed.flags["from"] === "string" ? (parsed.flags["from"] as string) : "";
        if (!from) return { code: 1, stderr: "log memelord taste --build: --from <posts.json> names the file of his X media posts" };
        let posts: unknown;
        try {
          posts = JSON.parse(readFileSync(from, "utf8"));
        } catch (error) {
          return { code: 1, stderr: `log memelord taste --build: ${from}: ${error instanceof Error ? error.message : String(error)}` };
        }
        const list = Array.isArray(posts) ? posts : ((posts as { data?: { timeline?: unknown[] } })?.data?.timeline ?? []);
        const candidates = candidatesFromXPosts(list as never);
        context.err(`memelord: taste from ${candidates.length} pictures in ${from}, each read by SubQ`);
        const index = await buildTaste(candidates, memelordDeps.decide(), from, { fetcher: memelordDeps.fetcher(), progress: context.err });
        writeTaste(index);
        if (json) return { code: 0, stdout: JSON.stringify(index, null, 2) };
        return { code: 0, stdout: [`log memelord taste: ${index.memes.length} memes of ${index.read} pictures read, kept in ${tastePath()}`, tasteSummary(index)].join("\n") };
      }
      const index = memelordDeps.taste();
      const replies = replyProfile(memelordDeps.ratings());
      if (json) return { code: 0, stdout: JSON.stringify({ summary: tasteSummary(index), counts: index ? tasteCounts(index) : {}, replies, memes: index?.memes ?? [] }, null, 2) };
      return { code: 0, stdout: [tasteSummary(index), replyProfileSummary(replies), ...(index?.memes ?? []).slice(0, 20).map((m) => `  ${m.style} · ${m.kind} · ${m.url}${m.text ? ` · ${m.text.replace(/\s+/g, " ").slice(0, 80)}` : ""}`)].join("\n") };
    }
    const category = typeof parsed.flags["category"] === "string" ? IMAGE_TOOL_CATEGORIES[parsed.flags["category"] as ImageToolCategory] : undefined;
    const answer = await client.listImageTools(category);
    if (!answer.ok) return refused(sub, answer);
    if (json) return { code: 0, stdout: JSON.stringify(answer.data, null, 2) };
    const tools = ((answer.data as { tools?: { tool_id?: string; name?: string; description?: string; category?: string }[] } | null)?.tools ?? []);
    return { code: 0, stdout: [`log memelord tools: ${tools.length} image tool${tools.length === 1 ? "" : "s"} (listed only: log never runs them, rule 41)`, ...tools.map((t) => `  ${t.name} (${t.tool_id}, ${t.category}): ${t.description ?? ""}`)].join("\n") };
  },
};
