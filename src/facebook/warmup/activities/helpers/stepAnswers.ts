import { stepExchangesAt } from '../../../../subq/stepReading/helpers/stepExchanges'
import type { StepExchange } from '../../../../subq/stepReading/types'
import type { ActivityStep, AnswerCheck, AnswerExpect } from '../types'

export const ANSWER_WAIT_MS = 15_000

export const answersAt = stepExchangesAt

export function answerWaitOf(step: ActivityStep): { name: string; ms: number } | undefined {
  const first = step.expect?.answers?.[0]
  return first ? { name: first.call, ms: first.waitMs ?? ANSWER_WAIT_MS } : undefined
}

export function valueAt(value: unknown, path: string): unknown {
  let at: unknown = value
  for (const key of path.split('.')) {
    if (at === null || typeof at !== 'object') return undefined
    at = (at as Record<string, unknown>)[key]
  }
  return at
}

const shown = (value: unknown) => (value === undefined ? 'nothing' : JSON.stringify(value))

function checkOne(check: AnswerCheck, exchange: StepExchange): string | null {
  const got = valueAt(exchange.answer, check.answer)
  const want = check.sent !== undefined ? valueAt(exchange.sent, check.sent) : check.is
  if (want === undefined) return `${exchange.name}: we sent no ${check.sent} to check ${check.answer} against`
  if (got !== want) return `${exchange.name} answered ${check.answer} = ${shown(got)}, not ${shown(want)}${check.sent ? ` (what we sent as ${check.sent})` : ''}`
  return null
}

export function answerIssue(expect: AnswerExpect, exchanges: StepExchange[]): string | null {
  const calls = exchanges.filter((e) => e.kind === 'api' && e.name === expect.call)
  if (!calls.length) return `Facebook never answered ${expect.call} in this step (rule 73: its answer decides, not the screen)`
  const last = calls.at(-1)!
  if (last.status < 200 || last.status >= 300) return `${expect.call} answered ${last.status}`
  if (last.errors.length) return `${expect.call} answered with errors: ${last.errors.join('; ')}`
  for (const check of expect.says) {
    const issue = checkOne(check, last)
    if (issue) return issue
  }
  return null
}
