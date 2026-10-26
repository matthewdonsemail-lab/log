import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { benchmark, buildIndex, chunksOf, hashEmbedder, loadConversations, openIndex, percentiles, reciprocalRankFusion, saveConversations, search } from './index'
import type { Conversation } from './index'

const dir = mkdtempSync(join(tmpdir(), 'convSearch'))
afterAll(() => rmSync(dir, { recursive: true, force: true }))

const convo = (id: string, who: string, lines: [boolean, string][]): Conversation => ({
  platform: 'twitter',
  account: 'matthewsoldit',
  conversationId: id,
  box: 'inbox',
  with: [who],
  messages: lines.map(([fromMe, text], i) => ({ id: `${id}m${i}`, at: `2026-10-0${(i % 9) + 1}T00:00:00Z`, from: fromMe ? null : who, fromMe, text })),
})

const corpus = [
  convo('a', 'traviscurnutte', [[false, 'what were you looking for from telnyx partnership or product use'], [true, 'an affiliate deal for the content'], [false, 'we run a referral program with a percent fee']]),
  convo('b', 'zachtheoldham', [[false, 'where are you based would love to interview you for a gtme role'], [true, 'vietnam fully remote']]),
  convo('c', 'jeffrey_ho', [[false, 'how good is the enrichment from treg for pool companies'], [true, 'finds the owner not the office']]),
]

describe('conversation search', () => {
  test('chunks keep who said what and overlap', () => {
    const chunks = chunksOf(convo('x', 'bob', [[false, '1'], [true, '2'], [false, '3'], [true, '4'], [false, '5'], [true, '6']]), 4, 1)
    expect(chunks.length).toBe(2)
    expect(chunks[0].text).toContain('@bob: 1')
    expect(chunks[0].text).toContain('@matthewsoldit: 2')
    expect(chunks[1].messageIds[0]).toBe('xm3')
  })

  test('reciprocal rank fusion rewards agreement', () => {
    const fused = reciprocalRankFusion([['a', 'b', 'c'], ['b', 'a']])
    expect(fused.map((f) => f.id).slice(0, 2).sort()).toEqual(['a', 'b'])
    expect(fused.find((f) => f.id === 'c')!.ranks).toEqual([3, null])
  })

  test('percentiles', () => {
    expect(percentiles([5, 1, 3, 2, 4])).toEqual({ p50: 3, p95: 5, p99: 5, runs: 5 })
  })

  test('saves and loads conversations', () => {
    expect(saveConversations(corpus, join(dir, 'raw'))).toBe(3)
    expect(loadConversations(join(dir, 'raw')).map((c) => c.conversationId).sort()).toEqual(['a', 'b', 'c'])
  })

  test('hybrid search finds by keyword and filters by person', async () => {
    const embedder = hashEmbedder()
    const built = await buildIndex(corpus, embedder, join(dir, 'index'))
    expect(built.chunks).toBe(3)
    const index = await openIndex(embedder, join(dir, 'index'))
    try {
      const hits = await search(index, 'referral fee telnyx', { limit: 3 })
      expect(hits[0].chunk.conversationId).toBe('a')
      expect(hits[0].keywordRank).toBe(1)
      const zach = await search(index, 'role', { with: '@zachtheoldham' })
      expect(zach.every((h) => h.chunk.with.includes('zachtheoldham'))).toBe(true)
      const bench = await benchmark(index, ['treg enrichment', 'interview role'], 2)
      expect(bench.warm.runs).toBe(4)
    } finally {
      await index.close()
    }
  })
})
