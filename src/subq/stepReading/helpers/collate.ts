import { exchangeTimeline } from './exchangeLines'
import { MAX_PAGE_TEXT_CHARS, MAX_STATE_CHARS } from '../types'
import type { EarlierStep, StepAccount, StepBundle, StepExchange, StepTaken } from '../types'

export interface CollateInput {
  goal: string | null
  account: StepAccount
  taken: StepTaken
  pageState: string | null
  pageText: string
  exchanges: StepExchange[]
  earlier: EarlierStep[]
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
    earlier: input.earlier
  }
  return fitBundle(bundle)
}

export function bundleChars(bundle: StepBundle): number {
  return JSON.stringify(bundle).length
}

export function fitBundle(bundle: StepBundle, limit = MAX_STATE_CHARS): StepBundle {
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
    whatThisIs: 'One step of an inspect session: an agent drives a browser on a real account a step at a time to learn how the platform works. Read the internal API calls the step triggered together with the page, the account, what we did and the earlier steps.',
    goal: bundle.goal ?? '(none given)',
    account: bundle.account,
    whatWeDid: bundle.taken,
    knownPageState: bundle.pageState ?? '(none: this page is not a known state)',
    internalApiCallsNeverDocumentedBefore: bundle.newRequests,
    internalApiTimeline: exchangeTimeline(bundle.exchanges, 12, 24),
    exchanges: bundle.exchanges,
    pageText: bundle.pageText,
    earlierSteps: bundle.earlier
  }
}
