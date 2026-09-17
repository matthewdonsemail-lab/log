import { ConvexError, v } from 'convex/values'
import { action, mutation, requireOwner } from './lib/server'
import { api, internal } from './_generated/api'
import type { Id } from './_generated/dataModel'

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
 * User-triggered read-only sync: pull the newest posts from one public
 * subreddit through the mirror and ingest them under the caller's account.
 * Failures throw honestly — no demo rows are ever substituted.
 */
export const syncSubreddit = action({
  args: { subreddit: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args): Promise<{ accountId: string; fetched: number; ingested: number; skipped: number }> => {
    const limit = args.limit ?? 25
    const raw = await fetchSubredditPosts(fetch, args.subreddit, limit)
    const posts: NormalizedPost[] = []
    let skipped = 0
    for (const row of raw) {
      const normalized = normalizeArcticPost(row)
      if (normalized) posts.push(normalized)
      else skipped += 1
    }
    const accountId: Id<'accounts'> = await ctx.runMutation(api.reddit.ensurePublicAccount, {})
    if (posts.length > 0) await ctx.runMutation(internal.feed.ingest, { accountId, posts })
    return { accountId, fetched: raw.length, ingested: posts.length, skipped }
  },
})
