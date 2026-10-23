import type { StepBundle, StepDecision } from '../types'

export function decisionOf(bundle: StepBundle): StepDecision {
  if (bundle.pageState) return { decided: true, by: 'pageState', state: bundle.pageState }
  const why: string[] = []
  if (!bundle.taken.ok) why.push(`the step failed: ${bundle.taken.error ?? 'no reason given'}`)
  if (bundle.newRequests.length) why.push(`internal API calls never documented before: ${bundle.newRequests.join(', ')}`)
  const withErrors = bundle.exchanges.filter((e) => e.errors.length || e.status >= 400)
  if (withErrors.length) why.push(`answers with errors: ${withErrors.map((e) => `${e.name} (${e.status}${e.errors.length ? `, ${e.errors[0]}` : ''})`).join(', ')}`)
  if (!why.length && bundle.taken.ok && !bundle.exchanges.length) return { decided: true, by: 'nothingHappened', state: 'noChange' }
  why.push(bundle.goal ? 'no known state confirms whether the goal was met' : 'no known state names this page')
  return { decided: false, why }
}
