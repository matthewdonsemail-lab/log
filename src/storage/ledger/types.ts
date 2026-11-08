export type LedgerKind = 'providerAnswer' | 'proxyTraffic' | 'launchReset' | 'captchaAttempt'

export interface LedgerEntry {
  kind: LedgerKind
  at: string
  outcome: string
  provider?: string | null
  platform?: string | null
  account?: string | null
  subject?: string | null
  amount?: number | null
  unit?: string | null
  code?: string | null
  detail?: string | null
}

export interface LedgerRow extends LedgerEntry {
  seq: number
}

export interface LedgerFilter {
  account?: string
  provider?: string
  since?: string
  limit?: number
}

export interface OldLedgerFile {
  store: string
  env: string
  homePath: readonly string[]
}

export const OLD_LEDGER_FILES: readonly OldLedgerFile[] = [
  { store: 'billingAnswers', env: 'LOG_BILLING_ANSWERS', homePath: ['billing', 'answers.jsonl'] },
  { store: 'proxyTraffic', env: 'LOG_PROXY_TRAFFIC', homePath: ['proxyTraffic.jsonl'] },
  { store: 'launchResets', env: 'LOG_LAUNCH_RESETS', homePath: ['launchResets.jsonl'] },
  { store: 'captchaAttempts', env: 'LOG_CAPTCHA_LEDGER', homePath: ['captcha', 'attempts.jsonl'] },
]
