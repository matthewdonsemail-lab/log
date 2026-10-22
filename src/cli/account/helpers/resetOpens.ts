import { recordLaunchReset } from "../../../browser/run/helpers/index.ts";
import { resetHostOpens } from "../../../marketplace/host/index.ts";
import type { FacebookAccount } from "../../../marketplace/socialAccount/index.ts";

export function resetAccountOpens(account: FacebookAccount, reason: string, at: Date = new Date()): string {
  recordLaunchReset(account.accountName, reason, at);
  const host = resetHostOpens(account.accountName);
  return `${account.accountName}: opens reset at ${at.toISOString()} (launch budget${host ? " and host opens" : ""} count from now).`;
}
