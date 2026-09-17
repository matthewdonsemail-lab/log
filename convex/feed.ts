import { ConvexError, v } from 'convex/values'
import { internalMutation, query, requireOwner } from './lib/server'
import { platform, postFields } from './schema'

/** Internal ingestion only: native post identity is stable within its account. */
export const ingest = internalMutation({
  args: { accountId: v.id('accounts'), posts: v.array(v.object(postFields)) },
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId)
    if (!account) throw new ConvexError('Account not found')
    if (args.posts.length > 100) throw new ConvexError('At most 100 posts per batch')
    for (const post of args.posts) {
      if (!post.externalId.trim()) throw new ConvexError('Native post ID is required')
      if (![post.likes, post.comments].every(Number.isFinite)) throw new ConvexError('Metrics must be finite')
      if (post.timestamp && !Number.isFinite(Date.parse(post.timestamp))) throw new ConvexError('Invalid timestamp')
      const existing = await ctx.db.query('posts').withIndex('by_account_external', q =>
        q.eq('accountId', account._id).eq('externalId', post.externalId)
      ).unique()
      const record = { ...post, accountId: account._id, owner: account.owner, platform: account.platform }
      if (existing) await ctx.db.replace(existing._id, record)
      else await ctx.db.insert('posts', record)
    }
    return { processed: args.posts.length }
  },
})

/** Bounded initial feed window; cursor pagination is a follow-up, not implied here. */
export const list = query({
  args: { platform: v.optional(platform), search: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const rows = await ctx.db.query('posts').withIndex('by_owner', q => q.eq('owner', owner)).order('desc').take(200)
    const needle = args.search?.trim().toLowerCase() ?? ''
    return { items: rows.filter(row =>
      (!args.platform || row.platform === args.platform) &&
      (!needle || [row.authorName, row.title ?? '', ...row.body].join(' ').toLowerCase().includes(needle))
    ).map(row => ({
      id: row._id, platform: row.platform, variant: 'post-text' as const,
      authorName: row.authorName, body: row.body,
      ...(row.title === undefined ? {} : { title: row.title }),
      ...(row.timestamp === undefined ? {} : { timestamp: row.timestamp }),
      timeAgo: '', likes: row.likes, comments: row.comments,
    })) }
  },
})
