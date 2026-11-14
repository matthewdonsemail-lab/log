import { openDatabase } from "../../storage/schema/index.ts";
import { countsOf, rebuildDerived, verifyDerived } from "../../storage/platform/index.ts";
import type { VerifyResult } from "../../storage/platform/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf, refuseInput } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";
import { liveThroughAction } from "../../platformKit/action/index.ts";

export const STORAGE_USAGE = [
  "Usage: log storage verify [--json]   (replays every event in ~/.logCli/log.db into a scratch copy and compares each typed table, row by row, with the live one; nothing is changed)",
  "       log storage rebuild [--apply] [--json]   (clears the typed tables (messages, attachments, chats, identities, memberships, interactions) and replays every event into them in order, in one transaction; a verify unless --apply)",
  "The events are the record: every typed row is derived from them, so a rebuild loses nothing (docs/storageAgainstTheBook.md, item 2).",
].join("\n");

export const STORAGE_INPUT: CommandInput = {
  forms: [
    { words: ["verify"], summary: "Replay every event into a scratch copy and compare each typed table with the live one, changing nothing", positionals: [], flags: [JSON_FLAG] },
    {
      words: ["rebuild"],
      effect: "write",
      summary: "Clear the typed tables and replay every event into them, in one transaction (a verify unless --apply)",
      positionals: [],
      flags: [{ name: "apply", kind: "boolean", live: true, description: "Rebuild the live tables (without it, it only verifies)" }, JSON_FLAG],
    },
  ],
};

export function verifyLines(result: VerifyResult): string[] {
  const rows = Object.keys(result.live).map((table) => `  ${table.padEnd(13)} live ${String(result.live[table].rows).padStart(6)}  replayed ${String(result.replayed[table].rows).padStart(6)}  ${result.differs.includes(table) ? "DIFFERS" : "same"}`);
  return [result.ok ? "Every typed table is what the events derive." : `>>> DIFFERS: ${result.differs.join(", ")} hold rows the events don't derive. \`log storage rebuild --apply\` replaces them with what the events say.`, ...rows];
}

export const storageCommand: Command = liveThroughAction<Command>({
  usage: STORAGE_USAGE,
  platform: "any",
  name: "storage",
  effect: "read",
  input: STORAGE_INPUT,
  summary: "Check that log.db's typed tables are exactly what its events derive, and rebuild them from the events",
  args: "verify|rebuild [--apply] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(STORAGE_INPUT));
    if (!parsed.ok) return refuseInput("storage", parsed.error, STORAGE_USAGE);
    const [sub, ...rest] = parsed.positionals;
    if (!sub || rest.length || !["verify", "rebuild"].includes(sub)) return { code: 1, stderr: `log storage: say verify or rebuild\n${STORAGE_USAGE}` };
    const handle = openDatabase();
    const json = parsed.flags["json"] === true;
    if (sub === "rebuild" && parsed.flags["apply"] === true) {
      context.err("log storage rebuild: replaying every event into the typed tables");
      const started = performance.now();
      const rebuilt = rebuildDerived(handle);
      const ms = Math.round(performance.now() - started);
      if (json) return { code: 0, stdout: JSON.stringify({ rebuilt, ms }, null, 2) };
      return { code: 0, stdout: `log storage rebuild: ${rebuilt.events} events replayed in ${ms} ms into ${rebuilt.messages} messages, ${rebuilt.chats} chats, ${rebuilt.identities} people and ${rebuilt.interactions} interactions.` };
    }
    context.err(`log storage ${sub}: replaying every event into a scratch copy (${countsOf(handle).messages} messages now)`);
    const result = verifyDerived(handle);
    if (json) return { code: result.ok ? 0 : 1, stdout: JSON.stringify(result, null, 2) };
    return { code: result.ok ? 0 : 1, stdout: [`log storage ${sub}:`, ...verifyLines(result)].join("\n") };
  },
}, ["apply"]);
