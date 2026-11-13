import type { Platform } from "../../cli/runner/helpers/platforms.ts";

export const CHECK_STATES = ["signedIn", "signInNeeded", "stopped", "unknown", "checking", "skipped"] as const;
export type CheckState = (typeof CHECK_STATES)[number];

export const SESSION_VERDICTS = ["signedIn", "signInNeeded", "stopped", "unknown", "skipped"] as const;
export type SessionVerdict = (typeof SESSION_VERDICTS)[number];

export const LEGACY_CHECK_STATES: Readonly<Record<string, CheckState>> = { succeeded: "signedIn", running: "checking", unavailable: "unknown", browserCheck: "skipped" };

export const SIGN_IN_CODES = ["sessionDead", "noPlatformSession", "notLoggedIn", "sessionExpired"] as const;

export const SESSION_CHECK_PLATFORMS: readonly Platform[] = ["twitter", "discord", "instagram", "slack", "reddit", "linkedin"];

export const STOPPED_SESSION_STATES = ["checkpoint", "restricted", "shadowSuspect", "accountWarning"] as const;

export const STOPPED_ACCOUNT_STATUSES = ["banned", "dead", "restricted", "checkpoint"] as const;

export const GATE_REFUSALS = ["accountDeactivated", "accountCheckStopped"] as const;
export type GateRefusal = (typeof GATE_REFUSALS)[number];

export type GateVerdict = { ok: true } | { ok: false; code: GateRefusal; detail: string };

export interface SessionNextStep {
  says: string;
  tool: { name: string; input: Record<string, unknown> } | null;
  cli: string | null;
  alternative: { says: string; cli: string } | null;
}

export interface SessionReport {
  id: string;
  platform: Platform;
  account: string;
  verdict: SessionVerdict;
  code: string | null;
  detail: string | null;
  httpStatus: number | null;
  checkedAt: string;
  next: SessionNextStep | null;
}

export interface SessionCheckOptions {
  platform?: string;
  account?: string;
  accountId?: string;
}

export type SessionToolAnswer = { isError?: boolean; structuredContent?: unknown };
export type SessionToolCaller = (name: string, input: Record<string, unknown>) => Promise<SessionToolAnswer>;

export interface StoredCheck {
  state: CheckState;
  checkedAt: string;
  code?: string | null;
  pid?: number;
  startedAt?: string;
}

export interface SessionCheckAccount {
  id: string;
  name: string;
  platform: Platform;
  status?: string;
  state?: string | null;
  checkedAt?: string | null;
  lastCheck?: Pick<StoredCheck, "state" | "checkedAt"> | null;
}

export type CheckClaim = { claimed: true } | { claimed: false; holder: number };

export interface CheckStore {
  claim(accountId: string, pid: number, now: Date): CheckClaim;
  record(accountId: string, check: StoredCheck): void;
}

export const CHECK_OUTCOMES = ["done", "busy", "refused", "failed"] as const;
export type CheckOutcome = (typeof CHECK_OUTCOMES)[number];

export interface CheckRun {
  outcome: CheckOutcome;
  state: CheckState;
  report: SessionReport;
}
