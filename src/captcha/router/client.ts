import { existsSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { appendLedger, ledgerRows } from '../../storage/ledger'
import { defaultDbPath } from '../../storage/schema'
import type { CaptchaAttempt, SolverAvailability } from './types'

export function ledgerPath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_CAPTCHA_LEDGER || defaultDbPath(env)
}

export function appendAttempt(attempt: CaptchaAttempt, path = ledgerPath()): void {
  appendLedger({ kind: 'captchaAttempt', at: attempt.at, account: attempt.accountId, provider: attempt.solver, subject: attempt.kind, amount: attempt.accepted === null ? null : attempt.accepted ? 1 : 0, outcome: attempt.solved ? 'solved' : 'unsolved', code: attempt.code ?? null, detail: attempt.detail ?? null }, path)
}

export function readAttempts(path = ledgerPath()): CaptchaAttempt[] {
  return ledgerRows('captchaAttempt', {}, path).map((r) => ({
    at: r.at,
    accountId: r.account ?? '',
    kind: r.subject as CaptchaAttempt['kind'],
    solver: r.provider as CaptchaAttempt['solver'],
    solved: r.outcome === 'solved',
    accepted: r.amount === null || r.amount === undefined ? null : r.amount === 1,
    ...(r.code ? { code: r.code as CaptchaAttempt['code'] } : {}),
    ...(r.detail ? { detail: r.detail } : {}),
  }))
}

export function solverAvailability(
  env: Record<string, string | undefined> = process.env,
  home: string = homedir()
): SolverAvailability {
  const krakenFile = join(env.CAPTCHA_KRAKEN_STATE_DIR || join(home, '.captchakraken'), 'credentials')
  return {
    captchaKraken: Boolean(env.CAPTCHA_KRAKEN_API_KEY || env.VLLM_API_KEY || existsSync(krakenFile)),
    twoCaptcha: Boolean(env.TWOCAPTCHA_API_KEY || env["2CAPTCHA_API_KEY"])
  }
}
