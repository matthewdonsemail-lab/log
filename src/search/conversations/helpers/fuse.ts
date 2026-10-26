import { RRF_K } from '../types'
import type { Latency } from '../types'

export interface Fused {
  id: string
  score: number
  ranks: (number | null)[]
}

export function reciprocalRankFusion(lists: string[][], k = RRF_K): Fused[] {
  const byId = new Map<string, Fused>()
  lists.forEach((list, which) => {
    list.forEach((id, index) => {
      const entry = byId.get(id) ?? { id, score: 0, ranks: lists.map(() => null) }
      entry.score += 1 / (k + index + 1)
      entry.ranks[which] = index + 1
      byId.set(id, entry)
    })
  })
  return [...byId.values()].sort((a, b) => b.score - a.score)
}

export function percentiles(samples: number[]): Latency {
  const sorted = [...samples].sort((a, b) => a - b)
  const at = (p: number) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)] : 0)
  return { p50: at(50), p95: at(95), p99: at(99), runs: sorted.length }
}
