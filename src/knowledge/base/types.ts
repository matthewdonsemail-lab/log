export const KB_KINDS = ['rule', 'section', 'skill', 'doc', 'infra', 'memory', 'pageState', 'account', 'note'] as const
export type KbKind = (typeof KB_KINDS)[number]

export const KB_OBJECT = 'knowledgeArticle'
export const KB_OBJECT_PLURAL = 'knowledgeArticles'
export const KB_INDEX = 'kbIdx'
export const KB_CHUNK_PREFIX = 'kb:chunk:'
export const KB_ARTICLE_PREFIX = 'kb:article:'
export const KB_CHUNK_CHARS = 1200
export const KB_CHUNK_OVERLAP = 150
export const KB_SEARCH_DEPTH = 50
export const KB_DEFAULT_TWENTY_URL = 'https://node02.tail4fcf85.ts.net'

export interface KbArticle {
  key: string
  kind: KbKind
  title: string
  body: string
  source: string
  tags: string[]
  author: string
}

export interface KbStoredArticle extends KbArticle {
  id: string
  hash: string
}

export interface KbChunk {
  id: string
  key: string
  kind: KbKind
  title: string
  source: string
  text: string
}

export interface KbHit {
  rank: number
  score: number
  keywordRank: number | null
  meaningRank: number | null
  key: string
  kind: KbKind
  title: string
  source: string
  text: string
}

export interface KbConfig {
  twentyUrl: string
  twentyKey: string
  redisUrl: string
}

export interface KbStore {
  ensure(): Promise<string[]>
  list(): Promise<KbStoredArticle[]>
  get(key: string): Promise<KbStoredArticle | null>
  save(article: KbArticle, hash: string, id: string | null): Promise<KbStoredArticle>
  createMany(items: { article: KbArticle; hash: string }[]): Promise<KbStoredArticle[]>
}

export interface KbIndex {
  ensure(dimensions: number): Promise<boolean>
  hashes(): Promise<Map<string, string>>
  put(article: KbStoredArticle, chunks: KbChunk[], vectors: Float32Array[]): Promise<void>
  drop(key: string): Promise<void>
  keyword(query: string, kind: KbKind | undefined, depth: number): Promise<string[]>
  meaning(vector: Float32Array, kind: KbKind | undefined, depth: number): Promise<string[]>
  chunks(ids: string[]): Promise<KbChunk[]>
  close(): void
}

export interface KbSources {
  repo: string
  memoryRoot: string | null
}

export interface KbSyncReport {
  collected: number
  created: number
  updated: number
  unchanged: number
  indexed: number
  chunks: number
  dropped: number
  byKind: Record<string, number>
  setup: string[]
  ms: number
}
