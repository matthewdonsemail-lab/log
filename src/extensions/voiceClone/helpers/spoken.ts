import { BREATH_WORDS, SPOKEN_LEXICON, SPOKEN_MOST_ERROR, WORD_MOST_MS } from '../types'
import { seeded } from './realism'
import type { SpokenEntry, SpokenReading, SpokenWord } from '../types'

const TAGS = /\[[^\]]*\]/g

const ONE_SOUND = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/gu

export function wordsOf(text: string): string[] {
  return text.replace(TAGS, ' ').toLowerCase().replace(/['’]/g, '').replace(ONE_SOUND, ' $& ').match(/[\p{L}\p{N}]+/gu) ?? []
}

const keyOf = (token: string) => token.toLowerCase().replace(/\./g, '')

export function unknownAcronyms(text: string, lexicon: Readonly<Record<string, SpokenEntry>> = SPOKEN_LEXICON): string[] {
  const tokens = text.replace(TAGS, ' ').split(/[^A-Za-z.]+/).map((t) => t.replace(/^\.+/, '').replace(/\.+$/, ''))
  const acronyms = tokens.filter((t) => /^[A-Z]{2,6}s?$/.test(t) || /^(?:[A-Za-z]\.)+[A-Za-z]$/.test(t))
  return [...new Set(acronyms.filter((t) => !lexicon[keyOf(t)] && !lexicon[keyOf(t).replace(/s$/, '')]))]
}

export function speakableText(text: string, lexicon: Readonly<Record<string, SpokenEntry>> = SPOKEN_LEXICON): string {
  const keys = Object.keys(lexicon)
  if (!keys.length) return text
  const pattern = new RegExp(`\\b(${keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi')
  return text.split(/(\[[^\]]*\])/).map((part) => (part.startsWith('[') ? part : part.replace(pattern, (word) => lexicon[word.toLowerCase()]?.write ?? word))).join('')
}

const ONE_SOUND_TEST = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u

const spokenLength = (sentence: string) => wordsOf(sentence).reduce((n, unit) => n + (ONE_SOUND_TEST.test(unit) ? 0.5 : 1), 0)

export function withBreaths(text: string, seed = 1): string {
  if (/\[breathe\]/i.test(text)) return text
  const rand = seeded(seed)
  const nextAt = () => BREATH_WORDS.least + Math.floor(rand() * (BREATH_WORDS.most - BREATH_WORDS.least + 1))
  let since = 0
  let at = nextAt()
  return text
    .trim()
    .split(/(?<=[.!?。！？])\s*/)
    .filter(Boolean)
    .map((sentence, i) => {
      const breathe = i > 0 && since >= at
      if (breathe) {
        since = 0
        at = nextAt()
      }
      since += spokenLength(sentence)
      return breathe ? `[breathe] ${sentence}` : sentence
    })
    .join(' ')
}

interface Heard {
  word: string
  ms: number
}

function heardOf(words: readonly SpokenWord[]): Heard[] {
  return words.flatMap((w) => {
    const parts = wordsOf(w.text)
    return parts.map((word) => ({ word, ms: (w.end - w.start) / (parts.length || 1) }))
  })
}

type Pair = { want: string | null; got: Heard | null }

export function aligned(want: readonly string[], got: readonly Heard[]): Pair[] {
  const rows = want.length + 1
  const cols = got.length + 1
  const cost: number[][] = Array.from({ length: rows }, (_, i) => Array.from({ length: cols }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))
  for (let i = 1; i < rows; i++) for (let j = 1; j < cols; j++) cost[i][j] = Math.min(cost[i - 1][j] + 1, cost[i][j - 1] + 1, cost[i - 1][j - 1] + (want[i - 1] === got[j - 1].word ? 0 : 1))
  const pairs: Pair[] = []
  let i = want.length
  let j = got.length
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && cost[i][j] === cost[i - 1][j - 1] + (want[i - 1] === got[j - 1].word ? 0 : 1)) {
      pairs.unshift({ want: want[i - 1], got: got[j - 1] })
      i--
      j--
    } else if (i > 0 && cost[i][j] === cost[i - 1][j] + 1) {
      pairs.unshift({ want: want[i - 1], got: null })
      i--
    } else {
      pairs.unshift({ want: null, got: got[j - 1] })
      j--
    }
  }
  return pairs
}

export function readSpoken(intended: string, words: readonly SpokenWord[], lexicon: Readonly<Record<string, SpokenEntry>> = SPOKEN_LEXICON): SpokenReading {
  const want = wordsOf(intended)
  const got = heardOf(words)
  const pairs = aligned(want, got)
  const errors = pairs.filter((p) => !p.want || !p.got || p.want !== p.got.word).length
  const problems: string[] = []
  pairs.forEach((pair, at) => {
    const entry = pair.want ? lexicon[pair.want] : undefined
    if (!pair.want || !entry) return
    const heard = new Set(entry.heard.map((h) => wordsOf(h).join(' ')))
    if (!pair.got) {
      const letters = pairs.slice(at + 1).filter((p) => !p.want && p.got && p.got.word.length === 1).map((p) => p.got!.word)
      problems.push(letters.length > 1 ? `"${pair.want}" was spelled out as letters (${letters.join(' ')}), when matt says it as a ${entry.say}` : `"${pair.want}" wasn't heard at all`)
      return
    }
    if (!heard.has(pair.got.word)) {
      problems.push(`"${pair.want}" was heard as "${pair.got.word}"`)
      return
    }
    if (entry.say === 'word' && pair.got.ms > WORD_MOST_MS) problems.push(`"${pair.want}" took ${Math.round(pair.got.ms)} ms, as letters would: matt says it as one word`)
  })
  const errorRate = want.length ? errors / want.length : 0
  if (errorRate > SPOKEN_MOST_ERROR) problems.push(`${Math.round(errorRate * 100)}% of the words came out differently from what was written (at most ${Math.round(SPOKEN_MOST_ERROR * 100)}%)`)
  return { ok: problems.length === 0, errorRate: Math.round(errorRate * 1000) / 1000, problems, heard: got.map((h) => h.word).join(' ') }
}
