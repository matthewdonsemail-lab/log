import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { getProxyAccount, twoCaptchaCredentials } from '../twoCaptcha/client'
import type { TrafficEntry, TrafficMeter } from './types'

/** `~/.logCli/proxyTraffic.jsonl`, or LOG_PROXY_TRAFFIC. */
export const trafficLedgerPath = (env: Record<string, string | undefined> = process.env) => env.LOG_PROXY_TRAFFIC || join(homedir(), '.logCli', 'proxyTraffic.jsonl')

export function readTrafficLedger(path = trafficLedgerPath()): TrafficEntry[] {
  if (!existsSync(path)) return []
  return readFileSync(path, 'utf8')
    .split('\n')
    .filter((l) => l.trim())
    .flatMap((l) => {
      try {
        return [JSON.parse(l) as TrafficEntry]
      } catch {
        return []
      }
    })
}

export function recordTraffic(entry: TrafficEntry, path = trafficLedgerPath()): void {
  mkdirSync(dirname(path), { recursive: true })
  appendFileSync(path, `${JSON.stringify(entry)}\n`)
}

/** 2Captcha's used-traffic counter (MB), from the proxy account; throws when it can't be read. */
export function twoCaptchaMeter(env: Record<string, string | undefined> = process.env): TrafficMeter {
  return async () => {
    const creds = twoCaptchaCredentials(env)
    const apiKey = 'apiKey' in creds ? creds.apiKey : (env['2CAPTCHA_API_KEY'] || env.TWOCAPTCHA_API_KEY || '').trim()
    if (!apiKey) throw Object.assign(new Error('2CAPTCHA_API_KEY is not set: the run\'s proxy traffic can\'t be measured'), { code: 'trafficUnmeasured' })
    return (await getProxyAccount(apiKey)).usedFlow
  }
}
