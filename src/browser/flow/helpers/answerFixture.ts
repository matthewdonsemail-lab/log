import type { StepExchange } from '../../../subq/stepReading/types'
import type { AnswerAccount, AnswerCheck, AnswerExpect } from '../types'

function put(target: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.')
  let at = target
  for (const key of keys.slice(0, -1)) {
    if (!at[key] || typeof at[key] !== 'object') at[key] = {}
    at = at[key] as Record<string, unknown>
  }
  at[keys.at(-1)!] = value
}

function valueFor(check: AnswerCheck, account: AnswerAccount): unknown {
  if (check.home === 'uid') return account.uid ?? 'uid'
  if (check.home === 'country') return account.homeCountry ?? 'US'
  if (check.home === 'city') return account.homeCity ?? 'Home'
  if (check.sent !== undefined) return 'sent'
  if (check.present) return check.answer.endsWith('display_name') ? (account.homeCity ?? 'Home') : 'present'
  return check.is ?? null
}

export function answeringFixture(answers: readonly AnswerExpect[] | undefined, account: AnswerAccount = {}): StepExchange[] {
  return (answers ?? []).map((expect, i) => {
    const answer: Record<string, unknown> = {}
    const sent: Record<string, unknown> = {}
    for (const check of expect.says) {
      put(answer, check.answer, valueFor(check, account))
      if (check.sent !== undefined) put(sent, check.sent, 'sent')
    }
    const page = expect.call.startsWith('page ')
    return { offsetMs: i * 100, kind: page ? 'document' : 'api', name: expect.call, method: page ? 'GET' : 'POST', host: 'www.facebook.com', path: page ? expect.call.slice(5) : '/api/graphql/', status: 200, ms: 100, sent, answer, errors: [], known: true }
  })
}
