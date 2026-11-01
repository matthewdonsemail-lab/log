export interface AiTellRule {
  name: string
  message: string
  tokens: string[]
  exceptions: string[]
  ignorecase: boolean
  nonword: boolean
}

export interface AiTellHit {
  rule: string
  match: string
  message: string
}

export interface AiPhrase {
  text: string
  source: string
}

export interface AiEmbedder {
  model: string
  dimensions: number
  embed: (texts: string[]) => Promise<number[][]>
  rerank: (query: string, documents: string[]) => Promise<number[]>
}

export interface AiBaseline {
  messages: number
  p50: number
  p99: number
  mutedRules: string[]
}

export interface AiIndexMeta {
  model: string
  dimensions: number
  builtAt: string
  phrases: AiPhrase[]
  baseline: AiBaseline
}

export interface AiIndex extends AiIndexMeta {
  vectors: Float32Array[]
}

export interface AiCloseMatch {
  chunk: string
  phrase: string
  source: string
  cosine: number
  rerank: number | null
}

export interface AiReading {
  hits: AiTellHit[]
  overused: { word: string; ratio: number }[]
  closest: AiCloseMatch[]
  score: number
  p50: number
  p99: number
  flagged: boolean
  pass: boolean
}

export const JINA_EMBED_MODEL = 'jina-embeddings-v3'
export const JINA_RERANK_MODEL = 'jina-reranker-v2-base-multilingual'
export const JINA_DIMENSIONS = 256
export const MUTE_IF_MATT_USES = 0.02
export const BASELINE_SAMPLE = 500
