import type { Platform } from "../../cli/runner/helpers/platforms.ts";

export const SIGN_IN_LINK_MS = 10 * 60 * 1000;

export const OWNER_REQUESTER = "owner";

export const SIGN_IN_LINK_PARAM = "signIn";

export const SIGN_IN_LINK_PATH = "/console/connections";

export const SIGN_IN_LINK_ERRORS = ["signInLinkInvalid", "signInLinkNotYours"] as const;

export interface SignInLinkTarget {
  accountId: string;
  account: string;
  platform: Platform;
}

export interface SignInLinkRow extends SignInLinkTarget {
  requester: string;
  expiresAt: string;
}

export interface SignInLink {
  url: string;
  expiresAt: string;
}

export interface SignInLinkStore {
  put(key: string, row: SignInLinkRow): void;
  read(key: string): SignInLinkRow | null;
  take(key: string): SignInLinkRow | null;
}
