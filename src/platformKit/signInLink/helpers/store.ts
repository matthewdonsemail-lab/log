import { db } from "../../../inbox/store/index.ts";
import { getState, putState } from "../../../storage/state/index.ts";
import type { SignInLinkRow, SignInLinkStore } from "../types.ts";

const SCOPE = "signInLink" as const;

export function logDbSignInLinkStore(): SignInLinkStore {
  return {
    put(key, row) {
      putState(SCOPE, key, row, Date.now(), db());
    },
    read(key) {
      return getState<SignInLinkRow>(SCOPE, key, {}, db())?.body ?? null;
    },
    take(key) {
      const row = db().prepare("DELETE FROM state WHERE scope = ? AND key = ? RETURNING body").get(SCOPE, key) as { body: string } | null;
      if (!row) return null;
      try {
        return JSON.parse(row.body) as SignInLinkRow;
      } catch {
        return null;
      }
    },
  };
}
