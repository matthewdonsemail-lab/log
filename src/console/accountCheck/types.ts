import type { CheckState, ConnectionAccount } from "../connections/types.ts";

export type CheckAccount = Pick<ConnectionAccount, "id" | "name" | "platform">;

export type CheckOutcome = Exclude<CheckState, "running">;

export interface CheckResult {
  state: CheckOutcome;
}

export type CheckToolAnswer = { isError?: boolean; structuredContent?: unknown };

export type CheckToolCaller = (name: string, input: Record<string, unknown>) => Promise<CheckToolAnswer>;

export type CheckRecorder = (accountId: string, state: CheckState) => void;

export const ACCOUNT_CHECK_ERRORS = ["accountNotFound", "accountCheckBusy", "accountCheckStopped", "accountDeactivated", "browserCheckRequired", "accountCheckUnavailable"] as const;
export type AccountCheckError = (typeof ACCOUNT_CHECK_ERRORS)[number];

export const STOPPED_SESSION_STATES = ["checkpoint", "restricted", "shadowSuspect", "accountWarning"] as const;
