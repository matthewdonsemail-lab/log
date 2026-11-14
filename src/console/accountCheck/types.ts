import type { CheckState, SessionReport } from "../../platformKit/sessionCheck/index.ts";
import type { ConnectionAccount } from "../connections/types.ts";

export type CheckAccount = Pick<ConnectionAccount, "id" | "name" | "platform">;

export interface CheckResult {
  state: CheckState;
  session?: SessionReport;
}

export type CheckToolAnswer = { isError?: boolean; structuredContent?: unknown };

export type CheckToolCaller = (name: string, input: Record<string, unknown>) => Promise<CheckToolAnswer>;

export const ACCOUNT_CHECK_ERRORS = ["accountNotFound", "accountCheckBusy", "accountCheckStopped", "accountDeactivated", "browserCheckRequired"] as const;
export type AccountCheckError = (typeof ACCOUNT_CHECK_ERRORS)[number];

export { STOPPED_SESSION_STATES } from "../../platformKit/sessionCheck/index.ts";
