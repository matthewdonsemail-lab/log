import { v } from 'convex/values'
import { usageFor } from './plan'
import { internalQuery } from './lib/server'
import { platform } from './schema'

export const MAX_MATCHES_PER_PAGE = 100
export const DEFAULT_MATCHES_PER_PAGE = 25
const SCAN = 400          // rows read to fill one page, so a filter that matches little cannot read the whole table
const TEXT_LIMIT = 2000   // characters of a post's text returned

/** The owner's phrases with how they are doing. */
export const keywordsFor = internalQuery({
  args: { owner: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query('keywords').withIndex('by_owner', q => q.eq('owner', args.owner)).take(200)
    return rows.map(row => ({
      id: row._id, phrase: row.phrase, platform: row.platform, community: row.subreddit ?? null, status: row.status,
      matches: row.signalsCount ?? 0, lastCheckedAt: row.lastCheckedAt ?? null, lastSource: row.lastSource ?? null,
    }))
  },
})

/**
 * The owner's matches, newest first. `before` is the `createdAt` of the last match already seen, so pages never overlap.
 * Filters are applied while scanning a bounded window; `nextCursor` is null when there is nothing older to read.
 */
export const matchesFor = internalQuery({
  args: { owner: v.string(), platform: v.optional(platform), minScore: v.optional(v.number()), before: v.optional(v.number()), limit: v.number() },
  handler: async (ctx, args) => {
    const limit = Math.min(MAX_MATCHES_PER_PAGE, Math.max(1, Math.floor(args.limit)))
    const rows = await ctx.db.query('hits').withIndex('by_owner', q => {
      const base = q.eq('owner', args.owner)
      return args.before === undefined ? base : base.lt('_creationTime', args.before)
    }).order('desc').take(SCAN)
    const wanted = rows.filter(row => (args.platform === undefined || row.platform === args.platform)
      && (args.minScore === undefined || (row.score !== undefined && row.score >= args.minScore)))
    const page = wanted.slice(0, limit)
    const data = []
    for (const hit of page) {
      const post = await ctx.db.get(hit.postId)
      if (!post) continue
      data.push({
        id: hit._id, createdAt: hit._creationTime, phrase: hit.phrase, platform: hit.platform,
        score: hit.score ?? null, intent: hit.intent ?? null, reason: hit.reason ?? null,
        post: {
          author: post.authorName, title: post.title ?? null, text: post.body.join('\n').slice(0, TEXT_LIMIT),
          url: post.url, likes: post.likes, comments: post.comments, postedAt: post.timestamp ?? null,
        },
      })
    }
    const more = wanted.length > page.length || rows.length === SCAN
    const last = page.at(-1)
    return { data, nextCursor: more && last ? last._creationTime : null }
  },
})

export const meFor = internalQuery({
  args: { owner: v.string() },
  handler: async (ctx, args) => await usageFor(ctx, args.owner),
})
