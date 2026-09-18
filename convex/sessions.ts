import { ConvexError, v } from 'convex/values'
import { ensureAccount } from './lib/accounts'
import { encryptText } from './lib/crypto'
import { internalQuery, mutation, query, requireOwner } from './lib/server'
import { parseToken } from './lib/token'
import { platform } from './schema'

/**
 * Connect an account with a token from the extension. The cookie jar is sealed before it is
 * stored, and nothing here ever returns it: the browser only gets metadata.
 */
export const save = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const parsed = parseToken(args.token)
    const sealed = await encryptText(JSON.stringify(parsed.cookies))
    const existing = await ctx.db.query('sessions')
      .withIndex('by_owner_and_platform', q => q.eq('owner', owner).eq('platform', parsed.platform)).first()
    const row = {
      owner, platform: parsed.platform, ...sealed, cookieCount: parsed.cookies.length,
      expiresAt: parsed.expiresAt, updatedAt: Date.now(),
    }
    if (existing) await ctx.db.replace(existing._id, row)
    else await ctx.db.insert('sessions', row)
    const account = await ensureAccount(ctx, owner, parsed.platform)
    await ctx.db.patch(account._id, { connectedAt: new Date().toISOString() })
    return { platform: parsed.platform, cookieCount: row.cookieCount, expiresAt: row.expiresAt }
  },
})

export const list = query({
  args: {},
  handler: async ctx => {
    const owner = await requireOwner(ctx)
    const rows = await ctx.db.query('sessions').withIndex('by_owner_and_platform', q => q.eq('owner', owner)).take(10)
    return { sessions: rows.map(row => ({
      platform: row.platform, cookieCount: row.cookieCount, expiresAt: row.expiresAt, savedAt: row.updatedAt,
    })) }
  },
})

/** Disconnect: forget the saved login and mark the account not connected. */
export const remove = mutation({
  args: { platform },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const row = await ctx.db.query('sessions')
      .withIndex('by_owner_and_platform', q => q.eq('owner', owner).eq('platform', args.platform)).first()
    if (!row) throw new ConvexError('That account is not connected')
    await ctx.db.delete(row._id)
    const account = await ensureAccount(ctx, owner, args.platform)
    await ctx.db.patch(account._id, { connectedAt: null })
    return null
  },
})

/** For the HTTP endpoint only: the sealed jar of whoever owns this ingest key. */
export const sealedForKey = internalQuery({
  args: { keyHash: v.string(), platform },
  handler: async (ctx, args) => {
    const key = await ctx.db.query('ingestKeys').withIndex('by_hash', q => q.eq('keyHash', args.keyHash)).unique()
    if (!key) throw new ConvexError('Invalid ingest key')
    const row = await ctx.db.query('sessions')
      .withIndex('by_owner_and_platform', q => q.eq('owner', key.owner).eq('platform', args.platform)).first()
    return row ? { iv: row.iv, data: row.data, expiresAt: row.expiresAt } : null
  },
})
