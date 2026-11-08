import { appendLedger, ledgerRows } from '../../../storage/ledger'
import { answersFile, OUT_OF_CREDIT_WORDS, PROVIDER_INFO, PROVIDERS } from '../types'
import type { Provider, ProviderAnswer } from '../types'

export function isOutOfCredit(status: number, said: string): boolean {
  return status === 402 || OUT_OF_CREDIT_WORDS.test(said)
}

export function noteProviderAnswer(provider: Provider, status: number, said = '', file = answersFile(), now = new Date()): ProviderAnswer {
  const ok = status >= 200 && status < 300
  const answer: ProviderAnswer = { provider, at: now.toISOString(), status, ok, outOfCredit: !ok && isOutOfCredit(status, said), said: ok ? '' : said.replace(/\s+/g, ' ').slice(0, 300) }
  try {
    appendLedger({ kind: 'providerAnswer', at: answer.at, provider, amount: status, unit: 'httpStatus', outcome: ok ? 'ok' : answer.outOfCredit ? 'outOfCredit' : 'failed', detail: answer.said || null }, file)
  } catch {
  }
  return answer
}

export function lastAnswers(file = answersFile()): Map<Provider, ProviderAnswer> {
  const last = new Map<Provider, ProviderAnswer>()
  for (const row of ledgerRows('providerAnswer', { limit: 5000 }, file)) {
    if (!(PROVIDERS as readonly string[]).includes(row.provider ?? '')) continue
    const status = row.amount ?? 0
    last.set(row.provider as Provider, { provider: row.provider as Provider, at: row.at, status, ok: row.outcome === 'ok', outOfCredit: row.outcome === 'outOfCredit', said: row.detail ?? '' })
  }
  return last
}

export function outOfCreditNote(provider: Provider): string {
  const info = PROVIDER_INFO[provider]
  return `${info.label} answered that it is out of credit, so this failed for want of money, not a bug: top it up at ${info.topUp}, then run it again (log balance shows every provider)`
}

export function withCreditNote(provider: Provider, status: number, said: string): string {
  const answer = noteProviderAnswer(provider, status, said)
  return answer.outOfCredit ? `${said} (${outOfCreditNote(provider)})` : said
}
