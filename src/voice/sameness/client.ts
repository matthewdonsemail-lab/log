import { wordPairsOf, wordsOf } from '../phrases/client'
import { SAMENESS_LIMIT, SAMENESS_MIN_PAIRS } from './types'
import type { SamenessReading, SentText } from './types'

export function pairSetOf(text: string): Set<string> {
  return new Set(wordPairsOf(wordsOf(text)))
}

export function overlapOf(a: ReadonlySet<string>, b: ReadonlySet<string>): { score: number; shared: string[] } {
  const smaller = a.size <= b.size ? a : b
  const larger = smaller === a ? b : a
  if (smaller.size < SAMENESS_MIN_PAIRS) return { score: 0, shared: [] }
  const shared = [...smaller].filter((pair) => larger.has(pair))
  return { score: shared.length / smaller.size, shared }
}

export function samenessOf(text: string, others: readonly SentText[], limit: number = SAMENESS_LIMIT): SamenessReading {
  const mine = pairSetOf(text)
  let best: SamenessReading = { score: 0, limit, closestTo: null, shared: [], pass: true }
  for (const other of others) {
    const { score, shared } = overlapOf(mine, pairSetOf(other.text))
    if (score > best.score) best = { score, limit, closestTo: other.to, shared, pass: score < limit }
  }
  return best
}

export function samenessLine(reading: SamenessReading): string {
  return `too close to what went to ${reading.closestTo} (${Math.round(reading.score * 100)}% of its word pairs, the limit is ${Math.round(reading.limit * 100)}%): ${reading.shared.slice(0, 6).map((p) => `"${p}"`).join(', ')}. Every message reads differently: write this one from their own thread`
}

export function batchSameness(items: readonly { n: number; to: string; text: string }[], limit: number = SAMENESS_LIMIT): { n: number; reading: SamenessReading }[] {
  const out: { n: number; reading: SamenessReading }[] = []
  items.forEach((item, i) => {
    const earlier = items.slice(0, i).map((other) => ({ to: other.to, text: other.text }))
    const reading = samenessOf(item.text, earlier, limit)
    if (!reading.pass) out.push({ n: item.n, reading })
  })
  return out
}
