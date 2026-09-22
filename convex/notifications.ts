import { ConvexError, v } from 'convex/values'
import { mutation, query, requireOwner } from './lib/server'

const MAX_RECENT = 50
const MAX_CONNECTIONS = 10
const MAX_LABEL = 80
const MAX_SERVER = 500
const MAX_KEY = 200

function normalizeServer(raw: string): string {
  const server = raw.trim().replace(/\/+$/, '')
  if (!server) return 'https://api.day.app'
  if (!/^https?:\/\//i.test(server)) throw new ConvexError('Server needs a scheme, e.g. https://api.day.app')
  if (server.length > MAX_SERVER) throw new ConvexError('Server URL is too long.')
  return server
}

/**
 * Notification feed for the header bell: the person's newest matches with
 * their state (scored? alerted? at what score), plus the email row when it
 * exists. Read-only; the owner comes from the token, never an argument.
 */
export const recent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const limit = Math.min(args.limit ?? MAX_RECENT, MAX_RECENT)
    const rows = await ctx.db.query('hits').withIndex('by_owner', q => q.eq('owner', owner)).order('desc').take(limit)
    const notifications = []
    for (const row of rows) {
      const post = await ctx.db.get(row.postId)
      if (!post) continue
      notifications.push({
        hitId: row._id,
        phrase: row.phrase,
        platform: row.platform,
        matchedAt: row._creationTime,
        // Notification type, most specific wins: an alerted match is an
        // "email sent" item, a scored one is a "strong match", otherwise
        // it is a plain "new match".
        kind: row.alertedAt !== undefined ? 'alerted' : row.score !== undefined ? 'scored' : 'new' as 'alerted' | 'scored' | 'new',
        score: row.score ?? null,
        scoreUpdatedAt: row.scoredAt ?? null,
        alertedAt: row.alertedAt ?? null,
        author: post.authorName,
        snippet: post.title ?? post.body[0]?.slice(0, 180) ?? null,
        url: post.url,
      })
    }
    const email = await ctx.db.query('emailAlerts').withIndex('by_owner', q => q.eq('owner', owner)).first()
    return {
      items: notifications,
      emailAlert: email ? { enabled: email.enabled, minScore: email.minScore, lastSentAt: email.lastSentAt ?? null } : null,
    }
  },
})

/* ------------------------------------------------------------------ */
/* Bark connections (the localStorage rows, now in Convex) ----------- */

/** One Bark push connection per row. The device key stays in plain text:
    the browser POSTs to the Bark server with it, so it must never be
    hashed away. */
export const createConnection = mutation({
  args: { label: v.string(), server: v.string(), deviceKey: v.string() },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const label = args.label.trim()
    if (!label || label.length > MAX_LABEL) throw new ConvexError('Label must contain 1-80 characters.')
    const deviceKey = args.deviceKey.trim()
    if (!deviceKey || deviceKey.length > MAX_KEY) throw new ConvexError('Paste your Bark device key first.')
    const existing = await ctx.db.query('barkConnections').withIndex('by_owner', q => q.eq('owner', owner)).take(MAX_CONNECTIONS + 1)
    if (existing.length >= MAX_CONNECTIONS) throw new ConvexError('You have too many connections. Delete one first.')
    const id = await ctx.db.insert('barkConnections', {
      owner, label, server: normalizeServer(args.server), deviceKey, createdAt: Date.now(),
    })
    return id
  },
})

export const listConnections = query({
  args: {},
  handler: async ctx => {
    const owner = await requireOwner(ctx)
    const rows = await ctx.db.query('barkConnections').withIndex('by_owner', q => q.eq('owner', owner)).take(MAX_CONNECTIONS)
    return rows.map(row => ({
      id: row._id, label: row.label, server: row.server, deviceKey: row.deviceKey,
      createdAt: row.createdAt,
    }))
  },
})

export const saveConnection = mutation({
  args: { id: v.id('barkConnections'), label: v.string(), server: v.string(), deviceKey: v.string() },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const row = await ctx.db.get(args.id)
    if (!row || row.owner !== owner) throw new ConvexError('Connection not found')
    const label = args.label.trim()
    if (!label || label.length > MAX_LABEL) throw new ConvexError('Label must contain 1-80 characters.')
    const deviceKey = args.deviceKey.trim()
    if (!deviceKey || deviceKey.length > MAX_KEY) throw new ConvexError('Paste your Bark device key first.')
    await ctx.db.patch(args.id, { label, server: normalizeServer(args.server), deviceKey })
    return null
  },
})

export const removeConnection = mutation({
  args: { id: v.id('barkConnections') },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const row = await ctx.db.get(args.id)
    if (!row || row.owner !== owner) throw new ConvexError('Connection not found')
    await ctx.db.delete(args.id)
    return null
  },
})
