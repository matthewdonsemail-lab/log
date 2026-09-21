import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { internal } from './_generated/api'
import { phraseMatches, subredditOf } from './lib/match'
import schema from './schema'

const modules = {
  './_generated/server.js': async () => ({}),
  './_generated/api.js': () => import('./_generated/api.js'),
  './accounts.ts': () => import('./accounts'),
  './feed.ts': () => import('./feed'),
  './hits.ts': () => import('./hits'),
  './http.ts': () => import('./http'),
  './ingest.ts': () => import('./ingest'),
  './keywords.ts': () => import('./keywords'),
  './reddit.ts': () => import('./reddit'),
  './watch.ts': () => import('./watch'),
}

function setup() {
  const t = convexTest(schema, modules)
  return {
    t,
    alice: t.withIdentity({ subject: 'alice', issuer: 'https://test.example' }),
    bob: t.withIdentity({ subject: 'bob', issuer: 'https://test.example' }),
  }
}

let n = 0
const redditPost = (sub: string, title: string, body = '') => ({
  externalId: `t3_p${++n}`, authorName: 'someone', title, body: body ? [body] : [], likes: 1, comments: 0,
  url: `https://reddit.com/r/${sub}/comments/p${n}/x/`,
})

async function pushReddit(t: ReturnType<typeof setup>['t'], secret: string, posts: unknown[]) {
  const res = await t.fetch('/ingest', {
    method: 'POST',
    headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform: 'reddit', posts }),
  })
  return res.json() as Promise<{ ingested: number }>
}

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })
beforeEach(() => { vi.stubEnv('PLAN_PHRASES_PER_PLATFORM', '100'); vi.stubEnv('PLAN_ACCOUNTS_PER_PLATFORM', '100') })  // these suites are about matching, not the Free plan

describe('phrase matching', () => {
  it('matches whole words and phrases, ignoring case and spacing', () => {
    expect(phraseMatches('bookkeeper', 'Need a Bookkeeper!')).toBe(true)
    expect(phraseMatches('need a bookkeeper', 'we NEED   a\nbookkeeper asap')).toBe(true)
    expect(phraseMatches('bookkeeper', 'bookkeepers wanted')).toBe(false)
    expect(phraseMatches('book', 'notebook')).toBe(false)
    expect(phraseMatches('c++', 'I write C++ daily')).toBe(true)
    expect(phraseMatches('  ', 'anything')).toBe(false)
    expect(phraseMatches('a.b', 'axb')).toBe(false)
  })

  it('reads the subreddit from a post url', () => {
    expect(subredditOf('https://reddit.com/r/Marketing/comments/abc/x/')).toBe('marketing')
    expect(subredditOf('https://x.com/a/status/1')).toBeNull()
  })
})

describe('keywords', () => {
  it('creates a cleaned, lowercase-scoped reddit phrase and lists it', async () => {
    const { alice } = setup()
    const { keyword } = await alice.mutation(anyApi.keywords.create, { phrase: '  need   a bookkeeper ', platform: 'reddit', subreddit: 'r/SmallBusiness' })
    expect(keyword).toMatchObject({ phrase: 'need a bookkeeper', subreddit: 'smallbusiness', status: 'listening', signalsCount: 0 })
    expect((await alice.query(anyApi.keywords.list, {})).keywords).toHaveLength(1)
  })

  it('enforces the rules a normal mistake would hit', async () => {
    const { alice } = setup()
    const make = (a: Record<string, unknown>) => alice.mutation(anyApi.keywords.create, a as never)
    await expect(make({ phrase: 'x', platform: 'reddit', subreddit: 'a' })).rejects.toThrow('2-100')
    await expect(make({ phrase: 'hello', platform: 'reddit' })).rejects.toThrow('subreddit')
    await expect(make({ phrase: 'hello', platform: 'reddit', subreddit: 'bad name!' })).rejects.toThrow('subreddit')
    await expect(make({ phrase: 'hello', platform: 'x', subreddit: 'a' })).rejects.toThrow('Only Reddit')
    await make({ phrase: 'hello', platform: 'reddit', subreddit: 'a' })
    await expect(make({ phrase: 'HELLO', platform: 'reddit', subreddit: 'A' })).rejects.toThrow('already listening')
    await make({ phrase: 'hello', platform: 'reddit', subreddit: 'b' })
    await make({ phrase: 'hello', platform: 'x' })
  })

  it('keeps one owner out of another owner\'s phrases', async () => {
    const { alice, bob } = setup()
    const { keyword } = await alice.mutation(anyApi.keywords.create, { phrase: 'secret plan', platform: 'x' })
    expect((await bob.query(anyApi.keywords.list, {})).keywords).toEqual([])
    await expect(bob.mutation(anyApi.keywords.setStatus, { id: keyword.id, status: 'paused' })).rejects.toThrow('not found')
    await expect(bob.mutation(anyApi.keywords.remove, { id: keyword.id })).rejects.toThrow('not found')
    await alice.mutation(anyApi.keywords.setStatus, { id: keyword.id, status: 'paused' })
    expect((await alice.query(anyApi.keywords.list, {})).keywords[0].status).toBe('paused')
    await alice.mutation(anyApi.keywords.remove, { id: keyword.id })
    expect((await alice.query(anyApi.keywords.list, {})).keywords).toEqual([])
  })

  it('caps phrases per owner and needs a sign-in', async () => {
    const { t, alice } = setup()
    for (let i = 0; i < 50; i++) await alice.mutation(anyApi.keywords.create, { phrase: `phrase ${i}`, platform: 'x' })
    await expect(alice.mutation(anyApi.keywords.create, { phrase: 'one more', platform: 'x' })).rejects.toThrow('up to 50')
    await expect(t.query(anyApi.keywords.list, {})).rejects.toThrow('Authentication required')
  })
})

describe('hits from pushed posts', () => {
  it('records a hit only for the right phrase, subreddit and status', async () => {
    const { t, alice } = setup()
    const { secret } = await alice.mutation(anyApi.ingest.createKey, { label: 'c' })
    const { keyword } = await alice.mutation(anyApi.keywords.create, { phrase: 'bookkeeper', platform: 'reddit', subreddit: 'smallbusiness' })
    const paused = await alice.mutation(anyApi.keywords.create, { phrase: 'invoice', platform: 'reddit', subreddit: 'smallbusiness' })
    await alice.mutation(anyApi.keywords.setStatus, { id: paused.keyword.id, status: 'paused' })

    await pushReddit(t, secret, [
      redditPost('smallbusiness', 'Need a bookkeeper in Austin'),
      redditPost('smallbusiness', 'Best invoice tool?'),
      redditPost('smallbusiness', 'Unrelated post', 'we hired bookkeepers last year'),
      redditPost('marketing', 'Looking for a bookkeeper'),
      redditPost('smallbusiness', 'Question', 'Where do I find a BOOKKEEPER?'),
    ])
    const { hits } = await alice.query(anyApi.hits.list, {})
    expect(hits.map((h: { post: { title: string } }) => h.post.title).sort()).toEqual(['Need a bookkeeper in Austin', 'Question'])
    expect(hits[0]).toMatchObject({ phrase: 'bookkeeper', platform: 'reddit' })
    expect((await alice.query(anyApi.keywords.list, {})).keywords.find((k: { id: string }) => k.id === keyword.id).signalsCount).toBe(2)
  })

  it("removes a phrase's matches when the phrase is removed", async () => {
    const { t, alice } = setup()
    const { secret } = await alice.mutation(anyApi.ingest.createKey, { label: 'c' })
    const { keyword } = await alice.mutation(anyApi.keywords.create, { phrase: 'bookkeeper', platform: 'reddit', subreddit: 'smallbusiness' })
    await pushReddit(t, secret, [redditPost('smallbusiness', 'Need a bookkeeper')])
    expect((await alice.query(anyApi.hits.list, {})).hits).toHaveLength(1)
    await alice.mutation(anyApi.keywords.remove, { id: keyword.id })
    expect((await alice.query(anyApi.hits.list, {})).hits).toHaveLength(0)
    expect((await alice.query(anyApi.feed.list, {})).items).toHaveLength(1)
  })

  it('does not double count when the same posts arrive again', async () => {
    const { t, alice } = setup()
    const { secret } = await alice.mutation(anyApi.ingest.createKey, { label: 'c' })
    await alice.mutation(anyApi.keywords.create, { phrase: 'bookkeeper', platform: 'reddit', subreddit: 'smallbusiness' })
    const posts = [redditPost('smallbusiness', 'Need a bookkeeper')]
    await pushReddit(t, secret, posts)
    await pushReddit(t, secret, posts)
    expect((await alice.query(anyApi.hits.list, {})).hits).toHaveLength(1)
    expect((await alice.query(anyApi.keywords.list, {})).keywords[0].signalsCount).toBe(1)
  })

  it('matches an unscoped X phrase and keeps hits private', async () => {
    const { t, alice, bob } = setup()
    const { secret } = await alice.mutation(anyApi.ingest.createKey, { label: 'x' })
    await alice.mutation(anyApi.keywords.create, { phrase: 'switching accountants', platform: 'x' })
    await bob.mutation(anyApi.keywords.create, { phrase: 'switching accountants', platform: 'x' })
    const res = await t.fetch('/ingest', {
      method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ platform: 'x', posts: [{ externalId: '1', url: 'https://x.com/a/status/1', authorName: 'a', body: ['thinking about switching accountants'], likes: 0, comments: 0 }] }),
    })
    expect(res.status).toBe(200)
    expect((await alice.query(anyApi.hits.list, {})).hits).toHaveLength(1)
    expect((await bob.query(anyApi.hits.list, {})).hits).toHaveLength(0)
  })
})

describe('scheduled watch', () => {
  const arctic = (sub: string, id: string, title: string) => ({
    id, author: 'someone', title, selftext: '', score: 1, num_comments: 0,
    created_utc: 1789754000, permalink: `/r/${sub}/comments/${id}/x/`, subreddit: sub,
  })

  it('fetches each watched subreddit once and delivers hits to every owner listening', async () => {
    const { t, alice, bob } = setup()
    await alice.mutation(anyApi.keywords.create, { phrase: 'bookkeeper', platform: 'reddit', subreddit: 'smallbusiness' })
    await bob.mutation(anyApi.keywords.create, { phrase: 'bookkeeper', platform: 'reddit', subreddit: 'smallbusiness' })
    await bob.mutation(anyApi.keywords.create, { phrase: 'tax', platform: 'reddit', subreddit: 'accounting' })
    const fetcher = vi.fn(async (url: string) => {
      if (url.includes('www.reddit.com')) return new Response('slow down', { status: 429 })
      if (url.includes('subreddit=accounting')) return new Response('nope', { status: 503 })
      return new Response(JSON.stringify({ data: [arctic('smallbusiness', 'aa11', 'Need a bookkeeper')] }), { status: 200 })
    })
    vi.stubGlobal('fetch', fetcher)
    const result = await t.action(internal.watch.tick, {})
    expect(result).toMatchObject({ subreddits: 2, failed: 1, newHits: 2, sources: { reddit: 0, mirror: 1 } })
    expect(result.fallbacks).toEqual(['r/smallbusiness: www.reddit.com answered HTTP 429'])
    const mirrorCalls = fetcher.mock.calls.filter(([url]) => String(url).includes('arctic-shift'))
    expect(mirrorCalls).toHaveLength(2)
    expect((await alice.query(anyApi.hits.list, {})).hits).toHaveLength(1)
    expect((await bob.query(anyApi.hits.list, {})).hits).toHaveLength(1)
    expect((await alice.query(anyApi.feed.list, {})).items).toHaveLength(1)
  })

  it('does nothing when nobody is listening, and skips paused phrases', async () => {
    const { t, alice } = setup()
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ data: [] }), { status: 200 }))
    vi.stubGlobal('fetch', fetcher)
    expect(await t.action(internal.watch.tick, {})).toEqual({ subreddits: 0, failed: 0, newHits: 0, sources: { reddit: 0, mirror: 0 }, fallbacks: [] })
    const { keyword } = await alice.mutation(anyApi.keywords.create, { phrase: 'hello', platform: 'reddit', subreddit: 'a' })
    await alice.mutation(anyApi.keywords.setStatus, { id: keyword.id, status: 'paused' })
    await t.action(internal.watch.tick, {})
    expect(fetcher).not.toHaveBeenCalled()
  })
})
