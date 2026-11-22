import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { BM25, tokenize } from 'bm25s'
import { VectorDB } from 'verso-db'
import type { Collection } from 'verso-db'
import { chunksOf, onePerPerson } from '../../search/conversations/helpers/index'
import type { Chunk, Conversation, Embedder } from '../../search/conversations/types'
import { searchRoot } from '../../search/conversations/client'

type ChunkMeta = { platform: string; account: string; conversationId: string; at: string }
type Store = Awaited<ReturnType<typeof VectorDB.open>>

export interface SearchStageReport {
  chunks: number
  embedded: number
  removed: number
  created: boolean
  ms: number
}

export function conversationsDir(): string {
  return join(searchRoot(), 'conversations')
}

const keyOfChunk = (c: { platform: string; account: string; conversationId: string }): string => `${c.platform}\u0000${c.account}\u0000${c.conversationId}`

const metaOf = (c: Chunk): ChunkMeta => ({ platform: c.platform, account: c.account, conversationId: c.conversationId, at: c.at ?? '' })

export class SearchStage {
  private dir: string
  private embedder: Embedder
  private batch: number
  private held: Map<string, Chunk> | null = null
  private pending = new Map<string, Chunk>()
  private gone = new Set<string>()
  private db: Store | null = null
  private collection: Collection<ChunkMeta> | null = null
  private embedded = 0
  private created = false
  private started = performance.now()

  constructor(embedder: Embedder, dir = conversationsDir(), batch = 64) {
    this.embedder = embedder
    this.dir = dir
    this.batch = batch
  }

  private load(): Map<string, Chunk> {
    if (this.held) return this.held
    const file = join(this.dir, 'chunks.json')
    const chunks = existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as Chunk[]) : []
    this.created = !existsSync(file) || !existsSync(join(this.dir, 'model.json'))
    this.held = new Map(chunks.map((c) => [c.id, c]))
    return this.held
  }

  async add(conversations: readonly Conversation[]): Promise<{ chunks: number; embedded: number }> {
    const held = this.load()
    const fresh: Chunk[] = onePerPerson(conversations).flatMap((c) => chunksOf(c))
    const mine = new Set(fresh.map((c) => c.id))
    const changed: Chunk[] = []
    for (const chunk of fresh) {
      const older = held.get(chunk.id)
      if (!older || older.text !== chunk.text || JSON.stringify(older.place ?? null) !== JSON.stringify(chunk.place ?? null)) changed.push(chunk)
      this.pending.set(chunk.id, chunk)
    }
    const touched = new Set(fresh.map((c) => keyOfChunk(c)))
    for (const [id, chunk] of held) {
      if (mine.has(id) || !touched.has(keyOfChunk(chunk))) continue
      this.gone.add(id)
      this.pending.delete(id)
    }
    if (!changed.length && !this.gone.size) return { chunks: fresh.length, embedded: 0 }
    await this.open()
    const removal = [...this.gone].filter((id) => held.has(id))
    if (removal.length) await this.collection!.delete(removal)
    for (let start = 0; start < changed.length; start += this.batch) {
      const slice = changed.slice(start, start + this.batch)
      const vectors = await this.embedder.embed(slice.map((c) => c.text))
      await this.collection!.upsert(slice.map((c, i) => ({ id: c.id, vector: vectors[i], metadata: metaOf(c) })))
    }
    this.embedded += changed.length
    return { chunks: fresh.length, embedded: changed.length }
  }

  private async open(): Promise<void> {
    if (this.collection) return
    mkdirSync(this.dir, { recursive: true })
    this.db = await VectorDB.open({ path: join(this.dir, 'vectors') })
    this.collection = this.created
      ? await this.db.createCollection<ChunkMeta>('chunks', { vector: { dimensions: this.embedder.dimensions, metric: 'cosine' }, index: { type: 'hnsw', profile: 'balanced' } })
      : await this.db.collection<ChunkMeta>('chunks')
  }

  pendingCount(): number {
    return this.pending.size + this.gone.size
  }

  async flush(): Promise<SearchStageReport> {
    const held = this.load()
    const embedded = this.embedded
    const removed = this.gone.size
    const created = this.created
    if (!embedded && !removed) {
      await this.close()
      return { chunks: held.size, embedded: 0, removed: 0, created, ms: performance.now() - this.started }
    }
    for (const id of this.gone) held.delete(id)
    for (const [id, chunk] of this.pending) held.set(id, chunk)
    const chunks = [...held.values()]
    await this.close()
    mkdirSync(this.dir, { recursive: true })
    writeFileSync(join(this.dir, 'chunks.json'), JSON.stringify(chunks))
    writeFileSync(join(this.dir, 'model.json'), JSON.stringify({ model: this.embedder.model, dimensions: this.embedder.dimensions, builtAt: new Date().toISOString() }))
    const keyword = new BM25()
    keyword.index(tokenize(chunks.map((c) => c.text)))
    await keyword.save(join(this.dir, 'bm25'))
    this.pending.clear()
    this.gone.clear()
    this.embedded = 0
    this.created = false
    this.held = held
    return { chunks: chunks.length, embedded, removed, created, ms: performance.now() - this.started }
  }

  async close(): Promise<void> {
    const db = this.db
    this.db = null
    this.collection = null
    if (db) await db.close()
  }
}

export async function embedConversations(conversations: readonly Conversation[], embedder: Embedder, dir = conversationsDir()): Promise<SearchStageReport> {
  const stage = new SearchStage(embedder, dir)
  try {
    await stage.add(conversations)
    return await stage.flush()
  } finally {
    await stage.close()
  }
}

export function chunkCountOf(dir = conversationsDir()): number {
  const file = join(dir, 'chunks.json')
  return existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as Chunk[]).length : 0
}
