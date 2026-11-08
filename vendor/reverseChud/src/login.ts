import type {
  AnonymousRedditAuthenticationContext,
  RequestParity,
  TwoFactorRedditAuthenticationContext,
} from "./authentication.js";
import type { RecaptchaEnterpriseV3Challenge } from "./captcha.js";

/** Contract for Reddit's password and 2FA login flow. */
export const REDDIT_LOGIN_FLOW = {
  password: {
    method: "POST",
    path: "/svc/shreddit/account/login",
    fields: {
      username: "username",
      password: "password",
    },
    captcha: {
      type: "recaptcha-enterprise-v3",
      method: "execute",
      action: "v1/web/login_with_password",
      script: "https://www.google.com/recaptcha/enterprise.js",
      siteKeyAttribute: "captcha-site-key",
      checkboxFallbackSiteKeyAttribute: "checkbox-site-key",
    },
  },
  authenticatorOtp: {
    method: "POST",
    path: "/svc/shreddit/account/login/otp",
    fields: {
      username: "username",
      password: "password",
      otp: "appOtp",
    },
    length: 6,
    inputType: "tel",
    autocomplete: "one-time-code",
  },
  backupOtp: {
    method: "POST",
    path: "/svc/shreddit/account/login/otp",
    fields: {
      username: "username",
      password: "password",
      otp: "backupOtp",
    },
    autocomplete: "one-time-code",
  },
  completion: {
    queryParameter: "logging_in",
    value: "true",
  },
} as const;

/** Build the solver-neutral challenge described by Reddit's login component. */
export function createRedditLoginCaptchaChallenge(
  websiteUrl: string | URL,
  websiteKey: string,
): RecaptchaEnterpriseV3Challenge {
  return {
    type: REDDIT_LOGIN_FLOW.password.captcha.type,
    websiteUrl: new URL(websiteUrl).href,
    websiteKey,
    pageAction: REDDIT_LOGIN_FLOW.password.captcha.action,
  };
}

/** Caller-supplied values for the password stage of login. */
export interface RedditPasswordLoginInput
  extends RequestParity<AnonymousRedditAuthenticationContext> {
  readonly username: string;
  readonly password: string;
}

/** Caller-supplied authenticator-app code after Reddit accepts the password. */
export interface RedditAuthenticatorOtpLoginInput
  extends RequestParity<TwoFactorRedditAuthenticationContext> {
  readonly appOtp: string;
  readonly password: string;
}

/** Caller-supplied backup code after Reddit accepts the password. */
export interface RedditBackupOtpLoginInput
  extends RequestParity<TwoFactorRedditAuthenticationContext> {
  readonly backupOtp: string;
  readonly password: string;
}
