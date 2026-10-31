import { exchangeTimeline } from './exchangeLines'
import { MAX_PAGE_TEXT_CHARS, MAX_STATE_CHARS, SOCKET_FRAMES_KEPT } from '../types'
import type { EarlierStep, GoalSoFar, StepAccount, StepBundle, StepExchange, StepTaken } from '../types'

export interface CollateInput {
  goal: string | null
  account: StepAccount
  taken: StepTaken
  pageState: string | null
  pageText: string
  exchanges: StepExchange[]
  earlier: EarlierStep[]
  since?: string | null
}

export function savedOf(exchanges: StepExchange[]): string[] {
  return exchanges.filter((e) => e.kind === 'api' && /mutation$/i.test(e.name) && e.status >= 200 && e.status < 300 && !e.errors.length).map((e) => e.name)
}

export function goalSoFarOf(earlier: EarlierStep[], exchanges: StepExchange[], since: string | null = null): GoalSoFar {
  const steps = earlier.filter((s) => s.forGoal)
  const saved: Record<string, number> = {}
  for (const name of [...steps.flatMap((s) => s.saved), ...savedOf(exchanges)]) saved[name] = (saved[name] ?? 0) + 1
  return { since, steps: steps.length + 1, saved }
}

export function bundleOf(input: CollateInput): StepBundle {
  const newRequests = [...new Set(input.exchanges.filter((e) => !e.known).map((e) => e.name))]
  const bundle: StepBundle = {
    goal: input.goal,
    account: input.account,
    taken: input.taken,
    pageState: input.pageState,
    pageText: input.pageText.length > MAX_PAGE_TEXT_CHARS ? `${input.pageText.slice(0, MAX_PAGE_TEXT_CHARS)}… (${input.pageText.length} chars)` : input.pageText,
    exchanges: input.exchanges,
    newRequests,
    earlier: input.earlier,
    goalSoFar: goalSoFarOf(input.earlier, input.exchanges, input.since ?? null)
  }
  return fitBundle(bundle)
}

export function bundleChars(bundle: StepBundle): number {
  return JSON.stringify(bundle).length
}

export function foldSocketFrames(exchanges: readonly StepExchange[], keep = SOCKET_FRAMES_KEPT): StepExchange[] {
  const seen = new Map<string, number>()
  const out: StepExchange[] = []
  for (const e of exchanges) {
    if (e.kind !== 'socket') {
      out.push(e)
      continue
    }
    const key = `${e.method} ${e.name}`
    const count = (seen.get(key) ?? 0) + 1
    seen.set(key, count)
    if (count <= keep) out.push(e)
  }
  for (const [key, count] of seen) {
    if (count <= keep) continue
    const first = exchanges.find((e) => e.kind === 'socket' && `${e.method} ${e.name}` === key)!
    out.push({ ...first, answer: `(${count - keep} more ${key} frames in this step, left out to fit)`, sent: null })
  }
  return out
}

export function fitBundle(bundle: StepBundle, limit = MAX_STATE_CHARS): StepBundle {
  if (bundle.exchanges.some((e) => e.kind === 'socket')) bundle = { ...bundle, exchanges: foldSocketFrames(bundle.exchanges) }
  if (bundleChars(bundle) <= limit) return bundle
  const size = (e: StepExchange) => JSON.stringify(e.answer).length
  let exchanges = bundle.exchanges.slice()
  let fitted = { ...bundle, exchanges }
  for (const index of exchanges.map((e, i) => ({ e, i })).filter(({ e }) => e.kind === 'api').sort((a, b) => size(b.e) - size(a.e)).map(({ i }) => i)) {
    if (bundleChars(fitted) <= limit) return fitted
    exchanges = exchanges.map((e, i) => (i === index ? { ...e, answer: `(answer left out to fit: ${size(e)} chars)` } : e))
    fitted = { ...bundle, exchanges }
  }
  if (bundleChars(fitted) <= limit) return fitted
  exchanges = exchanges.map((e) => ({ ...e, sent: typeof e.sent === 'object' && e.sent ? '(sent left out to fit)' : e.sent }))
  fitted = { ...fitted, exchanges }
  while (bundleChars(fitted) > limit && fitted.exchanges.length) fitted = { ...fitted, exchanges: fitted.exchanges.slice(0, Math.floor(fitted.exchanges.length * 0.8)) }
  return fitted
}

export function stateOf(bundle: StepBundle): Record<string, unknown> {
  return {
    whatThisIs: 'One step of an inspect session: an agent drives a browser on a real account a step at a time to learn how the platform works. Read the internal API calls the step triggered together with the page, the account, what we did and the earlier steps. The goal is judged across the whole session since it was set: goalSoFar counts what the platform saved (its mutations that answered OK) in this step and every earlier step for the goal.',
    goal: bundle.goal ?? '(none given)',
    account: bundle.account,
    whatWeDid: bundle.taken,
    knownPageState: bundle.pageState ?? '(none: this page is not a known state)',
    internalApiCallsNeverDocumentedBefore: bundle.newRequests,
    internalApiTimeline: exchangeTimeline(bundle.exchanges, 12, 24),
    exchanges: bundle.exchanges,
    pageText: bundle.pageText,
    earlierSteps: bundle.earlier,
    goalSoFar: bundle.goalSoFar
  }
}
