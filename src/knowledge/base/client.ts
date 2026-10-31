import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { reciprocalRankFusion } from '../../search/conversations/helpers/fuse'
import type { Embedder } from '../../search/conversations/types'
import { articleHash, chunksOf } from './helpers/chunk'
import { scrubSecrets } from './helpers/scrub'
import { KB_DEFAULT_TWENTY_URL, KB_SEARCH_DEPTH } from './types'
import type { KbArticle, KbConfig, KbHit, KbIndex, KbKind, KbStore, KbStoredArticle, KbSyncReport } from './types'

const CONFIG_DIR = join(homedir(), '.config', 'listeningkit')

function fromFile(path: string): string {
  return existsSync(path) ? readFileSync(path, 'utf8').trim() : ''
}

export function kbConfig(env: Record<string, string | undefined> = process.env): KbConfig | { missing: string } {
  const twentyUrl = (env.KB_TWENTY_URL || KB_DEFAULT_TWENTY_URL).trim()
  const twentyKey = (env.KB_TWENTY_API_KEY || fromFile(env.KB_TWENTY_API_KEY_FILE || join(CONFIG_DIR, 'twenty-listeningkit-api-key.txt'))).trim()
  const redisUrl = (env.KB_REDIS_URL || fromFile(env.KB_REDIS_URL_FILE || join(CONFIG_DIR, 'kb-redis-url.txt'))).trim()
  if (!twentyKey) return { missing: 'KB_TWENTY_API_KEY (or the file ~/.config/listeningkit/twenty-listeningkit-api-key.txt)' }
  if (!redisUrl) return { missing: 'KB_REDIS_URL (or the file ~/.config/listeningkit/kb-redis-url.txt)' }
  return { twentyUrl, twentyKey, redisUrl }
}

const embedText = (title: string, text: string) => `${title}\n${text}`

async function indexArticle(index: KbIndex, embedder: Embedder, article: KbStoredArticle): Promise<number> {
  const chunks = chunksOf(article)
  if (!chunks.length) {
    await index.drop(article.key)
    return 0
  }
  const vectors: Float32Array[] = []
  for (let i = 0; i < chunks.length; i += 32) vectors.push(...(await embedder.embed(chunks.slice(i, i + 32).map((c) => embedText(c.title, c.text)))))
  await index.put(article, chunks, vectors)
  return chunks.length
}

export interface SyncOptions {
  progress?: (line: string) => void
}

export async function syncKnowledge(collected: readonly KbArticle[], store: KbStore, index: KbIndex, embedder: Embedder, options: SyncOptions = {}): Promise<KbSyncReport> {
  const started = performance.now()
  const say = options.progress ?? (() => {})
  const report: KbSyncReport = { collected: collected.length, created: 0, updated: 0, unchanged: 0, indexed: 0, chunks: 0, dropped: 0, byKind: {}, setup: [], ms: 0 }
  report.setup.push(...(await store.ensure()))
  if (await index.ensure(embedder.dimensions)) report.setup.push('created Redis index kbIdx')
  say(`kb: ${collected.length} articles collected; reading what Twenty already holds`)
  const existing = new Map((await store.list()).map((a) => [a.key, a]))
  const fresh: { article: KbArticle; hash: string }[] = []
  const changed: { article: KbArticle; hash: string; id: string }[] = []
  for (const article of collected) {
    report.byKind[article.kind] = (report.byKind[article.kind] ?? 0) + 1
    const hash = articleHash(article)
    const have = existing.get(article.key)
    if (!have) fresh.push({ article, hash })
    else if (have.hash !== hash) changed.push({ article, hash, id: have.id })
    else report.unchanged++
  }
  say(`kb: ${fresh.length} new and ${changed.length} changed articles to write to Twenty, ${report.unchanged} unchanged`)
  for (let i = 0; i < fresh.length; i += 60) {
    for (const saved of await store.createMany(fresh.slice(i, i + 60))) existing.set(saved.key, saved)
    report.created = Math.min(fresh.length, i + 60)
    say(`kb: Twenty created ${report.created}/${fresh.length}`)
  }
  for (const { article, hash, id } of changed) {
    existing.set(article.key, await store.save(article, hash, id))
    report.updated++
    if (report.updated % 25 === 0) say(`kb: Twenty updated ${report.updated}/${changed.length}`)
  }
  say(`kb: Twenty done: ${report.created} new, ${report.updated} changed, ${report.unchanged} unchanged; indexing into Redis`)
  const indexed = await index.hashes()
  const all = [...existing.values()].map((a) => ({ ...a, hash: articleHash(a) }))
  let i = 0
  for (const article of all) {
    i++
    if (indexed.get(article.key) === article.hash) continue
    report.chunks += await indexArticle(index, embedder, article)
    report.indexed++
    if (report.indexed % 25 === 0) say(`kb: Redis ${i}/${all.length} (${report.indexed} indexed, ${report.chunks} chunks)`)
  }
  for (const key of indexed.keys()) {
    if (existing.has(key)) continue
    await index.drop(key)
    report.dropped++
  }
  report.ms = performance.now() - started
  return report
}

export interface KbSearchOptions {
  kind?: KbKind
  limit?: number
  depth?: number
}

export async function searchKnowledge(index: KbIndex, embedder: Embedder, query: string, options: KbSearchOptions = {}): Promise<KbHit[]> {
  const depth = options.depth ?? KB_SEARCH_DEPTH
  const [vector] = await embedder.embed([query])
  const [keyword, meaning] = await Promise.all([index.keyword(query, options.kind, depth), index.meaning(vector, options.kind, depth)])
  const fused = reciprocalRankFusion([keyword, meaning])
  const chunks = new Map((await index.chunks(fused.slice(0, depth).map((f) => f.id))).map((c) => [c.id, c]))
  const hits: KbHit[] = []
  const seen = new Set<string>()
  for (const f of fused) {
    const chunk = chunks.get(f.id)
    if (!chunk || seen.has(chunk.key)) continue
    seen.add(chunk.key)
    hits.push({ rank: hits.length + 1, score: f.score, keywordRank: f.ranks[0], meaningRank: f.ranks[1], key: chunk.key, kind: chunk.kind, title: chunk.title, source: chunk.source, text: chunk.text })
    if (hits.length >= (options.limit ?? 8)) break
  }
  return hits
}

export interface RememberInput {
  text: string
  title?: string
  tags?: string[]
  author?: string
  now?: Date
}

export function noteArticle(input: RememberInput): KbArticle {
  const now = input.now ?? new Date()
  const body = scrubSecrets(input.text.trim())
  const title = (input.title?.trim() || body.split('\n')[0]).slice(0, 160)
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').slice(0, 6).map((w, i) => (i ? w.charAt(0).toUpperCase() + w.slice(1) : w)).join('')
  return { key: `note:${stamp}${slug ? `-${slug}` : ''}`, kind: 'note', title, body, source: 'agent', tags: input.tags ?? [], author: input.author ?? 'agent' }
}

export async function rememberKnowledge(input: RememberInput, store: KbStore, index: KbIndex, embedder: Embedder): Promise<KbStoredArticle> {
  await store.ensure()
  await index.ensure(embedder.dimensions)
  const article = noteArticle(input)
  const hash = articleHash(article)
  const saved = await store.save(article, hash, null)
  await indexArticle(index, embedder, { ...saved, hash })
  return saved
}
