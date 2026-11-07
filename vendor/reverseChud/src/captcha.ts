/** A score-based reCAPTCHA Enterprise challenge. */
export interface RecaptchaEnterpriseV3Challenge {
  readonly type: "recaptcha-enterprise-v3";
  readonly websiteUrl: string;
  readonly websiteKey: string;
  readonly pageAction: string;
  readonly enterprisePayload?: Readonly<Record<string, unknown>>;
  readonly requiresSession?: boolean;
}

/** CAPTCHA challenges currently understood by the SDK. */
export type CaptchaChallenge = RecaptchaEnterpriseV3Challenge;

/** Solver-neutral result that can be applied to the matching request. */
export interface CaptchaSolution {
  readonly token: string;
  readonly userAgent?: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly cookies?: Readonly<Record<string, string>>;
}

/** Per-attempt controls shared by all CAPTCHA solver implementations. */
export interface CaptchaSolveOptions {
  /** Proxy URL the solver should use for the challenge browser or worker. */
  readonly proxy?: string;
  readonly signal?: AbortSignal;
}

/**
 * Pluggable CAPTCHA boundary.
 *
 * Implement this interface to use a hosted service, a browser-assisted solver,
 * or a test double without coupling Reddit's login flow to that implementation.
 */
export interface CaptchaSolver<
  TChallenge extends CaptchaChallenge = CaptchaChallenge,
> {
  solve(
    challenge: TChallenge,
    options?: CaptchaSolveOptions,
  ): Promise<CaptchaSolution>;
}
