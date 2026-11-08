import { Database } from "bun:sqlite";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

type Stat = { label: string; n: number; p50: number; p95: number; p99: number; max: number; note?: string };

const root = process.env.LOG_HOME ?? join(homedir(), ".logCli");

function percentiles(label: string, samples: number[], note?: string): Stat {
  const sorted = [...samples].sort((a, b) => a - b);
  const at = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] ?? 0;
  return { label, n: sorted.length, p50: at(0.5), p95: at(0.95), p99: at(0.99), max: sorted[sorted.length - 1] ?? 0, ...(note ? { note } : {}) };
}

function filesUnder(dir: string, ext: string): string[] {
  const found: string[] = [];
  const walk = (path: string) => {
    for (const name of readdirSync(path)) {
      const full = join(path, name);
      if (statSync(full).isDirectory()) walk(full);
      else if (full.endsWith(ext)) found.push(full);
    }
  };
  try {
    walk(dir);
  } catch {
    return [];
  }
  return found;
}

function readEach(label: string, dir: string, ext: string): Stat | null {
  const files = filesUnder(dir, ext);
  if (!files.length) return null;
  const samples = files.map((file) => {
    const started = performance.now();
    const raw = readFileSync(file, "utf8");
    try {
      if (ext === ".jsonl") raw.split("\n").filter(Boolean).forEach((line) => JSON.parse(line));
      else JSON.parse(raw);
    } catch {
      return performance.now() - started;
    }
    return performance.now() - started;
  });
  return percentiles(label, samples);
}

function wholeStore(dir: string): Stat {
  const started = performance.now();
  let messages = 0;
  for (const file of filesUnder(dir, ".json")) {
    try {
      const parsed = JSON.parse(readFileSync(file, "utf8")) as { messages?: unknown[] };
      messages += parsed.messages?.length ?? 0;
    } catch {
      continue;
    }
  }
  return percentiles("whole conversation store", [performance.now() - started], `${messages} messages`);
}

function dbReads(path: string): Stat[] {
  const db = new Database(path, { readonly: true });
  const chats = db.query("SELECT DISTINCT conversationId AS c FROM events WHERE conversationId != '' LIMIT 200").all() as { c: string }[];
  const byChat = db.query("SELECT * FROM events WHERE conversationId = ? ORDER BY seq DESC LIMIT 100");
  const chatSamples: number[] = [];
  for (let round = 0; round < 3; round++) {
    for (const { c } of chats) {
      const started = performance.now();
      byChat.all(c);
      chatSamples.push(performance.now() - started);
    }
  }
  const plan = (db.query("EXPLAIN QUERY PLAN SELECT * FROM events WHERE conversationId = 'x' ORDER BY seq DESC LIMIT 100").all() as { detail: string }[]).map((row) => row.detail).join("; ");
  const search = db.query("SELECT count(*) AS n FROM searchIndex WHERE searchIndex MATCH ?");
  const searchSamples = ["dialer", "twenty", "money", "call", "video", "voice", "price", "discord"].map((word) => {
    const started = performance.now();
    search.get(word);
    return performance.now() - started;
  });
  const rows = (db.query("SELECT count(*) AS n FROM events").get() as { n: number }).n;
  db.close();
  return [percentiles("log.db last 100 events of one chat", chatSamples, `${rows} events, plan: ${plan}`), percentiles("log.db FTS5 search", searchSamples)];
}

function counts(): Record<string, number> {
  const tally = (ext: string) => filesUnder(root, ext).length;
  return { jsonl: tally(".jsonl"), json: tally(".json"), db: tally(".db") };
}

const stats = [
  readEach("one conversation store file", join(root, "conversations"), ".json"),
  readEach("one kept run json", join(root, "runs", "kept"), ".json"),
  readEach("one job json", join(root, "mcp", "jobs"), ".json"),
  readEach("one job jsonl", join(root, "mcp", "jobs"), ".jsonl"),
  readEach("one queue json", join(root, "queues"), ".json"),
  wholeStore(join(root, "conversations")),
  ...dbReads(join(root, "log.db")),
].filter((stat): stat is Stat => stat !== null);

const json = process.argv.includes("--json");
if (json) console.log(JSON.stringify({ at: new Date().toISOString(), root, files: counts(), stats }, null, 2));
else {
  console.log(`benchStorage ${root}: ${JSON.stringify(counts())}`);
  for (const s of stats) console.log(`${s.label}: n=${s.n} p50=${s.p50.toFixed(2)}ms p95=${s.p95.toFixed(2)}ms p99=${s.p99.toFixed(2)}ms max=${s.max.toFixed(2)}ms${s.note ? ` (${s.note})` : ""}`);
}
