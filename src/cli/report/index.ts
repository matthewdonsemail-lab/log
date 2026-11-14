import { readIdentityProfile } from "../../inbox/profiles/index.ts";
import type { IdentityProfileView } from "../../inbox/profiles/index.ts";
import { readPlatformSenders, readTwitterSenders, SENDERS_DEFAULT_LIMIT, SENDERS_MAX_LIMIT } from "../../inbox/senders/index.ts";
import type { SendersReport } from "../../inbox/senders/index.ts";
import { readReportSource, REPORT_SOURCE_NAMES, reportDataSource } from "../../mcp/apps/report/helpers/sources.ts";
import type { ReportDeps } from "../../mcp/apps/report/helpers/sources.ts";
import { isErrorCode } from "../../errors/catalog/index.ts";
import { JSON_FLAG, numberOf, parseArgs, parserSpecOf, PLATFORM_LABELS, PLATFORMS, refuse, refuseInput } from "../runner/helpers/index.ts";
import type { Platform } from "../runner/helpers/index.ts";
import type { Command, CommandInput } from "../runner/types.ts";

export const REPORT_USAGE = [
  `Usage: log report data --source <${REPORT_SOURCE_NAMES.join("|")}> [--platform <p>] [--account <accountName>] [--since <7d|4w|12h|2026-11-01>] [--limit <n>] [--userId <id>] [--handle <handle>] [--json]`,
  "The numbers behind a report, read from log.db only: no platform call, no governor use, nothing sent. The sources are the report tool's (REPORT_SOURCES). twitterDmsBySender counts who messaged the account in its one-to-one DMs (the old DM thread and the Chat thread with one person counted as one, a message mirrored into both counted once; group chats left out), most messages first, with each person's first and last message time, the totals and the count per day. dmsBySender counts the same on the --platform named, for any platform with chats in log.db (reportSourceNoData when it has none). identityProfile reads one person's stored profile on --platform by --userId or --handle (identityProfileMissing when none is stored). Each holds only what log.db has: read the platform's inbox first if it may be behind.",
  "--account keeps one account (default every account the source covers in log.db). --since keeps messages from that date or span on. --limit is how many people to list, default 20, at most 200; the totals count everyone.",
  'Show it with the MCP tool report (getGuide({ topic: "ui" })): an MCP Apps host draws it inline, any other host gets markdown with unicode bars.',
].join("\n");

export const REPORT_INPUT: CommandInput = {
  forms: [
    {
      words: ["data"],
      effect: "read",
      summary: "The numbers behind a report, from log.db only: who messaged an account and how often, or one person's stored profile, by source",
      positionals: [],
      flags: [
        { name: "source", kind: "enum", values: REPORT_SOURCE_NAMES, required: true, description: "What to read: twitterDmsBySender (X one-to-one DMs by sender), dmsBySender (the same on --platform) or identityProfile (one person's stored profile on --platform)" },
        { name: "platform", kind: "enum", values: PLATFORMS, description: "The platform, for dmsBySender and identityProfile" },
        { name: "account", kind: "string", description: "One account's accountName (default every account the source covers in log.db)" },
        { name: "since", kind: "string", format: "dateOrSpan", description: "Only messages from this date (2026-11-01) or span (7d, 4w, 12h) on" },
        { name: "limit", kind: "integer", min: 1, max: SENDERS_MAX_LIMIT, description: `How many people to list (default ${SENDERS_DEFAULT_LIMIT}); the totals count everyone` },
        { name: "userId", kind: "string", description: "identityProfile: the person's user id on the platform (give userId or handle)" },
        { name: "handle", kind: "string", description: "identityProfile: the person's handle on the platform (give userId or handle)" },
        JSON_FLAG,
      ],
    },
  ],
};

export function sendersText(report: SendersReport): string {
  const label = report.platform ? (PLATFORM_LABELS[report.platform as Platform] ?? report.platform) : "X";
  const scope = `${report.account ? `@${report.account}` : `${report.accounts.length} ${label} account${report.accounts.length === 1 ? "" : "s"}`}${report.since ? ` since ${report.since.slice(0, 16).replace("T", " ")} UTC` : ""}`;
  if (!report.people) return `log report data: ${report.source}, ${scope}: no one-to-one messages from anyone in log.db. Read the inbox first if it may be behind.`;
  const rows = report.senders.map((s, i) => `  ${i + 1}. ${s.name === s.handle ? `@${s.handle}` : `${s.name} (@${s.handle})`}: ${s.count} message${s.count === 1 ? "" : "s"}, last ${s.lastAt?.slice(0, 16).replace("T", " ") ?? "?"}`);
  const more = report.people > report.senders.length ? [`  … and ${report.people - report.senders.length} more (--limit)`] : [];
  return [`log report data: ${report.source}, ${scope}, read from log.db: ${report.messages} message${report.messages === 1 ? "" : "s"} from ${report.people} ${report.people === 1 ? "person" : "people"}, most first:`, ...rows, ...more].join("\n");
}

export function profileText(profile: IdentityProfileView): string {
  const facts = [profile.handle ? `@${profile.handle}` : null, profile.followerCount === null ? null : `${profile.followerCount} followers`, profile.verified ? "verified" : null].filter(Boolean).join(", ");
  return [`log report data: identityProfile, ${profile.name} on ${profile.platform}${facts ? ` (${facts})` : ""}, read from log.db, kept ${profile.fetchedAt.slice(0, 16).replace("T", " ")} UTC`, ...(profile.bio ? [`  ${profile.bio}`] : [])].join("\n");
}

export const reportDeps: { read: ReportDeps["readSenders"]; readPlatformSenders: ReportDeps["readPlatformSenders"]; readProfile: ReportDeps["readProfile"] } = {
  read: readTwitterSenders,
  readPlatformSenders,
  readProfile: readIdentityProfile,
};

export const reportCommand: Command = {
  usage: REPORT_USAGE,
  platform: "any",
  name: "report",
  effect: "read",
  input: REPORT_INPUT,
  summary: "The numbers behind a report, read from log.db only (who messaged an account and how often, or one person's stored profile, by source), for the MCP report view",
  args: `data --source <${REPORT_SOURCE_NAMES.join("|")}> [--platform <p>] [--account <a>] [--since <span|date>] [--limit <n>] [--userId <id>] [--handle <h>] [--json]`,
  async run(_context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(REPORT_INPUT));
    if (!parsed.ok) return refuseInput("report", parsed.error, REPORT_USAGE);
    if (parsed.positionals[0] !== "data" || parsed.positionals.length > 1) return { code: 1, error: "inputInvalid", stderr: `log report: say data\n${REPORT_USAGE}` };
    const str = (name: string) => (typeof parsed.flags[name] === "string" ? String(parsed.flags[name]).trim() : undefined);
    const given = Object.fromEntries(Object.entries({ source: str("source"), platform: str("platform"), account: str("account") || undefined, since: str("since") || undefined, limit: numberOf(parsed, "limit"), userId: str("userId") || undefined, handle: str("handle") || undefined }).filter(([, value]) => value !== undefined));
    const input = reportDataSource.safeParse(given);
    if (!input.success) return refuse("report data", "reportFieldInvalid", input.error.issues.slice(0, 4).map((issue) => `${issue.path.join(".") || "input"}: ${issue.message}`).join("; "));
    try {
      const read = readReportSource(input.data, { readSenders: reportDeps.read, readPlatformSenders: reportDeps.readPlatformSenders, readProfile: reportDeps.readProfile });
      if (parsed.flags["json"]) return { code: 0, stdout: JSON.stringify(read, null, 2) };
      return { code: 0, stdout: input.data.source === "identityProfile" ? profileText(read as IdentityProfileView) : sendersText(read as SendersReport) };
    } catch (error) {
      const code = (error as { code?: unknown } | null)?.code;
      const message = error instanceof Error ? error.message : String(error);
      return refuse("report data", isErrorCode(code) ? code : "crashed", message.replace(/^[a-zA-Z]+: /, ""));
    }
  },
};
