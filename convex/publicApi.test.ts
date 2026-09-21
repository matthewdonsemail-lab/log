import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RATE_LIMIT_PER_MINUTE } from './apiKeys'
import { sha256Hex } from './lib/hash'
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

const NOW = Date.UTC(2026, 8, 21, 12, 0, 30)
const ALICE = 'https://test.example|alice'
const BOB = 'https://test.example|bob'

beforeEach(() => { vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(NOW) })
afterEach(() => { vi.useRealTimers() })

function setup() {
  const t = convexTest(schema, modules)
  return {
    t,
    alice: t.withIdentity({ subject: 'alice', issuer: 'https://test.example' }),
    bob: t.withIdentity({ subject: 'bob', issuer: 'https://test.example' }),
  }
}
type T = ReturnType<typeof setup>['t']

async function makeKey(client: ReturnType<T['withIdentity']>, label = 'my script') {
  return (await client.mutation(anyApi.apiKeys.createKey, { label })) as { id: string; secret: string; prefix: string }
}

const get = (t: T, path: string, secret?: string) => t.fetch(path, { headers: secret ? { Authorization: `Bearer ${secret}` } : {} })

let n = 0
/** One match for an owner, created a moment after the previous one so the order is real. */
async function match(t: T, owner: string, over: { platform?: 'reddit' | 'x' | 'facebook'; score?: number | null; text?: string; phrase?: string } = {}) {
  n += 1
  vi.setSystemTime(Date.now() + 1000)
  return await t.run(async ctx => {
    const platform = over.platform ?? 'reddit'
    const accountId = await ctx.db.insert('accounts', { owner, platform, label: `a${n}`, connectedAt: null })
    const keywordId = await ctx.db.insert('keywords', { owner, accountId, platform, phrase: over.phrase ?? 'need a bookkeeper', status: 'listening' })
    const postId = await ctx.db.insert('posts', {
      owner, accountId, platform, externalId: `p${n}`, authorName: `author${n}`, title: `Title ${n}`, body: [over.text ?? `post ${n} text`],
      url: `https://example.com/${n}`, likes: n, comments: 2,
    })
    return await ctx.db.insert('hits', {
      owner, keywordId, postId, phrase: over.phrase ?? 'need a bookkeeper', platform,
      ...(over.score === null ? {} : { score: over.score ?? 80, intent: 'looking_for_help', reason: `reason ${n}`, scoredAt: Date.now() }),
    })
  })
}

describe('API keys', () => {
  it('shows the secret once, keeps only its hash, and never lists it again', async () => {
    const { t, alice } = setup()
    const created = await makeKey(alice)
    expect(created.secret).toMatch(/^lk_api_[0-9a-f]{64}$/)
    expect(created.secret.startsWith(created.prefix)).toBe(true)
    const rows = await t.run(ctx => ctx.db.query('apiKeys').take(10))
    expect(rows).toHaveLength(1)
    expect(rows[0].keyHash).toBe(await sha256Hex(created.secret))
    expect(JSON.stringify(rows)).not.toContain(created.secret)
    const listed = await alice.query(anyApi.apiKeys.listKeys, {})
    expect(listed).toEqual([{ id: created.id, label: 'my script', prefix: created.prefix, scopes: ['read'], createdAt: expect.any(Number), lastUsedAt: null }])
    expect(JSON.stringify(listed)).not.toContain(created.secret)
    expect(JSON.stringify(listed)).not.toContain(rows[0].keyHash)
  })

  it('validates the name, limits how many a person can have, and needs a sign-in', async () => {
    const { t, alice } = setup()
    await expect(alice.mutation(anyApi.apiKeys.createKey, { label: '   ' })).rejects.toThrow('1-80 characters')
    await expect(alice.mutation(anyApi.apiKeys.createKey, { label: 'x'.repeat(81) })).rejects.toThrow('1-80 characters')
    for (let i = 0; i < 5; i++) await makeKey(alice, `key ${i}`)
    await expect(alice.mutation(anyApi.apiKeys.createKey, { label: 'sixth' })).rejects.toThrow('5 API keys')
    await expect(t.mutation(anyApi.apiKeys.createKey, { label: 'nobody' })).rejects.toThrow('Authentication required')
    await expect(t.query(anyApi.apiKeys.listKeys, {})).rejects.toThrow('Authentication required')
  })

  it('can only be listed and revoked by their owner', async () => {
    const { alice, bob } = setup()
    const created = await makeKey(alice)
    expect(await bob.query(anyApi.apiKeys.listKeys, {})).toEqual([])
    await expect(bob.mutation(anyApi.apiKeys.revokeKey, { id: created.id as never })).rejects.toThrow('Key not found')
    await alice.mutation(anyApi.apiKeys.revokeKey, { id: created.id as never })
    expect(await alice.query(anyApi.apiKeys.listKeys, {})).toEqual([])
  })
})

describe('signing in to the API', () => {
  it('needs a valid key in the Authorization header, and says so in plain words', async () => {
    const { t, alice } = setup()
    const { secret } = await makeKey(alice)
    for (const path of ['/api/v1/me', '/api/v1/keywords', '/api/v1/matches']) {
      const none = await get(t, path)
      expect(none.status, path).toBe(401)
      expect(await none.json()).toEqual({ error: { code: 'unauthorized', message: 'Send your API key as: Authorization: Bearer lk_api_...' } })
      expect((await get(t, path, 'lk_api_' + 'a'.repeat(64))).status).toBe(401)
      expect((await get(t, path, secret)).status).toBe(200)
    }
    expect((await t.fetch('/api/v1/me', { headers: { Authorization: secret } })).status).toBe(401)          // missing "Bearer"
    expect((await t.fetch('/api/v1/me', { headers: { Authorization: `Bearer ${secret}x y` } })).status).toBe(401)
  })

  it('does not accept an ingest key, and an API key does not work on the ingest side', async () => {
    const { t, alice } = setup()
    const ingest = (await alice.mutation(anyApi.ingest.createKey, { label: 'helper' })) as { secret: string }
    const { secret } = await makeKey(alice)
    expect((await get(t, '/api/v1/me', ingest.secret)).status).toBe(401)
    expect((await get(t, '/phrases?platform=x', secret)).status).toBe(401)
    expect((await t.fetch('/proxy', { headers: { Authorization: `Bearer ${secret}` } })).status).toBe(401)
  })

  it('stops working the moment the key is revoked', async () => {
    const { t, alice } = setup()
    const { id, secret } = await makeKey(alice)
    expect((await get(t, '/api/v1/me', secret)).status).toBe(200)
    await alice.mutation(anyApi.apiKeys.revokeKey, { id: id as never })
    const res = await get(t, '/api/v1/me', secret)
    expect(res.status).toBe(401)
    expect((await res.json()).error.message).toContain('revoked')
  })

  it('records when the key was last used', async () => {
    const { t, alice } = setup()
    const { secret } = await makeKey(alice)
    expect((await alice.query(anyApi.apiKeys.listKeys, {}))[0].lastUsedAt).toBeNull()
    await get(t, '/api/v1/me', secret)
    expect((await alice.query(anyApi.apiKeys.listKeys, {}))[0].lastUsedAt).toBe(NOW)
  })

  it('offers no way to change anything: only GET exists', async () => {
    const { t, alice } = setup()
    const { secret } = await makeKey(alice)
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
      const res = await t.fetch('/api/v1/keywords', { method, headers: { Authorization: `Bearer ${secret}` }, body: method === 'DELETE' ? undefined : '{}' })
      expect(res.status, method).not.toBe(200)
    }
  })
})

describe('the rate limit', () => {
  it('allows 60 requests a minute per key, then says when to retry, and resets next minute', async () => {
    const { t, alice } = setup()
    const { secret } = await makeKey(alice)
    let last: Response | null = null
    for (let i = 0; i < RATE_LIMIT_PER_MINUTE; i++) last = await get(t, '/api/v1/me', secret)
    expect(last!.status).toBe(200)
    expect(last!.headers.get('X-RateLimit-Limit')).toBe('60')
    expect(last!.headers.get('X-RateLimit-Remaining')).toBe('0')
    const over = await get(t, '/api/v1/me', secret)
    expect(over.status).toBe(429)
    expect(over.headers.get('Retry-After')).toBe('30')  // the clock is at :30 of the minute
    expect((await over.json()).error.code).toBe('rate_limited')
    vi.setSystemTime(NOW + 31_000)
    expect((await get(t, '/api/v1/me', secret)).status).toBe(200)
  })

  it('counts each key separately', async () => {
    const { t, alice, bob } = setup()
    const a = await makeKey(alice)
    const b = await makeKey(bob)
    for (let i = 0; i < RATE_LIMIT_PER_MINUTE + 1; i++) await get(t, '/api/v1/me', a.secret)
    expect((await get(t, '/api/v1/me', a.secret)).status).toBe(429)
    expect((await get(t, '/api/v1/me', b.secret)).status).toBe(200)
  })

  it('reports what is left', async () => {
    const { t, alice } = setup()
    const { secret } = await makeKey(alice)
    expect((await get(t, '/api/v1/me', secret)).headers.get('X-RateLimit-Remaining')).toBe('59')
    expect((await get(t, '/api/v1/me', secret)).headers.get('X-RateLimit-Remaining')).toBe('58')
  })
})

describe('GET /api/v1/me and /keywords', () => {
  it('reports the plan and usage, and the phrases, only for the key\'s owner', async () => {
    const { t, alice, bob } = setup()
    await match(t, ALICE, { platform: 'reddit', phrase: 'need a bookkeeper' })
    await match(t, BOB, { platform: 'x', phrase: 'bob only' })
    const { secret } = await makeKey(alice)
    const me = await (await get(t, '/api/v1/me', secret)).json()
    expect(me.data).toMatchObject({ plan: 'free', name: 'Free', limits: { phrasesPerPlatform: 1, accountsPerPlatform: 1 }, usage: { phrases: { reddit: 1, x: 0, facebook: 0 } } })
    const keywords = await (await get(t, '/api/v1/keywords', secret)).json()
    expect(keywords.data).toEqual([expect.objectContaining({ phrase: 'need a bookkeeper', platform: 'reddit', status: 'listening', matches: 0, lastCheckedAt: null })])
    expect(JSON.stringify(keywords)).not.toContain('bob only')
    const other = await makeKey(bob)
    expect(JSON.stringify(await (await get(t, '/api/v1/keywords', other.secret)).json())).not.toContain('need a bookkeeper')
  })
})

describe('GET /api/v1/matches', () => {
  it('returns matches newest first, with the post and the score', async () => {
    const { t, alice } = setup()
    await match(t, ALICE, { text: 'oldest' })
    await match(t, ALICE, { text: 'middle', score: 55 })
    await match(t, ALICE, { text: 'newest', score: null })
    const { secret } = await makeKey(alice)
    const body = await (await get(t, '/api/v1/matches', secret)).json()
    expect(body.data.map((m: { post: { text: string } }) => m.post.text)).toEqual(['newest', 'middle', 'oldest'])
    expect(body.data[0]).toMatchObject({ score: null, intent: null, reason: null, platform: 'reddit', phrase: 'need a bookkeeper' })
    expect(body.data[1]).toMatchObject({ score: 55, intent: 'looking_for_help', reason: expect.stringContaining('reason') })
    expect(body.data[2].post).toMatchObject({ author: expect.stringContaining('author'), title: expect.stringContaining('Title'), url: expect.stringContaining('https://example.com/'), comments: 2 })
    expect(body.nextCursor).toBeNull()
  })

  it('pages with a cursor that never repeats or skips a match', async () => {
    const { t, alice } = setup()
    for (let i = 1; i <= 5; i++) await match(t, ALICE, { text: `m${i}` })
    const { secret } = await makeKey(alice)
    const seen: string[] = []
    let cursor: number | null = null
    for (let page = 0; page < 6; page++) {
      const body = await (await get(t, `/api/v1/matches?limit=2${cursor === null ? '' : `&before=${cursor}`}`, secret)).json()
      seen.push(...body.data.map((m: { post: { text: string } }) => m.post.text))
      cursor = body.nextCursor
      if (cursor === null) break
    }
    expect(seen).toEqual(['m5', 'm4', 'm3', 'm2', 'm1'])
  })

  it('filters by platform and by minimum score', async () => {
    const { t, alice } = setup()
    await match(t, ALICE, { platform: 'reddit', score: 90, text: 'reddit strong' })
    await match(t, ALICE, { platform: 'x', score: 90, text: 'x strong' })
    await match(t, ALICE, { platform: 'x', score: 30, text: 'x weak' })
    await match(t, ALICE, { platform: 'x', score: null, text: 'x unscored' })
    const { secret } = await makeKey(alice)
    const texts = async (query: string) => (await (await get(t, `/api/v1/matches${query}`, secret)).json()).data.map((m: { post: { text: string } }) => m.post.text)
    expect(await texts('?platform=x')).toEqual(['x unscored', 'x weak', 'x strong'])
    expect(await texts('?min_score=60')).toEqual(['x strong', 'reddit strong'])
    expect(await texts('?platform=x&min_score=60')).toEqual(['x strong'])
    expect(await texts('?min_score=0')).toEqual(['x weak', 'x strong', 'reddit strong'])  // an unscored match has no score to compare
  })

  it('refuses bad parameters with a plain reason', async () => {
    const { t, alice } = setup()
    const { secret } = await makeKey(alice)
    const cases: [string, string][] = [
      ['limit=0', 'limit must be a whole number from 1 to 100'], ['limit=101', 'limit must be a whole number from 1 to 100'], ['limit=abc', 'limit must'],
      ['min_score=101', 'min_score must be a whole number from 0 to 100'], ['min_score=-1', 'min_score must'], ['min_score=1.5', 'min_score must'],
      ['before=-5', 'before must'], ['platform=myspace', 'platform must be reddit, x or facebook'],
    ]
    for (const [query, message] of cases) {
      const res = await get(t, `/api/v1/matches?${query}`, secret)
      expect(res.status, query).toBe(400)
      const body = await res.json()
      expect(body.error.code).toBe('invalid_parameter')
      expect(body.error.message, query).toContain(message)
    }
  })

  it('returns at most 100 a page, 25 by default, and only the key owner\'s matches', async () => {
    const { t, alice, bob } = setup()
    for (let i = 0; i < 30; i++) await match(t, ALICE)
    await match(t, BOB, { text: 'bob secret' })
    const { secret } = await makeKey(alice)
    const dflt = await (await get(t, '/api/v1/matches', secret)).json()
    expect(dflt.data).toHaveLength(25)
    expect(dflt.nextCursor).toEqual(expect.any(Number))
    expect((await (await get(t, '/api/v1/matches?limit=100', secret)).json()).data).toHaveLength(30)
    expect(JSON.stringify(dflt)).not.toContain('bob secret')
    const other = await makeKey(bob)
    expect((await (await get(t, '/api/v1/matches', other.secret)).json()).data.map((m: { post: { text: string } }) => m.post.text)).toEqual(['bob secret'])
  })

  it('trims very long post text', async () => {
    const { t, alice } = setup()
    await match(t, ALICE, { text: 'x'.repeat(5000) })
    const { secret } = await makeKey(alice)
    expect((await (await get(t, '/api/v1/matches', secret)).json()).data[0].post.text).toHaveLength(2000)
  })
})

describe('what the API never says', () => {
  it('leaks neither a secret, a hash, an owner id, nor a login', async () => {
    const { t, alice } = setup()
    await match(t, ALICE)
    const { secret } = await makeKey(alice)
    const hash = await sha256Hex(secret)
    for (const path of ['/api/v1/me', '/api/v1/keywords', '/api/v1/matches', '/api/v1/matches?limit=0']) {
      const text = await (await get(t, path, secret)).text()
      expect(text, path).not.toContain(secret)
      expect(text, path).not.toContain(hash)
      expect(text, path).not.toContain('test.example')
      expect(text, path).not.toMatch(/owner|tokenIdentifier|cookie/i)
    }
    const failure = await (await get(t, '/api/v1/me', 'lk_api_' + 'b'.repeat(64))).text()
    expect(failure).not.toContain('b'.repeat(20))
  })
})
