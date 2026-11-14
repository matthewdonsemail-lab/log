import type { SignInRouteName } from "../../cli/launch/helpers/start.ts";
import type { Platform } from "../../cli/runner/helpers/platforms.ts";
import type { SessionCheckAccount, SessionNextStep, SessionReport } from "../sessionCheck/index.ts";

export const SIGN_IN_STAGES = ["checking", "opening", "waitingForOwner", "saving", "rechecking", "signedIn", "signInNeeded", "stopped", "failed"] as const;
export type SignInStage = (typeof SIGN_IN_STAGES)[number];

export const SIGN_IN_FINAL_STATES = ["signedIn", "signInNeeded", "stopped", "failed"] as const;
export type SignInFinalState = (typeof SIGN_IN_FINAL_STATES)[number];

export type SignInState = SignInFinalState | "waitingForOwner";

export type SignInRoute = SignInRouteName;

export type SignInAccount = SessionCheckAccount;

export interface SaveOutcome {
  saved: boolean;
  code: string | null;
  detail: string | null;
  at: string;
}

export interface OwnerWait {
  finished: boolean;
}

export interface SignInActors {
  check(account: SignInAccount): Promise<SessionReport>;
  open(account: SignInAccount): Promise<void>;
  waitForOwner(account: SignInAccount, finish: boolean): Promise<OwnerWait>;
  save(account: SignInAccount, since: string): Promise<SaveOutcome>;
  recheck(account: SignInAccount): Promise<SessionReport>;
}

export interface SignInInput {
  account: SignInAccount;
  route: SignInRoute;
  finish: boolean;
  startedAt: string;
}

export interface SignInMachineOutput {
  state: SignInFinalState;
  stage: SignInStage;
  check: SessionReport | null;
  save: SaveOutcome | null;
  recheck: SessionReport | null;
  code: string | null;
  detail: string | null;
}

export interface SignInResult {
  accountId: string;
  account: string;
  platform: Platform;
  route: SignInRoute;
  state: SignInState;
  stage: SignInStage;
  code: string | null;
  detail: string | null;
  save: SaveOutcome | null;
  check: SessionReport | null;
  next: SessionNextStep | null;
}

export interface AccountNotConfigured {
  error: "accountNotConfigured";
  platform: Platform | null;
  account: string;
  next: SessionNextStep;
}

export interface SignInRequest {
  account: SignInAccount;
  route?: SignInRoute;
  finish?: boolean;
}

export interface SignInStore {
  load(accountId: string): { snapshot: unknown; route: SignInRoute; savedAt: number } | null;
  keep(accountId: string, snapshot: unknown, route: SignInRoute, now: number): void;
  drop(accountId: string): void;
}

export const SIGN_IN_SNAPSHOT_MS = 30 * 60 * 1000;

export const SIGN_IN_ERRORS = ["signInRouteUnavailable", "sessionSaveUnconfirmed", "accountCheckBusy", "accountNotConfigured"] as const;
