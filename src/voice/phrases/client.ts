import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { BASELINE_SAMPLE, FAMILIAR_MIN_USES, FAMILIARITY_FLOOR, MIN_WORDS, OWN_WORD_USES } from './types'
import type { PhraseBaseline, PhraseIndex, PhraseReading } from './types'

export function wordsOf(text: string): string[] {
  return text.toLowerCase().replace(/https?:\/\/\S+/g, ' ').replace(/['’]/g, '').match(/[a-z]+/g) ?? []
}

export function wordPairsOf(words: readonly string[]): string[] {
  return words.slice(1).map((word, i) => `${words[i]} ${word}`)
}

function share(pairs: readonly string[], counts: Record<string, number>, own: Map<string, number>): number {
  return pairs.filter((pair) => (counts[pair] ?? 0) - (own.get(pair) ?? 0) >= FAMILIAR_MIN_USES).length / pairs.length
}

function tally(pairs: readonly string[]): Map<string, number> {
  const out = new Map<string, number>()
  for (const pair of pairs) out.set(pair, (out.get(pair) ?? 0) + 1)
  return out
}

function percentile(sorted: readonly number[], p: number): number {
  return sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * (sorted.length - 1)))] : 0
}

export function buildPhraseIndex(replies: readonly string[], now = new Date()): PhraseIndex {
  const counts: Record<string, number> = {}
  const perReply = replies.map((reply) => wordPairsOf(wordsOf(reply)))
  for (const pairs of perReply) for (const pair of pairs) counts[pair] = (counts[pair] ?? 0) + 1
  const usable = perReply.filter((pairs) => pairs.length >= MIN_WORDS - 1)
  const step = Math.max(1, Math.floor(usable.length / BASELINE_SAMPLE))
  const shares = usable.filter((_, i) => i % step === 0).map((pairs) => share(pairs, counts, tally(pairs))).sort((a, b) => a - b)
  const baseline: PhraseBaseline = { p5: percentile(shares, 5), p10: percentile(shares, 10), p50: percentile(shares, 50), sampled: shares.length }
  return { builtAt: now.toISOString(), replies: replies.length, wordPairs: counts, baseline }
}

export function phraseIndexPath(dir: string): string {
  return join(dir, 'phrases.json')
}

export function writePhraseIndex(index: PhraseIndex, dir: string): void {
  writeFileSync(phraseIndexPath(dir), JSON.stringify(index))
}

export function openPhraseIndex(dir: string): PhraseIndex | null {
  const path = phraseIndexPath(dir)
  return existsSync(path) ? (JSON.parse(readFileSync(path, 'utf8')) as PhraseIndex) : null
}

const wordUses = new WeakMap<PhraseIndex, Map<string, number>>()

export function usesOfWord(index: PhraseIndex, word: string): number {
  let uses = wordUses.get(index)
  if (!uses) {
    uses = new Map()
    for (const [pair, count] of Object.entries(index.wordPairs)) for (const w of pair.split(' ')) uses.set(w, (uses.get(w) ?? 0) + count)
    wordUses.set(index, uses)
  }
  return uses.get(word) ?? 0
}

export function readPhrases(text: string, index: PhraseIndex, theirText = ''): PhraseReading {
  const theirs = new Set(wordsOf(theirText).filter((word) => usesOfWord(index, word) < OWN_WORD_USES))
  const pairs = wordPairsOf(wordsOf(text)).filter((pair) => !pair.split(' ').some((word) => theirs.has(word)))
  const floor = index.baseline[FAMILIARITY_FLOOR]
  if (pairs.length < MIN_WORDS - 1) return { familiarity: null, floor, unfamiliar: [], pass: true }
  const familiarity = share(pairs, index.wordPairs, new Map())
  const unfamiliar = [...new Set(pairs.filter((pair) => (index.wordPairs[pair] ?? 0) < FAMILIAR_MIN_USES))]
  return { familiarity, floor, unfamiliar, pass: familiarity >= floor }
}

export function phrasesLine(reading: PhraseReading): string {
  if (reading.familiarity === null) return 'his phrasing: too short to measure'
  const pct = (n: number) => `${Math.round(n * 100)}%`
  return `his phrasing: ${pct(reading.familiarity)} of its word pairs are ones he has written (his own floor ${pct(reading.floor)})${reading.unfamiliar.length ? `; never from him: ${reading.unfamiliar.slice(0, 8).join(', ')}` : ''}`
}
