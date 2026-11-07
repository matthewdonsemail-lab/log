import { TOP_K, WINDOW_STEP, WINDOW_WORDS } from '../types'
import type { RouteIndex } from '../types'

export function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i]
  return dot
}

export function windowsOf(text: string, size: number = WINDOW_WORDS, step: number = WINDOW_STEP): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (words.length <= size) return [words.join(' ')]
  const out: string[] = []
  for (let start = 0; start < words.length; start += step) {
    out.push(words.slice(start, start + size).join(' '))
    if (start + size >= words.length) break
  }
  return out
}

export function denseScores(promptVectors: readonly Float32Array[], index: RouteIndex, topK: number = TOP_K): Map<string, { score: number; text: string }> {
  const best = index.vectors.map((vector) => Math.max(...promptVectors.map((p) => cosine(p, vector))))
  const ranked = best.map((score, i) => ({ score, i })).sort((a, b) => b.score - a.score).slice(0, topK)
  const byRoute = new Map<string, { sum: number; n: number; top: number; text: string }>()
  for (const { score, i } of ranked) {
    const route = index.utterances[i].route
    const entry = byRoute.get(route) ?? { sum: 0, n: 0, top: 0, text: '' }
    entry.sum += score
    entry.n += 1
    if (score > entry.top) {
      entry.top = score
      entry.text = index.utterances[i].text
    }
    byRoute.set(route, entry)
  }
  const out = new Map<string, { score: number; text: string }>()
  for (const [route, entry] of byRoute) out.set(route, { score: (entry.sum / entry.n + entry.top) / 2, text: entry.text })
  return out
}
