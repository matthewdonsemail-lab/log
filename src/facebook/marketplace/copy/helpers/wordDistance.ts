import type { CopyVersion, LiveCopy } from '../types'
import { TITLE_WEIGHT } from '../types'

export function wordsOf(text: string, skip: ReadonlySet<string> = new Set()): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s']/gu, ' ')
    .split(/\s+/)
    .map((w) => w.replace(/^'+|'+$/g, ''))
    .filter((w) => w.length > 1 && !skip.has(w))
}

export function skipWordsOf(...places: (string | null | undefined)[]): Set<string> {
  return new Set(places.flatMap((p) => (p ? wordsOf(p) : [])))
}

export function wordDistance(a: string, b: string, skip: ReadonlySet<string> = new Set()): number {
  const wordsA = wordsOf(a, skip)
  const wordsB = wordsOf(b, skip)
  if (!wordsA.length && !wordsB.length) return 0
  if (!wordsA.length || !wordsB.length) return 1
  const inB = new Set(wordsB)
  const shared = new Set(wordsA.filter((w) => inB.has(w))).size
  return 1 - shared / Math.max(new Set(wordsA).size, inB.size)
}

export function copyDistance(version: Pick<CopyVersion, 'title' | 'description'>, live: Pick<LiveCopy, 'title' | 'description'>, skip: ReadonlySet<string> = new Set()): number {
  return TITLE_WEIGHT * wordDistance(version.title, live.title, skip) + (1 - TITLE_WEIGHT) * wordDistance(version.description, live.description, skip)
}
