import { callWaterfall, msText, reportLines, timingStats } from "../../observability/timing/index.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const TIMING_USAGE = [
  "Usage: log timing [--tool <name>] [--hours <n>] [--stages <n>] [--json]   (p50, p95 and p99 for every tool call, and for every stage inside it: the guards, the voice gate, each fetch, the Python start, the session host's queue, lock, spacing and governor, each platform request; newest --hours, default 24)",
  "       log timing --call <callId> [--json]   (one call as a waterfall: every stage in order, when it started and how long it took; the id is on the call's ▶ and ■ lines in the live log)",
].join("\n");

export const TIMING_INPUT: CommandInput = {
  forms: [
    {
      words: [],
      summary: "Where the time goes: p50, p95 and p99 for each tool call and each stage inside it, or one call as a waterfall",
      positionals: [],
      flags: [
        { name: "tool", kind: "string", description: "Only this tool (its MCP name, e.g. twitterDms, or a terminal run's words, e.g. cli twitter dms)" },
        { name: "hours", kind: "string", description: "How far back, in hours (default 24)" },
        { name: "stages", kind: "string", description: "How many stages to show per tool, slowest share first (default 8)" },
        { name: "call", kind: "string", description: "One call's id, to show it as a waterfall" },
        JSON_FLAG,
      ],
    },
  ],
};

function positive(value: unknown, fallback: number): number | null {
  if (value === undefined) return fallback;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const timingCommand: Command = {
  usage: TIMING_USAGE,
  platform: "any",
  name: "timing",
  effect: "read",
  input: TIMING_INPUT,
  summary: "Where the time goes in every call: p50, p95 and p99 per tool and per stage, from the timings every call stores in log.db, or one call as a waterfall",
  args: "[--tool <name>] [--hours <n>] [--stages <n>] [--call <callId>] [--json]",
  async run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(TIMING_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log timing: ${parsed.error}\n${TIMING_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log timing: unexpected argument "${parsed.positionals[0]}"\n${TIMING_USAGE}` };
    const json = Boolean(parsed.flags["json"]);
    const call = parsed.flags["call"];
    if (typeof call === "string" && call) {
      const lines = callWaterfall(call);
      if (!lines.length) return { code: 1, stderr: `log timing: no call "${call}" is stored (callTimingMissing): its id is on the ▶ and ■ lines in the live log, and timings are kept 90 days` };
      return { code: 0, stdout: json ? JSON.stringify({ call, lines }, null, 2) : lines.join("\n") };
    }
    const hours = positive(parsed.flags["hours"], 24);
    const stages = positive(parsed.flags["stages"], 8);
    if (hours === null || stages === null) return { code: 1, stderr: `log timing: --hours and --stages take a positive number\n${TIMING_USAGE}` };
    const tool = typeof parsed.flags["tool"] === "string" ? String(parsed.flags["tool"]) : undefined;
    const stats = timingStats({ tool, sinceMs: Date.now() - hours * 3600000 });
    if (json) return { code: 0, stdout: JSON.stringify({ hours, tool: tool ?? null, tools: stats }, null, 2) };
    if (!stats.length) return { code: 0, stdout: `No timed calls in the last ${hours} h${tool ? ` for ${tool}` : ""}. Every log call made through the MCP or the terminal stores its timings from now on.` };
    const total = stats.reduce((n, t) => n + t.n, 0);
    const slowest = [...stats].sort((a, b) => b.p99 - a.p99)[0];
    return {
      code: 0,
      stdout: [`Timings for ${total} call(s) in the last ${hours} h${tool ? ` (${tool})` : ""}; slowest p99: ${slowest.tool} at ${msText(slowest.p99)}. Each stage's share is of the tool's total time; nested stages are counted inside their parent too, and "unaccounted" is the call's own time outside every stage.`, "", ...reportLines(stats, { stages: Math.round(stages) })].join("\n"),
    };
  },
};
