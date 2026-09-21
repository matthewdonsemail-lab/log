import { ConvexError, v } from 'convex/values'
import type { Doc } from './_generated/dataModel'
import { createKeywordCore, removeKeywordCore, setKeywordStatusCore } from './lib/keywordOps'
import { usageFor } from './plan'
import type { QueryCtx } from './_generated/server'
import { internalMutation, internalQuery } from './lib/server'
import { platform } from './schema'

export const MAX_MATCHES_PER_PAGE = 100
export const DEFAULT_MATCHES_PER_PAGE = 25
const SCAN = 400          // rows read to fill one page, so a filter that matches little cannot read the whole table
const TEXT_LIMIT = 2000   // characters of a post's text returned

function apiKeyword(row: Doc<'keywords'>) {
  return {
    id: row._id, phrase: row.phrase, platform: row.platform, community: row.subreddit ?? null, status: row.status,
    matches: row.signalsCount ?? 0, lastCheckedAt: row.lastCheckedAt ?? null, lastSource: row.lastSource ?? null,
  }
}

/** The owner's phrases with how they are doing. */
export const keywordsFor = internalQuery({
  args: { owner: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db.query('keywords').withIndex('by_owner', q => q.eq('owner', args.owner)).take(200)
    return rows.map(apiKeyword)
  },
})

/** One phrase, or 'Phrase not found' (also for someone else's phrase: a key cannot tell whether an id exists). */
export const keywordById = internalQuery({
  args: { owner: v.string(), id: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId('keywords', args.id)
    const row = id === null ? null : await ctx.db.get(id)
    if (!row || row.owner !== args.owner) throw new ConvexError('Phrase not found')
    return apiKeyword(row)
  },
})

/** A match as the API shows it, with its post. Null when the post is gone. Shared with webhooks so both say the same thing. */
export async function apiMatch(ctx: Pick<QueryCtx, 'db'>, hit: Doc<'hits'>) {
  const post = await ctx.db.get(hit.postId)
  if (!post) return null
  return {
    id: hit._id, createdAt: hit._creationTime, phrase: hit.phrase, platform: hit.platform,
    score: hit.score ?? null, intent: hit.intent ?? null, reason: hit.reason ?? null,
    post: {
      author: post.authorName, title: post.title ?? null, text: post.body.join('\n').slice(0, TEXT_LIMIT),
      url: post.url, likes: post.likes, comments: post.comments, postedAt: post.timestamp ?? null,
    },
  }
}

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
      const item = await apiMatch(ctx, hit)
      if (item) data.push(item)
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

/** One match, or 'Match not found' (also for someone else's). */
export const matchById = internalQuery({
  args: { owner: v.string(), id: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId('hits', args.id)
    const hit = id === null ? null : await ctx.db.get(id)
    const item = hit && hit.owner === args.owner ? await apiMatch(ctx, hit) : null
    if (!item) throw new ConvexError('Match not found')
    return item
  },
})

const IDEMPOTENCY_WINDOW_MS = 24 * 3_600_000

/**
 * Add a phrase for the key's owner, with the same checks and plan limit as the dashboard. With an idempotency key, a retry
 * inside a day returns the phrase that was already made instead of making another.
 */
export const createKeyword = internalMutation({
  args: { owner: v.string(), phrase: v.string(), platform, community: v.optional(v.string()), idempotencyKey: v.optional(v.string()), now: v.number() },
  handler: async (ctx, args) => {
    if (args.idempotencyKey !== undefined) {
      const seen = await ctx.db.query('apiIdempotency')
        .withIndex('by_owner_and_key', q => q.eq('owner', args.owner).eq('key', args.idempotencyKey as string)).first()
      if (seen && args.now - seen.createdAt < IDEMPOTENCY_WINDOW_MS) {
        const existing = await ctx.db.get(seen.keywordId)
        if (existing && existing.owner === args.owner) return { keyword: apiKeyword(existing), created: false }
      }
    }
    const row = await createKeywordCore(ctx, args.owner, { phrase: args.phrase, platform: args.platform, ...(args.community === undefined ? {} : { subreddit: args.community }) })
    if (args.idempotencyKey !== undefined) {
      const old = await ctx.db.query('apiIdempotency')
        .withIndex('by_owner_and_key', q => q.eq('owner', args.owner).eq('key', args.idempotencyKey as string)).first()
      if (old) await ctx.db.patch(old._id, { keywordId: row._id, createdAt: args.now })
      else await ctx.db.insert('apiIdempotency', { owner: args.owner, key: args.idempotencyKey, keywordId: row._id, createdAt: args.now })
    }
    return { keyword: apiKeyword(row), created: true }
  },
})

export const setKeywordStatus = internalMutation({
  args: { owner: v.string(), id: v.string(), status: v.union(v.literal('listening'), v.literal('paused')) },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId('keywords', args.id)
    if (id === null) throw new ConvexError('Phrase not found')
    return apiKeyword(await setKeywordStatusCore(ctx, args.owner, id, args.status))
  },
})

export const deleteKeyword = internalMutation({
  args: { owner: v.string(), id: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId('keywords', args.id)
    if (id === null) throw new ConvexError('Phrase not found')
    await removeKeywordCore(ctx, args.owner, id)
    return { id: args.id, deleted: true }
  },
})
