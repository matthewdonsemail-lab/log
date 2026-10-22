/**
 * `log facebook check --account <a>` (matt, 2026-10-22): the host's Marketplace check, once, by hand, in the
 * account's open browser (rule 35): may it still sell, each listing's state on Selling into Twenty, and the
 * seller inbox's chats. Read from each step's own recording; nothing is clicked (rule 8).
 */
import { readCurrentInspect } from "../../browser/inspect/index.ts";
import * as marketplaceCheck from "../../facebook/marketplace/check/index.ts";
import { homeOf, outsideActiveHours } from "../../marketplace/home/index.ts";
import { findAccount } from "../../marketplace/socialAccount/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";

export const CHECK_USAGE = [
  "Usage: log facebook check --account <accountName> [--bypass] [--json]   (in the account's open browser: Marketplace status, each listing on Selling into Twenty, the seller inbox's chats; nothing clicked)",
].join("\n");

export const checkCommand: Command = {
  usage: CHECK_USAGE,
  platform: "facebook",
  name: "check",
  summary: "Check one account in its open browser: may it still sell, each listing's state on Selling (into Twenty), and its seller inbox's chats",
  args: "--account <a> [--bypass] [--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["bypass", "json"], valued: ["account"] });
    if (!parsed.ok) return { code: 1, stderr: `log facebook check: ${parsed.error}\n${CHECK_USAGE}` };
    if (parsed.positionals.length) return { code: 1, stderr: `log facebook check: unexpected argument "${parsed.positionals[0]}"\n${CHECK_USAGE}` };
    const ref = parsed.flags["account"];
    if (typeof ref !== "string") return { code: 1, stderr: `log facebook check: --account is needed\n${CHECK_USAGE}` };
    let account;
    try {
      account = await findAccount(context.twenty, ref);
    } catch (error) {
      return { code: 1, stderr: `log facebook check: ${(error as Error).message}` };
    }
    const home = homeOf(account);
    if (!home.ok) return { code: 1, stderr: `log facebook check: ${home.code}: ${home.detail}` };
    const outside = parsed.flags["bypass"] ? null : outsideActiveHours(account, home.home.timezone, context.now?.() ?? new Date());
    if (outside) return { code: 1, stderr: `log facebook check: outsideActiveHours: ${outside}` };
    const current = readCurrentInspect(undefined, account.accountName);
    if (!current) return { code: 1, stderr: `log facebook check: no open browser for ${account.accountName}: open it with log inspect start --account ${account.accountName} --detach, or run the host` };
    context.err(`Checking ${account.accountName} in its open browser (${current.runDir}).`);
    const found = await marketplaceCheck.readMarketplace((action, args = []) => context.sendInspect(current, action, args, 240_000), context.err);
    const report = await marketplaceCheck.keepCheck(context.twenty, account.id, account.accountName, found, current.runDir, context.now?.() ?? new Date());
    if (parsed.flags["json"]) return { code: report.issue ? 1 : 0, stdout: JSON.stringify({ ...found, report }, null, 2) };
    return { code: report.issue ? 1 : 0, stdout: [...report.lines, ...(report.issue ? [`Issue: ${report.issue.code}: ${report.issue.detail}`] : [])].join("\n") };
  },
};
