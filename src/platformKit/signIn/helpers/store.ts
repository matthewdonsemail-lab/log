import { db } from "../../../inbox/store/index.ts";
import { deleteState, getState, putState } from "../../../storage/state/index.ts";
import type { SaveOutcome, SignInRoute, SignInStore } from "../types.ts";

const SIGN_IN_SCOPE = "signIn" as const;
const SAVE_SCOPE = "sessionSave" as const;

export function logDbSignInStore(): SignInStore {
  return {
    load(accountId) {
      const row = getState<{ snapshot: unknown; route: SignInRoute }>(SIGN_IN_SCOPE, accountId, {}, db());
      return row ? { snapshot: row.body.snapshot, route: row.body.route, savedAt: row.updatedAt } : null;
    },
    keep(accountId, snapshot, route, now) {
      putState(SIGN_IN_SCOPE, accountId, { snapshot, route }, now, db());
    },
    drop(accountId) {
      deleteState(SIGN_IN_SCOPE, accountId, db());
    },
  };
}

export function recordSessionSave(accountId: string, outcome: SaveOutcome): void {
  putState(SAVE_SCOPE, accountId, outcome, Date.parse(outcome.at) || Date.now(), db());
}

export function readSessionSave(accountId: string, since: string): SaveOutcome | null {
  const row = getState<SaveOutcome>(SAVE_SCOPE, accountId, {}, db());
  if (!row || Date.parse(row.body.at) < Date.parse(since)) return null;
  return row.body;
}
