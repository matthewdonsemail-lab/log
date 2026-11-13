import { countOf, governorAccounts, governorCounts, resetGovernor } from "../../directApi/governor/index.ts";
import type { GovernorCount, GovernorResetResult } from "../../directApi/governor/index.ts";
import { writesPerDayOf } from "../../directApi/engine/index.ts";
import { ledgerRows } from "../../storage/ledger/index.ts";
import { PLATFORMS } from "../runner/helpers/platforms.ts";
import { JSON_FLAG, parseArgs, parserSpecOf } from "../runner/helpers/index.ts";
import type { Command, CommandInput, FlagSpec } from "../runner/types.ts";

export const GOVERNOR_USAGE = [
  "Usage: log governor show [--platform <p>] [--json]",
  "       log governor reset --platform <p> --account <accountName|all> --by <who> [--reason <text>] [--json]",
  "Every platform account's governor counts what it sent X, Discord, Slack, Instagram, Reddit, LinkedIn or Facebook today: requests (500 a day), writes and this hour's requests. show reads them. reset puts an account's requests, writes and hour count back to 0, only when the owner says so (rule 168): the count is written back, read again to prove it holds, and the reset is a row in log.db's ledger (kind governorReset) with who said it and what the count was. A cooldown after a block is kept: nothing resumes on a blocked account until matt says so (rule 94), and the platform's own answer still decides (rule 73).",
].join("\n");

const PLATFORM: FlagSpec = { name: "platform", kind: "enum", values: PLATFORMS, description: "The platform" };

export const GOVERNOR_INPUT: CommandInput = {
  forms: [
    { words: ["show"], effect: "read", summary: "Every platform account's governor count today: requests, writes, this hour, any cooldown, and its last reset in log.db", positionals: [], flags: [PLATFORM, JSON_FLAG] },
    {
      words: ["reset"],
      effect: "write",
      summary: "Put a platform account's governor count (requests, writes, this hour) back to 0, recorded in log.db, only when the owner says so (rule 168)",
      positionals: [],
      flags: [{ ...PLATFORM, required: true }, { name: "account", kind: "string", required: true, description: "The account's accountName, or all for every account on that platform" }, { name: "by", kind: "string", required: true, description: "Who said to reset it: the owner" }, { name: "reason", kind: "string", description: "What the owner said, written to the ledger" }, JSON_FLAG],
    },
  ],
};

const DAILY = 500;

function countLine(c: GovernorCount): string {
  const last = ledgerRows("governorReset", { account: c.account, limit: 50 }).filter((r) => r.platform === c.platform).at(-1);
  const cooldown = c.cooldownSeconds > 0 ? `, cooling off ${Math.ceil(c.cooldownSeconds / 60)} min` : "";
  const reset = last ? `, last reset ${last.at.slice(0, 16).replace("T", " ")} UTC by ${last.subject ?? "?"} (log.db ledger #${last.seq})` : "";
  return `  ${c.platform} ${c.account}: ${c.requests}/${DAILY} requests, ${c.writes}/${writesPerDayOf(c.platform)} writes, ${c.hourRequests} this hour (day ${c.day ?? "?"})${cooldown}${reset}`;
}

function resetLine(r: GovernorResetResult): string {
  const kept = r.cooldownKept ? `; its cooldown (${Math.ceil(r.before.cooldownSeconds / 60)} min) is kept until matt says so (rule 94)` : "";
  return `  ${r.platform} ${r.account}: ${r.before.requests} → ${r.after.requests} requests, ${r.before.writes} → ${r.after.writes} writes, ${r.before.hourRequests} → ${r.after.hourRequests} this hour; in log.db as ledger #${r.ledgerSeq}${kept}`;
}

export const governorCommand: Command = {
  usage: GOVERNOR_USAGE,
  platform: "any",
  name: "governor",
  effect: "read",
  input: GOVERNOR_INPUT,
  summary: "Read every platform account's governor count, and put one back to 0 when the owner says so, recorded in log.db",
  args: "show|reset [--platform <p>] [--account <a|all>] [--by <who>] [--reason <text>]",
  async run(context, argv) {
    const parsed = parseArgs(argv, parserSpecOf(GOVERNOR_INPUT));
    if (!parsed.ok) return { code: 1, stderr: `log governor: ${parsed.error}\n${GOVERNOR_USAGE}` };
    const [sub = "show", ...rest] = parsed.positionals;
    if (rest.length || !["show", "reset"].includes(sub)) return { code: 1, stderr: `log governor: pick show or reset\n${GOVERNOR_USAGE}` };
    const json = parsed.flags["json"] === true;
    const str = (name: string) => (typeof parsed.flags[name] === "string" ? String(parsed.flags[name]).trim() : "");
    const platform = str("platform");
    if (sub === "show") {
      const counts = governorCounts(platform ? [platform] : PLATFORMS);
      if (json) return { code: 0, stdout: JSON.stringify({ counts }, null, 2) };
      return { code: 0, stdout: counts.length ? ["log governor show:", ...counts.map(countLine)].join("\n") : "log governor show: no account has a governor count yet." };
    }
    const account = str("account");
    const by = str("by");
    if (!platform || !account || !by) return { code: 1, stderr: `log governor reset: --platform, --account and --by are needed\n${GOVERNOR_USAGE}` };
    const accounts = account === "all" ? governorAccounts(platform) : [account];
    const missing = accounts.filter((a) => !countOf(platform, a));
    if (!accounts.length || missing.length) return { code: 1, stderr: `log governor reset: ${platform} has no governor count for ${missing.length ? missing.join(", ") : "any account"}\n${GOVERNOR_USAGE}` };
    context.err(`log governor reset: ${platform} ${accounts.join(", ")} back to 0, said by ${by}`);
    const results = accounts.map((a) => resetGovernor({ platform, account: a, by, reason: str("reason") || undefined }));
    if (json) return { code: 0, stdout: JSON.stringify({ results }, null, 2) };
    return { code: 0, stdout: [`log governor reset: ${results.length} account(s) back to 0, checked and recorded in log.db:`, ...results.map(resetLine)].join("\n") };
  },
};
