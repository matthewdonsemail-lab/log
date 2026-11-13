import { readTwitterSenders, SENDER_SOURCES, SENDERS_DEFAULT_LIMIT, SENDERS_MAX_LIMIT } from "../../inbox/senders/index.ts";
import type { SendersReport } from "../../inbox/senders/index.ts";
import { JSON_FLAG, numberOf, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const REPORT_USAGE = [
  "Usage: log report data --source twitterDmsBySender [--account <accountName>] [--since <7d|4w|12h|2026-11-01>] [--limit <n>] [--json]",
  "The numbers behind a report, read from log.db only: no platform call, no governor use, nothing sent. twitterDmsBySender counts who messaged the X account in its one-to-one DMs (old DM thread and X Chat thread with one person counted as one, a message mirrored into both counted once; group chats left out), most messages first, with each person's first and last message time, the totals and the count per day. It holds only what log.db has: run twitterDms first if the inbox may be behind.",
  "--account keeps one X account (default every X account in log.db). --since keeps messages from that date or span on. --limit is how many people to list, default 20, at most 200; the totals count everyone.",
  'Show it with the MCP tool report (getGuide({ topic: "ui" })): an MCP Apps host draws it inline, any other host gets markdown with unicode bars.',
].join("\n");

export const REPORT_INPUT: CommandInput = {
  forms: [
    {
      words: ["data"],
      effect: "read",
      summary: "The numbers behind a report, from log.db only: who messaged an X account in DMs and how many messages, per person and per day",
      positionals: [],
      flags: [
        { name: "source", kind: "enum", values: SENDER_SOURCES, required: true, description: "What to count: twitterDmsBySender, who messaged the X account in one-to-one DMs" },
        { name: "account", kind: "string", description: "One X account's accountName (default every X account in log.db)" },
        { name: "since", kind: "string", format: "dateOrSpan", description: "Only messages from this date (2026-11-01) or span (7d, 4w, 12h) on" },
        { name: "limit", kind: "integer", description: `How many people to list (default ${SENDERS_DEFAULT_LIMIT}, at most ${SENDERS_MAX_LIMIT}); the totals count everyone` },
        JSON_FLAG,
      ],
    },
  ],
};

export function sendersText(report: SendersReport): string {
  const scope = `${report.account ? `@${report.account}` : `${report.accounts.length} X account${report.accounts.length === 1 ? "" : "s"}`}${report.since ? ` since ${report.since.slice(0, 16).replace("T", " ")} UTC` : ""}`;
  if (!report.people) return `log report data: twitterDmsBySender, ${scope}: no one-to-one DMs from anyone in log.db. Read the inbox with twitterDms first if it may be behind.`;
  const rows = report.senders.map((s, i) => `  ${i + 1}. ${s.name === s.handle ? `@${s.handle}` : `${s.name} (@${s.handle})`}: ${s.count} message${s.count === 1 ? "" : "s"}, last ${s.lastAt?.slice(0, 16).replace("T", " ") ?? "?"}`);
  const more = report.people > report.senders.length ? [`  … and ${report.people - report.senders.length} more (--limit)`] : [];
  return [`log report data: twitterDmsBySender, ${scope}, read from log.db: ${report.messages} message${report.messages === 1 ? "" : "s"} from ${report.people} ${report.people === 1 ? "person" : "people"}, most first:`, ...rows, ...more].join("\n");
}

export const reportDeps: { read: typeof readTwitterSenders } = { read: readTwitterSenders };

export const reportCommand: Command = {
  usage: REPORT_USAGE,
  platform: "any",
  name: "report",
  effect: "read",
  input: REPORT_INPUT,
  summary: "The numbers behind a report, read from log.db only (who messaged an X account and how often), for the MCP report view",
  args: "data --source twitterDmsBySender [--account <a>] [--since <span|date>] [--limit <n>] [--json]",
  async run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(REPORT_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log report: ${parsed.error}\n${REPORT_USAGE}` };
    if (parsed.positionals[0] !== "data" || parsed.positionals.length > 1) return { code: 1, stderr: `log report: say data\n${REPORT_USAGE}` };
    const source = parsed.flags["source"];
    if (source !== "twitterDmsBySender") return { code: 1, stderr: `log report data: --source is one of ${SENDER_SOURCES.join(", ")}\n${REPORT_USAGE}` };
    const str = (name: string) => (typeof parsed.flags[name] === "string" ? String(parsed.flags[name]).trim() : "");
    const limit = numberOf(parsed, "limit");
    try {
      const report = reportDeps.read({ account: str("account") || null, since: str("since") || null, limit });
      return { code: 0, stdout: parsed.flags["json"] ? JSON.stringify(report, null, 2) : sendersText(report) };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { code: 1, stderr: `log report data: ${message}` };
    }
  },
};
