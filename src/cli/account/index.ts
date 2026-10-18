/**
 * `log accounts` — the FACEBOOK socialAccounts in Twenty, and whether each may run.
 * `log account show <name>` — one account in full (never its password or cookies).
 * `log account status <name> <STATUS>` — set its status in Twenty. Restricted,
 * banned or dead also moves its live listings to ACCOUNT_LOST and replaces the
 * campaign ones with accounts in the same country. Nothing is ever deleted.
 */
import { ACCOUNT_STATUSES, findAccount, fromTwentyEnum, listFacebookAccounts } from "../../marketplace/socialAccount/index.ts";
import type { AccountStatus } from "../../marketplace/socialAccount/index.ts";
import { setStatusAndReplace } from "../../marketplace/replacement/index.ts";
import { isErrorCode } from "../../errors/catalog/index.ts";
import { renderLoss } from "../live/helpers/index.ts";
import { parseArgs, refuseError } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";
import { renderAccountDetail, renderAccountsTable } from "./helpers/index.ts";

export * from "./helpers/index.ts";
export const ACCOUNTS_USAGE = "Usage: log accounts [--json]";
export const ACCOUNT_USAGE = [
  "Usage: log account show <accountName> [--json]",
  `       log account status <accountName> <${ACCOUNT_STATUSES.map((s) => s.replace(/([A-Z])/g, "_$1").toUpperCase()).join("|")}> [--reason <code>] [--detail <text>]`,
].join("\n");

export const accountsCommand: Command = {
  name: "accounts",
  summary: "List the FACEBOOK accounts in Twenty: status, home, proxy, and whether each may run",
  args: "[--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"] });
    if (!parsed.ok) return { code: 1, stderr: `log accounts: ${parsed.error}\n${ACCOUNTS_USAGE}` };
    if (parsed.positionals.length > 0) return { code: 1, stderr: `log accounts: unexpected argument "${parsed.positionals[0]}"\n${ACCOUNTS_USAGE}` };
    try {
      const accounts = await listFacebookAccounts(context.twenty);
      if (parsed.flags["json"]) {
        const safe = accounts.map(({ cookies: _c, proxy, ...rest }) => ({ ...rest, hasProxy: Boolean(proxy) }));
        return { code: 0, stdout: JSON.stringify({ accounts: safe }, null, 2) };
      }
      return { code: 0, stdout: renderAccountsTable(accounts) };
    } catch (error) {
      return refuseError("accounts", error);
    }
  },
};

export const accountCommand: Command = {
  name: "account",
  summary: "Show one account, or set its status (banned/dead/restricted replace its campaign listings)",
  args: "<show|status> <name> [STATUS] [--reason <code>]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["reason", "detail"] });
    if (!parsed.ok) return { code: 1, stderr: `log account: ${parsed.error}\n${ACCOUNT_USAGE}` };
    const [action, ref, value, extra] = parsed.positionals;
    if (!ref || extra !== undefined || (action !== "show" && action !== "status")) return { code: 1, stderr: `log account: pick show or status\n${ACCOUNT_USAGE}` };
    try {
      const account = await findAccount(context.twenty, ref);
      if (action === "show") {
        if (parsed.flags["json"]) {
          const { cookies: _c, proxy, ...rest } = account;
          return { code: 0, stdout: JSON.stringify({ ...rest, hasProxy: Boolean(proxy) }, null, 2) };
        }
        return { code: 0, stdout: renderAccountDetail(account) };
      }
      const status = value ? fromTwentyEnum(value) : "";
      if (!(ACCOUNT_STATUSES as readonly string[]).includes(status)) return { code: 1, stderr: `log account status: give a status\n${ACCOUNT_USAGE}` };
      const reason = typeof parsed.flags["reason"] === "string" ? parsed.flags["reason"] : "setByHand";
      if (reason !== "setByHand" && !isErrorCode(reason)) return { code: 1, stderr: `log account status: --reason must be an error code (log errors --layer account)` };
      const detail = typeof parsed.flags["detail"] === "string" ? parsed.flags["detail"] : null;
      const loss = await setStatusAndReplace(context.twenty, account, status as AccountStatus, reason, detail);
      return { code: 0, stdout: renderLoss(loss) };
    } catch (error) {
      return refuseError("account", error);
    }
  },
};
