import { convexTest } from 'convex-test'
import { anyApi } from 'convex/server'
import { describe, expect, it, vi } from 'vitest'
import schema from './schema'
import { fetchSubredditPosts, normalizeArcticPost } from './reddit'

const modules = {
  './_generated/server.js': async () => ({}),
  './accounts.ts': () => import('./accounts'),
  './reddit.ts': () => import('./reddit'),
}

function setup() {
  const t = convexTest(schema, modules)
  return { t, alice: t.withIdentity({ subject: 'alice', issuer: 'https://test.example' }), bob: t.withIdentity({ subject: 'bob', issuer: 'https://test.example' }) }
}

const row = {
  id: 'abc123',
  author: 'someone',
  title: 'A real post',
  selftext: 'Body text here',
  score: 12,
  num_comments: 3,
  created_utc: 1789654476,
  permalink: '/r/marketing/comments/abc123/a_real_post/',
  subreddit: 'marketing',
}

describe('reddit public ingest', () => {
  it('normalizes mirror rows to the feed contract', () => {
    expect(normalizeArcticPost(row)).toMatchObject({
      externalId: 't3_abc123',
      authorName: 'someone',
      title: 'A real post',
      body: ['Body text here'],
      url: 'https://reddit.com/r/marketing/comments/abc123/a_real_post/',
      likes: 12,
      comments: 3,
    })
    expect(normalizeArcticPost(row)?.timestamp).toBe(new Date(1789654476 * 1000).toISOString())
  })

  it('skips junk rows instead of failing the batch', () => {
    expect(normalizeArcticPost(null)).toBeNull()
    expect(normalizeArcticPost({})).toBeNull()
    expect(normalizeArcticPost({ ...row, id: '  ' })).toBeNull()
    expect(normalizeArcticPost({ ...row, created_utc: 'yesterday' })).not.toHaveProperty('timestamp')
    expect(normalizeArcticPost({ ...row, score: null, num_comments: undefined })).toMatchObject({ likes: 0, comments: 0 })
    expect(normalizeArcticPost({ ...row, author: '', selftext: '', title: '' })).toMatchObject({
      authorName: 'unknown',
      body: [],
    })
    expect(normalizeArcticPost({ ...row, title: undefined })).not.toHaveProperty('title')
  })

  it('fetches newest posts from the mirror and rejects bad input honestly', async () => {
    const fetcher = vi.fn(async () => new Response(JSON.stringify({ data: [row] }), { status: 200 }))
    const rows = await fetchSubredditPosts(fetcher as unknown as typeof fetch, 'marketing', 25)
    expect(rows).toHaveLength(1)
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('/api/posts/search?subreddit=marketing&sort=desc&limit=25'),
      expect.objectContaining({}),
    )
    await expect(fetchSubredditPosts(fetcher as unknown as typeof fetch, 'bad name!', 25)).rejects.toThrow('Subreddit')
    await expect(fetchSubredditPosts(fetcher as unknown as typeof fetch, 'marketing', 0)).rejects.toThrow('Limit')
    const down = vi.fn(async () => new Response('nope', { status: 503 }))
    await expect(fetchSubredditPosts(down as unknown as typeof fetch, 'marketing', 25)).rejects.toThrow('503')
    const broken = vi.fn(async () => new Response(JSON.stringify({ data: null }), { status: 200 }))
    await expect(fetchSubredditPosts(broken as unknown as typeof fetch, 'marketing', 25)).rejects.toThrow('unexpected response')
    const offline = vi.fn(async () => { throw new Error('socket hangup') })
    await expect(fetchSubredditPosts(offline as unknown as typeof fetch, 'marketing', 25)).rejects.toThrow('Could not reach')
  })

  it('creates one public reddit account per owner and reuses it', async () => {
    const { alice, bob } = setup()
    const first = await alice.mutation(anyApi.reddit.ensurePublicAccount, {})
    const second = await alice.mutation(anyApi.reddit.ensurePublicAccount, {})
    expect(second).toEqual(first)
    expect((await alice.query(anyApi.accounts.list, {})).accounts).toEqual([
      expect.objectContaining({ platform: 'reddit', label: 'Reddit public ingest' }),
    ])
    await bob.mutation(anyApi.reddit.ensurePublicAccount, {})
    expect((await bob.query(anyApi.accounts.list, {})).accounts).toHaveLength(1)
    expect((await alice.query(anyApi.accounts.list, {})).accounts).toHaveLength(1)
  })

  it('denies account setup without authentication', async () => {
    const { t } = setup()
    await expect(t.mutation(anyApi.reddit.ensurePublicAccount, {})).rejects.toThrow('Authentication required')
  })
})
