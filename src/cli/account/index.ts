import { ACCOUNT_STATUSES, findAccount, fromTwentyEnum, listFacebookAccounts } from "../../marketplace/socialAccount/index.ts";
import type { AccountStatus } from "../../marketplace/socialAccount/index.ts";
import { setStatusAndReplace } from "../../marketplace/replacement/index.ts";
import { isErrorCode } from "../../errors/catalog/index.ts";
import { renderLoss } from "../live/helpers/index.ts";
import { parseArgs, refuseError } from "../runner/helpers/index.ts";
import type { Command } from "../runner/types.ts";
import { renderAccountDetail, renderAccountsTable, resaveKeptRun, resetAccountOpens, safeAccount } from "./helpers/index.ts";

export * from "./helpers/index.ts";
export const ACCOUNTS_USAGE = "Usage: log facebook accounts [--json]";
export const ACCOUNT_USAGE = [
  "Usage: log facebook account show <accountName> [--json]",
  "       log facebook account resave <accountName> --from <folder>   (a run's device and session Twenty didn't take: ~/.logCli/runs/unsaved/...)",
  "       log facebook account resetOpens <accountName|all> [--reason <text>]   (today's launches and host opens count from now; nothing is deleted)",
  `       log facebook account status <accountName> <${ACCOUNT_STATUSES.map((s) => s.replace(/([A-Z])/g, "_$1").toUpperCase()).join("|")}> [--reason <code>] [--detail <text>]`,
].join("\n");

export const accountsCommand: Command = {
  usage: ACCOUNTS_USAGE,
  platform: "facebook",
  name: "accounts",
  summary: "List the FACEBOOK accounts in Twenty: status, home, proxy, and whether each may run",
  args: "[--json]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"] });
    if (!parsed.ok) return { code: 1, stderr: `log facebook accounts: ${parsed.error}\n${ACCOUNTS_USAGE}` };
    if (parsed.positionals.length > 0) return { code: 1, stderr: `log facebook accounts: unexpected argument "${parsed.positionals[0]}"\n${ACCOUNTS_USAGE}` };
    try {
      const accounts = await listFacebookAccounts(context.twenty);
      if (parsed.flags["json"]) {
        const safe = accounts.map(safeAccount);
        return { code: 0, stdout: JSON.stringify({ accounts: safe }, null, 2) };
      }
      return { code: 0, stdout: renderAccountsTable(accounts) };
    } catch (error) {
      return refuseError("accounts", error);
    }
  },
};

export const accountCommand: Command = {
  usage: ACCOUNT_USAGE,
  platform: "facebook",
  name: "account",
  summary: "Show one account, or set its status (banned/dead/restricted replace its campaign listings)",
  args: "<show|status|resave|resetOpens> <name> [STATUS] [--reason <code>]",
  async run(context, argv) {
    const parsed = parseArgs(argv, { boolean: ["json"], valued: ["reason", "detail", "from"] });
    if (!parsed.ok) return { code: 1, stderr: `log facebook account: ${parsed.error}\n${ACCOUNT_USAGE}` };
    const [action, ref, value, extra] = parsed.positionals;
    if (!ref || extra !== undefined || !["show", "status", "resave", "resetOpens"].includes(action ?? "")) return { code: 1, stderr: `log facebook account: pick show, status, resave or resetOpens\n${ACCOUNT_USAGE}` };
    try {
      if (action === "resetOpens") {
        const reason = typeof parsed.flags["reason"] === "string" ? parsed.flags["reason"] : "reset by matt";
        const accounts = ref === "all" ? await listFacebookAccounts(context.twenty) : [await findAccount(context.twenty, ref)];
        return { code: 0, stdout: accounts.map((a) => resetAccountOpens(a, reason)).join("\n") };
      }
      const account = await findAccount(context.twenty, ref);
      if (action === "resave") {
        if (typeof parsed.flags["from"] !== "string") return { code: 1, stderr: `log facebook account resave: give --from <folder>\n${ACCOUNT_USAGE}` };
        const saved = await resaveKeptRun(context.twenty, account, parsed.flags["from"]);
        return { code: saved.ok ? 0 : 1, stdout: saved.lines.join("\n") };
      }
      if (action === "show") {
        if (parsed.flags["json"]) {
          return { code: 0, stdout: JSON.stringify(safeAccount(account), null, 2) };
        }
        return { code: 0, stdout: renderAccountDetail(account) };
      }
      const status = value ? fromTwentyEnum(value) : "";
      if (!(ACCOUNT_STATUSES as readonly string[]).includes(status)) return { code: 1, stderr: `log facebook account status: give a status\n${ACCOUNT_USAGE}` };
      const reason = typeof parsed.flags["reason"] === "string" ? parsed.flags["reason"] : "setByHand";
      if (reason !== "setByHand" && !isErrorCode(reason)) return { code: 1, stderr: `log facebook account status: --reason must be an error code (log errors --layer account)` };
      const detail = typeof parsed.flags["detail"] === "string" ? parsed.flags["detail"] : null;
      const loss = await setStatusAndReplace(context.twenty, account, status as AccountStatus, reason, detail);
      return { code: 0, stdout: renderLoss(loss) };
    } catch (error) {
      return refuseError("account", error);
    }
  },
};
