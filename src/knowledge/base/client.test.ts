import { describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { hashEmbedder } from '../../search/conversations/helpers/embed'
import { articleHash, chunksOf, collectAll, collectRules, kbConfig, keywordQuery, kindOf, kindValue, noteArticle, rememberKnowledge, scrubSecrets, searchKnowledge, splitText, syncKnowledge } from './index'
import type { KbArticle, KbChunk, KbIndex, KbStore, KbStoredArticle } from './index'

function memoryStore(): KbStore & { rows: Map<string, KbStoredArticle> } {
  const rows = new Map<string, KbStoredArticle>()
  let next = 1
  return {
    rows,
    async ensure() {
      return []
    },
    async list() {
      return [...rows.values()]
    },
    async get(key) {
      return rows.get(key) ?? null
    },
    async save(article, hash, id) {
      const saved = { ...article, hash, id: id ?? `row${next++}` }
      rows.set(article.key, saved)
      return saved
    },
    async createMany(items) {
      return Promise.all(items.map(({ article, hash }) => this.save(article, hash, null)))
    },
  }
}

function memoryIndex(): KbIndex & { chunkMap: Map<string, { chunk: KbChunk; vector: Float32Array }> } {
  const chunkMap = new Map<string, { chunk: KbChunk; vector: Float32Array }>()
  const articles = new Map<string, { hash: string; ids: string[] }>()
  const cosine = (a: Float32Array, b: Float32Array) => a.reduce((s, x, i) => s + x * b[i], 0)
  return {
    chunkMap,
    async ensure() {
      return false
    },
    async hashes() {
      return new Map([...articles].map(([k, v]) => [k, v.hash]))
    },
    async put(article, chunks, vectors) {
      await this.drop(article.key)
      chunks.forEach((chunk, i) => chunkMap.set(chunk.id, { chunk, vector: vectors[i] }))
      articles.set(article.key, { hash: article.hash, ids: chunks.map((c) => c.id) })
    },
    async drop(key) {
      for (const id of articles.get(key)?.ids ?? []) chunkMap.delete(id)
      articles.delete(key)
    },
    async keyword(query, kind, depth) {
      const words = (keywordQuery(query) ?? '').replace(/[()]/g, '').split('|').filter(Boolean)
      return [...chunkMap.values()]
        .filter(({ chunk }) => !kind || chunk.kind === kind)
        .map(({ chunk }) => ({ id: chunk.id, n: words.filter((w) => `${chunk.title} ${chunk.text}`.toLowerCase().includes(w)).length }))
        .filter((x) => x.n > 0)
        .sort((a, b) => b.n - a.n)
        .slice(0, depth)
        .map((x) => x.id)
    },
    async meaning(vector, kind, depth) {
      return [...chunkMap.values()]
        .filter(({ chunk }) => !kind || chunk.kind === kind)
        .sort((a, b) => cosine(b.vector, vector) - cosine(a.vector, vector))
        .slice(0, depth)
        .map(({ chunk }) => chunk.id)
    },
    async chunks(ids) {
      return ids.flatMap((id) => (chunkMap.get(id) ? [chunkMap.get(id)!.chunk] : []))
    },
    close() {},
  }
}

const note = (key: string, title: string, body: string, kind: KbArticle['kind'] = 'doc'): KbArticle => ({ key, kind, title, body, source: 'test', tags: [], author: 'sync' })

describe('knowledge base', () => {
  test('secrets are scrubbed before anything is written', () => {
    const text = 'password=hunter2hunter2 token: abcdefghijklmnop url redis://default:s3cretPass@node02:6380 jwt eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U key Sv30aZ9kQ2mN8xLpR4tY7uW1eB5cV6dF0gH3jK'
    const out = scrubSecrets(text)
    expect(out).not.toContain('hunter2')
    expect(out).not.toContain('s3cretPass')
    expect(out).not.toContain('eyJhbGci')
    expect(out).not.toContain('Sv30aZ9k')
    expect(scrubSecrets('useMWEncryptedBackupsFetchBackupIdsV2Query src/knowledge/base/helpers/collect.ts 2026-10-27T03:03:50Z')).toBe('useMWEncryptedBackupsFetchBackupIdsV2Query src/knowledge/base/helpers/collect.ts 2026-10-27T03:03:50Z')
  })

  test('long text is split on breaks with overlap, short text stays whole', () => {
    expect(splitText('one line')).toEqual(['one line'])
    const parts = splitText(Array.from({ length: 60 }, (_, i) => `Paragraph ${i} says something about the stack.`).join('\n\n'), 400, 50)
    expect(parts.length).toBeGreaterThan(3)
    expect(parts.every((p) => p.length <= 400)).toBe(true)
  })

  test('AGENTS.md rules become one article each', () => {
    const repo = mkdtempSync(join(tmpdir(), 'kbRepo'))
    writeFileSync(join(repo, 'AGENTS.md'), '# AGENTS\n\n## Rule one\n\nRead the API.\n\n## Hard rules (from matt)\n\n1. 2026-10-18 · camelCase everywhere, never kebab-case.\n2. 2026-10-18 · Code lives in src.\n   More text.\n\n## Checks\n\n- run it\n')
    const rules = collectRules(repo)
    expect(rules.filter((r) => r.kind === 'rule').map((r) => r.key)).toEqual(['rule:1', 'rule:2'])
    expect(rules.find((r) => r.key === 'rule:2')?.body).toContain('More text.')
    expect(rules.filter((r) => r.kind === 'section').map((r) => r.title)).toEqual(['Rule one', 'Checks'])
  })

  test('collects skills, docs, memory files and page states, never vendor files', () => {
    const repo = mkdtempSync(join(tmpdir(), 'kbRepo'))
    mkdirSync(join(repo, 'skills', 'inspect'), { recursive: true })
    writeFileSync(join(repo, 'skills', 'inspect', 'SKILL.md'), '---\nname: inspect\ndescription: Look at a page step by step.\n---\n# inspect\n\nSteps.')
    mkdirSync(join(repo, 'docs', 'vendors'), { recursive: true })
    mkdirSync(join(repo, 'docs', 'infra'), { recursive: true })
    writeFileSync(join(repo, 'docs', 'vendors', 'order.md'), '# Order\n\nlogin details')
    writeFileSync(join(repo, 'docs', 'infra', 'node02.md'), '# node02\n\nThe server.')
    const memoryRoot = mkdtempSync(join(tmpdir(), 'kbMemory'))
    mkdirSync(join(memoryRoot, 'C--Users-mande-projects-log-cli', 'memory'), { recursive: true })
    writeFileSync(join(memoryRoot, 'C--Users-mande-projects-log-cli', 'memory', 'cloudflare.md'), '---\nname: cloudflare\ndescription: Where the token lives\nmetadata:\n  type: reference\n---\n\nThe file path.')
    writeFileSync(join(memoryRoot, 'C--Users-mande-projects-log-cli', 'memory', 'MEMORY.md'), '- index')
    const all = collectAll({ repo, memoryRoot })
    const keys = all.map((a) => a.key)
    expect(keys).toContain('skill:inspect')
    expect(keys).toContain('doc:docs/infra/node02.md')
    expect(all.find((a) => a.key === 'doc:docs/infra/node02.md')?.kind).toBe('infra')
    expect(keys).toContain('memory:log-cli/cloudflare')
    expect(all.find((a) => a.key === 'memory:log-cli/cloudflare')?.tags).toContain('reference')
    expect(keys.some((k) => k.includes('vendors'))).toBe(false)
    expect(keys.some((k) => k.endsWith('MEMORY'))).toBe(false)
    expect(keys.some((k) => k.startsWith('pageState:'))).toBe(true)
  })

  test('Twenty select values round-trip', () => {
    expect(kindValue('pageState')).toBe('PAGE_STATE')
    expect(kindOf('PAGE_STATE')).toBe('pageState')
    expect(kindOf('SOMETHING')).toBe('note')
  })

  test('sync writes only what changed and indexes only what changed', async () => {
    const store = memoryStore()
    const index = memoryIndex()
    const embedder = hashEmbedder()
    const articles = [note('doc:a', 'Proxy gate', 'No browser opens without its proxy in the home country.'), note('doc:b', 'Launch budget', 'At most 8 opens a day, 10 minutes apart.')]
    const first = await syncKnowledge(articles, store, index, embedder)
    expect([first.created, first.updated, first.unchanged, first.indexed]).toEqual([2, 0, 0, 2])
    const second = await syncKnowledge(articles, store, index, embedder)
    expect([second.created, second.updated, second.unchanged, second.indexed]).toEqual([0, 0, 2, 0])
    const third = await syncKnowledge([articles[0], { ...articles[1], body: 'At most 8 opens a day.' }], store, index, embedder)
    expect([third.updated, third.indexed]).toEqual([1, 1])
  })

  test('an article written in Twenty by a person is indexed too, and a gone one dropped', async () => {
    const store = memoryStore()
    const index = memoryIndex()
    const embedder = hashEmbedder()
    await store.save(note('note:matt', 'Pricing', 'Charge per listing.', 'note'), '', null)
    const report = await syncKnowledge([], store, index, embedder)
    expect(report.indexed).toBe(1)
    store.rows.delete('note:matt')
    expect((await syncKnowledge([], store, index, embedder)).dropped).toBe(1)
  })

  test('search fuses keyword and meaning and returns each article once', async () => {
    const store = memoryStore()
    const index = memoryIndex()
    const embedder = hashEmbedder()
    const long = Array.from({ length: 40 }, () => 'The tunnel needs its token in the env file to connect.').join('\n\n')
    await syncKnowledge([note('doc:tunnel', 'Cloudflare tunnel', long, 'infra'), note('doc:proxy', 'Proxy gate', 'The proxy must exit in the home country.'), note('rule:12', 'Rule 12', 'No browser opens unless its proxy is attached.', 'rule')], store, index, embedder)
    const hits = await searchKnowledge(index, embedder, 'tunnel token env', { limit: 5 })
    expect(hits[0].key).toBe('doc:tunnel')
    expect(new Set(hits.map((h) => h.key)).size).toBe(hits.length)
    const rules = await searchKnowledge(index, embedder, 'proxy browser', { kind: 'rule' })
    expect(rules.map((h) => h.key)).toEqual(['rule:12'])
  })

  test('remember saves a scrubbed note in both stores', async () => {
    const store = memoryStore()
    const index = memoryIndex()
    const saved = await rememberKnowledge({ text: 'node02 kb-redis password=abcdef123456 lives in the env', tags: ['infra'], now: new Date('2026-10-27T03:00:00Z') }, store, index, hashEmbedder())
    expect(saved.key).toBe('note:20261027T030000Z-node02KbRedisPasswordRedactedLives')
    expect(saved.body).not.toContain('abcdef123456')
    expect([...index.chunkMap.values()].some(({ chunk }) => chunk.key === saved.key)).toBe(true)
  })

  test('config comes from the env or the private files, and says what is missing', () => {
    expect(kbConfig({ KB_TWENTY_API_KEY_FILE: '/nope', KB_REDIS_URL_FILE: '/nope' })).toEqual({ missing: 'KB_TWENTY_API_KEY (or the file ~/.config/listeningkit/twenty-listeningkit-api-key.txt)' })
    expect(kbConfig({ KB_TWENTY_API_KEY: 'k', KB_REDIS_URL: 'redis://x', KB_TWENTY_URL: 'https://t' })).toEqual({ twentyUrl: 'https://t', twentyKey: 'k', redisUrl: 'redis://x' })
  })

  test('article hash and chunks are stable', () => {
    const a = note('doc:x', 'X', 'body')
    expect(articleHash(a)).toBe(articleHash({ ...a }))
    expect(chunksOf(a)[0].id).toMatch(/^[0-9a-f]{20}:0$/)
    expect(noteArticle({ text: 'First line\nmore', now: new Date('2026-01-01T00:00:00Z') }).title).toBe('First line')
  })
})
