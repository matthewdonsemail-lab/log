import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { internal } from './_generated/api'
import { fetchRedditApi, fetchRedditRss, parseRedditAtom } from './lib/redditFeed'
import { fetchLatestPosts } from './reddit'
import schema from './schema'

const modules = {
  './_generated/server.js': async () => ({}),
  './_generated/api.js': () => import('./_generated/api.js'),
  './accounts.ts': () => import('./accounts'),
  './feed.ts': () => import('./feed'),
  './hits.ts': () => import('./hits'),
  './keywords.ts': () => import('./keywords'),
  './reddit.ts': () => import('./reddit'),
  './watch.ts': () => import('./watch'),
}

const ATOM = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
<entry>
  <author><name>/u/plumber_pete</name><uri>https://www.reddit.com/user/plumber_pete</uri></author>
  <category term="smallbusiness" label="r/smallbusiness"/>
  <content type="html">&lt;!-- SC_OFF --&gt;&lt;div class="md"&gt;&lt;p&gt;Our sink is leaking &amp;amp; we need a plumber in Austin.&lt;/p&gt;&lt;p&gt;Any tips?&lt;/p&gt;&lt;/div&gt;&lt;!-- SC_ON --&gt;</content>
  <id>t3_1wkabc1</id>
  <link href="https://old.reddit.com/r/smallbusiness/comments/1wkabc1/need_a_plumber_in_austin/" />
  <updated>2026-09-18T19:10:00+00:00</updated>
  <published>2026-09-18T19:05:00+00:00</published>
  <title>Need a plumber in Austin &amp; fast</title>
</entry>
<entry>
  <author><name>/u/linker</name></author>
  <content type="html">&lt;table&gt;&lt;tr&gt;&lt;td&gt; &amp;#32; submitted by &amp;#32; &lt;a href="https://www.reddit.com/user/linker"&gt; /u/linker &lt;/a&gt; &lt;/td&gt;&lt;/tr&gt;&lt;/table&gt;</content>
  <id>t3_1wkabc2</id>
  <link href="https://www.reddit.com/r/smallbusiness/comments/1wkabc2/link_post/" />
  <updated>2026-09-18T19:00:00+00:00</updated>
  <title>A link post</title>
</entry>
<entry><id>t1_comment</id><link href="https://www.reddit.com/r/x/comments/1/2/3/"/><title>a comment, not a post</title></entry>
<entry><id>t3_evil</id><link href="https://evil.example.com/r/x"/><title>wrong host</title></entry>
</feed>`

const listing = (rows: Record<string, unknown>[]) => ({ data: { children: rows.map(data => ({ data })) } })
const apiRow = { id: 'abc123', title: 'Need a plumber', selftext: 'Leak!', author: 'pete', permalink: '/r/smallbusiness/comments/abc123/x/', score: 7, num_comments: 4, created_utc: 1789754000 }

const res = (body: unknown, status = 200) =>
  new Response(typeof body === 'string' ? body : JSON.stringify(body), { status })

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs() })

describe("Reddit's own feed", () => {
  it('reads posts, decodes the text, and ignores comments and foreign links', () => {
    const posts = parseRedditAtom(ATOM)
    expect(posts).toHaveLength(2)
    expect(posts[0]).toEqual({
      externalId: 't3_1wkabc1', authorName: 'plumber_pete', title: 'Need a plumber in Austin & fast',
      body: ['Our sink is leaking & we need a plumber in Austin.\nAny tips?'],
      url: 'https://reddit.com/r/smallbusiness/comments/1wkabc1/need_a_plumber_in_austin/',
      timestamp: '2026-09-18T19:05:00.000Z', likes: 0, comments: 0,
    })
    expect(posts[1].body).toEqual([])
    expect(posts[1].url).toBe('https://reddit.com/r/smallbusiness/comments/1wkabc2/link_post/')
  })

  it('explains a refusal, a login redirect and an empty page', async () => {
    const reason = (r: Response) => fetchRedditRss((async () => r) as unknown as typeof fetch, 'ipad', 25).catch((e: Error) => e.message)
    expect(await reason(res('', 429))).toContain('HTTP 429')
    expect(await reason(res('', 302))).toContain('asked for a login')
    expect(await reason(res('<html>login</html>'))).toContain('returned no posts')
    const down = (async () => { throw new Error('socket') }) as unknown as typeof fetch
    expect(await fetchRedditRss(down, 'ipad', 25).catch((e: Error) => e.message)).toContain('could not reach')
  })

  it('asks for the feed without following redirects and with a descriptive agent', async () => {
    const fetcher = vi.fn(async () => res(ATOM))
    await fetchRedditRss(fetcher as unknown as typeof fetch, 'ipad', 10)
    const [url, init] = fetcher.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe('https://www.reddit.com/r/ipad/new/.rss?limit=10')
    expect(init.redirect).toBe('manual')
    expect((init.headers as Record<string, string>)['User-Agent']).toContain('ListeningKit')
  })
})

describe("Reddit's official API", () => {
  it('signs in as the app, reads the listing, and keeps real scores', async () => {
    const calls: string[] = []
    const fetcher = vi.fn(async (url: string, init: RequestInit) => {
      calls.push(url)
      if (url.includes('access_token')) {
        expect((init.headers as Record<string, string>).Authorization).toBe(`Basic ${btoa('id:secret')}`)
        return res({ access_token: 'tok', expires_in: 3600 })
      }
      expect((init.headers as Record<string, string>).Authorization).toBe('Bearer tok')
      return res(listing([apiRow, { id: 'bad id' }]))
    })
    const posts = await fetchRedditApi(fetcher as unknown as typeof fetch, 'smallbusiness', 25, { id: 'id', secret: 'secret' })
    expect(calls[1]).toBe('https://oauth.reddit.com/r/smallbusiness/new?limit=25&raw_json=1')
    expect(posts).toEqual([{
      externalId: 't3_abc123', authorName: 'pete', title: 'Need a plumber', body: ['Leak!'],
      url: 'https://reddit.com/r/smallbusiness/comments/abc123/x/', timestamp: new Date(1789754000 * 1000).toISOString(),
      likes: 7, comments: 4,
    }])
  })

  it('names the step that failed without leaking the credentials', async () => {
    const creds = { id: 'MYCLIENTID', secret: 'MYSECRET' }
    const failAt = (step: 'token' | 'listing' | 'network') => (async (url: string) => {
      if (step === 'network') throw new Error(`boom MYSECRET`)
      if (url.includes('access_token')) return step === 'token' ? res('', 401) : res({ access_token: 't' })
      return res('', 403)
    }) as unknown as typeof fetch
    const messages = [
      await fetchRedditApi(failAt('token'), 'a', 5, creds).catch((e: Error) => e.message),
      await fetchRedditApi(failAt('listing'), 'a', 5, creds).catch((e: Error) => e.message),
      await fetchRedditApi(failAt('network'), 'a', 5, creds).catch((e: Error) => e.message),
    ]
    expect(messages[0]).toContain('sign-in answered HTTP 401')
    expect(messages[1]).toContain('API answered HTTP 403')
    expect(messages[2]).toContain('could not sign in')
    for (const message of messages) expect(message).not.toMatch(/MYSECRET|MYCLIENTID/)
  })
})

describe('choosing a source', () => {
  const mirrorRow = { id: 'mir1', author: 'a', title: 'Mirror post', selftext: '', score: 3, num_comments: 1, created_utc: 1789700000, permalink: '/r/x/comments/mir1/y/', subreddit: 'x' }
  const router = (answers: { api?: () => Response; rss?: () => Response; mirror?: () => Response }) =>
    vi.fn(async (url: string) => {
      if (url.includes('access_token') || url.includes('oauth.reddit.com')) return (answers.api ?? (() => res('', 401)))()
      if (url.includes('www.reddit.com/r/')) return (answers.rss ?? (() => res('', 429)))()
      return (answers.mirror ?? (() => res({ data: [mirrorRow] })))()
    }) as unknown as typeof fetch

  it('prefers the official API, then Reddit\'s feed, then the mirror', async () => {
    const creds = { id: 'i', secret: 's' }
    const api = () => (vi.fn(async (url: string) => url.includes('access_token') ? res({ access_token: 't' }) : res(listing([apiRow]))) as unknown as typeof fetch)
    const first = await fetchLatestPosts(api(), 'x', 25, creds)
    expect(first).toMatchObject({ source: 'reddit', metricsKnown: true })
    expect(first.fallbackReason).toBeUndefined()

    const second = await fetchLatestPosts(router({ rss: () => res(ATOM) }), 'x', 25, creds)
    expect(second).toMatchObject({ source: 'reddit', metricsKnown: false })

    const third = await fetchLatestPosts(router({}), 'x', 25, creds)
    expect(third).toMatchObject({ source: 'mirror', metricsKnown: true })
    expect(third.fallbackReason).toMatch(/sign-in answered HTTP 401.*HTTP 429/)
    expect(third.posts[0].externalId).toBe('t3_mir1')
  })

  it('skips the API when no app is set up, and throws only when every source fails', async () => {
    const noApi = await fetchLatestPosts(router({ rss: () => res(ATOM) }), 'x', 25, null)
    expect(noApi).toMatchObject({ source: 'reddit', metricsKnown: false })
    await expect(fetchLatestPosts(router({ mirror: () => res('', 503) }), 'x', 25, null)).rejects.toThrow('503')
  })

  it('reads the app credentials from the deployment settings', async () => {
    const { redditAppCredentials } = await import('./reddit')
    expect(redditAppCredentials()).toBeNull()
    vi.stubEnv('REDDIT_CLIENT_ID', 'abc')
    expect(redditAppCredentials()).toBeNull()
    vi.stubEnv('REDDIT_CLIENT_SECRET', 'def')
    expect(redditAppCredentials()).toEqual({ id: 'abc', secret: 'def' })
  })
})

describe('freshness and counts when posts arrive', () => {
  function setup() {
    const t = convexTest(schema, modules)
    return { t, alice: t.withIdentity({ subject: 'alice', issuer: 'https://test.example' }) }
  }
  const post = (over: Record<string, unknown> = {}) => ({
    externalId: 't3_p1', authorName: 'a', title: 'Need a plumber', body: [], url: 'https://reddit.com/r/smallbusiness/comments/p1/x/',
    likes: 0, comments: 0, ...over,
  })

  it("stamps the listening phrases with when and where they were read, and only theirs", async () => {
    const { t, alice } = setup()
    await alice.mutation(anyApi.keywords.create, { phrase: 'plumber', platform: 'reddit', subreddit: 'smallbusiness' })
    await alice.mutation(anyApi.keywords.create, { phrase: 'plumber', platform: 'reddit', subreddit: 'ipad' })
    const owner = (await t.run(async ctx => (await ctx.db.query('keywords').first())!.owner)) as string
    const before = Date.now()
    await t.mutation(internal.watch.ingestFor, { owner, subreddit: 'smallbusiness', source: 'mirror', metricsKnown: true, posts: [post()] })
    const rows = (await alice.query(anyApi.keywords.list, {})).keywords
    const read = rows.find((k: { subreddit: string }) => k.subreddit === 'smallbusiness')
    const other = rows.find((k: { subreddit: string }) => k.subreddit === 'ipad')
    expect(read.lastSource).toBe('mirror')
    expect(read.lastCheckedAt).toBeGreaterThanOrEqual(before)
    expect(other.lastCheckedAt).toBeNull()
    expect(read.signalsCount).toBe(1)
  })

  it("does not wipe scores when Reddit's plain feed (which has none) re-reads a post", async () => {
    const { t, alice } = setup()
    await alice.mutation(anyApi.keywords.create, { phrase: 'plumber', platform: 'reddit', subreddit: 'smallbusiness' })
    const owner = (await t.run(async ctx => (await ctx.db.query('keywords').first())!.owner)) as string
    await t.mutation(internal.watch.ingestFor, { owner, subreddit: 'smallbusiness', source: 'mirror', metricsKnown: true, posts: [post({ likes: 9, comments: 5 })] })
    await t.mutation(internal.watch.ingestFor, { owner, subreddit: 'smallbusiness', source: 'reddit', metricsKnown: false, posts: [post()] })
    const stored = (await alice.query(anyApi.feed.list, {})).items[0]
    expect([stored.likes, stored.comments]).toEqual([9, 5])
    await t.mutation(internal.watch.ingestFor, { owner, subreddit: 'smallbusiness', source: 'reddit', metricsKnown: true, posts: [post({ likes: 11, comments: 6 })] })
    const updated = (await alice.query(anyApi.feed.list, {})).items[0]
    expect([updated.likes, updated.comments]).toEqual([11, 6])
  })

  it('Check now uses the same sources and records them', async () => {
    const { alice } = setup()
    await alice.mutation(anyApi.keywords.create, { phrase: 'plumber', platform: 'reddit', subreddit: 'smallbusiness' })
    vi.stubGlobal('fetch', vi.fn(async (url: string) => (url.includes('www.reddit.com/r/') ? res(ATOM) : res('', 500))))
    const summary = await alice.action(anyApi.reddit.syncSubreddit, { subreddit: 'SmallBusiness' })
    expect(summary).toMatchObject({ source: 'reddit', ingested: 2, skipped: 0, fetched: 2 })
    const keyword = (await alice.query(anyApi.keywords.list, {})).keywords[0]
    expect(keyword).toMatchObject({ lastSource: 'reddit', signalsCount: 1 })
    expect((await alice.query(anyApi.hits.list, {})).hits).toHaveLength(1)
  })
})
