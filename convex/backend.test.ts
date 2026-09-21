import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { describe, expect, it } from 'vitest'
import schema from './schema'
import { createApp } from '../apps/api/src/app'

// Explicit offline module map; the empty generated marker only identifies the
// module root for convex-test. No deployment or generated client is required.
const modules = {
  './_generated/server.js': async () => ({}),
  './accounts.ts': () => import('./accounts'),
  './feed.ts': () => import('./feed'),
}
const post = { externalId: 'native-1', authorName: 'Alice', body: ['A plumbing question'], url: 'https://example.com/post/1', likes: 4, comments: 2 }

function setup() {
  const t = convexTest(schema, modules)
  return { t, alice: t.withIdentity({ subject: 'alice', issuer: 'https://test.example' }), bob: t.withIdentity({ subject: 'bob', issuer: 'https://test.example' }) }
}

describe('backend foundation', () => {
  it('serves the gateway account/feed contracts against isolated Convex test identities', async () => {
    const { t } = setup()
    const app = createApp({
      verifyToken: async token => { if (!['alice', 'bob'].includes(token)) throw new Error('invalid') },
      backend: token => {
        const user = t.withIdentity({ subject: token, issuer: 'https://test.example' })
        return {
          listAccounts: () => user.query(anyApi.accounts.list, {}),
          createAccount: input => user.mutation(anyApi.accounts.createWithResponse, input),
          feed: input => user.query(anyApi.feed.list, input),
        }
      },
    })
    const headers = { Authorization: 'Bearer alice' }
    const created = await app.request('/api/accounts', { method: 'POST', headers, body: JSON.stringify({ platform: 'reddit' }) })
    expect(created.status).toBe(201)
    const response = await created.json()
    expect(response.accounts).toEqual([response.account])
    expect(response.account.connectedAt).toBeNull()
    await t.mutation(anyApi.feed.ingest, { accountId: response.account.id, posts: [post] })
    const feed = await app.request('/api/feed/reddit?search=plumbing', { headers })
    expect((await feed.json()).items).toHaveLength(1)
    const otherFeed = await app.request('/api/feed', { headers: { Authorization: 'Bearer bob' } })
    expect(await otherFeed.json()).toEqual({ items: [] })
  })

  it('rejects unauthenticated account and feed access', async () => {
    const { t } = setup()
    await expect(t.query(anyApi.accounts.list, {})).rejects.toThrow('Authentication required')
    await expect(t.query(anyApi.feed.list, {})).rejects.toThrow('Authentication required')
    await expect(t.mutation(anyApi.accounts.create, { platform: 'x', label: 'Ops' })).rejects.toThrow('Authentication required')
  })

  it('isolates account metadata and never fabricates connected status', async () => {
    const { alice, bob } = setup()
    await alice.mutation(anyApi.accounts.create, { platform: 'reddit', label: ' Research ' })
    expect((await alice.query(anyApi.accounts.list, {})).accounts).toEqual([
      expect.objectContaining({ label: 'Research', connectedAt: null }),
    ])
    expect(await bob.query(anyApi.accounts.list, {})).toEqual({ accounts: [] })
    await expect(alice.mutation(anyApi.accounts.create, { platform: 'x', label: ' ' })).rejects.toThrow('Label')
  })

  it('deduplicates native IDs per account and enforces feed ownership and filters', async () => {
    const { t, alice, bob } = setup()
    const a = await alice.mutation(anyApi.accounts.create, { platform: 'reddit', label: 'A' })
    const b = await bob.mutation(anyApi.accounts.create, { platform: 'x', label: 'B' })
    await t.mutation(anyApi.feed.ingest, { accountId: a, posts: [post, { ...post, likes: 9 }] })
    await t.mutation(anyApi.feed.ingest, { accountId: b, posts: [{ ...post, body: ['Private to Bob'] }] })
    const result = await alice.query(anyApi.feed.list, { search: 'PLUMBING' })
    expect(result.items).toHaveLength(1)
    expect(result.items[0]).toMatchObject({ likes: 9, comments: 2, platform: 'reddit', timeAgo: '' })
    expect(await alice.query(anyApi.feed.list, { platform: 'x' })).toEqual({ items: [] })
    expect(await bob.query(anyApi.feed.list, { search: 'plumbing' })).toEqual({ items: [] })
    expect((await t.run(ctx => ctx.db.query('posts').collect()))).toHaveLength(2)
  })

  it('rejects invalid ingestion atomically', async () => {
    const { t, alice } = setup()
    const accountId = await alice.mutation(anyApi.accounts.create, { platform: 'facebook', label: 'A' })
    await expect(t.mutation(anyApi.feed.ingest, { accountId, posts: [post, { ...post, externalId: '' }] })).rejects.toThrow('Native post ID')
    expect(await alice.query(anyApi.feed.list, {})).toEqual({ items: [] })
    await expect(t.mutation(anyApi.feed.ingest, { accountId, posts: [{ ...post, timestamp: 'not a date' }] })).rejects.toThrow('timestamp')
  })
})
