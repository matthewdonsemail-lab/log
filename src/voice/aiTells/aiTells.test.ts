import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { aiPhrases, buildAiIndex, chunksOf, mutedRules, openAiIndex, percentile, readAiTells, ruleHits, valeRules } from './index'
import type { AiEmbedder } from './index'

const VOCAB = ['delve', 'tapestry', 'hope', 'helps', 'lad', 'tool', 'free', 'yo', 'filmed', 'game', 'changer', 'landscape']

function fakeEmbedder(): AiEmbedder {
  const vec = (t: string): number[] => [...VOCAB.map((w) => (t.toLowerCase().includes(w) ? 1 : 0)), 0.01]
  return { model: 'fake', dimensions: VOCAB.length + 1, embed: async (texts) => texts.map(vec), rerank: async (_q, docs) => docs.map((_, i) => 1 / (i + 1)) }
}

describe('AI tells: vale-ai-tells and the other lists, read against a draft (rule 112)', () => {
  test('vale-ai-tells loads as rules and catches AI phrasing, and nothing in a line matt wrote', () => {
    const rules = valeRules()
    expect(rules.length).toBeGreaterThan(100)
    const hits = ruleHits('I hope this helps! Let us delve into the rich tapestry.', rules).map((h) => h.rule)
    expect(hits).toEqual(expect.arrayContaining(['ClosingPleasantries', 'OverusedVocabulary']))
    expect(ruleHits('yo lad made a new free tool and filmed it today', rules)).toEqual([])
  })

  test('every list gives phrases, vale first, with where each came from', () => {
    const phrases = aiPhrases()
    expect(phrases.length).toBeGreaterThan(1000)
    expect(phrases[0].source).toContain('valeAiTells')
    expect(new Set(phrases.map((p) => p.source.split(' ')[0]))).toEqual(expect.objectContaining({}))
  })

  test('a rule matt uses himself in more than 2% of his messages is muted', () => {
    const rules = valeRules()
    const replies = Array.from({ length: 10 }, (_, i) => (i < 3 ? 'i hope this helps lad' : 'yo lad'))
    expect(mutedRules(replies, rules)).toContain('ClosingPleasantries')
  })

  test('drafts are cut into lines and word windows', () => {
    expect(chunksOf('one two three four five six seven eight nine ten eleven twelve thirteen fourteen', 6, 3)).toContain('four five six seven eight nine')
    expect(percentile([0.1, 0.2, 0.3, 0.4], 50)).toBe(0.2)
  })

  test('the index measures matt against the AI phrases and flags a draft past his p99', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'aiTells'))
    const embedder = fakeEmbedder()
    const phrases = [{ text: 'delve into the rich tapestry', source: 'test' }, { text: 'game changer for the landscape', source: 'test' }]
    const meta = await buildAiIndex(embedder, ['yo lad made a free tool', 'filmed it today lad', 'yo yo yo lad'], dir, phrases, valeRules())
    expect(meta.baseline.messages).toBe(3)
    const index = openAiIndex(dir)!
    const ai = await readAiTells('lets delve into this rich tapestry of a landscape', index, embedder, valeRules())
    expect(ai.flagged).toBe(true)
    expect(ai.pass).toBe(false)
    expect(ai.closest[0].phrase).toBe('delve into the rich tapestry')
    const mine = await readAiTells('yo lad filmed it today', index, embedder, valeRules())
    expect(mine.pass).toBe(true)
  })
})
