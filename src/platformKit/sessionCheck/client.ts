import { createActor, toPromise } from "xstate";
import { signInRoutesOf } from "../../cli/launch/helpers/start.ts";
import { PLATFORMS, PLATFORM_SITES } from "../../cli/runner/helpers/platforms.ts";
import type { Platform } from "../../cli/runner/helpers/platforms.ts";
import { logDbCheckStore } from "./helpers/index.ts";
import { sessionCheckMachine } from "./machine.ts";
import { SESSION_CHECK_PLATFORMS, SIGN_IN_CODES, STOPPED_ACCOUNT_STATUSES, STOPPED_SESSION_STATES } from "./types.ts";
import type { CheckRun, CheckStore, GateVerdict, SessionCheckAccount, SessionCheckOptions, SessionNextStep, SessionReport, SessionToolAnswer, SessionToolCaller, SessionVerdict } from "./types.ts";

type Answer = { ok?: unknown; code?: unknown; detail?: unknown; loginState?: unknown; httpStatus?: unknown };

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
  if (!content || "exit" in content) return null;
  return "loginState" in content || "code" in content || typeof content.ok === "boolean" ? (content as Answer) : null;
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
    const stderr = typeof content?.stderr === "string" ? content.stderr.trim().split(/\r?\n/)[0] : "";
    const toolCode = typeof content?.code === "string" && content.code ? content.code : null;
    return { verdict: "unknown", code: code ?? toolCode ?? "checkFailed", detail: detail ?? (stderr ? stderr.slice(0, 300) : "the check failed before the platform answered"), httpStatus };
  }
  return { verdict: "unknown", code, detail, httpStatus };
}

export function sessionGate(account: Pick<SessionCheckAccount, "name" | "status" | "state" | "checkedAt" | "lastCheck">, options: { openedByOwner?: boolean } = {}): GateVerdict {
  if (account.status === "deactivated") return { ok: false, code: "accountDeactivated", detail: `${account.name} is taken out of use` };
  if ((STOPPED_ACCOUNT_STATUSES as readonly unknown[]).includes(account.status)) return { ok: false, code: "accountCheckStopped", detail: `${account.name} is ${account.status}: nothing reaches the platform until the owner says so (rule 94)` };
  if ((STOPPED_SESSION_STATES as readonly unknown[]).includes(account.state)) return { ok: false, code: "accountCheckStopped", detail: `${account.name}'s session is ${account.state}: nothing reaches the platform until the owner says so (rule 94)` };
  const last = options.openedByOwner ? null : account.lastCheck;
  if (last?.state === "stopped" && (!account.checkedAt || Date.parse(account.checkedAt) <= Date.parse(last.checkedAt))) return { ok: false, code: "accountCheckStopped", detail: `the platform refused ${account.name}'s last check: nothing retries until the owner says so (rule 94)` };
  return { ok: true };
}

export function nextStepOf(account: Pick<SessionCheckAccount, "name" | "platform">, verdict: SessionVerdict): SessionNextStep | null {
  const site = PLATFORM_SITES[account.platform];
  if (verdict === "signInNeeded") {
    const routes = signInRoutesOf(account.platform);
    const cookies = routes.includes("cookies") ? { says: `Save ${account.name}'s ${account.platform} cookies instead (a masked prompt in a terminal, for the owner).`, cli: `log sessions signIn --account ${account.name} --platform ${account.platform} --route cookies` } : null;
    if (!routes.includes("browser")) {
      return { says: `${cookies?.says.replace(" instead", "") ?? "Sign in again."} Then check again.`, tool: null, cli: cookies?.cli ?? null, alternative: null };
    }
    return {
      says: `Sign ${account.name} in from its own browser: sessionsSignIn opens it on ${site.home}, the owner signs in themself on the login screen, and the cookies and session are saved from the browser once it shows them signed in. Then the account is checked again.`,
      tool: { name: "sessionsSignIn", input: { account: account.name, platform: account.platform } },
      cli: `log sessions signIn --account ${account.name} --platform ${account.platform}`,
      alternative: cookies,
    };
  }
  if (verdict === "stopped") return { says: "The platform refused. Nothing retries on this account until the owner says so (rule 94).", tool: null, cli: null, alternative: null };
  if (verdict === "unknown") return { says: "Check it again; the platform gave no answer this time.", tool: { name: "sessionsCheck", input: { account: account.name, platform: account.platform } }, cli: `log sessions check --platform ${account.platform} --account ${account.name}`, alternative: null };
  return null;
}

function reportOf(account: SessionCheckAccount, now: Date, found: { verdict: SessionVerdict; code: string | null; detail: string | null; httpStatus: number | null }, next: SessionNextStep | null = nextStepOf(account, found.verdict)): SessionReport {
  return { id: account.id, platform: account.platform, account: account.name, ...found, checkedAt: now.toISOString(), next };
}

export function gateReport(account: SessionCheckAccount, now: Date): SessionReport | null {
  const gate = sessionGate(account);
  if (!gate.ok && gate.code === "accountDeactivated") return reportOf(account, now, { verdict: "skipped", code: gate.code, detail: gate.detail, httpStatus: null }, null);
  if (!gate.ok) return reportOf(account, now, { verdict: "stopped", code: gate.code, detail: gate.detail, httpStatus: null });
  if (account.platform === "facebook") return reportOf(account, now, { verdict: "skipped", code: "browserCheckRequired", detail: "Facebook is checked in the account's own browser", httpStatus: null }, nextStepOf(account, "signInNeeded"));
  if (!SESSION_CHECK_PLATFORMS.includes(account.platform)) return reportOf(account, now, { verdict: "skipped", code: "noSessionCheck", detail: `${account.platform} has no session check`, httpStatus: null }, null);
  return null;
}

export async function platformCheck(account: SessionCheckAccount, callTool: SessionToolCaller, now: Date): Promise<SessionReport> {
  return reportOf(account, now, verdictOf(await callTool(sessionCheckToolOf(account.platform), { account: account.name, json: true })));
}

export function failedReport(account: SessionCheckAccount, error: unknown, now: Date): SessionReport {
  return reportOf(account, now, { verdict: "unknown", code: "checkFailed", detail: error instanceof Error ? error.message.slice(0, 300) : "the check failed", httpStatus: null });
}

export async function checkSession(account: SessionCheckAccount, callTool: SessionToolCaller, now: () => Date = () => new Date()): Promise<SessionReport> {
  const refused = gateReport(account, now());
  if (refused) return refused;
  try {
    return await platformCheck(account, callTool, now());
  } catch (error) {
    return failedReport(account, error, now());
  }
}

export interface RunCheckDeps {
  callTool: SessionToolCaller;
  store?: CheckStore;
  now?: () => Date;
  pid?: number;
}

export async function runSessionCheck(account: SessionCheckAccount, deps: RunCheckDeps): Promise<CheckRun> {
  const machine = sessionCheckMachine({ store: deps.store ?? logDbCheckStore(), callTool: deps.callTool, now: deps.now ?? (() => new Date()), pid: deps.pid ?? process.pid, gate: gateReport, check: platformCheck, failed: failedReport });
  const actor = createActor(machine, { input: { account } });
  actor.start();
  return toPromise(actor);
}

export async function checkSessions(accounts: readonly SessionCheckAccount[], options: SessionCheckOptions, checkOne: (account: SessionCheckAccount) => Promise<SessionReport>, onReport: (report: SessionReport) => void = () => {}): Promise<SessionReport[]> {
  const platform = options.platform?.trim().toLowerCase().replace(/^x$/, "twitter");
  if (platform && !(PLATFORMS as readonly string[]).includes(platform)) throw new Error("sessionPlatformInvalid");
  const name = options.account?.trim().replace(/^@/, "").toLowerCase();
  const picked = accounts.filter((account) => (!platform || account.platform === platform) && (!name || account.name.toLowerCase() === name) && (!options.accountId || account.id === options.accountId));
  if ((name || options.accountId) && !picked.length) throw new Error("accountNotFound");
  const reports: SessionReport[] = [];
  for (const account of picked) {
    const report = await checkOne(account);
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
