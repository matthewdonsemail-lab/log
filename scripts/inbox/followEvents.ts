import { Database } from "bun:sqlite";
import { defaultDbPath } from "../../src/storage/schema/client.ts";

const args = process.argv.slice(2);
const flag = (name: string) => {
  const at = args.indexOf(`--${name}`);
  return at >= 0 ? args[at + 1] : undefined;
};

const platform = flag("platform");
const types = (flag("types") ?? "message,mention,reply").split(",").map((t) => t.trim()).filter(Boolean);
const chat = flag("chat");
const everyMs = Math.max(500, Number(flag("everyMs") ?? 2000));

const handle = new Database(defaultDbPath(), { readonly: true });
handle.exec("PRAGMA busy_timeout = 5000");
let last = Number(flag("after") ?? (handle.prepare("SELECT COALESCE(MAX(seq), 0) AS seq FROM events").get() as { seq: number }).seq);
const where = [`seq > ?`, `type IN (${types.map(() => "?").join(", ")})`, ...(platform ? ["platform = ?"] : []), ...(chat ? ["conversationId = ?"] : [])];
const next = handle.prepare(`SELECT seq, platform, account, conversationId, type, withWho, text, payload, receivedAt FROM events WHERE ${where.join(" AND ")} ORDER BY seq LIMIT 200`);

function summary(row: { type: string; withWho: string; text: string; payload: string }): string {
  if (row.text) return row.text.replace(/\s+/g, " ").slice(0, 300);
  try {
    const payload = JSON.parse(row.payload) as Record<string, unknown>;
    const said = payload.text ?? payload.postText ?? payload.error ?? payload.detail ?? payload.kind;
    return typeof said === "string" ? said.replace(/\s+/g, " ").slice(0, 300) : "";
  } catch {
    return "";
  }
}

console.log(`following log.db events after seq ${last}: ${platform ?? "every platform"}, ${types.join(", ")}${chat ? `, chat ${chat}` : ""}`);
setInterval(() => {
  try {
    const rows = next.all(last, ...types, ...(platform ? [platform] : []), ...(chat ? [chat] : [])) as { seq: number; platform: string; account: string; conversationId: string; type: string; withWho: string; text: string; payload: string; receivedAt: string }[];
    for (const row of rows) {
      last = row.seq;
      console.log(`[${row.seq}] ${row.platform} ${row.account} ${row.type}${row.withWho ? ` ${row.withWho}` : ""}${row.conversationId ? ` in ${row.conversationId}` : ""}: ${summary(row)}`);
    }
  } catch (error) {
    console.log(`followEvents: could not read log.db (${error instanceof Error ? error.message : String(error)})`);
  }
}, everyMs);
