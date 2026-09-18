import { ConvexError, v } from 'convex/values'
import { writePosts } from './feed'
import { ensureAccount } from './lib/accounts'
import { sha256Hex } from './lib/hash'
import { internalMutation, mutation, query, requireOwner } from './lib/server'
import { platform, postFields } from './schema'

const MAX_KEYS = 10

/** Mint a key for an external client (camofox, twikit). The secret is returned exactly once. */
export const createKey = mutation({
  args: { label: v.string() },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const label = args.label.trim()
    if (!label || label.length > 80) throw new ConvexError('Label must contain 1-80 characters')
    const existing = await ctx.db.query('ingestKeys').withIndex('by_owner', q => q.eq('owner', owner)).take(MAX_KEYS + 1)
    if (existing.length >= MAX_KEYS) throw new ConvexError('Ingest key limit reached; revoke one first')
    const secret = `lk_ingest_${crypto.randomUUID().replaceAll('-', '')}${crypto.randomUUID().replaceAll('-', '')}`
    const id = await ctx.db.insert('ingestKeys', {
      owner, label, prefix: secret.slice(0, 16), keyHash: await sha256Hex(secret),
    })
    return { id, secret, prefix: secret.slice(0, 16) }
  },
})

export const listKeys = query({
  args: {},
  handler: async ctx => {
    const owner = await requireOwner(ctx)
    const rows = await ctx.db.query('ingestKeys').withIndex('by_owner', q => q.eq('owner', owner)).take(MAX_KEYS)
    return rows.map(row => ({
      id: row._id, label: row.label, prefix: row.prefix,
      createdAt: row._creationTime, lastUsedAt: row.lastUsedAt ?? null,
    }))
  },
})

export const revokeKey = mutation({
  args: { id: v.id('ingestKeys') },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const row = await ctx.db.get(args.id)
    if (!row || row.owner !== owner) throw new ConvexError('Key not found')
    await ctx.db.delete(args.id)
    return null
  },
})

/** Called by the HTTP endpoint only: resolves the owner from the key hash, never from the request. */
export const commit = internalMutation({
  args: { keyHash: v.string(), platform, posts: v.array(v.object(postFields)) },
  handler: async (ctx, args) => {
    const key = await ctx.db.query('ingestKeys').withIndex('by_hash', q => q.eq('keyHash', args.keyHash)).unique()
    if (!key) throw new ConvexError('Invalid ingest key')
    const account = await ensureAccount(ctx, key.owner, args.platform)
    const { processed, newHits } = await writePosts(ctx, account, args.posts)
    const now = Date.now()
    await ctx.db.patch(key._id, { lastUsedAt: now })
    // X and Facebook are read by the person's own helper, so a push counts as checking all of their phrases there.
    // Reddit phrases are per community, so the Reddit poll stamps those.
    if (args.platform !== 'reddit') {
      const phrases = await ctx.db.query('keywords').withIndex('by_owner', q => q.eq('owner', key.owner)).take(100)
      for (const phrase of phrases) {
        if (phrase.platform === args.platform && phrase.status === 'listening') {
          await ctx.db.patch(phrase._id, { lastCheckedAt: now, lastSource: 'helper' })
        }
      }
    }
    return { accountId: account._id, processed, newHits }
  },
})
