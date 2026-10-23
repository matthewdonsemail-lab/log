import type { TrafficBudget, TrafficEntry } from '../types'

export const DEFAULT_TRAFFIC_BUDGET_MB = 1024
const DAY_MS = 24 * 60 * 60 * 1000

export function trafficBudget(entries: TrafficEntry[], account: string, now: Date, budgetMb = DEFAULT_TRAFFIC_BUDGET_MB): TrafficBudget {
  const since = now.getTime() - DAY_MS
  const usedMb = Math.round(entries.filter((e) => e.account === account && Date.parse(e.at) > since).reduce((sum, e) => sum + e.mb, 0) * 100) / 100
  return { budgetMb, usedMb, leftMb: Math.round(Math.max(0, budgetMb - usedMb) * 100) / 100 }
}
