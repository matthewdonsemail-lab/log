import { ConvexError } from 'convex/values'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getAccounts, createAccount } from '../connections'
import { getFeed, syncFeed } from '../feed'
import { setApiTokenProvider } from '../transport'

const calls: { method: string; ref: string; args: unknown }[] = []
let reply: (method: string, ref: string) => unknown = () => ({})
let token: string | null = null

vi.mock('convex/browser', () => ({
  ConvexHttpClient: class {
    constructor(readonly url: string) {}
    setAuth(value: string) { token = value }
    async query(ref: unknown, args: unknown) { return this.call('query', ref, args) }
    async mutation(ref: unknown, args: unknown) { return this.call('mutation', ref, args) }
    async action(ref: unknown, args: unknown) { return this.call('action', ref, args) }
    private async call(method: string, ref: unknown, args: unknown) {
      const name = String((ref as Record<symbol, unknown>)[Symbol.for('functionName')])
      calls.push({ method, ref: name, args })
      const out = reply(method, name)
      if (out instanceof Error) throw out
      return out
    }
  },
}))

beforeEach(() => {
  calls.length = 0
  token = null
  vi.stubEnv('VITE_API_MODE', 'live')
  vi.stubEnv('VITE_CONVEX_URL', 'https://example.convex.cloud')
  setApiTokenProvider(async () => 'clerk-convex-token')
})
afterEach(() => { vi.unstubAllEnvs(); setApiTokenProvider(async () => null) })

const item = { id: 'p1', platform: 'reddit', variant: 'post-text', authorName: 'a', timeAgo: '', body: ['hi'], likes: 1, comments: 0, score: null, intent: null, reason: null, keywordId: null }

describe('live transport on Convex (no bridge)', () => {
  it('reads the feed straight from Convex with the caller token and forwards filters', async () => {
    reply = () => ({ items: [item] })
    const feed = await getFeed({ platform: 'reddit', search: ' hello ' })
    expect(feed.items).toHaveLength(1)
    expect(token).toBe('clerk-convex-token')
    expect(calls).toEqual([{ method: 'query', ref: 'feed:list', args: { platform: 'reddit', search: 'hello' } }])
  })

  it('does not hide server or schema errors behind mock rows', async () => {
    reply = () => new ConvexError('Authentication required')
    await expect(getFeed()).rejects.toThrow('Authentication required')
    reply = () => ({ items: [{ likes: 'many' }] })
    await expect(getFeed()).rejects.toThrow('invalid response')
    reply = () => new Error('socket closed')
    await expect(getFeed()).rejects.toThrow('Live feed request failed')
  })

  it('refuses to call Convex without a signed-in token', async () => {
    setApiTokenProvider(async () => null)
    await expect(getFeed()).rejects.toThrow('Sign in')
    expect(calls).toHaveLength(0)
  })

  it('syncs a subreddit through the Convex action and validates the summary', async () => {
    reply = () => ({ accountId: 'a1', fetched: 3, ingested: 2, skipped: 1 })
    expect(await syncFeed(' marketing ')).toEqual({ accountId: 'a1', fetched: 3, ingested: 2, skipped: 1 })
    expect(calls).toEqual([{ method: 'action', ref: 'reddit:syncSubreddit', args: { subreddit: 'marketing', limit: 25 } }])
    reply = () => ({ accountId: 'a1' })
    await expect(syncFeed('marketing')).rejects.toThrow('invalid response')
    reply = () => new ConvexError('Reddit mirror unavailable (HTTP 503) — try again in a moment')
    await expect(syncFeed('marketing')).rejects.toThrow('503')
    await expect(syncFeed('bad name!')).rejects.toThrow('Subreddit')
  })

  it('lists and creates accounts through Convex', async () => {
    const account = { id: 'acc1', platform: 'x', label: 'X', connectedAt: null }
    reply = (method) => (method === 'query' ? { accounts: [account] } : { account, accounts: [account] })
    expect(await getAccounts()).toEqual([account])
    expect(await createAccount('x')).toEqual(account)
    expect(calls.map((c) => c.ref)).toEqual(['accounts:list', 'accounts:createWithResponse'])
    expect(calls[1].args).toEqual({ platform: 'x', label: 'X' })
  })

  it('stays on the bridge when no Convex URL is configured', async () => {
    vi.stubEnv('VITE_CONVEX_URL', '')
    const fetcher = vi.fn().mockResolvedValue(Response.json({ items: [] }))
    vi.stubGlobal('fetch', fetcher)
    expect(await getFeed()).toEqual({ items: [] })
    expect(calls).toHaveLength(0)
    expect(fetcher).toHaveBeenCalled()
    vi.unstubAllGlobals()
  })
})
