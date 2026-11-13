import type { Platform } from "../../cli/runner/helpers/platforms.ts";

export const SESSION_VERDICTS = ["signedIn", "signInNeeded", "stopped", "unknown", "browserCheck", "skipped"] as const;
export type SessionVerdict = (typeof SESSION_VERDICTS)[number];

export const SIGN_IN_CODES = ["sessionDead", "noPlatformSession", "notLoggedIn", "sessionExpired"] as const;

export const SESSION_CHECK_PLATFORMS: readonly Platform[] = ["twitter", "discord", "instagram", "slack", "reddit", "linkedin"];

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

export interface SessionCheckAccount {
  id: string;
  name: string;
  platform: Platform;
  status?: string;
}
