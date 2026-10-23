import { diskFree, listRuns, pruneRuns, runsBytes, storageVerdict } from "../../browser/runStore/index.ts";
import type { RunEntry } from "../../browser/runStore/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const RUNS_USAGE = [
  "Usage: log runs [list] [--json]   (every recorded run: its size, settled by rea, in the request docs, and why it is kept or that it may go)",
  "       log runs prune [--before <YYYY-MM-DD>] [--apply]   (deletes each analysed run, started before the day when given, keeping its findings.md, steps.jsonl, settle.json and its requests by domain; a dry run unless --apply)",
  "       log runs space   (the size of ~/.logCli/runs and the disk's free space, as the storage hook says them)",
].join("\n");

const mb = (bytes: number) => `${(bytes / 1e6).toFixed(0)} MB`;
const gb = (bytes: number) => `${(bytes / 1e9).toFixed(1)} GB`;
const yn = (v: boolean | null) => (v === null ? "-" : v ? "yes" : "no");

function table(entries: RunEntry[]): string {
  const lines = entries.map((e) => `${mb(e.bytes).padStart(8)}  settled ${yn(e.settled).padEnd(3)}  docs ${yn(e.documented).padEnd(3)}  ${`${e.action}/${e.run}`.padEnd(48)}  ${e.keep ? `kept: ${e.keep}` : "may go"}`);
  const total = entries.reduce((n, e) => n + e.bytes, 0);
  const free = entries.filter((e) => !e.keep).reduce((n, e) => n + e.bytes, 0);
  return [...lines, `${entries.length} runs, ${gb(total)}; ${entries.filter((e) => !e.keep).length} may go (${gb(free)}).`].join("\n");
}

export const RUNS_INPUT: CommandInput = {
  forms: [
    { words: ["list"], summary: "Every recorded run: its size, settled by rea, in the request docs, and whether it may go", positionals: [], flags: [JSON_FLAG] },
    {
      words: ["prune"], effect: "delete",
      summary: "Delete each analysed run, keeping its findings; a dry run unless apply",
      positionals: [],
      flags: [{ name: "before", kind: "string", description: "Only runs started before this day, YYYY-MM-DD" }, { name: "apply", kind: "boolean", description: "Delete them (without it, it only lists what would go)" }],
    },
    { words: ["space"], summary: "The size of the runs folder and the disk's free space", positionals: [], flags: [] },
  ],
};

export const runsCommand: Command = {
  usage: RUNS_USAGE,
  platform: "any",
  name: "runs",
  effect: "read",
  input: RUNS_INPUT,
  summary: "The recorded runs on this machine, and pruning the ones rea settled and the request docs hold, keeping each one's findings and domains",
  args: "[list|prune|space] [--before <day>] [--apply]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(RUNS_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log runs: ${parsed.error}\n${RUNS_USAGE}` };
    const [sub = "list", ...rest] = parsed.positionals;
    if (rest.length) return { code: 1, stderr: `log runs: unexpected argument "${rest[0]}"\n${RUNS_USAGE}` };
    const before = parsed.flags["before"];
    if (before !== undefined && (typeof before !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(before))) return { code: 1, stderr: `log runs: --before takes a day, YYYY-MM-DD\n${RUNS_USAGE}` };
    if (sub === "space") {
      const bytes = runsBytes();
      const free = diskFree();
      return { code: 0, stdout: `~/.logCli/runs: ${gb(bytes)}; disk free: ${free === null ? "unknown" : gb(free)}${storageVerdict(bytes, free) ? `\n${storageVerdict(bytes, free)}` : ""}` };
    }
    const entries = listRuns();
    if (sub === "list") return { code: 0, stdout: parsed.flags["json"] ? JSON.stringify({ runs: entries }, null, 2) : table(entries) };
    if (sub !== "prune") return { code: 1, stderr: `log runs: unknown subcommand "${sub}"\n${RUNS_USAGE}` };
    const apply = Boolean(parsed.flags["apply"]);
    const pruned = await pruneRuns(entries, { apply, before: typeof before === "string" ? before : undefined, log: context.err });
    const bytes = pruned.reduce((n, p) => n + p.bytes, 0);
    const kept = entries.filter((e) => e.keep);
    return {
      code: 0,
      stdout: [
        `${apply ? "Pruned" : "Would prune"} ${pruned.length} run(s), ${gb(bytes)}${apply ? "; each one's findings, steps and domains are in ~/.logCli/runs/kept and runs/pruned.jsonl" : " (a dry run: --apply deletes them)"}.`,
        ...kept.map((e) => `Kept ${e.action}/${e.run}: ${e.keep}`),
      ].join("\n"),
    };
  },
};
