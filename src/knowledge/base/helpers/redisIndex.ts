import { KB_ARTICLE_PREFIX, KB_CHUNK_PREFIX, KB_INDEX } from '../types'
import type { KbChunk, KbIndex, KbKind, KbStoredArticle } from '../types'
import { kindOf } from './twentyStore'

interface Reply {
  results?: { id: string; extra_attributes?: Record<string, string> }[]
}

export interface RedisLike {
  send(command: string, args: (string | Buffer)[]): Promise<unknown>
  close(): void
}

const STOP = new Set(['the', 'and', 'for', 'with', 'what', 'how', 'why', 'when', 'where', 'who', 'does', 'did', 'are', 'was', 'can', 'should', 'into', 'from', 'that', 'this', 'not', 'you', 'our', 'its', 'per', 'any', 'all', 'about', 'does'])

export function queryWords(query: string): string[] {
  return [...new Set((query.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter((w) => w.length > 1 && !STOP.has(w)))]
}

export function keywordQuery(query: string, every = false): string | null {
  const words = queryWords(query)
  return words.length ? `(${words.join(every ? ' ' : '|')})` : null
}

const kindFilter = (kind: KbKind | undefined) => (kind ? `@kind:{${kind}} ` : '')

const vectorBlob = (vector: Float32Array) => Buffer.from(vector.buffer, vector.byteOffset, vector.byteLength)

export function redisKbIndex(redis: RedisLike): KbIndex {
  const ids = (reply: unknown) => ((reply as Reply).results ?? []).map((r) => r.id.slice(KB_CHUNK_PREFIX.length))
  return {
    async ensure(dimensions) {
      const list = (await redis.send('FT._LIST', [])) as string[]
      if (list.includes(KB_INDEX)) return false
      await redis.send('FT.CREATE', [KB_INDEX, 'ON', 'HASH', 'PREFIX', '1', KB_CHUNK_PREFIX, 'SCHEMA', 'title', 'TEXT', 'WEIGHT', '3', 'text', 'TEXT', 'key', 'TAG', 'kind', 'TAG', 'source', 'TAG', 'vec', 'VECTOR', 'HNSW', '6', 'TYPE', 'FLOAT32', 'DIM', String(dimensions), 'DISTANCE_METRIC', 'COSINE'])
      return true
    },
    async hashes() {
      const out = new Map<string, string>()
      let cursor = '0'
      do {
        const [next, keys] = (await redis.send('SCAN', [cursor, 'MATCH', `${KB_ARTICLE_PREFIX}*`, 'COUNT', '500'])) as [string, string[]]
        cursor = next
        for (const k of keys) {
          const hash = (await redis.send('HGET', [k, 'hash'])) as string | null
          out.set(k.slice(KB_ARTICLE_PREFIX.length), hash ?? '')
        }
      } while (cursor !== '0')
      return out
    },
    async put(article, chunks, vectors) {
      await this.drop(article.key)
      for (const [i, chunk] of chunks.entries()) {
        await redis.send('HSET', [`${KB_CHUNK_PREFIX}${chunk.id}`, 'title', chunk.title, 'text', chunk.text, 'key', chunk.key, 'kind', chunk.kind, 'source', chunk.source, 'vec', vectorBlob(vectors[i])])
      }
      await redis.send('HSET', [`${KB_ARTICLE_PREFIX}${article.key}`, 'hash', article.hash, 'chunks', chunks.map((c) => c.id).join(','), 'title', article.title, 'kind', article.kind])
    },
    async drop(key) {
      const old = (await redis.send('HGET', [`${KB_ARTICLE_PREFIX}${key}`, 'chunks'])) as string | null
      const keys = (old ?? '').split(',').filter(Boolean).map((id) => `${KB_CHUNK_PREFIX}${id}`)
      if (keys.length) await redis.send('DEL', keys)
      await redis.send('DEL', [`${KB_ARTICLE_PREFIX}${key}`])
    },
    async keyword(query, kind, depth) {
      const any = keywordQuery(query)
      if (!any) return []
      const run = async (words: string) => ids(await redis.send('FT.SEARCH', [KB_INDEX, `${kindFilter(kind)}${words}`, 'SCORER', 'BM25', 'NOCONTENT', 'LIMIT', '0', String(depth), 'DIALECT', '2']))
      const every = queryWords(query).length > 1 ? await run(keywordQuery(query, true)!) : []
      const some = await run(any)
      return [...new Set([...every, ...some])].slice(0, depth)
    },
    async meaning(vector, kind, depth) {
      const filter = kind ? `(@kind:{${kind}})` : '*'
      return ids(await redis.send('FT.SEARCH', [KB_INDEX, `${filter}=>[KNN ${depth} @vec $v AS distance]`, 'PARAMS', '2', 'v', vectorBlob(vector), 'SORTBY', 'distance', 'RETURN', '1', 'distance', 'LIMIT', '0', String(depth), 'DIALECT', '2']))
    },
    async chunks(chunkIds) {
      const out: KbChunk[] = []
      for (const id of chunkIds) {
        const [title, text, key, kind, source] = (await redis.send('HMGET', [`${KB_CHUNK_PREFIX}${id}`, 'title', 'text', 'key', 'kind', 'source'])) as (string | null)[]
        if (key) out.push({ id, title: title ?? '', text: text ?? '', key, kind: (kind as KbKind) ?? kindOf(kind), source: source ?? '' })
      }
      return out
    },
    close() {
      redis.close()
    },
  }
}
