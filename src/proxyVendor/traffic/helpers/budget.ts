import type { TrafficBudget, TrafficEntry } from '../types'

/** One GB a day per account, matt's figure (2026-10-20). */
export const DEFAULT_TRAFFIC_BUDGET_MB = 1024
const DAY_MS = 24 * 60 * 60 * 1000

/** The account's use in the 24 hours before `now`, and what is left of its budget. Pure. */
export function trafficBudget(entries: TrafficEntry[], account: string, now: Date, budgetMb = DEFAULT_TRAFFIC_BUDGET_MB): TrafficBudget {
  const since = now.getTime() - DAY_MS
  const usedMb = Math.round(entries.filter((e) => e.account === account && Date.parse(e.at) > since).reduce((sum, e) => sum + e.mb, 0) * 100) / 100
  return { budgetMb, usedMb, leftMb: Math.round(Math.max(0, budgetMb - usedMb) * 100) / 100 }
}
