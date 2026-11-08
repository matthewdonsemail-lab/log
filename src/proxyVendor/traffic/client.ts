import { defaultDbPath } from '../../storage/schema'
import { appendLedger, ledgerRows } from '../../storage/ledger'
import { bytefulCredentials, getResidentialSummary } from '../byteful/client'
import { getProxyAccount, twoCaptchaCredentials } from '../twoCaptcha/client'
import { vendorOfProxy } from '../vendor/helpers/vendorOfProxy'
import type { TrafficEntry, TrafficMeter } from './types'

export const trafficLedgerPath = (env: Record<string, string | undefined> = process.env) => env.LOG_PROXY_TRAFFIC || defaultDbPath(env)

export function readTrafficLedger(path = trafficLedgerPath()): TrafficEntry[] {
  return ledgerRows('proxyTraffic', {}, path).map((r) => ({ at: r.at, account: r.account ?? '', run: r.detail ?? '', mb: r.amount ?? 0 }))
}

export function recordTraffic(entry: TrafficEntry, path = trafficLedgerPath()): void {
  appendLedger({ kind: 'proxyTraffic', at: entry.at, account: entry.account, amount: entry.mb, unit: 'MB', outcome: 'used', detail: entry.run }, path)
}

export function twoCaptchaMeter(env: Record<string, string | undefined> = process.env): TrafficMeter {
  return async () => {
    const creds = twoCaptchaCredentials(env)
    const apiKey = 'apiKey' in creds ? creds.apiKey : (env['2CAPTCHA_API_KEY'] || env.TWOCAPTCHA_API_KEY || '').trim()
    if (!apiKey) throw Object.assign(new Error('2CAPTCHA_API_KEY is not set: the run\'s proxy traffic can\'t be measured'), { code: 'trafficUnmeasured' })
    return (await getProxyAccount(apiKey)).usedFlow
  }
}

export function bytefulMeter(env: Record<string, string | undefined> = process.env): TrafficMeter {
  return async () => {
    const creds = bytefulCredentials(env)
    if ('missing' in creds) throw Object.assign(new Error(`${creds.missing} is not set: the run's proxy traffic can't be measured`), { code: 'trafficUnmeasured' })
    return (await getResidentialSummary(creds)).bytesUsed / 1_000_000
  }
}

export function meterForProxy(proxy: string | null | undefined, env: Record<string, string | undefined> = process.env): TrafficMeter | null {
  const vendor = vendorOfProxy(proxy)
  if (!vendor || vendor.billing !== 'traffic') return null
  return vendor.vendor === 'byteful' ? bytefulMeter(env) : twoCaptchaMeter(env)
}
