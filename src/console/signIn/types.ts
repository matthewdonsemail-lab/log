import type { Platform } from "../../cli/runner/helpers/platforms.ts";

export type SignInMethod = "cookies" | "password";

export interface SignInRequest {
  platform: Platform;
  method: SignInMethod;
  account: string;
  cookies?: string;
  username?: string;
  password?: string;
}

export const COOKIE_NAMES: Readonly<Partial<Record<Platform, readonly string[]>>> = {
  twitter: ["auth_token", "ct0", "twid"],
  linkedin: ["li_at", "JSESSIONID"],
  slack: ["d"],
};

export const PASSWORD_PLATFORMS: readonly Platform[] = ["facebook"];

export const SIGN_IN_ERRORS = ["signInInputInvalid", "cookieSignInUnavailable", "passwordSignInUnavailable", "cookiesIncomplete", "signInRefused", "signInBusy", "accountNotFound"] as const;
export type SignInError = (typeof SIGN_IN_ERRORS)[number];

export interface SignInResult {
  signedIn: boolean;
  next: "none" | "browserCheck";
  accountId: string;
  detail: string;
}

export interface SignInPrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  password(option: { message: string; validate?: (value: string | undefined) => string | Error | undefined }): Promise<unknown>;
}
