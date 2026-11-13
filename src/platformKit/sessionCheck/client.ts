import { signInRouteOf } from "../../cli/launch/helpers/start.ts";
import { PLATFORMS, PLATFORM_SITES } from "../../cli/runner/helpers/platforms.ts";
import type { Platform } from "../../cli/runner/helpers/platforms.ts";
import { SESSION_CHECK_PLATFORMS, SIGN_IN_CODES } from "./types.ts";
import type { SessionCheckAccount, SessionCheckOptions, SessionNextStep, SessionReport, SessionToolAnswer, SessionToolCaller, SessionVerdict } from "./types.ts";

type Answer = { ok?: unknown; code?: unknown; detail?: unknown; loginState?: unknown; httpStatus?: unknown };

const SIGN_IN_GOAL = "Open the account's browser on the platform's sign-in page so the owner signs in, then save the new session";

export function sessionCheckToolOf(platform: Platform): string {
  return `${platform}SessionCheck`;
}

function objectOf(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

export function platformAnswerOf(answer: SessionToolAnswer): Answer | null {
  const content = objectOf(answer.structuredContent);
  const json = objectOf(content?.json);
  if (json && ("ok" in json || "code" in json || "loginState" in json)) return json as Answer;
  return content && ("loginState" in content || "code" in content || typeof content.ok === "boolean") ? (content as Answer) : null;
}

export function verdictOf(answer: SessionToolAnswer): { verdict: SessionVerdict; code: string | null; detail: string | null; httpStatus: number | null } {
  const content = objectOf(answer.structuredContent);
  if (content?.job) return { verdict: "unknown", code: "checkStillRunning", detail: "the check outlasted its wait and runs on as a job", httpStatus: null };
  const said = platformAnswerOf(answer);
  const code = typeof said?.code === "string" ? said.code : null;
  const detail = typeof said?.detail === "string" ? said.detail : null;
  const httpStatus = typeof said?.httpStatus === "number" ? said.httpStatus : null;
  if (said?.ok === true && !answer.isError) return { verdict: "signedIn", code: null, detail, httpStatus };
  if (said && ((code && (SIGN_IN_CODES as readonly string[]).includes(code)) || said.loginState === "loggedOut" || httpStatus === 401)) return { verdict: "signInNeeded", code: code ?? "loggedOut", detail, httpStatus };
  if (said?.ok === false) return { verdict: "stopped", code, detail, httpStatus };
  if (answer.isError) {
    const stderr = typeof content?.stderr === "string" ? content.stderr : "";
    const local = /: ([a-z][A-Za-z]+): (.+)/.exec(stderr);
    return { verdict: "unknown", code: code ?? local?.[1] ?? "checkFailed", detail: detail ?? local?.[2]?.slice(0, 300) ?? "the check failed before the platform answered", httpStatus };
  }
  return { verdict: "unknown", code, detail, httpStatus };
}

export function nextStepOf(account: Pick<SessionCheckAccount, "name" | "platform">, verdict: SessionVerdict): SessionNextStep | null {
  const site = PLATFORM_SITES[account.platform];
  if (verdict === "signInNeeded" || verdict === "browserCheck") {
    if (signInRouteOf(account.platform).kind === "cookies") {
      return { says: `Save ${account.name}'s ${account.platform} cookies again (a masked prompt in a terminal, for the owner), then check again.`, tool: null, cli: `log ${account.platform} cookies save --account ${account.name}` };
    }
    const url = site.home;
    return {
      says: `Open ${account.name}'s own browser on ${url}. The owner signs in themself; closing it (inspectDo stop) saves the new session. Then check again.`,
      tool: { name: "inspectStart", input: { account: account.name, url, detach: true, goal: SIGN_IN_GOAL } },
      cli: `log inspect start --account ${account.name} --url ${url} --detach`,
    };
  }
  if (verdict === "stopped") return { says: "The platform refused. Nothing retries on this account until matt says so (rule 94).", tool: null, cli: null };
  if (verdict === "unknown") return { says: "Check it again; the platform gave no answer this time.", tool: { name: "sessionsCheck", input: { account: account.name, platform: account.platform } }, cli: `log sessions check --platform ${account.platform} --account ${account.name}` };
  return null;
}

export async function checkSession(account: SessionCheckAccount, callTool: SessionToolCaller, now: () => Date = () => new Date()): Promise<SessionReport> {
  const base = { id: account.id, platform: account.platform, account: account.name };
  if (account.status === "deactivated") {
    return { ...base, verdict: "skipped", code: "accountDeactivated", detail: "taken out of use", httpStatus: null, checkedAt: now().toISOString(), next: null };
  }
  if (account.platform === "facebook") {
    return { ...base, verdict: "browserCheck", code: "browserCheckRequired", detail: "Facebook is checked in the account's own browser", httpStatus: null, checkedAt: now().toISOString(), next: nextStepOf(account, "browserCheck") };
  }
  if (!SESSION_CHECK_PLATFORMS.includes(account.platform)) {
    return { ...base, verdict: "skipped", code: "noSessionCheck", detail: `${account.platform} has no session check`, httpStatus: null, checkedAt: now().toISOString(), next: null };
  }
  let found: ReturnType<typeof verdictOf>;
  try {
    found = verdictOf(await callTool(sessionCheckToolOf(account.platform), { account: account.name, json: true }));
  } catch (error) {
    found = { verdict: "unknown", code: "checkFailed", detail: error instanceof Error ? error.message.slice(0, 300) : "the check failed", httpStatus: null };
  }
  return { ...base, ...found, checkedAt: now().toISOString(), next: nextStepOf(account, found.verdict) };
}

export async function checkSessions(accounts: readonly SessionCheckAccount[], options: SessionCheckOptions, callTool: SessionToolCaller, onReport: (report: SessionReport) => void = () => {}): Promise<SessionReport[]> {
  const platform = options.platform?.trim().toLowerCase().replace(/^x$/, "twitter");
  if (platform && !(PLATFORMS as readonly string[]).includes(platform)) throw new Error("sessionPlatformInvalid");
  const name = options.account?.trim().replace(/^@/, "").toLowerCase();
  const picked = accounts.filter((account) => (!platform || account.platform === platform) && (!name || account.name.toLowerCase() === name) && (!options.accountId || account.id === options.accountId));
  if ((name || options.accountId) && !picked.length) throw new Error("accountNotFound");
  const reports: SessionReport[] = [];
  for (const account of picked) {
    const report = await checkSession(account, callTool);
    onReport(report);
    reports.push(report);
  }
  return reports;
}

const VERDICT_WORDS: Record<SessionVerdict, string> = {
  signedIn: "signed in",
  signInNeeded: "needs signing in",
  stopped: "stopped",
  unknown: "unknown",
  browserCheck: "checked in its browser",
  skipped: "skipped",
};

export function sessionLine(report: SessionReport): string {
  const why = report.verdict === "signedIn" ? "" : [report.code, report.httpStatus ? `HTTP ${report.httpStatus}` : null].filter(Boolean).join(", ");
  return `  ${report.platform} ${report.account}: ${VERDICT_WORDS[report.verdict]}${why ? ` (${why})` : ""}${report.next ? `\n      next: ${report.next.says}${report.next.cli ? `\n      ${report.next.cli}` : ""}` : ""}`;
}

export function sessionsText(reports: readonly SessionReport[]): string {
  if (!reports.length) return "No accounts to check.";
  const counts = new Map<SessionVerdict, number>();
  for (const report of reports) counts.set(report.verdict, (counts.get(report.verdict) ?? 0) + 1);
  const summary = [...counts].map(([verdict, count]) => `${count} ${VERDICT_WORDS[verdict]}`).join(", ");
  return [`${reports.length} accounts: ${summary}`, ...reports.map(sessionLine)].join("\n");
}
