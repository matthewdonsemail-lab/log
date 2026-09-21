import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hasScope, normalizeScopes, SCOPES } from './lib/scopes'
import schema from './schema'

const modules = {
  './_generated/server.js': async () => ({}),
  './_generated/api.js': () => import('./_generated/api.js'),
  './accounts.ts': () => import('./accounts'),
  './apiKeys.ts': () => import('./apiKeys'),
  './feed.ts': () => import('./feed'),
  './hits.ts': () => import('./hits'),
  './http.ts': () => import('./http'),
  './ingest.ts': () => import('./ingest'),
  './keywords.ts': () => import('./keywords'),
  './plan.ts': () => import('./plan'),
  './publicApi.ts': () => import('./publicApi'),
  './reddit.ts': () => import('./reddit'),
  './watch.ts': () => import('./watch'),
}

const NOW = Date.UTC(2026, 8, 21, 12, 0, 0)
const ALICE = 'https://test.example|alice'

beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(NOW) })
afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs() })

function setup() {
  const t = convexTest(schema, modules)
  return {
    t,
    alice: t.withIdentity({ subject: 'alice', issuer: 'https://test.example' }),
    bob: t.withIdentity({ subject: 'bob', issuer: 'https://test.example' }),
  }
}
type T = ReturnType<typeof setup>['t']
type Client = ReturnType<T['withIdentity']>

async function makeKey(client: Client, scopes?: string[]) {
  return (await client.mutation(anyApi.apiKeys.createKey, { label: 'k', ...(scopes ? { scopes } : {}) })) as { id: string; secret: string; scopes: string[] }
}

const call = (t: T, method: string, path: string, secret: string, body?: unknown, headers: Record<string, string> = {}) =>
  t.fetch(path, { method, headers: { Authorization: `Bearer ${secret}`, ...headers }, ...(body === undefined ? {} : { body: typeof body === 'string' ? body : JSON.stringify(body) }) })

describe('scopes', () => {
  it('always include read, keep a fixed order, and drop what is unknown', () => {
    expect(SCOPES).toEqual(['read', 'write:phrases', 'webhooks'])
    expect(normalizeScopes(undefined)).toEqual(['read'])
    expect(normalizeScopes([])).toEqual(['read'])
    expect(normalizeScopes(['webhooks', 'write:phrases', 'write:phrases', 'admin'])).toEqual(['read', 'write:phrases', 'webhooks'])
    expect(hasScope(['write:phrases'], 'read')).toBe(true)
    expect(hasScope(['read'], 'write:phrases')).toBe(false)
  })

  it('are chosen when the key is made, listed with it, and refuse anything unknown', async () => {
    const { alice } = setup()
    expect((await makeKey(alice)).scopes).toEqual(['read'])
    expect((await makeKey(alice, ['write:phrases'])).scopes).toEqual(['read', 'write:phrases'])
    const listed = await alice.query(anyApi.apiKeys.listKeys, {})
    expect(listed.map((key: { scopes: string[] }) => key.scopes)).toEqual([['read'], ['read', 'write:phrases']])
    await expect(alice.mutation(anyApi.apiKeys.createKey, { label: 'bad', scopes: ['admin'] })).rejects.toThrow()
  })

  it('leave a key made before scopes existed with read only', async () => {
    const { t } = setup()
    const secret = 'lk_api_' + 'c'.repeat(64)
    const { sha256Hex } = await import('./lib/hash')
    await t.run(ctx => ctx.db.insert('apiKeys', { owner: ALICE, label: 'old', prefix: secret.slice(0, 14), keyHash: '' }))
    await t.run(async ctx => { const row = (await ctx.db.query('apiKeys').first())!; await ctx.db.patch(row._id, { keyHash: await sha256Hex(secret) }) })
    expect((await call(t, 'GET', '/api/v1/me', secret)).status).toBe(200)
    const denied = await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'need a helper', platform: 'x' })
    expect(denied.status).toBe(403)
  })

  it('stop a read key from writing, and say which scope is missing', async () => {
    const { t, alice } = setup()
    const { secret } = await makeKey(alice)
    const res = await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'need a helper', platform: 'x' })
    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ error: { code: 'forbidden', message: 'This key does not have the "write:phrases" scope. Make a new key with it ticked.' } })
    for (const [method, path, body] of [['PATCH', '/api/v1/keywords/abcdefgh12345', { status: 'paused' }], ['DELETE', '/api/v1/keywords/abcdefgh12345', undefined]] as const) {
      expect((await call(t, method, path, secret, body)).status, method).toBe(403)
    }
    expect((await alice.query(anyApi.keywords.list, {})).keywords).toHaveLength(0)
  })

  it('let a write key read as well', async () => {
    const { t, alice } = setup()
    const { secret } = await makeKey(alice, ['write:phrases'])
    for (const path of ['/api/v1/me', '/api/v1/keywords', '/api/v1/matches']) expect((await call(t, 'GET', path, secret)).status, path).toBe(200)
  })
})

describe('adding a phrase (POST /keywords)', () => {
  it('creates it, answers 201 with the phrase, and it shows in the dashboard too', async () => {
    const { t, alice } = setup()
    const { secret } = await makeKey(alice, ['write:phrases'])
    const res = await call(t, 'POST', '/api/v1/keywords', secret, { phrase: '  need a   bookkeeper ', platform: 'reddit', community: 'r/SmallBusiness' })
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.data).toMatchObject({ phrase: 'need a bookkeeper', platform: 'reddit', community: 'smallbusiness', status: 'listening', matches: 0 })
    const listed = (await alice.query(anyApi.keywords.list, {})).keywords
    expect(listed).toHaveLength(1)
    expect(listed[0].id).toBe(body.data.id)
    expect(JSON.stringify(body)).not.toMatch(/owner|test\.example/)
  })

  it('follows the Free plan exactly like the dashboard: one per platform, shared both ways', async () => {
    const { t, alice } = setup()
    const { secret } = await makeKey(alice, ['write:phrases'])
    expect((await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'first', platform: 'x' })).status).toBe(201)
    const second = await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'second', platform: 'x' })
    expect(second.status).toBe(403)
    expect(await second.json()).toEqual({ error: { code: 'plan_limit', message: expect.stringContaining('The Free plan has 1 X phrase at a time') } })
    expect((await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'first', platform: 'facebook' })).status).toBe(201)   // another platform has its own slot
    // the dashboard sees the slot the API used, and the API sees the one the dashboard used
    await expect(alice.mutation(anyApi.keywords.create, { phrase: 'third', platform: 'x' })).rejects.toThrow('The Free plan')
    await alice.mutation(anyApi.keywords.create, { phrase: 'dashboard one', platform: 'reddit', subreddit: 'a' })
    expect((await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'api one', platform: 'reddit', community: 'b' })).status).toBe(403)
  })

  it('follows the operator raising the limit', async () => {
    const { t, alice } = setup()
    vi.stubEnv('PLAN_PHRASES_PER_PLATFORM', '2')
    const { secret } = await makeKey(alice, ['write:phrases'])
    expect((await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'one', platform: 'x' })).status).toBe(201)
    expect((await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'two', platform: 'x' })).status).toBe(201)
    expect((await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'three', platform: 'x' })).status).toBe(403)
  })

  it('says exactly what is wrong with a bad request', async () => {
    const { t, alice } = setup()
    vi.stubEnv('PLAN_PHRASES_PER_PLATFORM', '5')
    const { secret } = await makeKey(alice, ['write:phrases'])
    const cases: [unknown, number, string, string][] = [
      ['{oops', 400, 'invalid_json', 'JSON object'],
      ['[]', 400, 'invalid_json', 'JSON object'],
      ['"text"', 400, 'invalid_json', 'JSON object'],
      [{ platform: 'x' }, 400, 'invalid_parameter', 'phrase must be a string'],
      [{ phrase: 'ok', platform: 'myspace' }, 400, 'invalid_parameter', 'platform must be reddit, x or facebook'],
      [{ phrase: 'ok', platform: 7 }, 400, 'invalid_parameter', 'platform must be a string'],
      [{ phrase: 'a', platform: 'x' }, 400, 'invalid_request', 'A phrase needs 2-100 characters'],
      [{ phrase: 'ok phrase', platform: 'reddit' }, 400, 'invalid_request', 'Pick a subreddit'],
      [{ phrase: 'ok phrase', platform: 'x', community: 'nope' }, 400, 'invalid_request', 'Only Reddit phrases take a subreddit'],
      [{ phrase: 'x'.repeat(5000), platform: 'x' }, 413, 'payload_too_large', 'too large'],
    ]
    for (const [body, status, code, message] of cases) {
      const res = await call(t, 'POST', '/api/v1/keywords', secret, body)
      const json = await res.json()
      expect([res.status, json.error.code], JSON.stringify(body).slice(0, 40)).toEqual([status, code])
      expect(json.error.message).toContain(message)
    }
    expect((await alice.query(anyApi.keywords.list, {})).keywords).toHaveLength(0)
  })

  it('says "conflict" for the same phrase twice', async () => {
    const { t, alice } = setup()
    vi.stubEnv('PLAN_PHRASES_PER_PLATFORM', '5')
    const { secret } = await makeKey(alice, ['write:phrases'])
    await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'need a helper', platform: 'x' })
    const again = await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'Need A Helper', platform: 'x' })
    expect([again.status, (await again.json()).error.code]).toEqual([409, 'conflict'])
  })

  it('can be retried safely with an Idempotency-Key', async () => {
    const { t, alice } = setup()
    const { secret } = await makeKey(alice, ['write:phrases'])
    const headers = { 'Idempotency-Key': 'order-1' }
    const first = await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'need a helper', platform: 'x' }, headers)
    const retry = await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'need a helper', platform: 'x' }, headers)
    expect([first.status, retry.status]).toEqual([201, 200])
    expect(retry.headers.get('Idempotent-Replayed')).toBe('true')
    expect((await retry.json()).data.id).toBe((await first.json()).data.id)
    expect((await alice.query(anyApi.keywords.list, {})).keywords).toHaveLength(1)
    // after the phrase is gone, the same key makes a fresh one
    const id = (await alice.query(anyApi.keywords.list, {})).keywords[0].id
    await alice.mutation(anyApi.keywords.remove, { id })
    expect((await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'need a helper', platform: 'x' }, headers)).status).toBe(201)
    expect((await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'x', platform: 'x' }, { 'Idempotency-Key': 'bad key!' })).status).toBe(400)
  })
})

describe('changing and removing a phrase', () => {
  async function withPhrase() {
    const s = setup()
    const { secret } = await makeKey(s.alice, ['write:phrases'])
    const made = await (await call(s.t, 'POST', '/api/v1/keywords', secret, { phrase: 'need a helper', platform: 'x' })).json()
    return { ...s, secret, id: made.data.id as string }
  }

  it('pauses and resumes', async () => {
    const { t, alice, secret, id } = await withPhrase()
    const paused = await call(t, 'PATCH', `/api/v1/keywords/${id}`, secret, { status: 'paused' })
    expect([paused.status, (await paused.json()).data.status]).toEqual([200, 'paused'])
    expect((await alice.query(anyApi.keywords.list, {})).keywords[0].status).toBe('paused')
    expect((await (await call(t, 'PATCH', `/api/v1/keywords/${id}`, secret, { status: 'listening' })).json()).data.status).toBe('listening')
    const bad = await call(t, 'PATCH', `/api/v1/keywords/${id}`, secret, { status: 'deleted' })
    expect([bad.status, (await bad.json()).error.message]).toEqual([400, 'status must be listening or paused'])
  })

  it('deletes a phrase and its matches', async () => {
    const { t, alice, secret, id } = await withPhrase()
    await t.run(async ctx => {
      const kw = (await ctx.db.query('keywords').first())!
      const postId = await ctx.db.insert('posts', { owner: ALICE, accountId: kw.accountId, platform: 'x', externalId: 'p', authorName: 'a', body: ['b'], url: 'https://x.com/a', likes: 0, comments: 0 })
      await ctx.db.insert('hits', { owner: ALICE, keywordId: kw._id, postId, phrase: 'need a helper', platform: 'x' })
    })
    const res = await call(t, 'DELETE', `/api/v1/keywords/${id}`, secret)
    expect([res.status, await res.json()]).toEqual([200, { data: { id, deleted: true } }])
    expect((await alice.query(anyApi.keywords.list, {})).keywords).toHaveLength(0)
    expect(await t.run(ctx => ctx.db.query('hits').take(5))).toHaveLength(0)
    expect((await call(t, 'DELETE', `/api/v1/keywords/${id}`, secret)).status).toBe(404)   // already gone
    // the slot is free again
    expect((await call(t, 'POST', '/api/v1/keywords', secret, { phrase: 'another', platform: 'x' })).status).toBe(201)
  })

  it('cannot reach anyone else\'s phrase, and cannot tell that it exists', async () => {
    const { t, bob, secret, id } = await withPhrase()
    const other = await makeKey(bob, ['write:phrases'])
    for (const [method, body] of [['PATCH', { status: 'paused' }], ['DELETE', undefined], ['GET', undefined]] as const) {
      const res = await call(t, method, `/api/v1/keywords/${id}`, other.secret, body)
      expect([res.status, (await res.json()).error.code], method).toEqual([404, 'not_found'])
    }
    expect((await call(t, 'GET', `/api/v1/keywords/${id}`, secret)).status).toBe(200)   // still there for its owner
  })

  it('answers 404 for an address that is not an id', async () => {
    const { t, secret } = await withPhrase()
    for (const path of ['/api/v1/keywords/x', '/api/v1/keywords/a/b', '/api/v1/keywords/not%20an%20id!!', '/api/v1/keywords/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa']) {
      expect((await call(t, 'DELETE', path, secret)).status, path).toBe(404)
    }
  })
})

describe('reading one thing', () => {
  it('returns one phrase or one match for its owner only', async () => {
    const { t, alice, bob } = setup()
    const { secret } = await makeKey(alice)
    const other = await makeKey(bob)
    await alice.mutation(anyApi.keywords.create, { phrase: 'need a helper', platform: 'x' })
    const hitId = await t.run(async ctx => {
      const kw = (await ctx.db.query('keywords').first())!
      const postId = await ctx.db.insert('posts', { owner: ALICE, accountId: kw.accountId, platform: 'x', externalId: 'p', authorName: 'someone', body: ['hello there'], url: 'https://x.com/a/status/1', likes: 2, comments: 1 })
      return await ctx.db.insert('hits', { owner: ALICE, keywordId: kw._id, postId, phrase: 'need a helper', platform: 'x', score: 88, intent: 'looking_for_help', reason: 'asks' })
    })
    const one = await (await call(t, 'GET', `/api/v1/matches/${hitId}`, secret)).json()
    expect(one.data).toMatchObject({ id: hitId, score: 88, phrase: 'need a helper', post: { author: 'someone', text: 'hello there' } })
    const theirs = await call(t, 'GET', `/api/v1/matches/${hitId}`, other.secret)
    expect([theirs.status, (await theirs.json()).error.code]).toEqual([404, 'not_found'])
    const kwId = (await alice.query(anyApi.keywords.list, {})).keywords[0].id
    expect((await (await call(t, 'GET', `/api/v1/keywords/${kwId}`, secret)).json()).data.phrase).toBe('need a helper')
    expect((await call(t, 'GET', `/api/v1/matches/${kwId}`, secret)).status).toBe(404)   // a phrase id is not a match id
  })
})
