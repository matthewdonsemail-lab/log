import { ConvexError, v } from 'convex/values'
import { ensureAccount } from './lib/accounts'
import { mutation, query, requireOwner } from './lib/server'
import { platform } from './schema'

const MAX_KEYWORDS = 50
const SUBREDDIT = /^[A-Za-z0-9_]{1,21}$/

function publicKeyword(row: {
  _id: string; _creationTime: number; phrase: string; platform: 'facebook' | 'x' | 'reddit'
  status: 'listening' | 'paused'; subreddit?: string; signalsCount?: number
  lastCheckedAt?: number; lastSource?: 'reddit' | 'mirror'
}) {
  return {
    id: row._id, phrase: row.phrase, platform: row.platform, status: row.status,
    subreddit: row.subreddit ?? null, signalsCount: row.signalsCount ?? 0, addedAt: row._creationTime,
    lastCheckedAt: row.lastCheckedAt ?? null, lastSource: row.lastSource ?? null,
  }
}

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
    const phrase = args.phrase.trim().replace(/\s+/g, ' ')
    if (phrase.length < 2 || phrase.length > 100) throw new ConvexError('A phrase needs 2-100 characters')
    let subreddit: string | undefined
    if (args.platform === 'reddit') {
      const name = (args.subreddit ?? '').trim().replace(/^\/?r\//i, '')
      if (!SUBREDDIT.test(name)) throw new ConvexError('Pick a subreddit: letters, numbers or underscores, up to 21')
      subreddit = name.toLowerCase()
    } else if (args.subreddit) {
      throw new ConvexError('Only Reddit phrases take a subreddit')
    }
    const rows = await ctx.db.query('keywords').withIndex('by_owner', q => q.eq('owner', owner)).take(MAX_KEYWORDS + 1)
    if (rows.length >= MAX_KEYWORDS) throw new ConvexError(`You can listen for up to ${MAX_KEYWORDS} phrases`)
    const duplicate = rows.some(row =>
      row.platform === args.platform && row.subreddit === subreddit && row.phrase.toLowerCase() === phrase.toLowerCase())
    if (duplicate) throw new ConvexError('You are already listening for that phrase there')
    const account = await ensureAccount(ctx, owner, args.platform)
    const id = await ctx.db.insert('keywords', {
      owner, accountId: account._id, platform: args.platform, phrase, status: 'listening',
      ...(subreddit === undefined ? {} : { subreddit }), signalsCount: 0,
    })
    const row = await ctx.db.get(id)
    if (!row) throw new ConvexError('Could not save the phrase')
    return { keyword: publicKeyword(row) }
  },
})

export const setStatus = mutation({
  args: { id: v.id('keywords'), status: v.union(v.literal('listening'), v.literal('paused')) },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const row = await ctx.db.get(args.id)
    if (!row || row.owner !== owner) throw new ConvexError('Phrase not found')
    await ctx.db.patch(args.id, { status: args.status })
    return null
  },
})

export const remove = mutation({
  args: { id: v.id('keywords') },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const row = await ctx.db.get(args.id)
    if (!row || row.owner !== owner) throw new ConvexError('Phrase not found')
    // Its matches go with it; bounded per call so one transaction stays small.
    const hits = await ctx.db.query('hits').withIndex('by_keyword_and_post', q => q.eq('keywordId', args.id)).take(500)
    for (const hit of hits) await ctx.db.delete(hit._id)
    await ctx.db.delete(args.id)
    return null
  },
})
