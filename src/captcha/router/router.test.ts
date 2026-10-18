import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { appendAttempt, countArkoseToday, DEFAULT_CAPTCHA_POLICY, planNextSolver, readAttempts, solverAvailability } from './index'
import type { CaptchaAttempt, CaptchaDetection } from './index'

const both = { captchaKraken: true, twoCaptcha: true }
const recaptcha: CaptchaDetection = { kind: 'recaptcha', enterprise: true }
const arkose: CaptchaDetection = { kind: 'arkose' }
const attempt = (solver: CaptchaAttempt['solver'], extra: Partial<CaptchaAttempt> = {}): CaptchaAttempt => ({
  at: '2026-10-18T06:00:00.000Z',
  accountId: 'fbPacer',
  kind: 'recaptcha',
  solver,
  solved: false,
  accepted: false,
  ...extra
})

describe('planNextSolver', () => {
  test('reCAPTCHA: CaptchaKraken twice, then 2Captcha, then out', () => {
    const p = DEFAULT_CAPTCHA_POLICY
    expect(planNextSolver(recaptcha, [], both, p).solver).toBe('captchaKraken')
    expect(planNextSolver(recaptcha, [attempt('captchaKraken')], both, p).solver).toBe('captchaKraken')
    expect(planNextSolver(recaptcha, [attempt('captchaKraken'), attempt('captchaKraken')], both, p).solver).toBe('twoCaptcha')
    const spent = [attempt('captchaKraken'), attempt('captchaKraken'), attempt('twoCaptcha')]
    expect(planNextSolver(recaptcha, spent, both, p)).toMatchObject({ solver: null, reason: 'attemptsUsed' })
  })

  test('a dead CaptchaKraken key skips straight to 2Captcha', () => {
    const plan = planNextSolver(recaptcha, [attempt('captchaKraken', { code: 'insufficientCredits' })], both, DEFAULT_CAPTCHA_POLICY)
    expect(plan.solver).toBe('twoCaptcha')
  })

  test('reCAPTCHA with only 2Captcha configured goes to 2Captcha', () => {
    expect(planNextSolver(recaptcha, [], { captchaKraken: false, twoCaptcha: true }, DEFAULT_CAPTCHA_POLICY).solver).toBe('twoCaptcha')
  })

  test('Arkose never goes to CaptchaKraken, and is capped per day', () => {
    expect(planNextSolver(arkose, [], both, DEFAULT_CAPTCHA_POLICY).solver).toBe('twoCaptcha')
    expect(planNextSolver(arkose, [], { captchaKraken: true, twoCaptcha: false }, DEFAULT_CAPTCHA_POLICY)).toMatchObject({
      solver: null,
      reason: 'noSolverConfigured'
    })
    expect(planNextSolver(arkose, [], both, DEFAULT_CAPTCHA_POLICY, 3)).toMatchObject({ solver: null, reason: 'arkoseCapReached' })
  })

  test("Facebook's own challenge and unknown captchas go to a person", () => {
    expect(planNextSolver({ kind: 'facebookChallenge' }, [], both, DEFAULT_CAPTCHA_POLICY)).toMatchObject({ solver: null, reason: 'noSolverForKind' })
    expect(planNextSolver({ kind: 'unknown' }, [], both, DEFAULT_CAPTCHA_POLICY)).toMatchObject({ solver: null, reason: 'noSolverForKind' })
  })

  test('no keys at all says which env vars to set', () => {
    const plan = planNextSolver(recaptcha, [], { captchaKraken: false, twoCaptcha: false }, DEFAULT_CAPTCHA_POLICY)
    expect(plan).toMatchObject({ solver: null, reason: 'noSolverConfigured' })
  })

  test('the round cap stops everything', () => {
    const many = Array.from({ length: 4 }, () => attempt('captchaKraken'))
    expect(planNextSolver(recaptcha, many, both, DEFAULT_CAPTCHA_POLICY)).toMatchObject({ solver: null, reason: 'roundsUsed' })
  })
})

describe('ledger', () => {
  test('appends and reads JSON lines, skipping torn ones', () => {
    const path = join(mkdtempSync(join(tmpdir(), 'logCliLedger')), 'attempts.jsonl')
    appendAttempt(attempt('twoCaptcha', { kind: 'arkose' }), path)
    appendAttempt(attempt('captchaKraken'), path)
    require('node:fs').appendFileSync(path, '{"torn":')
    const rows = readAttempts(path)
    expect(rows).toHaveLength(2)
    expect(countArkoseToday(rows, 'fbPacer', new Date('2026-10-18T12:00:00Z'))).toBe(1)
    expect(countArkoseToday(rows, 'fbPacer', new Date('2026-10-19T12:00:00Z'))).toBe(0)
  })

  test('solverAvailability reads keys from env, never the network', () => {
    const home = mkdtempSync(join(tmpdir(), 'logCliHome'))
    expect(solverAvailability({}, home)).toEqual({ captchaKraken: false, twoCaptcha: false })
    expect(solverAvailability({ CAPTCHA_KRAKEN_API_KEY: 'ck_live_x', TWOCAPTCHA_API_KEY: 'y' }, home)).toEqual(both)
  })
})
