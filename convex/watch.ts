import { v } from 'convex/values'
import { internal } from './_generated/api'
import { fetchLatestPosts } from './reddit'
import { writePosts } from './feed'
import { ensureAccount } from './lib/accounts'
import { internalAction, internalMutation, internalQuery } from './lib/server'
import { postFields } from './schema'

const MAX_SUBREDDITS_PER_TICK = 20
const POSTS_PER_FETCH = 25
// Reddit rate-limits bursts, so reads are spaced out.
const PAUSE_BETWEEN_SUBREDDITS_MS = 400

/** Every subreddit someone is listening in, with the owners to deliver its posts to. */
export const targets = internalQuery({
  args: {},
  handler: async ctx => {
    const rows = await ctx.db.query('keywords')
      .withIndex('by_status_and_platform', q => q.eq('status', 'listening').eq('platform', 'reddit')).take(1000)
    const bySub = new Map<string, Set<string>>()
    for (const row of rows) {
      if (!row.subreddit) continue
      bySub.set(row.subreddit, (bySub.get(row.subreddit) ?? new Set()).add(row.owner))
    }
    return [...bySub].map(([subreddit, owners]) => ({ subreddit, owners: [...owners] }))
  },
})

/**
 * Store a fetched batch under one owner's Reddit account, match it against their phrases, and
 * stamp those phrases as checked. Reddit's own feed has no scores, so its posts keep any counts
 * an earlier read recorded.
 */
export const ingestFor = internalMutation({
  args: {
    owner: v.string(), subreddit: v.string(), source: v.union(v.literal('reddit'), v.literal('mirror')),
    metricsKnown: v.boolean(), posts: v.array(v.object(postFields)),
  },
  handler: async (ctx, args) => {
    const account = await ensureAccount(ctx, args.owner, 'reddit')
    const result = await writePosts(ctx, account, args.posts, { keepMetrics: !args.metricsKnown })
    const phrases = await ctx.db.query('keywords').withIndex('by_owner', q => q.eq('owner', args.owner)).take(100)
    const now = Date.now()
    for (const phrase of phrases) {
      if (phrase.platform === 'reddit' && phrase.status === 'listening' && phrase.subreddit === args.subreddit) {
        await ctx.db.patch(phrase._id, { lastCheckedAt: now, lastSource: args.source })
      }
    }
    return { accountId: account._id, processed: result.processed, newHits: result.newHits }
  },
})

/**
 * Scheduled poll: read each watched subreddit once, then hand the posts to every owner
 * listening there. One failing subreddit never stops the rest.
 */
export const tick = internalAction({
  args: {},
  handler: async (ctx): Promise<{ subreddits: number; failed: number; newHits: number; sources: { reddit: number; mirror: number }; fallbacks: string[] }> => {
    const targets: { subreddit: string; owners: string[] }[] = await ctx.runQuery(internal.watch.targets, {})
    const sources = { reddit: 0, mirror: 0 }
    const fallbacks: string[] = []
    let failed = 0
    let newHits = 0
    const batch = targets.slice(0, MAX_SUBREDDITS_PER_TICK)
    for (const [index, target] of batch.entries()) {
      if (index > 0) await new Promise(resolve => setTimeout(resolve, PAUSE_BETWEEN_SUBREDDITS_MS))
      try {
        const latest = await fetchLatestPosts(fetch, target.subreddit, POSTS_PER_FETCH)
        sources[latest.source] += 1
        if (latest.fallbackReason) fallbacks.push(`r/${target.subreddit}: ${latest.fallbackReason}`)
        if (latest.posts.length === 0) continue
        for (const owner of target.owners) {
          const result = await ctx.runMutation(internal.watch.ingestFor, {
            owner, subreddit: target.subreddit, source: latest.source, metricsKnown: latest.metricsKnown, posts: latest.posts,
          })
          newHits += result.newHits
        }
      } catch (error) {
        failed += 1
        console.error(`watch: r/${target.subreddit} failed`, error instanceof Error ? error.message : error)
      }
    }
    return { subreddits: batch.length, failed, newHits, sources, fallbacks }
  },
})
