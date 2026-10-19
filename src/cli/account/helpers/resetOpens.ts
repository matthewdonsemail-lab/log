import { recordLaunchReset } from "../../../camofox/run/helpers/index.ts";
import { resetHostOpens } from "../../../marketplace/host/index.ts";
import type { FacebookAccount } from "../../../marketplace/socialAccount/index.ts";

/**
 * matt, 2026-10-19: "close, then reset every single one of the opens". Today's
 * launches (rule 24) and the host's opens (rule 35) count from now again. The
 * recordings are kept; only a dated reset line is written. Close the browsers
 * first (`log host send ... SHUTDOWN`): this doesn't close anything itself.
 */
export function resetAccountOpens(account: FacebookAccount, reason: string, at: Date = new Date()): string {
  recordLaunchReset(account.accountName, reason, at);
  const host = resetHostOpens(account.accountName);
  return `${account.accountName}: opens reset at ${at.toISOString()} (launch budget${host ? " and host opens" : ""} count from now).`;
}
