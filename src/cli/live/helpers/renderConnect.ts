import type { ConnectContext, ConnectOutput } from "../../../marketplace/connect/index.ts";

export function summarizeConnect(context: unknown): Record<string, unknown> {
  const c = context as ConnectContext | undefined;
  if (!c) return {};
  const detail: Record<string, unknown> = {};
  if (c.page) detail.page = c.page.kind;
  if (c.page?.heading && (c.page.kind === "checkpoint" || c.page.kind === "captcha" || c.page.kind === "unknown")) detail.heading = c.page.heading;
  if (c.loginTries) detail.logins = c.loginTries;
  if (c.codeTries) detail.codes = c.codeTries;
  if (c.failure) detail.failure = c.failure.code;
  return detail;
}

const RESULT_TEXT: Record<ConnectOutput["result"], string> = {
  connected: "Signed in.",
  checkpointed: "Stopped on Facebook's checkpoint: a person has to clear it in the browser.",
  disabled: "Facebook says the account is disabled or locked.",
  wrongPassword: "Facebook says the password is wrong (or found no account for the email). Fix it in Twenty.",
  timedOut: "Not signed in before the deadline.",
  videoSelfie: "Facebook wants a video selfie to confirm the account. Nothing was clicked: a person has to record it, then connect again.",
  failed: "Failed.",
};

export function renderConnect(accountName: string, output: ConnectOutput): string {
  const lines = [`${accountName}: ${RESULT_TEXT[output.result]}`];
  if (output.pages.length) lines.push(`Pages: ${output.pages.join(" → ")}`);
  if (output.checkpoint) lines.push(`Checkpoint: "${output.checkpoint}"${output.page?.buttons?.length ? ` (buttons: ${output.page.buttons.join(", ")})` : ""}`);
  if (output.result !== "connected" && output.page) lines.push(`Last page: ${output.page.kind} ${output.page.path}${output.page.heading ? ` "${output.page.heading}"` : ""}`);
  if (output.failure && output.result === "failed") lines.push(`Failure: ${output.failure.code} in ${output.failure.state}${output.failure.detail ? `: ${output.failure.detail}` : ""}`);
  return lines.join("\n");
}
