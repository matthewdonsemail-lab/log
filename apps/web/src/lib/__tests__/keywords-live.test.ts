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
  })
})
