/**
 * Captcha routing: which solver gets a captcha, decided from what is on screen.
 * The order and the reasons are in `docs/listingPublish/captchaKraken.md` and
 * matt's call on 2026-10-18: CaptchaKraken first, 2Captcha as the fallback, a
 * person for Facebook's own challenges.
 */

/** What the page shows. Set by the session's `inspect` step. */
export type CaptchaKind =
  /** Google reCAPTCHA v2 or Enterprise (FB wraps it in an fbsbx.com frame). */
  | 'recaptcha'
  /** Arkose Labs / FunCaptcha. CaptchaKraken can't solve it. */
  | 'arkose'
  /** FB's own checkpoint: SMS code, ID, selfie, "confirm it's you". No solver. */
  | 'facebookChallenge'
  /** Something captcha-like that matched no known vendor. */
  | 'unknown'

export type CaptchaSolverName = 'captchaKraken' | 'twoCaptcha'

export interface CaptchaDetection {
  kind: CaptchaKind
  /** reCAPTCHA Enterprise (FB's checkpoints use it). */
  enterprise?: boolean
  /** Site key / public key, when the frame URL carries one. */
  siteKey?: string | null
  /** URL of the captcha's own frame. */
  frameUrl?: string | null
  /** Short human note on what matched. */
  detail?: string
}

/** Which solvers have a key configured. Read from the env, never the network. */
export interface SolverAvailability {
  captchaKraken: boolean
  twoCaptcha: boolean
}

/** One solve attempt, as written to the ledger (`~/.logCli/captcha/attempts.jsonl`). */
export interface CaptchaAttempt {
  at: string
  accountId: string
  kind: CaptchaKind
  solver: CaptchaSolverName
  /** The solver said it solved it. */
  solved: boolean
  /** The page moved past the captcha afterwards (`null` = not checked yet). */
  accepted: boolean | null
  /** Machine code on failure (`insufficientCredits`, `noWidget`, `timeout`, ...). */
  code?: string
  detail?: string
}

export interface CaptchaPolicy {
  /** CaptchaKraken tries per reCAPTCHA before 2Captcha gets it. */
  krakenAttempts: number
  /** 2Captcha tries per captcha. */
  twoCaptchaAttempts: number
  /** Arkose solves per account per day (unproven on FB, so capped). */
  arkoseDailyCap: number
  /** Hard stop on captcha rounds in one publish run. */
  maxRounds: number
}

export const DEFAULT_CAPTCHA_POLICY: CaptchaPolicy = {
  krakenAttempts: 2,
  twoCaptchaAttempts: 1,
  arkoseDailyCap: 3,
  maxRounds: 4
}

/**
 * Solver codes that mean "this solver can't work right now", so it is skipped
 * for the rest of the run instead of retried.
 */
export const SOLVER_DEAD_CODES = new Set([
  'missingApiKey',
  'invalidApiKey',
  'insufficientCredits',
  'accountSuspended',
  'notInstalled'
])

export type CaptchaPlan =
  | { solver: CaptchaSolverName; reason: string }
  | {
      solver: null
      reason: 'needsPerson' | 'noSolverConfigured' | 'arkoseCapReached' | 'attemptsUsed' | 'roundsUsed'
      detail: string
    }
