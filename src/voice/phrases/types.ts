export interface PhraseBaseline {
  p5: number
  p10: number
  p50: number
  sampled: number
}

export interface PhraseIndex {
  builtAt: string
  replies: number
  wordPairs: Record<string, number>
  baseline: PhraseBaseline
}

export interface PhraseReading {
  familiarity: number | null
  floor: number
  unfamiliar: string[]
  newPhrasing: string[]
  newWords: string[]
  pass: boolean
}

export const FAMILIAR_MIN_USES = 2
export const FAMILIARITY_FLOOR = 'p10' as const
export const BASELINE_SAMPLE = 5000
export const MIN_WORDS = 5
export const OWN_WORD_USES = 6
