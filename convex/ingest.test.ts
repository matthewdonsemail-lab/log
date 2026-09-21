import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { internal } from './_generated/api'
import schema from './schema'
import { normalizePushedPost } from './lib/posts'

const modules = {
  './_generated/server.js': async () => ({}),
  './_generated/api.js': () => import('./_generated/api.js'),
  './accounts.ts': () => import('./accounts'),
  './feed.ts': () => import('./feed'),
  './ingest.ts': () => import('./ingest'),
  './keywords.ts': () => import('./keywords'),
  './http.ts': () => import('./http'),
}

function setup() {
  const t = convexTest(schema, modules)
  return {
    t,
    alice: t.withIdentity({ subject: 'alice', issuer: 'https://test.example' }),
    bob: t.withIdentity({ subject: 'bob', issuer: 'https://test.example' }),
  }
}

const post = {
  externalId: 'x-1790000000000000001',
  authorName: 'someone',
  body: ['looking for a bookkeeper'],
  url: 'https://x.com/someone/status/1790000000000000001',
  timestamp: '2026-09-18T10:00:00Z',
  likes: 4,
  comments: 1,
}

function push(t: ReturnType<typeof setup>['t'], secret: string, body: unknown) {
  return t.fetch('/ingest', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

afterEach(() => { vi.unstubAllEnvs() })
beforeEach(() => { vi.stubEnv('PLAN_PHRASES_PER_PLATFORM', '100'); vi.stubEnv('PLAN_ACCOUNTS_PER_PLATFORM', '100') })  // these suites are about matching, not the Free plan

describe('pushed post normalization', () => {
  it('keeps the feed contract and drops junk', () => {
    expect(normalizePushedPost(post)).toMatchObject({ externalId: post.externalId, likes: 4, timestamp: '2026-09-18T10:00:00.000Z' })
    expect(normalizePushedPost(null)).toBeNull()
    expect(normalizePushedPost({ ...post, externalId: ' ' })).toBeNull()
    expect(normalizePushedPost({ ...post, url: 'javascript:alert(1)' })).toBeNull()
    expect(normalizePushedPost({ ...post, url: 'not a url' })).toBeNull()
    expect(normalizePushedPost({ ...post, likes: 'many', comments: -3 })).toMatchObject({ likes: 0, comments: 0 })
    expect(normalizePushedPost({ ...post, body: 'plain string' })?.body).toEqual(['plain string'])
    expect(normalizePushedPost({ ...post, timestamp: 'yesterday' })).not.toHaveProperty('timestamp')
  })
})

describe('ingest keys and the /ingest endpoint', () => {
  it('shows the secret once and stores only its hash', async () => {
    const { alice } = setup()
    const created = await alice.mutation(anyApi.ingest.createKey, { label: 'x client' })
    expect(created.secret).toMatch(/^lk_ingest_[a-f0-9]{64}$/)
    const listed = await alice.query(anyApi.ingest.listKeys, {})
    expect(listed).toEqual([expect.objectContaining({ label: 'x client', prefix: created.prefix, lastUsedAt: null })])
    expect(JSON.stringify(listed)).not.toContain(created.secret)
  })

  it('ingests under the key owner and creates that platform account once', async () => {
    const { t, alice } = setup()
    const { secret } = await alice.mutation(anyApi.ingest.createKey, { label: 'x client' })
    const first = await push(t, secret, { platform: 'x', posts: [post, { junk: true }] })
    expect(first.status).toBe(200)
    expect(await first.json()).toMatchObject({ ingested: 1, skipped: 1 })
    const again = await push(t, secret, { platform: 'x', posts: [{ ...post, likes: 9 }] })
    expect(again.status).toBe(200)
    const feed = await alice.query(anyApi.feed.list, {})
    expect(feed.items).toHaveLength(1)
    expect(feed.items[0]).toMatchObject({ platform: 'x', likes: 9 })
    expect((await alice.query(anyApi.accounts.list, {})).accounts).toEqual([
      expect.objectContaining({ platform: 'x', label: 'X ingest' }),
    ])
    expect((await alice.query(anyApi.ingest.listKeys, {}))[0].lastUsedAt).not.toBeNull()
  })

  it('never lets one owner see or write another owner\'s data', async () => {
    const { t, alice, bob } = setup()
    const { secret } = await alice.mutation(anyApi.ingest.createKey, { label: 'fb client' })
    await push(t, secret, { platform: 'facebook', posts: [post] })
    expect((await bob.query(anyApi.feed.list, {})).items).toHaveLength(0)
    expect(await bob.query(anyApi.ingest.listKeys, {})).toEqual([])
    const [key] = await alice.query(anyApi.ingest.listKeys, {})
    await expect(bob.mutation(anyApi.ingest.revokeKey, { id: key.id })).rejects.toThrow('Key not found')
  })

  it('rejects missing, wrong, and revoked keys', async () => {
    const { t, alice } = setup()
    const noAuth = await t.fetch('/ingest', { method: 'POST', body: '{}' })
    expect(noAuth.status).toBe(401)
    const wrong = await push(t, `lk_ingest_${'a'.repeat(64)}`, { platform: 'x', posts: [post] })
    expect(wrong.status).toBe(401)
    const { id, secret } = await alice.mutation(anyApi.ingest.createKey, { label: 'temp' })
    await alice.mutation(anyApi.ingest.revokeKey, { id })
    expect((await push(t, secret, { platform: 'x', posts: [post] })).status).toBe(401)
  })

  it('validates the request shape', async () => {
    const { t, alice } = setup()
    const { secret } = await alice.mutation(anyApi.ingest.createKey, { label: 'shape' })
    expect((await push(t, secret, { platform: 'myspace', posts: [post] })).status).toBe(400)
    expect((await push(t, secret, { platform: 'x', posts: [] })).status).toBe(400)
    expect((await push(t, secret, { platform: 'x', posts: Array(101).fill(post) })).status).toBe(400)
    expect((await push(t, secret, { platform: 'x', posts: [{ nope: 1 }] })).status).toBe(422)
    const badJson = await t.fetch('/ingest', { method: 'POST', headers: { Authorization: `Bearer ${secret}` }, body: '{oops' })
    expect(badJson.status).toBe(400)
  })

  it('caps keys per owner', async () => {
    const { alice } = setup()
    for (let i = 0; i < 10; i++) await alice.mutation(anyApi.ingest.createKey, { label: `k${i}` })
    await expect(alice.mutation(anyApi.ingest.createKey, { label: 'one too many' })).rejects.toThrow('limit')
  })
})

describe('operator cleanup', () => {
  it('deletes only that owner\'s posts by that exact author', async () => {
    const { t, alice, bob } = setup()
    const a = await alice.mutation(anyApi.ingest.createKey, { label: 'a' })
    const b = await bob.mutation(anyApi.ingest.createKey, { label: 'b' })
    await push(t, a.secret, { platform: 'x', posts: [
      { ...post, externalId: '1', authorName: 'qa_bot' },
      { ...post, externalId: '2', authorName: 'qa_bot' },
      { ...post, externalId: '3', authorName: 'real_person' },
    ] })
    await push(t, b.secret, { platform: 'x', posts: [{ ...post, externalId: '1', authorName: 'qa_bot' }] })
    const owner = (await t.run(async ctx => (await ctx.db.query('accounts').first())!.owner)) as string
    const result = await t.mutation(internal.feed.purgeAuthor, { owner, authorName: 'qa_bot' })
    expect(result.deleted).toBe(2)
    const left = (await alice.query(anyApi.feed.list, {})).items.map((i: { authorName: string }) => i.authorName)
    expect(left).toEqual(['real_person'])
    expect((await bob.query(anyApi.feed.list, {})).items).toHaveLength(1)
  })
})

describe('the /phrases endpoint for the local helper', () => {
  const get = (t: ReturnType<typeof setup>['t'], secret: string, platform = 'x') =>
    t.fetch(`/phrases?platform=${platform}`, { headers: { Authorization: `Bearer ${secret}` } })

  it("lists only the owner's listening phrases for that platform", async () => {
    const { t, alice, bob } = setup()
    const a = await alice.mutation(anyApi.ingest.createKey, { label: 'helper' })
    await alice.mutation(anyApi.keywords.create, { phrase: 'switching accountants', platform: 'x' })
    await alice.mutation(anyApi.keywords.create, { phrase: 'paused one', platform: 'x' })
    await alice.mutation(anyApi.keywords.create, { phrase: 'reddit phrase', platform: 'reddit', subreddit: 'ipad' })
    await bob.mutation(anyApi.keywords.create, { phrase: 'bobs private phrase', platform: 'x' })
    const list = await alice.query(anyApi.keywords.list, {})
    const paused = list.keywords.find((k: { phrase: string }) => k.phrase === 'paused one')
    await alice.mutation(anyApi.keywords.setStatus, { id: paused.id, status: 'paused' })

    const res = await get(t, a.secret)
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('no-store')
    expect(await res.json()).toEqual({ platform: 'x', phrases: [{ phrase: 'switching accountants', subreddit: null }] })
    const reddit = await (await get(t, a.secret, 'reddit')).json()
    expect(reddit.phrases).toEqual([{ phrase: 'reddit phrase', subreddit: 'ipad' }])
  })

  it('rejects missing, wrong and revoked keys and unknown platforms', async () => {
    const { t, alice } = setup()
    const key = await alice.mutation(anyApi.ingest.createKey, { label: 'k' })
    expect((await t.fetch('/phrases?platform=x')).status).toBe(401)
    expect((await get(t, `lk_ingest_${'a'.repeat(64)}`)).status).toBe(401)
    expect((await get(t, key.secret, 'myspace')).status).toBe(400)
    await alice.mutation(anyApi.ingest.revokeKey, { id: key.id })
    expect((await get(t, key.secret)).status).toBe(401)
  })

  it("marks the owner's X phrases as checked by the helper when it pushes, and no one else's", async () => {
    const { t, alice, bob } = setup()
    const key = await alice.mutation(anyApi.ingest.createKey, { label: 'helper' })
    await alice.mutation(anyApi.keywords.create, { phrase: 'switching accountants', platform: 'x' })
    await bob.mutation(anyApi.keywords.create, { phrase: 'switching accountants', platform: 'x' })
    await alice.mutation(anyApi.keywords.create, { phrase: 'ipad', platform: 'reddit', subreddit: 'ipad' })
    const before = Date.now()
    await push(t, key.secret, { platform: 'x', posts: [{ externalId: '1', url: 'https://x.com/a/status/1', authorName: 'a', body: ['thinking about switching accountants'], likes: 0, comments: 0 }] })
    const mine = (await alice.query(anyApi.keywords.list, {})).keywords
    const xPhrase = mine.find((k: { platform: string }) => k.platform === 'x')
    const redditPhrase = mine.find((k: { platform: string }) => k.platform === 'reddit')
    expect(xPhrase.lastSource).toBe('helper')
    expect(xPhrase.lastCheckedAt).toBeGreaterThanOrEqual(before)
    expect(xPhrase.signalsCount).toBe(1)
    expect(redditPhrase.lastCheckedAt).toBeNull()
    expect((await bob.query(anyApi.keywords.list, {})).keywords[0].lastCheckedAt).toBeNull()
  })
})
