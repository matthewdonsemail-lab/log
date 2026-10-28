import { PROFILE_WORDS, START_MIN_SEEN, START_WORDS } from '../types'
import type { VoicePair, VoiceProfile } from '../types'

const EMOJI = /\p{Extended_Pictographic}/u

function share(replies: string[], test: (r: string) => boolean): number {
  return replies.length ? +(replies.filter(test).length / replies.length).toFixed(2) : 0
}

function median(values: number[]): number {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

function wordsOf(text: string): string[] {
  return text.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []
}

export function profileOf(key: string, pairs: readonly VoicePair[], everyone: Map<string, number> = new Map(), everywhere = 0): VoiceProfile {
  const replies = pairs.map((p) => p.reply).filter((r) => r.trim())
  const counts = new Map<string, number>()
  for (const reply of replies) for (const word of new Set(wordsOf(reply))) if (!/^\d+$/.test(word)) counts.set(word, (counts.get(word) ?? 0) + 1)
  const total = Math.max(1, everywhere || pairs.length)
  const here = Math.max(1, replies.length)
  const lift = ([word, n]: [string, number]) => n / here - (everyone.get(word) ?? 0) / total
  const words = [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => lift(b) - lift(a))
    .slice(0, PROFILE_WORDS)
    .map(([w]) => w)
  const openers = new Map<string, number>()
  for (const reply of replies) {
    const first = wordsOf(reply)[0]
    if (first) openers.set(first, (openers.get(first) ?? 0) + 1)
  }
  return {
    key,
    replies: replies.length,
    medianWords: median(replies.map((r) => wordsOf(r).length)),
    lowercase: share(replies, (r) => r === r.toLowerCase()),
    commas: share(replies, (r) => r.includes(',')),
    fullStops: share(replies, (r) => /\.(\s|$)/.test(r.replace(/https?:\/\/\S+/g, ''))),
    questions: share(replies, (r) => r.includes('?')),
    exclamations: share(replies, (r) => r.includes('!')),
    emoji: share(replies, (r) => EMOJI.test(r)),
    openers: [...openers.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([w]) => w),
    words,
    burst: { median: median(pairs.map((p) => p.parts ?? 1)), oneShare: share(pairs.map((p) => String(p.parts ?? 1)), (n) => n === '1'), gapSeconds: +median(pairs.flatMap((p) => p.gaps ?? []).filter((g) => g < 120)).toFixed(1), messageWords: median(replies.flatMap((r) => r.split('\n')).map((m) => wordsOf(m).length).filter((n) => n > 0)) },
  }
}

export function startRatesOf(pairs: readonly VoicePair[]): Record<string, number> {
  const seen = new Map<string, number>()
  const starts = new Map<string, number>()
  for (const pair of pairs) {
    for (const message of pair.reply.split('\n')) {
      const words = wordsOf(message)
      words.forEach((word, i) => {
        seen.set(word, (seen.get(word) ?? 0) + 1)
        if (i === 0) starts.set(word, (starts.get(word) ?? 0) + 1)
      })
    }
  }
  return Object.fromEntries(
    [...seen.entries()]
      .filter(([, n]) => n >= START_MIN_SEEN)
      .map(([word, n]) => [word, +((starts.get(word) ?? 0) / n).toFixed(3)] as const)
      .filter(([, rate]) => rate > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, START_WORDS),
  )
}

export function wordCounts(pairs: readonly VoicePair[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const pair of pairs) for (const word of new Set(wordsOf(pair.reply))) counts.set(word, (counts.get(word) ?? 0) + 1)
  return counts
}
