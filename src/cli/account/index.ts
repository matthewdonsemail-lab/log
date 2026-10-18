/**
 * `log accounts` — the Facebook accounts the listings are published from,
 * with each one's last observed issue and how many listings it owns.
 */
import { isWriteBlocked } from "../../marketplace/account/index.ts";
import { parseArgs } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";
import { renderAccountsTable } from "./helpers/index.ts";

export * from "./helpers/index.ts";
export const ACCOUNTS_USAGE = "Usage: log accounts [--json]";

export const accountsCommand: Command = {
  name: "accounts",
  summary: "List the Facebook accounts, their issues, and listing counts",
  args: "[--json]",
  run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"] });
    if (!parsed.ok) return { code: 1, stderr: `log accounts: ${parsed.error}\n${ACCOUNTS_USAGE}` };
    if (parsed.positionals.length > 0) {
      return { code: 1, stderr: `log accounts: unexpected argument "${parsed.positionals[0]}"\n${ACCOUNTS_USAGE}` };
    }

    const data = context.load();
    if (parsed.flags["json"]) {
      const accounts = data.accounts.map((account) => ({
        ...account,
        listings: data.listings.filter((row) => row.accountId === account.id).length,
        writeBlocked: isWriteBlocked(account.lastIssue),
      }));
      return { code: 0, stdout: JSON.stringify({ accounts }, null, 2) };
    }
    return { code: 0, stdout: renderAccountsTable(data.accounts, data.listings) };
  },
};
