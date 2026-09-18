import { ConvexError, v } from 'convex/values'
import { fetchRedditApi, fetchRedditRss, type RedditAppCredentials } from './lib/redditFeed'
import { action, mutation, requireOwner } from './lib/server'
import { internal } from './_generated/api'

const MIRROR_BASE = 'https://arctic-shift.photon-reddit.com'
const SYNC_LABEL = 'Reddit public ingest'
const SUBREDDIT_PATTERN = /^[A-Za-z0-9_]{1,21}$/

export type NormalizedPost = {
  externalId: string
  authorName: string
  body: string[]
  title?: string
  url: string
  timestamp?: string
  likes: number
  comments: number
}

function finiteCount(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.trunc(value) : 0
}

/**
 * Arctic Shift rows carry the full Reddit payload; only the feed contract
 * fields survive. Returns null for junk rows (the sync counts and skips
 * them) instead of throwing halfway through a batch.
 */
export function normalizeArcticPost(raw: unknown): NormalizedPost | null {
  if (typeof raw !== 'object' || raw === null) return null
  const row = raw as Record<string, unknown>
  const id = typeof row.id === 'string' ? row.id.trim() : ''
  if (!id) return null
  const author = typeof row.author === 'string' && row.author.trim() ? row.author : 'unknown'
  const title = typeof row.title === 'string' && row.title.trim() ? row.title : undefined
  const selftext = typeof row.selftext === 'string' ? row.selftext : ''
  const subreddit = typeof row.subreddit === 'string' ? row.subreddit : ''
  const permalink = typeof row.permalink === 'string' ? row.permalink : ''
  const created = typeof row.created_utc === 'number' ? new Date(row.created_utc * 1000) : null
  if (created && !Number.isFinite(created.getTime())) return null
  return {
    externalId: `t3_${id}`,
    authorName: author,
    body: selftext.trim() ? [selftext.slice(0, 4000)] : [],
    ...(title === undefined ? {} : { title }),
    url: permalink ? `https://reddit.com${permalink}` : `https://www.reddit.com/r/${subreddit}/`,
    ...(created === null ? {} : { timestamp: created.toISOString() }),
    likes: finiteCount(row.score),
    comments: finiteCount(row.num_comments),
  }
}

export async function fetchSubredditPosts(
  fetcher: typeof fetch,
  subreddit: string,
  limit: number,
): Promise<unknown[]> {
  const sub = subreddit.trim()
  if (!SUBREDDIT_PATTERN.test(sub)) throw new ConvexError('Subreddit must be 1-21 letters, numbers or underscores')
  if (!Number.isInteger(limit) || limit < 1 || limit > 25) throw new ConvexError('Limit must be 1-25')
  const url = `${MIRROR_BASE}/api/posts/search?subreddit=${encodeURIComponent(sub)}&sort=desc&limit=${limit}`
  let res: Response
  try {
    res = await fetcher(url, {
      headers: { 'User-Agent': 'ListeningKit/1.0 (social-listening sync)', Accept: 'application/json' },
      signal: AbortSignal.timeout(15_000),
    })
  } catch {
    throw new ConvexError('Could not reach the Reddit mirror — try again in a moment')
  }
  if (!res.ok) throw new ConvexError(`Reddit mirror unavailable (HTTP ${res.status}) — try again in a moment`)
  const parsed = (await res.json()) as { data?: unknown; error?: unknown }
  if (!Array.isArray(parsed?.data)) throw new ConvexError('Reddit mirror returned an unexpected response')
  return parsed.data
}


export type LatestPosts = {
  posts: NormalizedPost[]; source: 'reddit' | 'mirror'; skipped: number; fallbackReason?: string
  /** Reddit's plain feed carries no scores or comment counts; every other source does. */
  metricsKnown: boolean
}

/** The app-level Reddit API login, set once on the deployment. Unset means that source is skipped. */
export function redditAppCredentials(): RedditAppCredentials | null {
  const id = process.env.REDDIT_CLIENT_ID
  const secret = process.env.REDDIT_CLIENT_SECRET
  return id && secret ? { id, secret } : null
}

/**
 * Newest posts for a subreddit, freshest source first: Reddit's official API (when the app is
 * set up), then Reddit's own feed, then the public mirror. Reddit rate-limits shared server
 * addresses, and the mirror can be hours behind, so callers record which source answered.
 * Throws only if every source fails.
 */
export async function fetchLatestPosts(
  fetcher: typeof fetch,
  subreddit: string,
  limit: number,
  creds: RedditAppCredentials | null = redditAppCredentials(),
): Promise<LatestPosts> {
  const reasons: string[] = []
  type Attempt = { run: () => Promise<NormalizedPost[]>; metricsKnown: boolean }
  const attempts: Attempt[] = []
  if (creds) attempts.push({ run: () => fetchRedditApi(fetcher, subreddit, limit, creds), metricsKnown: true })
  attempts.push({ run: () => fetchRedditRss(fetcher, subreddit, limit), metricsKnown: false })
  for (const attempt of attempts) {
    try {
      return { posts: await attempt.run(), source: 'reddit', skipped: 0, metricsKnown: attempt.metricsKnown }
    } catch (error) {
      reasons.push(error instanceof Error ? error.message : 'Reddit failed')
    }
  }
  const raw = await fetchSubredditPosts(fetcher, subreddit, limit)
  const posts: NormalizedPost[] = []
  for (const row of raw) {
    const normalized = normalizeArcticPost(row)
    if (normalized) posts.push(normalized)
  }
  return { posts, source: 'mirror', skipped: raw.length - posts.length, fallbackReason: reasons.join('; '), metricsKnown: true }
}

/** The caller's Reddit row for public ingestion, created on first sync. Never another owner's. */
export const ensurePublicAccount = mutation({
  args: {},
  handler: async (ctx) => {
    const owner = await requireOwner(ctx)
    const existing = await ctx.db
      .query('accounts')
      .withIndex('by_owner', (q) => q.eq('owner', owner))
      .filter((q) => q.eq(q.field('platform'), 'reddit'))
      .first()
    if (existing) return existing._id
    return await ctx.db.insert('accounts', { owner, platform: 'reddit', label: SYNC_LABEL, connectedAt: null })
  },
})

/**
 * User-triggered read-only sync: pull the newest posts from one public subreddit (Reddit first,
 * the mirror as a fallback) and ingest them under the caller's account.
 * Failures throw honestly: no demo rows are ever substituted.
 */
export const syncSubreddit = action({
  args: { subreddit: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ accountId: string; fetched: number; ingested: number; skipped: number; source: 'reddit' | 'mirror' }> => {
    const owner = await requireOwner(ctx)
    const subreddit = args.subreddit.trim()
    const latest = await fetchLatestPosts(fetch, subreddit, args.limit ?? 25)
    const result: { accountId: string } = await ctx.runMutation(internal.watch.ingestFor, {
      owner, subreddit: subreddit.toLowerCase(), source: latest.source, metricsKnown: latest.metricsKnown, posts: latest.posts,
    })
    return {
      accountId: result.accountId, fetched: latest.posts.length + latest.skipped, ingested: latest.posts.length,
      skipped: latest.skipped, source: latest.source,
    }
  },
})
