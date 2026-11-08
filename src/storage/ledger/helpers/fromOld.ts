import type { LedgerEntry } from '../types'

type Old = Record<string, unknown>

const str = (v: unknown): string | null => (typeof v === 'string' && v !== '' ? v : null)

export function fromOldLine(store: string, old: Old): LedgerEntry | null {
  const at = str(old.at)
  if (!at) return null
  if (store === 'billingAnswers') {
    const status = typeof old.status === 'number' ? old.status : null
    return { kind: 'providerAnswer', at, provider: str(old.provider), amount: status, unit: 'httpStatus', outcome: old.ok ? 'ok' : old.outOfCredit ? 'outOfCredit' : 'failed', detail: str(old.said) }
  }
  if (store === 'proxyTraffic') {
    return { kind: 'proxyTraffic', at, account: str(old.account), amount: typeof old.mb === 'number' ? old.mb : 0, unit: 'MB', outcome: 'used', detail: str(old.run) }
  }
  if (store === 'launchResets') {
    return { kind: 'launchReset', at, account: str(old.account), outcome: 'reset', detail: str(old.reason) }
  }
  if (store === 'captchaAttempts') {
    return { kind: 'captchaAttempt', at, account: str(old.accountId), provider: str(old.solver), subject: str(old.kind), amount: old.accepted === true ? 1 : old.accepted === false ? 0 : null, outcome: old.solved ? 'solved' : 'unsolved', code: str(old.code), detail: str(old.detail) }
  }
  return null
}
