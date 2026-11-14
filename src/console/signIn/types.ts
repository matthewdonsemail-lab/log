import type { Platform } from "../../cli/runner/helpers/platforms.ts";
import type { SignInState } from "../../platformKit/signIn/index.ts";

export const SIGN_IN_METHODS = ["cookies", "password", "browser"] as const;
export type SignInMethod = (typeof SIGN_IN_METHODS)[number];

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

export const SIGN_IN_ERRORS = ["signInInputInvalid", "cookieSignInUnavailable", "passwordSignInUnavailable", "cookiesIncomplete", "signInRefused", "accountNotFound", "signInRouteUnavailable"] as const;
export type SignInError = (typeof SIGN_IN_ERRORS)[number];

export interface SignInResult {
  signedIn: boolean;
  next: "none" | "browserCheck";
  accountId: string;
  detail: string;
  state: SignInState;
}

export interface SignInPrompts {
  intro(title: string): void;
  outro(message?: string): void;
  cancel(message?: string): void;
  password(option: { message: string; validate?: (value: string | undefined) => string | Error | undefined }): Promise<unknown>;
}
