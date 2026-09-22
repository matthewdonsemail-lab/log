import { ConvexError, v, type Infer } from 'convex/values'
import { internal } from './_generated/api'
import type { Doc, Id } from './_generated/dataModel'
import { internalMutation, query, requireOwner, type MutationCtx } from './lib/server'
import { listeningKeywords, recordHits } from './hits'
import { scoringEnabled } from './lib/scoring'
import { platform, postFields } from './schema'

const post = v.object(postFields)
export const MAX_POSTS_PER_BATCH = 100
const MAX_SCORED_PER_BATCH = 20

/** Native post identity is stable within its account: re-ingesting replaces, never duplicates. */
export async function writePosts(
  ctx: MutationCtx,
  account: Doc<'accounts'>,
  posts: Infer<typeof post>[],
  options: { keepMetrics?: boolean } = {},
) {
  if (posts.length > MAX_POSTS_PER_BATCH) throw new ConvexError(`At most ${MAX_POSTS_PER_BATCH} posts per batch`)
  const keywords = await listeningKeywords(ctx, account)
  const gains = new Map<Id<'keywords'>, number>()
  let newHits = 0
  const newHitIds: Id<'hits'>[] = []
  for (const item of posts) {
    if (!item.externalId.trim()) throw new ConvexError('Native post ID is required')
    if (![item.likes, item.comments].every(Number.isFinite)) throw new ConvexError('Metrics must be finite')
    if (item.timestamp && !Number.isFinite(Date.parse(item.timestamp))) throw new ConvexError('Invalid timestamp')
    const existing = await ctx.db.query('posts').withIndex('by_account_external', q =>
      q.eq('accountId', account._id).eq('externalId', item.externalId)
    ).unique()
    // A source without scores (Reddit's own feed) must not zero out counts an earlier read recorded.
    const counts = options.keepMetrics && existing ? { likes: existing.likes, comments: existing.comments } : {}
    const record = { ...item, ...counts, accountId: account._id, owner: account.owner, platform: account.platform }
    let postId: Id<'posts'>
    if (existing) {
      await ctx.db.replace(existing._id, record)
      postId = existing._id
    } else {
      postId = await ctx.db.insert('posts', record)
    }
    for (const { keywordId, hitId } of await recordHits(ctx, keywords, { ...record, _id: postId })) {
      gains.set(keywordId, (gains.get(keywordId) ?? 0) + 1)
      newHits += 1
      newHitIds.push(hitId)
    }
  }
  for (const [keywordId, gained] of gains) {
    const keyword = keywords.find(row => row._id === keywordId)
    if (keyword) await ctx.db.patch(keywordId, { signalsCount: (keyword.signalsCount ?? 0) + gained })
  }
  // Score new matches in the background; a backfill cron catches anything this misses.
  if (newHitIds.length > 0 && scoringEnabled()) {
    await ctx.scheduler.runAfter(0, internal.scoring.scoreHits, { hitIds: newHitIds.slice(0, MAX_SCORED_PER_BATCH) })
  }
  return { processed: posts.length, newHits }
}

/** Internal ingestion only. */
export const ingest = internalMutation({
  args: { accountId: v.id('accounts'), posts: v.array(post) },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId)
    if (!account) throw new ConvexError('Account not found')
    return await writePosts(ctx, account, args.posts)
  },
})

const PURGE_WINDOW = 500

/**
 * Operator cleanup, run from the CLI (`convex run`): deletes one owner's posts by an exact
 * author name, newest 500 at a time. Internal, so no browser client can call it.
 */
export const purgeAuthor = internalMutation({
  args: { owner: v.string(), authorName: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query('posts').withIndex('by_owner', q => q.eq('owner', args.owner)).order('desc').take(PURGE_WINDOW)
    const doomed = rows.filter(row => row.authorName === args.authorName)
    for (const row of doomed) await ctx.db.delete(row._id)
    return { deleted: doomed.length, scanned: rows.length }
  },
})

/** Bounded initial feed window; cursor pagination is a follow-up, not implied here. */
export const list = query({
  args: { platform: v.optional(platform), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const rows = await ctx.db.query('posts').withIndex('by_owner', q => q.eq('owner', owner)).order('desc').take(200)
    const needle = args.search?.trim().toLowerCase() ?? ''
    const items = []
    for (const row of rows.filter(r =>
      (!args.platform || r.platform === args.platform) &&
      (!needle || [r.authorName, r.title ?? '', ...r.body].join(' ').toLowerCase().includes(needle))
    )) {
      // The strongest match on this post, if any keyword matched it; null until the AI scores one.
      const hits = await ctx.db.query('hits').withIndex('by_keyword_and_post', q => q.eq('postId', row._id)).collect()
      const best = hits.filter(h => h.score !== undefined).sort((a, b) => b.score! - a.score!)[0]
      items.push({
        id: row._id, platform: row.platform, variant: 'post-text' as const,
        authorName: row.authorName, body: row.body,
        ...(row.title === undefined ? {} : { title: row.title }),
        ...(row.timestamp === undefined ? {} : { timestamp: row.timestamp }),
        timeAgo: '', likes: row.likes, comments: row.comments,
        ...(best === undefined
          ? { score: null, intent: null, reason: null, keywordId: null }
          : { score: best.score, intent: best.intent, reason: best.reason, keywordId: best.keywordId }),
      })
    }
    return { items }
  },
})
