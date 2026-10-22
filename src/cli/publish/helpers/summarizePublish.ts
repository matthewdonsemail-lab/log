import { summarizeConnect } from "../../live/helpers/renderConnect.ts";
import type { PublishContext, PublishOutput } from "../../../marketplace/publish/index.ts";

/** The context fields worth showing on each state line of the trace. Pure. */
export function summarizePublish(context: unknown): Record<string, unknown> {
  const c = context as PublishContext | undefined;
  if (!c) return {};
  // The in-browser sign-in (rule 24) is the connect machine as a child: its lines read like connect's.
  if (!Array.isArray(c.photoPaths)) return summarizeConnect(context);
  const detail: Record<string, unknown> = {};
  if (c.photoPaths.length) detail.photos = c.photoCount ? `${c.photoCount}/10 on form` : `${c.photoPaths.length} ready`;
  if (c.captcha) detail.captcha = c.captcha.kind;
  if (c.plan) detail.solver = c.plan.solver ?? c.plan.reason;
  if (c.captchaAttempts.length) detail.attempts = c.captchaAttempts.length;
  if (c.failure) detail.failure = c.failure.code;
  return detail;
}

const RESULT_TEXT: Record<PublishOutput["result"], string> = {
  dryRun: "Dry run: everything filled and checked, nothing published.",
  published: "Published.",
  unconfirmedId: "Publish was clicked but the listing id wasn't found. Check Marketplace > Selling by hand. Not retried.",
  blocked: "Stopped: the account needs attention.",
  needsPerson: "Stopped: a captcha needs a person.",
  failed: "Failed.",
};

/** Human summary of one publish run. Pure. */
export function renderPublishOutput(output: PublishOutput, runDir: string): string {
  const lines = [RESULT_TEXT[output.result]];
  if (output.listingId) lines.push(`Listing: ${output.listingId}  ${output.listingUrl ?? ""}`.trimEnd());
  if (output.review) lines.push(`Held for review: Facebook says "${output.review}" It is listed but buyers can't see it until the review clears (UNDER_REVIEW in Twenty; log facebook scan --account <a> sees it clear).`);
  if (output.issue) lines.push(`Account issue: ${output.issue}`);
  if (output.signIn) lines.push(`Signed in in this browser (rule 24): ${output.signIn.result}. Pages: ${output.signIn.pages.join(" → ") || "none"}`);
  if (output.failure) {
    lines.push(`Where: ${output.failure.state}  code: ${output.failure.code}${output.failure.detail ? `  (${output.failure.detail})` : ""}`);
  }
  const filled = Object.entries(output.filled);
  if (filled.length) lines.push(`Filled: ${filled.map(([k, v]) => `${k}=${v}`).join(", ")}`);
  if (output.photoCount) lines.push(`Photos on the form: ${output.photoCount}/10`);
  for (const a of output.captchaAttempts) {
    const verdict = a.accepted === true ? "accepted" : a.accepted === false ? "not accepted" : "unchecked";
    lines.push(`Captcha: ${a.kind} via ${a.solver}: ${a.solved ? "solved" : `failed (${a.code ?? "?"})`}, ${verdict}`);
  }
  if (output.receipt) lines.push(`Review screenshot: ${output.receipt}`);
  lines.push(`Run record: ${runDir}`);
  return lines.join("\n");
}
