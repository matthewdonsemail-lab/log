import type { Database } from 'bun:sqlite'
import { extenderOf, readConversations, writeConversation } from './helpers'
import type { StoredConversation } from './helpers'
import type { EventInput, ExtenderContext, TypedRows } from './types'

const owners = new Map<string, string | null>()

export function ownerIdFromPairs(conversationIds: readonly string[]): string | null {
  const counts = new Map<string, number>()
  for (const id of conversationIds) {
    const parts = id.split(/[:-]/)
    if (parts.length !== 2 || !parts.every((p) => /^\d+$/.test(p))) continue
    for (const part of new Set(parts)) counts.set(part, (counts.get(part) ?? 0) + 1)
  }
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1])
  if (!ranked.length || ranked[0][1] < 2) return null
  if (ranked[1] && ranked[1][1] === ranked[0][1]) return null
  return ranked[0][0]
}

export function contextOn(handle: Database): ExtenderContext {
  return {
    ownerIdOf(platform, account) {
      const key = `${platform}:${account}`
      if (owners.has(key)) return owners.get(key) ?? null
      if (platform !== 'twitter') return null
      const rows = handle.prepare("SELECT DISTINCT conversationId FROM events WHERE platform = ? AND account = ? AND (conversationId LIKE '%:%' OR conversationId LIKE '%-%') LIMIT 500").all(platform, account) as { conversationId: string }[]
      const found = ownerIdFromPairs(rows.map((r) => r.conversationId))
      if (found) owners.set(key, found)
      return found
    },
  }
}

export function forgetOwners(): void {
  owners.clear()
}

export function typedRowsOf(event: EventInput, context: ExtenderContext): TypedRows {
  const extender = extenderOf(event.platform)
  return {
    identities: extender.toIdentities(event, context),
    chat: extender.toChat(event),
    message: extender.toMessage(event, context),
    attachments: extender.toAttachments(event),
    interaction: extender.toInteraction(event),
  }
}

export function writeTypedRows(handle: Database, event: EventInput, rows: TypedRows): void {
  const at = event.sourceAt || event.receivedAt
  for (const identity of rows.identities) {
    handle.prepare('INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(platform, userId) DO UPDATE SET handle = COALESCE(excluded.handle, identities.handle), displayName = COALESCE(excluded.displayName, identities.displayName), firstSeenAt = MIN(identities.firstSeenAt, excluded.firstSeenAt), lastSeenAt = MAX(identities.lastSeenAt, excluded.lastSeenAt)').run(identity.platform, identity.userId, identity.handle, identity.displayName, at, at)
  }
  if (rows.chat) {
    const c = rows.chat
    handle.prepare('INSERT INTO chats (chatId, platform, account, conversationId, kind, name, serverId, lastMessageAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(chatId) DO UPDATE SET name = COALESCE(chats.name, excluded.name), serverId = COALESCE(excluded.serverId, chats.serverId), lastMessageAt = MAX(COALESCE(chats.lastMessageAt, \'\'), COALESCE(excluded.lastMessageAt, \'\'))').run(c.chatId, c.platform, c.account, c.conversationId, c.kind, c.name, c.serverId, rows.message ? at : null)
  }
  if (rows.message) {
    const m = rows.message
    const inserted = handle.prepare('INSERT OR IGNORE INTO messages (messageKey, chatId, platformMessageId, senderPlatform, senderUserId, senderLabel, fromOwner, sentAt, text, replyToKey, source, rawHash, receivedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)').run(m.messageKey, m.chatId, m.platformMessageId, event.platform, m.senderUserId, m.senderLabel, m.fromOwner ? 1 : 0, m.sentAt, m.text, m.replyToKey, event.source, event.receivedAt).changes > 0
    if (inserted) {
      const attach = handle.prepare('INSERT OR IGNORE INTO attachments (messageKey, n, kind, name, contentType, url, durationMs) VALUES (?, ?, ?, ?, ?, ?, ?)')
      for (const a of rows.attachments) attach.run(m.messageKey, a.n, a.kind, a.name, a.contentType, a.url, a.durationMs)
      if (!m.fromOwner && !m.senderUserId.startsWith('unknown:')) {
        handle.prepare('INSERT INTO memberships (platform, roomId, userId, firstSeenAt, lastSeenAt) VALUES (?, ?, ?, ?, ?) ON CONFLICT(platform, roomId, userId) DO UPDATE SET firstSeenAt = MIN(memberships.firstSeenAt, excluded.firstSeenAt), lastSeenAt = MAX(memberships.lastSeenAt, excluded.lastSeenAt)').run(event.platform, m.chatId, m.senderUserId, at, at)
      }
    }
  }
  if (rows.interaction) {
    const i = rows.interaction
    handle.prepare('INSERT OR IGNORE INTO interactions (interactionKey, platform, account, kind, actorUserId, targetRef, targetText, text, at, rawHash) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)').run(i.interactionKey, event.platform, event.account, i.kind, i.actorUserId, i.targetRef, i.targetText, i.text, i.at)
  }
}

export function typeEvent(handle: Database, event: EventInput): TypedRows {
  const rows = typedRowsOf(event, contextOn(handle))
  writeTypedRows(handle, event, rows)
  return rows
}

interface EventRow {
  eventId: string
  platform: string
  account: string
  conversationId: string
  type: string
  withWho: string
  text: string
  box: string
  payload: string
  sourceAt: string
  receivedAt: string
  source: string
}

export function eventInputOf(row: EventRow): EventInput {
  let payload: Record<string, unknown> = {}
  try {
    const parsed = JSON.parse(row.payload)
    if (parsed && typeof parsed === 'object') payload = parsed as Record<string, unknown>
  } catch {}
  return { eventId: row.eventId, platform: row.platform, account: row.account, conversationId: row.conversationId, type: row.type, with: row.withWho, text: row.text, box: row.box, payload, sourceAt: row.sourceAt, receivedAt: row.receivedAt, source: row.source }
}

export function typeStoredEvents(handle: Database, now: Date = new Date()): { events: number; messages: number; interactions: number; identities: number } {
  const before = countsOf(handle)
  const rows = handle.prepare('SELECT eventId, platform, account, conversationId, type, withWho, text, box, payload, sourceAt, receivedAt, source FROM events ORDER BY seq').all() as EventRow[]
  const context = contextOn(handle)
  for (const row of rows) {
    const event = eventInputOf(row)
    writeTypedRows(handle, event, typedRowsOf(event, context))
  }
  const after = countsOf(handle)
  handle.prepare("INSERT INTO imports (store, state, files, rows, startedAt, endedAt) VALUES ('events', 'done', 0, ?, ?, ?) ON CONFLICT(store) DO UPDATE SET state = 'done', rows = excluded.rows, endedAt = excluded.endedAt").run(rows.length, now.toISOString(), new Date().toISOString())
  return { events: rows.length, messages: after.messages - before.messages, interactions: after.interactions - before.interactions, identities: after.identities - before.identities }
}

export function typeAllEvents(handle: Database, now: Date = new Date()): { events: number; messages: number; interactions: number; identities: number } {
  handle.exec('BEGIN IMMEDIATE')
  try {
    const result = typeStoredEvents(handle, now)
    handle.exec('COMMIT')
    return result
  } catch (error) {
    handle.exec('ROLLBACK')
    throw error
  }
}

export function countsOf(handle: Database): { messages: number; interactions: number; identities: number; chats: number } {
  const n = (table: string) => (handle.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n
  return { messages: n('messages'), interactions: n('interactions'), identities: n('identities'), chats: n('chats') }
}

export interface ChatMessage {
  messageKey: string
  platformMessageId: string | null
  senderUserId: string
  senderLabel: string | null
  fromOwner: boolean
  sentAt: string
  text: string
  replyToKey: string | null
  source: string
}

export function lastMessagesOf(handle: Database, chatId: string, limit = 100): ChatMessage[] {
  const rows = handle.prepare('SELECT messageKey, platformMessageId, senderUserId, senderLabel, fromOwner, sentAt, text, replyToKey, source FROM messages WHERE chatId = ? ORDER BY sentAt DESC LIMIT ?').all(chatId, limit) as (Omit<ChatMessage, 'fromOwner'> & { fromOwner: number })[]
  return rows.reverse().map((r) => ({ ...r, fromOwner: r.fromOwner === 1 }))
}

export function messagesFromIdentity(handle: Database, platform: string, userId: string, limit = 500): (ChatMessage & { chatId: string })[] {
  const rows = handle.prepare('SELECT messageKey, chatId, platformMessageId, senderUserId, senderLabel, fromOwner, sentAt, text, replyToKey, source FROM messages WHERE senderPlatform = ? AND senderUserId = ? ORDER BY sentAt DESC LIMIT ?').all(platform, userId, limit) as (Omit<ChatMessage, 'fromOwner'> & { fromOwner: number; chatId: string })[]
  return rows.map((r) => ({ ...r, fromOwner: r.fromOwner === 1 }))
}

export function saveConversationRows(handle: Database, conversations: readonly StoredConversation[]): number {
  handle.exec('BEGIN IMMEDIATE')
  try {
    const context = contextOn(handle)
    let written = 0
    for (const c of conversations) written += writeConversation(handle, c, context, (h, event, ctx) => writeTypedRows(h, event, typedRowsOf(event, ctx)))
    handle.exec('COMMIT')
    return written
  } catch (error) {
    handle.exec('ROLLBACK')
    throw error
  }
}

export function loadConversationRows(handle: Database, account?: string): StoredConversation[] {
  return readConversations(handle, account)
}
