import { SOLVER_DEAD_CODES } from '../types'
import type { CaptchaAttempt, CaptchaDetection, CaptchaPlan, CaptchaPolicy, CaptchaSolverName, SolverAvailability } from '../types'

/**
 * Pick the next solver for the captcha on screen. Pure.
 *
 * - reCAPTCHA: CaptchaKraken (solves in our own browser, on our own IP), then
 *   a 2Captcha token.
 * - Arkose: 2Captcha only, capped per account per day.
 * - Facebook's own challenge, or anything unrecognised: a person.
 *
 * `attempts` are this run's attempts, oldest first. `arkoseToday` counts this
 * account's 2Captcha Arkose attempts today (from the ledger).
 */
export function planNextSolver(
  detection: CaptchaDetection,
  attempts: CaptchaAttempt[],
  availability: SolverAvailability,
  policy: CaptchaPolicy,
  arkoseToday = 0
): CaptchaPlan {
  if (attempts.length >= policy.maxRounds) {
    return { solver: null, reason: 'roundsUsed', detail: `${attempts.length} captcha rounds in this run` }
  }
  if (detection.kind === 'facebookChallenge' || detection.kind === 'unknown') {
    return {
      solver: null,
      reason: 'noSolverForKind',
      detail: detection.kind === 'facebookChallenge' ? "Facebook's own challenge (no solver can do it)" : 'unrecognised captcha'
    }
  }

  const tries = (solver: CaptchaSolverName) => attempts.filter((a) => a.solver === solver).length
  const usable = (solver: CaptchaSolverName) =>
    availability[solver] && !attempts.some((a) => a.solver === solver && a.code && SOLVER_DEAD_CODES.has(a.code))

  if (detection.kind === 'recaptcha' || detection.kind === 'textImage') {
    // A text image goes the same way: CaptchaKraken reads it on the page, 2Captcha's image solver after.
    const label = detection.kind === 'recaptcha' ? 'reCAPTCHA' : 'text image'
    if (usable('captchaKraken') && tries('captchaKraken') < policy.krakenAttempts) {
      return { solver: 'captchaKraken', reason: `${label}, CaptchaKraken try ${tries('captchaKraken') + 1}/${policy.krakenAttempts}` }
    }
    if (usable('twoCaptcha') && tries('twoCaptcha') < policy.twoCaptchaAttempts) {
      return { solver: 'twoCaptcha', reason: detection.kind === 'recaptcha' ? 'reCAPTCHA, 2Captcha token fallback' : 'text image, 2Captcha image fallback' }
    }
  } else {
    // arkose
    if (!availability.twoCaptcha) {
      return { solver: null, reason: 'noSolverConfigured', detail: 'Arkose needs 2Captcha (2CAPTCHA_API_KEY); CaptchaKraken does not support it' }
    }
    if (arkoseToday >= policy.arkoseDailyCap) {
      return { solver: null, reason: 'arkoseCapReached', detail: `${arkoseToday}/${policy.arkoseDailyCap} Arkose solves today on this account` }
    }
    if (usable('twoCaptcha') && tries('twoCaptcha') < policy.twoCaptchaAttempts) {
      return { solver: 'twoCaptcha', reason: 'Arkose, 2Captcha only' }
    }
  }

  if (!availability.captchaKraken && !availability.twoCaptcha) {
    return { solver: null, reason: 'noSolverConfigured', detail: 'set CAPTCHA_KRAKEN_API_KEY and/or 2CAPTCHA_API_KEY in .env.local' }
  }
  return { solver: null, reason: 'attemptsUsed', detail: `every solver tried: ${attempts.map((a) => `${a.solver}(${a.code ?? 'failed'})`).join(', ')}` }
}
