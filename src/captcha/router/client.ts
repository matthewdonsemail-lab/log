/**
 * The captcha ledger and solver availability: the only I/O in captcha/router.
 *
 * Every solve attempt is one JSON line in `~/.logCli/captcha/attempts.jsonl`
 * (`LOG_CAPTCHA_LEDGER` overrides the path), so after real runs we can see which
 * solver actually gets accounts through, and reorder.
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import type { CaptchaAttempt, SolverAvailability } from './types'

export function ledgerPath(env: Record<string, string | undefined> = process.env): string {
  return env.LOG_CAPTCHA_LEDGER || join(homedir(), '.logCli', 'captcha', 'attempts.jsonl')
}

export function appendAttempt(attempt: CaptchaAttempt, path = ledgerPath()): void {
  mkdirSync(dirname(path), { recursive: true })
  appendFileSync(path, `${JSON.stringify(attempt)}\n`)
}

export function readAttempts(path = ledgerPath()): CaptchaAttempt[] {
  if (!existsSync(path)) return []
  const out: CaptchaAttempt[] = []
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    if (!line.trim()) continue
    try {
      out.push(JSON.parse(line) as CaptchaAttempt)
    } catch {
      // A torn line from a crash is skipped, never fatal.
    }
  }
  return out
}

/**
 * Which solvers have a key. CaptchaKraken also reads
 * `~/.captchakraken/credentials` (written by its MCP's `create_api_key`).
 */
export function solverAvailability(
  env: Record<string, string | undefined> = process.env,
  home: string = homedir()
): SolverAvailability {
  const krakenFile = join(env.CAPTCHA_KRAKEN_STATE_DIR || join(home, '.captchakraken'), 'credentials')
  return {
    captchaKraken: Boolean(env.CAPTCHA_KRAKEN_API_KEY || env.VLLM_API_KEY || existsSync(krakenFile)),
    twoCaptcha: Boolean(env.TWOCAPTCHA_API_KEY)
  }
}
