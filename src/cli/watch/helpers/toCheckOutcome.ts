import type { ScanResult, WorkerFailure } from "../../../camofox/worker/index.ts";
import { ERROR_CATALOG } from "../../../errors/catalog/index.ts";
import { classifySignal } from "../../../marketplace/account/index.ts";
import type { AccountIssue } from "../../../marketplace/account/index.ts";
import type { CheckOutcome } from "../../../marketplace/monitor/index.ts";

export function toCheckOutcome(result: ScanResult | WorkerFailure): CheckOutcome {
  if (result.ok) {
    const issue = classifySignal({ url: result.url, text: result.bodySample });
    if (issue && issue !== "loginWall" && issue !== "readOnlyLimited") {
      return { kind: "issue", issue, detail: `page shows ${issue}` };
    }
    return {
      kind: "ok",
      seen: result.listings.map((row) => ({ listingId: row.listingId, title: row.title, health: row.health })),
      needsAttention: result.needsAttention,
      issue,
    };
  }
  const entry = ERROR_CATALOG[result.code];
  const detail = result.detail ?? entry.meaning;
  if (result.code === "loginWall") {
    const issue = classifySignal({ url: String(result.url ?? ""), text: String(result.bodySample ?? "") });
    return { kind: "issue", issue: issue ?? "sessionExpired", detail: "Facebook asked to log in" };
  }
  if (entry.layer === "account") return { kind: "issue", issue: result.code as AccountIssue, detail };
  return { kind: "error", code: result.code, detail, retryable: entry.retryable };
}
