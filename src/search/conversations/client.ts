import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { BM25, tokenize } from 'bm25s'
import { VectorDB } from 'verso-db'
import type { Collection } from 'verso-db'
import { chunksOf, onePerPerson, percentiles, reciprocalRankFusion } from './helpers/index'
import { SEARCH_DEPTH } from './types'
import type { Chunk, Conversation, Embedder, Latency, SearchHit, SearchOptions } from './types'
import type { TwitterDmConversation } from '../../twitter/account/session/index'

type ChunkMeta = { platform: string; account: string; conversationId: string; at: string }

export interface ConversationIndex {
  dir: string
  chunks: Chunk[]
  byId: Map<string, Chunk>
  keyword: BM25
  embedder: Embedder
  vectors: Collection<ChunkMeta>
  close(): Promise<void>
}

export function searchRoot(): string {
  return process.env.LOG_SEARCH_DIR || join(homedir(), '.logCli', 'search')
}

export function conversationsRoot(): string {
  return process.env.LOG_CONVERSATIONS_DIR || join(homedir(), '.logCli', 'conversations')
}

export function saveConversations(conversations: Conversation[], root = conversationsRoot()): number {
  for (const c of conversations) {
    const dir = join(root, c.platform, c.account)
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, `${c.conversationId.replace(/[^\w-]/g, '_')}.json`), JSON.stringify(c))
  }
  return conversations.length
}

export function loadConversations(root = conversationsRoot()): Conversation[] {
  const out: Conversation[] = []
  if (!existsSync(root)) return out
  for (const platform of readdirSync(root)) {
    for (const account of readdirSync(join(root, platform))) {
      for (const file of readdirSync(join(root, platform, account))) {
        if (!file.endsWith('.json')) continue
        try {
          out.push(JSON.parse(readFileSync(join(root, platform, account, file), 'utf8')) as Conversation)
        } catch {
          continue
        }
      }
    }
  }
  return out
}

function queryTerms(query: string): string[][] {
  const tokens = tokenize([query])
  const words = new Map([...tokens.vocab].map(([word, id]) => [id, word]))
  return [tokens.ids[0].map((id) => words.get(id) ?? '').filter(Boolean)]
}

export async function buildIndex(conversations: Conversation[], embedder: Embedder, dir = join(searchRoot(), 'conversations'), batch = 64): Promise<{ chunks: number; conversations: number; ms: number }> {
  const started = performance.now()
  const merged = onePerPerson(conversations)
  const chunks = merged.flatMap((c) => chunksOf(c))
  rmSync(dir, { recursive: true, force: true })
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'chunks.json'), JSON.stringify(chunks))
  writeFileSync(join(dir, 'model.json'), JSON.stringify({ model: embedder.model, dimensions: embedder.dimensions, builtAt: new Date().toISOString() }))
  const keyword = new BM25()
  keyword.index(tokenize(chunks.map((c) => c.text)))
  await keyword.save(join(dir, 'bm25'))
  const db = await VectorDB.open({ path: join(dir, 'vectors') })
  const collection = await db.createCollection<ChunkMeta>('chunks', { vector: { dimensions: embedder.dimensions, metric: 'cosine' }, index: { type: 'hnsw', profile: 'balanced' } })
  for (let start = 0; start < chunks.length; start += batch) {
    const slice = chunks.slice(start, start + batch)
    const vectors = await embedder.embed(slice.map((c) => c.text))
    await collection.insert(slice.map((c, i) => ({ id: c.id, vector: vectors[i], metadata: { platform: c.platform, account: c.account, conversationId: c.conversationId, at: c.at ?? '' } })))
  }
  await db.close()
  return { chunks: chunks.length, conversations: merged.length, ms: performance.now() - started }
}

export async function updateIndex(conversations: Conversation[], embedder: Embedder, dir = join(searchRoot(), 'conversations'), batch = 64): Promise<{ chunks: number; conversations: number; embedded: number; removed: number; ms: number; rebuilt: boolean }> {
  const started = performance.now()
  if (!existsSync(join(dir, 'chunks.json')) || !existsSync(join(dir, 'model.json'))) {
    const built = await buildIndex(conversations, embedder, dir, batch)
    return { ...built, embedded: built.chunks, removed: 0, rebuilt: true }
  }
  const model = JSON.parse(readFileSync(join(dir, 'model.json'), 'utf8')) as { model: string; dimensions: number }
  if (model.model !== embedder.model || model.dimensions !== embedder.dimensions) {
    const built = await buildIndex(conversations, embedder, dir, batch)
    return { ...built, embedded: built.chunks, removed: 0, rebuilt: true }
  }
  const merged = onePerPerson(conversations)
  const chunks = merged.flatMap((c) => chunksOf(c))
  const held = new Map((JSON.parse(readFileSync(join(dir, 'chunks.json'), 'utf8')) as Chunk[]).map((c) => [c.id, c]))
  const fresh = chunks.filter((c) => held.get(c.id)?.text !== c.text)
  const ids = new Set(chunks.map((c) => c.id))
  const gone = [...held.keys()].filter((id) => !ids.has(id))
  if (!fresh.length && !gone.length) return { chunks: chunks.length, conversations: merged.length, embedded: 0, removed: 0, ms: performance.now() - started, rebuilt: false }
  const db = await VectorDB.open({ path: join(dir, 'vectors') })
  const collection = await db.collection<ChunkMeta>('chunks')
  if (gone.length) await collection.delete(gone)
  for (let start = 0; start < fresh.length; start += batch) {
    const slice = fresh.slice(start, start + batch)
    const vectors = await embedder.embed(slice.map((c) => c.text))
    await collection.upsert(slice.map((c, i) => ({ id: c.id, vector: vectors[i], metadata: { platform: c.platform, account: c.account, conversationId: c.conversationId, at: c.at ?? '' } })))
  }
  await db.close()
  const keyword = new BM25()
  keyword.index(tokenize(chunks.map((c) => c.text)))
  await keyword.save(join(dir, 'bm25'))
  writeFileSync(join(dir, 'chunks.json'), JSON.stringify(chunks))
  writeFileSync(join(dir, 'model.json'), JSON.stringify({ model: embedder.model, dimensions: embedder.dimensions, builtAt: new Date().toISOString() }))
  return { chunks: chunks.length, conversations: merged.length, embedded: fresh.length, removed: gone.length, ms: performance.now() - started, rebuilt: false }
}

export function twitterConversationOf(account: string, c: TwitterDmConversation): Conversation {
  return {
    platform: 'twitter',
    account,
    conversationId: c.conversationId,
    box: c.box ?? 'inbox',
    with: c.with.map((p) => p.handle ?? p.userId),
    messages: c.messages.map((m) => ({ id: m.id, at: m.time ?? null, from: m.from ?? null, fromMe: m.fromMe === true, text: m.text ?? '' })),
  }
}

export async function openIndex(embedder: Embedder, dir = join(searchRoot(), 'conversations')): Promise<ConversationIndex> {
  if (!existsSync(join(dir, 'chunks.json'))) throw new Error(`no conversation index at ${dir}: build it with \`log search index\``)
  const chunks = JSON.parse(readFileSync(join(dir, 'chunks.json'), 'utf8')) as Chunk[]
  const keyword = await BM25.load(join(dir, 'bm25'))
  const db = await VectorDB.open({ path: join(dir, 'vectors') })
  const vectors = await db.collection<ChunkMeta>('chunks')
  return { dir, chunks, byId: new Map(chunks.map((c) => [c.id, c])), keyword, embedder, vectors, close: () => db.close() }
}

function passes(chunk: Chunk, options: SearchOptions): boolean {
  if (options.platform && chunk.platform !== options.platform) return false
  if (options.account && chunk.account !== options.account) return false
  if (options.with && !chunk.with.some((w) => w.toLowerCase() === options.with!.toLowerCase().replace(/^@/, ''))) return false
  if (options.after && (chunk.at ?? '') < options.after) return false
  return true
}

export async function search(index: ConversationIndex, query: string, options: SearchOptions = {}): Promise<SearchHit[]> {
  const limit = options.limit ?? 10
  const filtered = Boolean(options.platform || options.account || options.with || options.after)
  const depth = Math.min(index.chunks.length, (options.depth ?? SEARCH_DEPTH) * (filtered ? 4 : 1))
  if (!depth) return []
  const keywordList = (async () => {
    const terms = queryTerms(query)
    if (!terms[0].length) return []
    const found = index.keyword.retrieve(terms, { k: depth })
    return Array.from(found.documents[0]).filter((_, i) => found.scores[0][i] > 0).map((n) => index.chunks[n as number].id)
  })()
  const meaningList = (async () => {
    const [vector] = await index.embedder.embed([query])
    const found = await index.vectors.search({ vector, limit: depth })
    return found.matches.map((m: { id: string | number }) => String(m.id))
  })()
  const [byKeyword, byMeaning] = await Promise.all([keywordList, meaningList])
  const keep = (ids: string[]) => ids.filter((id) => index.byId.has(id) && passes(index.byId.get(id)!, options))
  return reciprocalRankFusion([keep(byKeyword), keep(byMeaning)]).slice(0, limit).map((f, i) => ({ rank: i + 1, score: f.score, keywordRank: f.ranks[0], meaningRank: f.ranks[1], chunk: index.byId.get(f.id)! }))
}

export function linearScan(conversations: Conversation[], query: string, limit = 10): Chunk[] {
  const words = query.toLowerCase().match(/\w+/g) ?? []
  return onePerPerson(conversations)
    .flatMap((c) => chunksOf(c))
    .map((chunk) => ({ chunk, hits: words.filter((w) => chunk.text.toLowerCase().includes(w)).length }))
    .filter((x) => x.hits > 0)
    .sort((a, b) => b.hits - a.hits)
    .slice(0, limit)
    .map((x) => x.chunk)
}

export async function benchmark(index: ConversationIndex, queries: string[], rounds = 5): Promise<{ cold: Latency; warm: Latency }> {
  const cold: number[] = []
  for (const q of queries) {
    const t = performance.now()
    await search(index, q)
    cold.push(performance.now() - t)
  }
  const warm: number[] = []
  for (let r = 0; r < rounds; r++) {
    for (const q of queries) {
      const t = performance.now()
      await search(index, q)
      warm.push(performance.now() - t)
    }
  }
  return { cold: percentiles(cold), warm: percentiles(warm) }
}
