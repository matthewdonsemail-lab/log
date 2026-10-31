import { ConvexError } from 'convex/values'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createKeyword, deleteKeyword, getKeywords, saveKeyword } from '../keywords'
import { setApiTokenProvider } from '../transport'

const calls: { method: string; ref: string; args: unknown }[] = []
let listing: unknown[] = []
let failWith: Error | null = null

vi.mock('convex/browser', () => ({
  ConvexHttpClient: class {
    constructor(readonly url: string) {}
    setAuth() {}
    async query(ref: unknown, args: unknown) { return this.call('query', ref, args) }
    async mutation(ref: unknown, args: unknown) { return this.call('mutation', ref, args) }
    private async call(method: string, ref: unknown, args: unknown) {
      const name = String((ref as Record<symbol, unknown>)[Symbol.for('functionName')])
      calls.push({ method, ref: name, args })
      if (failWith) throw failWith
      if (name === 'keywords:list') return { keywords: listing }
      if (name === 'keywords:create') return { keyword: listing[0] }
      return null
    }
  },
}))

const row = { id: 'k1', phrase: 'need a bookkeeper', platform: 'reddit', status: 'listening', subreddit: 'smallbusiness', signalsCount: 3, addedAt: 1789754000000, lastCheckedAt: null, lastSource: null }

beforeEach(() => {
  calls.length = 0
  listing = [row, { ...row, id: 'k2', platform: 'x', subreddit: null, phrase: 'switching' }]
  failWith = null
  vi.stubEnv('VITE_API_MODE', 'live')
  vi.stubEnv('VITE_CONVEX_URL', 'https://example.convex.cloud')
  setApiTokenProvider(async () => 'token')
})
afterEach(() => { vi.unstubAllEnvs(); setApiTokenProvider(async () => null) })

describe('keywords on Convex', () => {
  it('maps live rows to the dashboard shape, with the subreddit as the group', async () => {
    const all = await getKeywords()
    expect(all[0]).toEqual({
      id: 'k1', phrase: 'need a bookkeeper', platform: 'reddit', status: 'listening', signalsCount: 3,
      addedAt: new Date(1789754000000).toISOString(), groupId: 'smallbusiness',
    })
    expect(await getKeywords({ platform: 'x' })).toHaveLength(1)
    expect(await getKeywords({ groupId: null })).toHaveLength(1)
    expect(await getKeywords({ groupId: 'smallbusiness' })).toHaveLength(1)
  })

  it('creates, pauses and removes through Convex', async () => {
    const made = await createKeyword({ phrase: 'need a bookkeeper', platform: 'reddit', groupId: 'smallbusiness' })
    expect(made.id).toBe('k1')
    expect(calls.at(-1)).toEqual({ method: 'mutation', ref: 'keywords:create', args: { phrase: 'need a bookkeeper', platform: 'reddit', subreddit: 'smallbusiness' } })
    await saveKeyword({ ...made, status: 'paused' })
    expect(calls.some((c) => c.ref === 'keywords:setStatus' && JSON.stringify(c.args) === JSON.stringify({ id: 'k1', status: 'paused' }))).toBe(true)
    await deleteKeyword('k1')
    expect(calls.some((c) => c.ref === 'keywords:remove')).toBe(true)
  })

  it('shows the server\'s own message and rejects malformed data', async () => {
    failWith = new ConvexError('You are already listening for that phrase there')
    await expect(createKeyword({ phrase: 'x1', platform: 'reddit', groupId: 'a' })).rejects.toThrow('already listening')
    failWith = null
    listing = [{ id: 'k1' }]
    await expect(getKeywords()).rejects.toThrow('invalid response')
  })

  it('keeps the mock store when no deployment is configured', async () => {
    vi.stubEnv('VITE_CONVEX_URL', '')
    vi.stubEnv('VITE_API_MODE', 'mock')
    expect((await getKeywords()).length).toBeGreaterThan(0)
    expect(calls).toHaveLength(0)
  })
})


describe('freshness wording', () => {
  it('tells a normal person when it was read and warns about old data', async () => {
    const { freshness } = await import('../../components/DashboardKeywordsLive')
    expect(freshness({ lastCheckedAt: null, lastSource: null })).toBe('not checked yet')
    expect(freshness({ lastCheckedAt: Date.now() - 4 * 60_000, lastSource: 'reddit' })).toBe('checked 4 min ago')
    expect(freshness({ lastCheckedAt: Date.now() - 4 * 60_000, lastSource: 'mirror' })).toBe('checked 4 min ago from a backup source, posts may be hours old')
    expect(freshness({ lastCheckedAt: Date.now() - 4 * 60_000, lastSource: 'helper', platform: 'x' })).toBe('checked 4 min ago by your helper')
    expect(freshness({ lastCheckedAt: null, lastSource: null, platform: 'x' })).toBe('waiting for the helper on your computer')
    expect(freshness({ lastCheckedAt: null, lastSource: null, platform: 'reddit' })).toBe('not checked yet')
  })
})

describe('score display helpers', () => {
  const hit = (id: string, score: number | null, matchedAt: number) => ({
    id, phrase: 'p', platform: 'reddit' as const, matchedAt, score, intent: null, reason: null,
    post: { id, title: id, authorName: 'a', url: 'https://reddit.com/x', snippet: null, timestamp: null },
  })

  it('names the intent in plain words and bands the score', async () => {
    const { intentLabel, scoreBand } = await import('../live-keywords')
    expect(intentLabel('looking_for_help')).toBe('Wants help')
    expect(intentLabel('buying')).toBe('Ready to buy')
    expect(intentLabel('anything-else')).toBe('Other')
    expect(intentLabel(null)).toBe('Other')
    expect([scoreBand(85), scoreBand(70), scoreBand(69), scoreBand(40), scoreBand(39)]).toEqual(['strong', 'strong', 'maybe', 'maybe', 'weak'])
  })

  it('puts the best matches first, keeps unscored ones after, and leaves newest-first alone', async () => {
    const { sortHits } = await import('../live-keywords')
    const list = [hit('new-unscored', null, 300), hit('mid', 60, 200), hit('best', 95, 100), hit('tie-newer', 60, 250)]
    expect(sortHits(list, 'newest').map((h) => h.id)).toEqual(['new-unscored', 'mid', 'best', 'tie-newer'])
    expect(sortHits(list, 'best').map((h) => h.id)).toEqual(['best', 'tie-newer', 'mid', 'new-unscored'])
    expect(list.map((h) => h.id)).toEqual(['new-unscored', 'mid', 'best', 'tie-newer'])
  })
})
