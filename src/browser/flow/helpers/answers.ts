import type { StepExchange } from '../../../subq/stepReading/types'
import type { AnswerAccount, AnswerCheck, AnswerExpect, AnswerIssue } from '../types'

export const ANSWER_WAIT_MS = 15_000

export function valueAt(value: unknown, path: string): unknown {
  let at: unknown = value
  for (const key of path.split('.')) {
    if (at === null || typeof at !== 'object') return undefined
    at = (at as Record<string, unknown>)[key]
  }
  return at
}

export function answerWait(answers: readonly AnswerExpect[] | undefined): { name: string; ms: number } | undefined {
  const first = answers?.find((a) => !a.call.startsWith('page '))
  return first ? { name: first.call, ms: first.waitMs ?? ANSWER_WAIT_MS } : undefined
}

const shown = (value: unknown) => (value === undefined ? 'nothing' : JSON.stringify(value))

function homeOf(check: AnswerCheck, account: AnswerAccount): { want: string; matches: (got: unknown) => boolean } | null {
  if (check.home === 'uid' && account.uid) return { want: account.uid, matches: (got) => String(got) === account.uid }
  if (check.home === 'country' && account.homeCountry) return { want: account.homeCountry.toUpperCase(), matches: (got) => typeof got === 'string' && got.toUpperCase() === account.homeCountry!.toUpperCase() }
  if (check.home === 'city' && account.homeCity) return { want: account.homeCity, matches: (got) => typeof got === 'string' && got.toLowerCase().includes(account.homeCity!.toLowerCase()) }
  return null
}

export function answerAt(answer: unknown, path: string): unknown {
  const direct = valueAt(answer, path)
  return direct === undefined && answer && typeof answer === 'object' && 'first' in answer ? valueAt((answer as { first: unknown }).first, path) : direct
}

function checkOne(check: AnswerCheck, exchange: StepExchange, account: AnswerAccount): AnswerIssue | null {
  const code = check.code ?? 'answerNotAsExpected'
  const got = answerAt(exchange.answer, check.answer)
  if (check.present) return got === undefined || got === null ? { code, text: `${exchange.name} answered no ${check.answer}` } : null
  if (check.home) {
    const home = homeOf(check, account)
    if (!home) return null
    return home.matches(got) ? null : { code, text: `${exchange.name} answered ${check.answer} = ${shown(got)}, not the account's ${check.home === 'uid' ? 'id' : `home ${check.home}`} (${home.want})` }
  }
  const want = check.sent !== undefined ? valueAt(exchange.sent, check.sent) : check.is
  if (want === undefined) return { code, text: `${exchange.name}: we sent no ${check.sent} to check ${check.answer} against` }
  if (got !== want) return { code, text: `${exchange.name} answered ${check.answer} = ${shown(got)}, not ${shown(want)}${check.sent ? ` (what we sent as ${check.sent})` : ''}` }
  return null
}

export function answerIssueOf(expect: AnswerExpect, exchanges: readonly StepExchange[], account: AnswerAccount = {}): AnswerIssue | null {
  const calls = exchanges.filter((e) => e.name === expect.call)
  if (!calls.length) return { code: 'answerNotAsExpected', text: `Facebook never answered ${expect.call} in this step (rule 73: its answer decides, not the screen)` }
  const last = calls.filter((e) => e.status >= 200 && e.status < 300).at(-1)
  if (!last) return { code: 'answerNotAsExpected', text: `${expect.call} answered ${calls.map((e) => e.status).join(', ')}, never 2xx` }
  if (last.errors.length) return { code: 'answerNotAsExpected', text: `${expect.call} answered with errors: ${last.errors.join('; ')}` }
  for (const check of expect.says) {
    const issue = checkOne(check, last, account)
    if (issue) return issue
  }
  return null
}

export function answersIssue(answers: readonly AnswerExpect[] | undefined, exchanges: readonly StepExchange[], account: AnswerAccount = {}): AnswerIssue | null {
  for (const expect of answers ?? []) {
    const issue = answerIssueOf(expect, exchanges, account)
    if (issue) return issue
  }
  return null
}
