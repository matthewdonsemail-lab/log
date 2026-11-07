import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { answersFile, OUT_OF_CREDIT_WORDS, PROVIDER_INFO, PROVIDERS } from '../types'
import type { Provider, ProviderAnswer } from '../types'

export function isOutOfCredit(status: number, said: string): boolean {
  return status === 402 || OUT_OF_CREDIT_WORDS.test(said)
}

export function noteProviderAnswer(provider: Provider, status: number, said = '', file = answersFile(), now = new Date()): ProviderAnswer {
  const ok = status >= 200 && status < 300
  const answer: ProviderAnswer = { provider, at: now.toISOString(), status, ok, outOfCredit: !ok && isOutOfCredit(status, said), said: ok ? '' : said.replace(/\s+/g, ' ').slice(0, 300) }
  try {
    mkdirSync(dirname(file), { recursive: true })
    appendFileSync(file, `${JSON.stringify(answer)}\n`)
  } catch {
  }
  return answer
}

export function lastAnswers(file = answersFile()): Map<Provider, ProviderAnswer> {
  const last = new Map<Provider, ProviderAnswer>()
  if (!existsSync(file)) return last
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/).slice(-5000)) {
    if (!line.trim()) continue
    try {
      const answer = JSON.parse(line) as ProviderAnswer
      if ((PROVIDERS as readonly string[]).includes(answer.provider)) last.set(answer.provider, answer)
    } catch {
    }
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
