import { ConvexError, v } from 'convex/values'
import type { Doc, Id } from './_generated/dataModel'
import { ensureAccount } from './lib/accounts'
import { internalMutation, internalQuery, mutation, query, requireOwner } from './lib/server'
import { platform } from './schema'

export const MAX_THREADS_PER_BATCH = 20
export const MAX_MESSAGES_PER_THREAD = 30
export const MAX_PENDING_PER_POLL = 10
const MAX_TEXT_LENGTH = 2000

const inboundMessage = v.object({
  externalId: v.string(), text: v.string(), sentAt: v.optional(v.number()),
})
const inboundThread = v.object({
  peerHandle: v.string(), peerName: v.optional(v.string()), messages: v.array(inboundMessage),
})

function threadView(row: Doc<'dmThreads'>) {
  return {
    id: row._id, platform: row.platform, peerHandle: row.peerHandle, peerName: row.peerName ?? null,
    lastMessageAt: row.lastMessageAt, lastMessagePreview: row.lastMessagePreview ?? null,
  }
}
function messageView(row: Doc<'dmMessages'>) {
  return { id: row._id, direction: row.direction, text: row.text, sentAt: row.sentAt, status: row.status }
}

// ---- the dashboard's own view: live queries and sending a message ----

export const listThreads = query({
  args: {},
  handler: async ctx => {
    const owner = await requireOwner(ctx)
    const rows = await ctx.db.query('dmThreads').withIndex('by_owner', q => q.eq('owner', owner)).take(200)
    return rows.sort((a, b) => b.lastMessageAt - a.lastMessageAt).map(threadView)
  },
})

export const listMessages = query({
  args: { threadId: v.id('dmThreads') },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const thread = await ctx.db.get(args.threadId)
    if (!thread || thread.owner !== owner) throw new ConvexError('Thread not found')
    const rows = await ctx.db.query('dmMessages').withIndex('by_thread', q => q.eq('threadId', args.threadId)).take(500)
    return rows.sort((a, b) => a.sentAt - b.sentAt).map(messageView)
  },
})

/** Queues a message to send. The helper on the person's own computer actually sends it and confirms with `markSent`. */
export const sendMessage = mutation({
  args: { threadId: v.id('dmThreads'), text: v.string() },
  handler: async (ctx, args) => {
    const owner = await requireOwner(ctx)
    const thread = await ctx.db.get(args.threadId)
    if (!thread || thread.owner !== owner) throw new ConvexError('Thread not found')
    const text = args.text.trim()
    if (!text) throw new ConvexError('Message must not be empty')
    if (text.length > MAX_TEXT_LENGTH) throw new ConvexError(`Message must be at most ${MAX_TEXT_LENGTH} characters`)
    const now = Date.now()
    const id = await ctx.db.insert('dmMessages', { owner, threadId: args.threadId, direction: 'out', text, sentAt: now, status: 'pending' })
    await ctx.db.patch(args.threadId, { lastMessageAt: now, lastMessagePreview: text.slice(0, 200) })
    return messageView((await ctx.db.get(id))!)
  },
})

// ---- the helper's view (an ingest key, never a signed-in browser) ----

async function ownerForKey(ctx: { db: import('./_generated/server').DatabaseReader }, keyHash: string): Promise<Doc<'ingestKeys'>> {
  const key = await ctx.db.query('ingestKeys').withIndex('by_hash', q => q.eq('keyHash', keyHash)).unique()
  if (!key) throw new ConvexError('Invalid ingest key')
  return key
}

/** New inbound messages (and any new conversations) the helper read from the platform. Idempotent: a message it already pushed is skipped. */
export const ingestDms = internalMutation({
  args: { keyHash: v.string(), platform, threads: v.array(inboundThread) },
  handler: async (ctx, args) => {
    const key = await ownerForKey(ctx, args.keyHash)
    const account = await ensureAccount(ctx, key.owner, args.platform)
    let threadsSeen = 0
    let messagesAdded = 0
    for (const incoming of args.threads.slice(0, MAX_THREADS_PER_BATCH)) {
      const peerHandle = incoming.peerHandle.trim().slice(0, 120)
      if (!peerHandle) continue
      threadsSeen += 1
      let thread = await ctx.db.query('dmThreads')
        .withIndex('by_account_and_peer', q => q.eq('accountId', account._id).eq('peerHandle', peerHandle)).unique()
      const threadId: Id<'dmThreads'> = thread
        ? thread._id
        : await ctx.db.insert('dmThreads', {
            owner: key.owner, accountId: account._id, platform: args.platform,
            peerHandle, peerName: incoming.peerName?.trim().slice(0, 120), lastMessageAt: Date.now(),
          })
      let latest = thread?.lastMessageAt ?? 0
      let preview = thread?.lastMessagePreview
      for (const message of incoming.messages.slice(0, MAX_MESSAGES_PER_THREAD)) {
        const externalId = message.externalId.trim()
        const text = message.text.trim().slice(0, MAX_TEXT_LENGTH)
        if (!externalId || !text) continue
        const already = await ctx.db.query('dmMessages')
          .withIndex('by_thread_and_external', q => q.eq('threadId', threadId).eq('externalId', externalId)).unique()
        if (already) continue
        const sentAt = message.sentAt ?? Date.now()
        await ctx.db.insert('dmMessages', { owner: key.owner, threadId, direction: 'in', text, sentAt, status: 'sent', externalId })
        messagesAdded += 1
        if (sentAt >= latest) { latest = sentAt; preview = text.slice(0, 200) }
      }
      await ctx.db.patch(threadId, { lastMessageAt: latest, lastMessagePreview: preview })
    }
    await ctx.db.patch(key._id, { lastUsedAt: Date.now() })
    return { threadsSeen, messagesAdded }
  },
})

/** Outbound messages waiting to be sent, oldest first, for the helper to actually send. */
export const pendingForKey = internalQuery({
  args: { keyHash: v.string(), platform },
  handler: async (ctx, args) => {
    const key = await ownerForKey(ctx, args.keyHash)
    const threads = await ctx.db.query('dmThreads').withIndex('by_owner', q => q.eq('owner', key.owner)).take(200)
    const pending: { id: Id<'dmMessages'>; threadId: Id<'dmThreads'>; peerHandle: string; text: string; sentAt: number }[] = []
    for (const thread of threads) {
      if (thread.platform !== args.platform) continue
      const rows = await ctx.db.query('dmMessages').withIndex('by_thread', q => q.eq('threadId', thread._id)).collect()
      for (const row of rows) {
        if (row.direction === 'out' && row.status === 'pending') {
          pending.push({ id: row._id, threadId: thread._id, peerHandle: thread.peerHandle, text: row.text, sentAt: row.sentAt })
        }
      }
    }
    return pending.sort((a, b) => a.sentAt - b.sentAt).slice(0, MAX_PENDING_PER_POLL)
  },
})

/** The helper confirms a queued message actually sent. */
export const markSent = internalMutation({
  args: { keyHash: v.string(), messageId: v.id('dmMessages'), externalId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const key = await ownerForKey(ctx, args.keyHash)
    const row = await ctx.db.get(args.messageId)
    if (!row || row.owner !== key.owner) throw new ConvexError('Message not found')
    await ctx.db.patch(args.messageId, { status: 'sent', ...(args.externalId ? { externalId: args.externalId } : {}) })
    await ctx.db.patch(row.threadId, { lastMessageAt: row.sentAt, lastMessagePreview: row.text.slice(0, 200) })
    await ctx.db.patch(key._id, { lastUsedAt: Date.now() })
    return null
  },
})

/** The helper reports it could not send a queued message (a plain-words reason, never a cookie or a page dump). */
export const markFailed = internalMutation({
  args: { keyHash: v.string(), messageId: v.id('dmMessages'), error: v.string() },
  handler: async (ctx, args) => {
    const key = await ownerForKey(ctx, args.keyHash)
    const row = await ctx.db.get(args.messageId)
    if (!row || row.owner !== key.owner) throw new ConvexError('Message not found')
    await ctx.db.patch(args.messageId, { status: 'failed', error: args.error.slice(0, 300) })
    return null
  },
})
