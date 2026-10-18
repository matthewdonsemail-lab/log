import type { ScanResult, WorkerFailure } from "../../../camofox/worker/index.ts";
import { classifySignal } from "../../../marketplace/account/index.ts";
import type { CheckOutcome } from "../../../marketplace/monitor/index.ts";

/**
 * Worker scan result -> monitor outcome. Account problems become `issue`
 * (the monitor stops or rests); anything else that failed is an `error`
 * (retried, then the circuit breaker). Pure.
 */
export function toCheckOutcome(result: ScanResult | WorkerFailure): CheckOutcome {
  if (result.ok) {
    const issue = classifySignal({ url: result.url, text: result.bodySample });
    // A ban or checkpoint shown on a page that still loaded stops the account too.
    if (issue && issue !== "login_wall" && issue !== "read_only_limited") {
      return { kind: "issue", issue, detail: `page shows ${issue}` };
    }
    return {
      kind: "ok",
      seen: result.listings.map((row) => ({ listingId: row.listingId, title: row.title, health: row.health })),
      needsAttention: result.needsAttention,
      issue,
    };
  }
  if (result.error === "noSession") return { kind: "issue", issue: "never_connected", detail: "no saved session" };
  if (result.error === "loginWall") {
    const issue = classifySignal({ url: String(result.url ?? ""), text: String(result.bodySample ?? "") });
    return { kind: "issue", issue: issue ?? "session_expired", detail: "Facebook asked to log in" };
  }
  const retryable = !/^bad request|unknown action/.test(result.error);
  return { kind: "error", code: result.error.split(":")[0] || "worker", detail: result.error, retryable };
}
