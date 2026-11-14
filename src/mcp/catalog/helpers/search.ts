import { PLATFORM_LABELS, PLATFORMS } from "../../../cli/runner/helpers/platforms.ts";
import type { CatalogEntry, SearchHit, SearchResult } from "../types.ts";

const STOP_WORDS = new Set(["a", "an", "the", "to", "of", "for", "on", "in", "and", "or", "my", "me", "i", "it", "is", "be", "with", "from", "by", "at", "as", "do", "how", "can", "want", "please", "some", "all", "one", "this", "that", "what", "who", "log"]);

const SYNONYMS: Readonly<Record<string, string[]>> = {
  x: ["twitter"],
  tweet: ["post", "twitter"],
  tweets: ["post", "twitter"],
  dm: ["message", "dm"],
  dms: ["message", "dms"],
  message: ["send", "dm"],
  messages: ["read", "dms"],
  login: ["session", "cookies"],
  signin: ["session", "cookies"],
  sign: ["session", "cookies"],
  cookie: ["cookies"],
  inbox: ["dms", "inbox"],
  fb: ["facebook"],
  ig: ["instagram"],
  insta: ["instagram"],
  meme: ["memelord"],
  memes: ["memelord"],
  members: ["members", "read"],
};

const PLATFORM_WORDS = new Set<string>([...PLATFORMS, ...Object.values(PLATFORM_LABELS).map((l) => l.toLowerCase()), "x", "fb", "ig", "insta"]);

export function wordsOf(text: string): string[] {
  return text
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 1 || w === "x");
}

export function queryWords(query: string): string[] {
  return [...new Set(wordsOf(query).filter((w) => !STOP_WORDS.has(w)))];
}

interface Doc {
  entry: CatalogEntry;
  fields: { words: string[]; weight: number }[];
  platform: string;
}

function docOf(entry: CatalogEntry): Doc {
  return {
    entry,
    platform: entry.platform,
    fields: [
      { words: wordsOf(entry.id), weight: 3 },
      { words: wordsOf(entry.summary), weight: 2 },
      { words: wordsOf(entry.command.summary), weight: 1.5 },
      { words: wordsOf(entry.inputs.map((i) => i.name).join(" ")), weight: 1 },
      { words: wordsOf(entry.usage.join(" ")), weight: 0.5 },
    ],
  };
}

function matches(word: string, candidate: string): boolean {
  if (word === candidate) return true;
  if (word.length >= 4 && candidate.startsWith(word)) return true;
  if (candidate.length >= 4 && word.startsWith(candidate)) return true;
  return false;
}

function termScore(doc: Doc, term: string): number {
  let best = 0;
  for (const field of doc.fields) if (field.words.some((w) => matches(term, w))) best = Math.max(best, field.weight);
  return best;
}

function platformOfWord(word: string): string | null {
  if (word === "x") return "twitter";
  if (word === "fb") return "facebook";
  if (word === "ig" || word === "insta") return "instagram";
  return PLATFORMS.find((p) => p === word || PLATFORM_LABELS[p].toLowerCase() === word) ?? null;
}

export function searchCatalog(entries: readonly CatalogEntry[], query: string, limit: number): SearchResult {
  const words = queryWords(query);
  const docs = entries.map(docOf);
  const platforms = words.map(platformOfWord).filter((p): p is string => p !== null);
  const terms = words.filter((w) => !PLATFORM_WORDS.has(w));
  const rarity = new Map(terms.map((t) => [t, Math.log(1 + docs.length / (1 + docs.filter((d) => termScore(d, t) > 0 || (SYNONYMS[t] ?? []).some((s) => termScore(d, s) > 0)).length))]));
  const scored: SearchHit[] = docs.map((doc) => {
    const matched: string[] = [];
    const missed: string[] = [];
    let score = 0;
    for (const term of terms) {
      const direct = termScore(doc, term);
      const viaSynonym = Math.max(0, ...(SYNONYMS[term] ?? []).map((s) => termScore(doc, s) * 0.8));
      const best = Math.max(direct, viaSynonym);
      if (best > 0) {
        matched.push(term);
        score += best * (rarity.get(term) ?? 1);
      } else missed.push(term);
    }
    if (platforms.includes(doc.platform)) score += 2;
    if (doc.entry.recorded) score /= 2;
    return { entry: doc.entry, score, matched, missed };
  });
  const onPlatform = (h: SearchHit) => !platforms.length || platforms.includes(h.entry.platform) || h.entry.platform === "any" || h.entry.platform === "byArgument";
  const ranked = scored
    .filter((h) => onPlatform(h) && h.score > 0 && (h.matched.length > 0 || terms.length === 0))
    .sort((a, b) => b.matched.length - a.matched.length || b.score - a.score || a.entry.id.localeCompare(b.entry.id));
  const most = ranked.filter((h) => h.matched.length * 2 >= terms.length);
  if (!most.length) return { query, verdict: "none", hits: [], near: ranked.slice(0, 3) };
  return { query, verdict: terms.length && most[0].missed.length === 0 ? "strong" : "closest", hits: most.slice(0, limit), near: [] };
}

function distance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const held = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1));
      previous = held;
    }
  }
  return row[b.length];
}

export function didYouMean(entries: readonly CatalogEntry[], id: string): string[] {
  const wanted = id.toLowerCase();
  const byDistance = entries.map((e) => ({ id: e.id, d: Math.min(distance(wanted, e.id.toLowerCase()), distance(wanted, e.tool.toLowerCase())) })).sort((a, b) => a.d - b.d);
  const close = byDistance.filter((c) => c.d <= Math.max(2, Math.floor(wanted.length / 3))).slice(0, 3).map((c) => c.id);
  if (close.length) return close;
  return searchCatalog(entries, id, 3).hits.map((h) => h.entry.id);
}
