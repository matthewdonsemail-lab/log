import { ConvexError, v } from 'convex/values'
import { createKeywordCore, MAX_KEYWORDS, publicKeyword, removeKeywordCore, setKeywordStatusCore } from './lib/keywordOps'
import { internalQuery, mutation, query, requireOwner } from './lib/server'
import { platform } from './schema'

export const list = query({
  args: {},
  handler: async ctx => {
    const owner = await requireOwner(ctx)
    const rows = await ctx.db.query('keywords').withIndex('by_owner', q => q.eq('owner', owner)).order('desc').take(MAX_KEYWORDS)
    return { keywords: rows.map(publicKeyword) }
  },
})

/** Reddit keywords name the subreddit to watch; X and Facebook phrases listen wherever their account reads. */
export const create = mutation({
  args: { phrase: v.string(), platform, subreddit: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    return { keyword: publicKeyword(await createKeywordCore(ctx, owner, args)) }
  },
})

export const setStatus = mutation({
  args: { id: v.id('keywords'), status: v.union(v.literal('listening'), v.literal('paused')) },
  handler: async (ctx, args) => {
    await setKeywordStatusCore(ctx, await requireOwner(ctx), args.id, args.status)
    return null
  },
})

export const remove = mutation({
  args: { id: v.id('keywords') },
  handler: async (ctx, args) => {
    await removeKeywordCore(ctx, await requireOwner(ctx), args.id)
    return null
  },
})

/** For the local helper: the phrases its owner is listening for on one platform, found by ingest key, never by argument. */
export const forKey = internalQuery({
  args: { keyHash: v.string(), platform },
  handler: async (ctx, args): Promise<{ phrase: string; subreddit: string | null }[]> => {
    const key = await ctx.db.query('ingestKeys').withIndex('by_hash', q => q.eq('keyHash', args.keyHash)).unique()
    if (!key) throw new ConvexError('Invalid ingest key')
    const rows = await ctx.db.query('keywords').withIndex('by_owner', q => q.eq('owner', key.owner)).take(MAX_KEYWORDS)
    return rows
      .filter(row => row.platform === args.platform && row.status === 'listening')
      .map(row => ({ phrase: row.phrase, subreddit: row.subreddit ?? null }))
  },
})
