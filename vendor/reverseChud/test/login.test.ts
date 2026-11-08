import { describe, expect, test } from "bun:test";

import {
  AnonymousRedditAuthenticationContext,
  createRedditLoginCaptchaChallenge,
  REDDIT_EDGE_COOKIE_NAME,
  REDDIT_LOGIN_FLOW,
  TwoFactorRedditAuthenticationContext,
  type RedditAuthenticatorOtpLoginInput,
  type RedditBackupOtpLoginInput,
  type RedditPasswordLoginInput,
} from "../src";

describe("Reddit login contract", () => {
  test("documents the password endpoint and CAPTCHA action", () => {
    expect(REDDIT_LOGIN_FLOW.password).toMatchObject({
      method: "POST",
      path: "/svc/shreddit/account/login",
      fields: { username: "username", password: "password" },
      captcha: {
        type: "recaptcha-enterprise-v3",
        method: "execute",
        action: "v1/web/login_with_password",
        script: "https://www.google.com/recaptcha/enterprise.js",
        siteKeyAttribute: "captcha-site-key",
        checkboxFallbackSiteKeyAttribute: "checkbox-site-key",
      },
    });
  });

  test("creates a solver-neutral login challenge from the live site key", () => {
    expect(
      createRedditLoginCaptchaChallenge(
        "https://www.reddit.com/login",
        "public-site-key",
      ),
    ).toEqual({
      type: "recaptcha-enterprise-v3",
      websiteUrl: "https://www.reddit.com/login",
      websiteKey: "public-site-key",
      pageAction: "v1/web/login_with_password",
    });
  });

  test("documents both observed OTP submissions", () => {
    expect(REDDIT_LOGIN_FLOW.authenticatorOtp).toMatchObject({
      path: "/svc/shreddit/account/login/otp",
      fields: {
        username: "username",
        password: "password",
        otp: "appOtp",
      },
      length: 6,
    });
    expect(REDDIT_LOGIN_FLOW.backupOtp).toMatchObject({
      path: "/svc/shreddit/account/login/otp",
      fields: {
        username: "username",
        password: "password",
        otp: "backupOtp",
      },
    });
  });

  test("types each request against its required auth state", () => {
    const password: RedditPasswordLoginInput = {
      authentication: new AnonymousRedditAuthenticationContext(),
      username: "example_user",
      password: "example_password",
    };
    const twoFactor = new TwoFactorRedditAuthenticationContext(
      password.username,
    );
    const authenticator: RedditAuthenticatorOtpLoginInput = {
      authentication: twoFactor,
      appOtp: "123456",
      password: password.password,
    };
    const backup: RedditBackupOtpLoginInput = {
      authentication: twoFactor,
      backupOtp: "example-backup-code",
      password: password.password,
    };

    expect(authenticator.authentication.username).toBe("example_user");
    expect(backup.authentication).toBe(twoFactor);
    expect(authenticator.password).toBe("example_password");
  });

  test("records the edge cookie and completion query signal", () => {
    expect(REDDIT_EDGE_COOKIE_NAME).toBe("edgebucket");
    expect(REDDIT_LOGIN_FLOW.completion).toEqual({
      queryParameter: "logging_in",
      value: "true",
    });
  });
});
