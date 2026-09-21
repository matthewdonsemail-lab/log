import { ConvexError, v } from 'convex/values'
import { sha256Hex } from './lib/hash'
import { internalMutation, mutation, query, requireOwner } from './lib/server'

const MAX_KEYS = 5
export const RATE_LIMIT_PER_MINUTE = 60

/** Mint a key for the public read API. The secret is returned exactly once; only its hash is kept. */
export const createKey = mutation({
  args: { label: v.string() },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const label = args.label.trim()
    if (!label || label.length > 80) throw new ConvexError('Name the key with 1-80 characters')
    const existing = await ctx.db.query('apiKeys').withIndex('by_owner', q => q.eq('owner', owner)).take(MAX_KEYS + 1)
    if (existing.length >= MAX_KEYS) throw new ConvexError(`You can have ${MAX_KEYS} API keys; revoke one first`)
    const secret = `lk_api_${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`
    const id = await ctx.db.insert('apiKeys', { owner, label, prefix: secret.slice(0, 14), keyHash: await sha256Hex(secret) })
    return { id, secret, prefix: secret.slice(0, 14) }
  },
})

export const listKeys = query({
  args: {},
  handler: async ctx => {
    const owner = await requireOwner(ctx)
    const rows = await ctx.db.query('apiKeys').withIndex('by_owner', q => q.eq('owner', owner)).take(MAX_KEYS)
    return rows.map(row => ({
      id: row._id, label: row.label, prefix: row.prefix, createdAt: row._creationTime, lastUsedAt: row.lastUsedAt ?? null,
    }))
  },
})

export const revokeKey = mutation({
  args: { id: v.id('apiKeys') },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const row = await ctx.db.get(args.id)
    if (!row || row.owner !== owner) throw new ConvexError('Key not found')
    await ctx.db.delete(args.id)
    return null
  },
})

/**
 * For the HTTP layer only: turns a key hash into its owner, and counts the request against the key's
 * per-minute allowance. Throws 'Invalid API key' for an unknown or revoked key and 'Rate limited' past the allowance.
 */
export const authenticate = internalMutation({
  args: { keyHash: v.string(), now: v.number() },
  handler: async (ctx, args): Promise<{ owner: string; remaining: number }> => {
    const key = await ctx.db.query('apiKeys').withIndex('by_hash', q => q.eq('keyHash', args.keyHash)).unique()
    if (!key) throw new ConvexError('Invalid API key')
    const window = Math.floor(args.now / 60_000)
    const sameWindow = key.windowStart === window
    const count = (sameWindow ? key.windowCount ?? 0 : 0) + 1
    if (count > RATE_LIMIT_PER_MINUTE) throw new ConvexError('Rate limited')
    await ctx.db.patch(key._id, { windowStart: window, windowCount: count, ...(sameWindow ? {} : { lastUsedAt: args.now }) })
    return { owner: key.owner, remaining: RATE_LIMIT_PER_MINUTE - count }
  },
})
