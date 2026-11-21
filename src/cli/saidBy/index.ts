import type { Database } from "bun:sqlite";
import { defaultDbPath, openDatabase } from "../../storage/schema/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const SAID_BY_USAGE = "Usage: log saidBy [--name <name>] [--limit <n>] [--json]";

export const SAID_BY_INPUT: CommandInput = {
  forms: [{ words: [], summary: "Someone's messages on every platform, found by name, newest first", positionals: [], flags: [{ name: "name", kind: "string", description: "Part of their name or handle, as stored" }, { name: "limit", kind: "integer", min: 1, max: 500, description: "How many, default 60" }, JSON_FLAG] }],
};

export type SaidByInput = { name?: string; limit?: number };

export function saidByRows(handle: Database, input: SaidByInput): Record<string, unknown>[] {
  const name = input.name?.trim();
  if (!name) return [];
  const like = `%${name.replace(/[!%_]/g, "!$&")}%`;
  return handle
    .query("SELECT c.platform, c.name AS chat, m.senderLabel, m.fromOwner, m.sentAt, m.text FROM messages m JOIN chats c ON c.chatId = m.chatId WHERE m.senderLabel LIKE ? ESCAPE '!' ORDER BY m.sentAt DESC LIMIT ?")
    .all(like, input.limit ?? 60) as Record<string, unknown>[];
}

export const saidByCommand: Command = {
  usage: SAID_BY_USAGE,
  platform: "any",
  name: "saidBy",
  effect: "read",
  input: SAID_BY_INPUT,
  summary: "Someone's messages on every platform, found by name, newest first",
  args: "[--name <name>] [--limit <n>] [--json]",
  run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(SAID_BY_INPUT));
    if (!parsed.ok) return refuseInput("saidBy", parsed.error, SAID_BY_USAGE);
    const text = (flag: string) => (typeof parsed.flags[flag] === "string" ? (parsed.flags[flag] as string) : undefined);
    const rows = saidByRows(openDatabase(defaultDbPath()), { name: text("name"), limit: typeof parsed.flags["limit"] === "number" ? (parsed.flags["limit"] as number) : undefined });
    if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify({ rows }, null, 2) };
    return { code: 0, stdout: rows.length ? rows.map((r) => JSON.stringify(r)).join("\n") : "log saidBy: nothing found." };
  },
};
