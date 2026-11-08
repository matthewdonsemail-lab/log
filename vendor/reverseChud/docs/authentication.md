# Authentication

This document records the Reddit web-login flow observed on August 6, 2026.
It describes browser behavior, not a stable or official API contract.

## State transitions

```text
anonymous
  -> password accepted
  -> authenticated OR two-factor required
  -> authenticator/backup code accepted
  -> authenticated
```

The SDK represents these stages with
`AnonymousRedditAuthenticationContext`,
`TwoFactorRedditAuthenticationContext`, and
`AuthenticatedRedditAuthenticationContext`. `RedditClient.login()` manages
these internal transitions and returns only after the session is authenticated.

## Anonymous JavaScript challenge

An anonymous request may return a hidden GET form containing `solution`,
`js_challenge`, `token`, and `jsc_orig_r`. The observed script duplicates a
16-character hexadecimal seed to produce `solution`. Reddit also sets an
`edgebucket` cookie. The cookie and opaque token must be preserved unchanged.

This challenge is separate from login reCAPTCHA.

## Password login

```text
POST /svc/shreddit/account/login
```

Observed user fields are `username` and `password`. The login component runs
reCAPTCHA with method `execute` and action `v1/web/login_with_password`. Its
site key is supplied by the page through the `captcha-site-key` attribute and
must not be hard-coded.

The page loads `recaptcha/enterprise.js` with the site key as its `render`
parameter and creates an invisible Enterprise frame. This identifies the
observed login challenge as score-based reCAPTCHA Enterprise (v3-style). A
separate `checkbox-site-key` was also present, suggesting a possible v2
checkbox fallback when Reddit requests an interactive challenge.

The SDK describes the score-based challenge with
`RecaptchaEnterpriseV3Challenge` and passes it through the provider-neutral
`CaptchaSolver` interface. `CapSolver` is one adapter; login code must not
depend on it specifically. Solver-returned user-agent, header, and cookie
context should be preserved with the generated token when supplied.

All stages must reuse one browser-grade HTTP session. The SDK's
`createRedditSession` factory uses `wreq-js` for a stable Chrome TLS/HTTP2
fingerprint, connection pool, and cookie jar. Creating a new transport or
changing browser identity between password and OTP can invalidate server-side
continuation state even when the submitted OTP itself is correct.

`RedditClient.login({ proxy })` applies one normalized proxy to the complete
Reddit session and passes the same URL to every CAPTCHA solve attempt. This is
important for residential sessions: solving from one exit and submitting from
another can lower the score or invalidate the continuation. Proxy credentials
are runtime configuration and are deliberately excluded from exported session
snapshots.

Most callers should use `RedditClient.login()`, which creates and owns this
session automatically. `createRedditSession()` remains available for protocol
research, custom orchestration, and transport-level tests.

An authenticated client can export a normalized, versioned session snapshot.
`RedditClient.resume()` restores its cookies into a fresh browser-grade session
and verifies the account is still authenticated before returning. See
[sessions](./sessions.md).

## Two-factor login

Both observed second-factor choices use:

```text
POST /svc/shreddit/account/login/otp
```

The authenticator-app field is `appOtp`, presented as a six-digit `tel` input
with `autocomplete="one-time-code"`. The backup-code field is `backupOtp`.
Before the browser submits either form, its `onLoginOTPRequest` handler also
copies the original `username` and `password` into the OTP request body. Both
values are therefore required again at this stage and must never be logged.

## Successful transition

After successful OTP submission, the page URL gained `logging_in=true`; the
login dialog disappeared; and authenticated controls such as Chat, Create
post, and Inbox appeared.

The server-rendered `microapp-pool="logged-out"` attribute remained stale after
the client-side transition. It must not be used as an authentication signal.
