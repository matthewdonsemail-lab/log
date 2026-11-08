import { Database } from 'bun:sqlite'
import { createHash } from 'node:crypto'
import { gunzipSync, gzipSync } from 'node:zlib'
import { chatIdOf, eventIdFrom, extenderOf, handleIdOf, isBareId, messageKeyOf, msOf, normalHandle, platformMessageIdOf, readConversations, writeConversation } from './helpers'
import type { StoredConversation } from './helpers'
import { DERIVED_TABLES, EXTENDER_VERSION, MESSAGE_TYPES } from './types'
import type { EventInput, EventInsert, ExtenderContext, InsertedEvent, TypedRows } from './types'

export const PAYLOAD_INLINE_LIMIT = 20000

interface PairTally {
  seen: Set<string>
  found: string | null
}

let tallies = new WeakMap<Database, Map<string, PairTally>>()

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

function tallyOf(handle: Database, platform: string, account: string): PairTally {
  let byKey = tallies.get(handle)
  if (!byKey) {
    byKey = new Map()
    tallies.set(handle, byKey)
  }
  const key = `${platform}:${account}`
  let tally = byKey.get(key)
  if (!tally) {
    const rows = handle.prepare("SELECT DISTINCT conversationId FROM events WHERE platform = ? AND account = ? AND (conversationId LIKE '%:%' OR conversationId LIKE '%-%') LIMIT 500").all(platform, account) as { conversationId: string }[]
    const seen = new Set(rows.map((r) => r.conversationId))
    tally = { seen, found: ownerIdFromPairs([...seen]) }
    byKey.set(key, tally)
  }
  return tally
}

export function notePairConversation(handle: Database, platform: string, account: string, conversationId: string): void {
  if (platform !== 'twitter' || !/^\d+[:-]\d+$/.test(conversationId)) return
  const tally = tallyOf(handle, platform, account)
  if (tally.seen.has(conversationId)) return
  tally.seen.add(conversationId)
  if (!tally.found) tally.found = ownerIdFromPairs([...tally.seen])
}

export function contextOn(handle: Database): ExtenderContext {
  return {
    ownerIdOf(platform, account) {
      const known = handle.prepare('SELECT userId FROM accounts WHERE platform = ? AND account = ?').get(platform, account) as { userId: string } | null
      if (known) return known.userId
      return platform === 'twitter' ? tallyOf(handle, platform, account).found : null
    },
    userIdOfHandle(platform, name) {
      const row = handle.prepare('SELECT userId FROM handleAliases WHERE platform = ? AND handle = ? ORDER BY lastSeenAt DESC LIMIT 1').get(platform, normalHandle(name)) as { userId: string } | null
      return row?.userId ?? null
    },
  }
}

export function rekeyIdentity(handle: Database, platform: string, fromId: string, toId: string, reason: string, at: string, chatPrefix: string | null = null): number {
  if (!fromId || !toId || fromId === toId) return 0
  const inChats = chatPrefix ? ' AND chatId LIKE ? ESCAPE \'\\\'' : ''
  const prefix = chatPrefix ? [`${chatPrefix.replace(/[\\%_]/g, (c) => `\\${c}`)}%`] : []
  let moved = handle.prepare(`UPDATE messages SET senderUserId = ? WHERE senderPlatform = ? AND lower(senderUserId) = lower(?)${inChats}`).run(toId, platform, fromId, ...prefix).changes
  moved += handle.prepare('UPDATE OR IGNORE memberships SET userId = ? WHERE platform = ? AND lower(userId) = lower(?)').run(toId, platform, fromId).changes
  handle.prepare('DELETE FROM memberships WHERE platform = ? AND lower(userId) = lower(?)').run(platform, fromId)
  moved += handle.prepare('UPDATE interactions SET actorUserId = ? WHERE platform = ? AND lower(actorUserId) = lower(?)').run(toId, platform, fromId).changes
  const old = handle.prepare('SELECT handle, displayName, firstSeenAt, lastSeenAt FROM identities WHERE platform = ? AND lower(userId) = lower(?)').get(platform, fromId) as { handle: string | null; displayName: string | null; firstSeenAt: string; lastSeenAt: string } | null
  if (old) {
    handle.prepare('INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(platform, userId) DO UPDATE SET handle = COALESCE(identities.handle, excluded.handle), displayName = COALESCE(identities.displayName, excluded.displayName), firstSeenAt = MIN(identities.firstSeenAt, excluded.firstSeenAt), lastSeenAt = MAX(identities.lastSeenAt, excluded.lastSeenAt)').run(platform, toId, old.handle, old.displayName, old.firstSeenAt, old.lastSeenAt)
    handle.prepare('DELETE FROM identities WHERE platform = ? AND lower(userId) = lower(?)').run(platform, fromId)
    moved++
  }
  if (moved) handle.prepare('INSERT INTO identityMerges (platform, fromId, toId, at, reason) VALUES (?, ?, ?, ?, ?)').run(platform, fromId, toId, at, reason)
  return moved
}

export function forgetOwners(): void {
  tallies = new WeakMap()
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

export function putBlob(handle: Database, kind: string, text: string, now: Date = new Date()): string {
  const bytes = Buffer.from(text, 'utf8')
  const hash = createHash('sha256').update(bytes).digest('hex')
  const packed = gzipSync(bytes)
  handle.prepare('INSERT OR IGNORE INTO blobs (hash, kind, codec, size, storedSize, chunks, bytes, createdAt) VALUES (?, ?, ?, ?, ?, 0, ?, ?)').run(hash, kind, 'gzip', bytes.length, packed.length, packed, now.toISOString())
  return hash
}

export function readBlob(handle: Database, hash: string): string | null {
  const row = handle.prepare('SELECT codec, bytes FROM blobs WHERE hash = ?').get(hash) as { codec: string; bytes: Uint8Array } | null
  if (!row) return null
  return (row.codec === 'gzip' ? gunzipSync(row.bytes) : Buffer.from(row.bytes)).toString('utf8')
}

export function insertEventRow(handle: Database, input: EventInsert, now: Date = new Date()): InsertedEvent | null {
  const messageKey = MESSAGE_TYPES.includes(input.type) ? messageKeyOf(input.platform, input.account, input.conversationId, platformMessageIdOf(input.payload)) : null
  const eventId = input.eventId ?? eventIdFrom({ platform: input.platform, account: input.account, conversationId: input.conversationId, at: input.sourceAt || input.receivedAt, text: input.text, messageKey })
  notePairConversation(handle, input.platform, input.account, input.conversationId)
  const ownerId = input.ownerId ?? contextOn(handle).ownerIdOf(input.platform, input.account)
  const json = JSON.stringify(input.payload)
  const rawHash = json.length > PAYLOAD_INLINE_LIMIT ? putBlob(handle, 'eventPayload', json, now) : null
  const result = handle.prepare('INSERT OR IGNORE INTO events (eventId, platform, account, conversationId, type, known, withWho, text, box, payload, sourceAt, receivedAt, appendedAt, ownerPid, source, sourceAtMs, receivedAtMs, messageKey, rawHash, ownerId, typedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(eventId, input.platform, input.account, input.conversationId, input.type, input.known === false ? 0 : 1, input.with, input.text, input.box, rawHash ? JSON.stringify({ storedIn: 'blobs', rawHash }) : json, input.sourceAt, input.receivedAt, now.toISOString(), process.pid, input.source, msOf(input.sourceAt), msOf(input.receivedAt), messageKey, rawHash, ownerId, now.getTime())
  if (!result.changes) return null
  typeEvent(handle, { eventId, platform: input.platform, account: input.account, conversationId: input.conversationId, type: input.type, with: input.with, text: input.text, box: input.box, payload: input.payload, sourceAt: input.sourceAt, receivedAt: input.receivedAt, source: input.source, ownerId })
  return { seq: Number(result.lastInsertRowid), eventId, messageKey }
}

function deriveInternal(handle: Database, event: EventInput): boolean {
  if (event.type === 'attachmentsSeen') {
    const messageKey = String(event.payload.messageKey ?? '')
    const list = Array.isArray(event.payload.attachments) ? (event.payload.attachments as Record<string, unknown>[]) : []
    const rows = extenderOf(event.platform).toAttachments({ ...event, type: 'message', conversationId: event.conversationId || 'derived', payload: { attachments: list } })
    const attach = handle.prepare('INSERT INTO attachments (messageKey, n, kind, name, contentType, url, durationMs, path, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(messageKey, n) DO UPDATE SET kind = excluded.kind, name = COALESCE(excluded.name, attachments.name), contentType = COALESCE(excluded.contentType, attachments.contentType), url = COALESCE(excluded.url, attachments.url), durationMs = COALESCE(excluded.durationMs, attachments.durationMs), path = COALESCE(excluded.path, attachments.path), error = COALESCE(excluded.error, attachments.error)')
    for (const a of rows) attach.run(messageKey, a.n, a.kind, a.name, a.contentType, a.url, a.durationMs, a.path, a.error)
    const platformMessageId = typeof event.payload.platformMessageId === 'string' ? event.payload.platformMessageId : null
    if (platformMessageId) handle.prepare('UPDATE messages SET platformMessageId = COALESCE(platformMessageId, ?) WHERE messageKey = ?').run(platformMessageId, messageKey)
    return true
  }
  if (event.type === 'accountIdentified') {
    const userId = String(event.payload.userId ?? '')
    if (!userId) return true
    handle.prepare('INSERT INTO accounts (platform, account, userId, learnedAt) VALUES (?, ?, ?, ?) ON CONFLICT(platform, account) DO UPDATE SET userId = excluded.userId, learnedAt = excluded.learnedAt').run(event.platform, event.account, userId, event.receivedAt)
    rekeyIdentity(handle, event.platform, `self:${event.account}`, userId, 'accountIdentified', event.receivedAt, `${event.platform}:${event.account}:`)
    return true
  }
  if (event.type === 'identityLearned') {
    const userId = String(event.payload.userId ?? '')
    const name = String(event.payload.handle ?? '')
    if (!userId || !name) return true
    const at = event.receivedAt
    handle.prepare('INSERT INTO handleAliases (platform, handle, userId, firstSeenAt, lastSeenAt) VALUES (?, ?, ?, ?, ?) ON CONFLICT(platform, handle, userId) DO UPDATE SET lastSeenAt = MAX(handleAliases.lastSeenAt, excluded.lastSeenAt)').run(event.platform, normalHandle(name), userId, at, at)
    rekeyIdentity(handle, event.platform, handleIdOf(name), userId, 'identityLearned', at)
    const displayName = typeof event.payload.displayName === 'string' ? event.payload.displayName : null
    handle.prepare('INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(platform, userId) DO UPDATE SET handle = excluded.handle, displayName = COALESCE(excluded.displayName, identities.displayName), lastSeenAt = MAX(identities.lastSeenAt, excluded.lastSeenAt)').run(event.platform, userId, name, displayName, at, at)
    return true
  }
  if (event.type === 'messageEdited') {
    handle.prepare('UPDATE messages SET text = ? WHERE messageKey = ?').run(event.text, String(event.payload.messageKey ?? ''))
    return true
  }
  if (event.type === 'conversationSeen') {
    const chatId = chatIdOf(event.platform, event.account, event.conversationId)
    const at = event.receivedAt
    handle.prepare('INSERT INTO chats (chatId, platform, account, conversationId, kind, box, backfilledAt) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(chatId) DO UPDATE SET box = excluded.box, backfilledAt = COALESCE(chats.backfilledAt, excluded.backfilledAt)').run(chatId, event.platform, event.account, event.conversationId, event.box === 'group' ? 'group' : 'dm', event.box, at)
    const members = Array.isArray(event.payload.members) ? (event.payload.members as unknown[]).map(String) : []
    members.forEach((label, position) => {
      if (!label) return
      const userId = isBareId(label) ? label.replace(/^@/, '') : handleIdOf(label)
      handle.prepare('INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES (?, ?, ?, NULL, ?, ?) ON CONFLICT(platform, userId) DO UPDATE SET handle = COALESCE(identities.handle, excluded.handle)').run(event.platform, userId, isBareId(label) ? null : label.replace(/^@/, ''), at, at)
      handle.prepare('INSERT INTO memberships (platform, roomId, userId, firstSeenAt, lastSeenAt, position) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(platform, roomId, userId) DO UPDATE SET position = excluded.position').run(event.platform, chatId, userId, at, at, position)
    })
    return true
  }
  return false
}

export function writeTypedRows(handle: Database, event: EventInput, rows: TypedRows): void {
  if (deriveInternal(handle, event)) return
  const at = event.sourceAt || event.receivedAt
  for (const identity of rows.identities) {
    handle.prepare('INSERT INTO identities (platform, userId, handle, displayName, firstSeenAt, lastSeenAt) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(platform, userId) DO UPDATE SET handle = COALESCE(excluded.handle, identities.handle), displayName = COALESCE(excluded.displayName, identities.displayName), firstSeenAt = MIN(identities.firstSeenAt, excluded.firstSeenAt), lastSeenAt = MAX(identities.lastSeenAt, excluded.lastSeenAt)').run(identity.platform, identity.userId, identity.handle, identity.displayName, at, at)
  }
  if (rows.chat) {
    const c = rows.chat
    handle.prepare('INSERT INTO chats (chatId, platform, account, conversationId, kind, name, serverId, lastMessageAt, lastMessageAtMs) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(chatId) DO UPDATE SET name = COALESCE(chats.name, excluded.name), serverId = COALESCE(excluded.serverId, chats.serverId), lastMessageAt = MAX(COALESCE(chats.lastMessageAt, \'\'), COALESCE(excluded.lastMessageAt, \'\')), lastMessageAtMs = MAX(COALESCE(chats.lastMessageAtMs, 0), COALESCE(excluded.lastMessageAtMs, 0))').run(c.chatId, c.platform, c.account, c.conversationId, c.kind, c.name, c.serverId, rows.message ? at : null, rows.message ? rows.message.sentAtMs : null)
  }
  if (rows.message) {
    const m = rows.message
    const inserted = handle.prepare('INSERT OR IGNORE INTO messages (messageKey, chatId, platformMessageId, senderPlatform, senderUserId, senderLabel, fromOwner, sentAt, sentAtMs, timeSource, text, replyToKey, source, rawHash, receivedAt, receivedAtMs, extenderVersion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)').run(m.messageKey, m.chatId, m.platformMessageId, event.platform, m.senderUserId, m.senderLabel, m.fromOwner ? 1 : 0, m.sentAt, m.sentAtMs, m.timeSource, m.text, m.replyToKey, event.source, event.receivedAt, msOf(event.receivedAt), EXTENDER_VERSION).changes > 0
    if (inserted) {
      const attach = handle.prepare('INSERT OR IGNORE INTO attachments (messageKey, n, kind, name, contentType, url, durationMs, path, error) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
      for (const a of rows.attachments) attach.run(m.messageKey, a.n, a.kind, a.name, a.contentType, a.url, a.durationMs, a.path, a.error)
      if (!m.fromOwner && !m.senderUserId.startsWith('unknown:')) {
        handle.prepare('INSERT INTO memberships (platform, roomId, userId, firstSeenAt, lastSeenAt) VALUES (?, ?, ?, ?, ?) ON CONFLICT(platform, roomId, userId) DO UPDATE SET firstSeenAt = MIN(memberships.firstSeenAt, excluded.firstSeenAt), lastSeenAt = MAX(memberships.lastSeenAt, excluded.lastSeenAt)').run(event.platform, m.chatId, m.senderUserId, at, at)
      }
    }
  }
  if (rows.interaction) {
    const i = rows.interaction
    handle.prepare('INSERT OR IGNORE INTO interactions (interactionKey, platform, account, kind, actorUserId, targetRef, targetText, text, at, atMs, rawHash, extenderVersion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)').run(i.interactionKey, event.platform, event.account, i.kind, i.actorUserId, i.targetRef, i.targetText, i.text, i.at, msOf(i.at) ?? msOf(event.receivedAt), EXTENDER_VERSION)
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
  rawHash?: string | null
  ownerId?: string | null
}

export function eventInputOf(row: EventRow, handle?: Database): EventInput {
  let payload: Record<string, unknown> = {}
  try {
    const text = row.rawHash && handle ? readBlob(handle, row.rawHash) ?? row.payload : row.payload
    const parsed = JSON.parse(text)
    if (parsed && typeof parsed === 'object') payload = parsed as Record<string, unknown>
  } catch {}
  return { eventId: row.eventId, platform: row.platform, account: row.account, conversationId: row.conversationId, type: row.type, with: row.withWho, text: row.text, box: row.box, payload, sourceAt: row.sourceAt, receivedAt: row.receivedAt, source: row.source, ownerId: row.ownerId ?? null }
}

export function replayEvents(handle: Database, afterSeq = 0): number {
  const rows = handle.prepare('SELECT eventId, platform, account, conversationId, type, withWho, text, box, payload, sourceAt, receivedAt, source, rawHash, ownerId FROM events WHERE seq > ? ORDER BY seq').all(afterSeq) as EventRow[]
  forgetOwners()
  const context = contextOn(handle)
  for (const row of rows) {
    const event = eventInputOf(row, handle)
    writeTypedRows(handle, event, typedRowsOf(event, context))
  }
  return rows.length
}

export function rebuildDerived(handle: Database): { events: number; messages: number; interactions: number; identities: number; chats: number } {
  handle.exec('BEGIN IMMEDIATE')
  try {
    for (const table of DERIVED_TABLES) handle.exec(`DELETE FROM ${table}`)
    const events = replayEvents(handle)
    handle.exec('COMMIT')
    return { events, ...countsOf(handle) }
  } catch (error) {
    handle.exec('ROLLBACK')
    throw error
  }
}

const FINGERPRINT_COLUMNS: Record<string, string> = {
  messages: 'messageKey, chatId, platformMessageId, senderPlatform, senderUserId, senderLabel, fromOwner, sentAtMs, timeSource, text, replyToKey',
  attachments: 'messageKey, n, kind, name, contentType, url, durationMs, path, error',
  chats: 'chatId, platform, account, conversationId, kind, name, serverId, box',
  identities: 'platform, userId, handle, displayName',
  memberships: 'platform, roomId, userId, position',
  interactions: 'interactionKey, platform, account, kind, actorUserId, targetRef, targetText, text, atMs',
  accounts: 'platform, account, userId',
  handleAliases: 'platform, handle, userId',
  identityMerges: 'platform, fromId, toId, reason',
}

export function derivedFingerprint(handle: Database): Record<string, { rows: number; hash: string }> {
  const out: Record<string, { rows: number; hash: string }> = {}
  for (const [table, columns] of Object.entries(FINGERPRINT_COLUMNS)) {
    const rows = handle.prepare(`SELECT ${columns} FROM ${table} ORDER BY ${columns.split(',')[0]}, ${columns.split(',')[1]}`).values() as unknown[][]
    const hash = createHash('sha256')
    for (const row of rows) hash.update(JSON.stringify(row)).update('\n')
    out[table] = { rows: rows.length, hash: hash.digest('hex').slice(0, 16) }
  }
  return out
}

export interface VerifyResult {
  ok: boolean
  live: Record<string, { rows: number; hash: string }>
  replayed: Record<string, { rows: number; hash: string }>
  differs: string[]
}

export function verifyDerived(handle: Database, prepare: (copy: Database) => void = () => {}): VerifyResult {
  const bytes = handle.serialize()
  if (bytes.length > 19) {
    bytes[18] = 1
    bytes[19] = 1
  }
  const copy = Database.deserialize(bytes)
  try {
    prepare(copy)
    rebuildDerived(copy)
    const live = derivedFingerprint(handle)
    const replayed = derivedFingerprint(copy)
    const differs = Object.keys(live).filter((t) => live[t].hash !== replayed[t].hash)
    return { ok: differs.length === 0, live, replayed, differs }
  } finally {
    copy.close()
  }
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
  const rows = handle.prepare('SELECT messageKey, platformMessageId, senderUserId, senderLabel, fromOwner, sentAt, text, replyToKey, source FROM messages WHERE chatId = ? ORDER BY sentAtMs DESC, seq DESC LIMIT ?').all(chatId, limit) as (Omit<ChatMessage, 'fromOwner'> & { fromOwner: number })[]
  return rows.reverse().map((r) => ({ ...r, fromOwner: r.fromOwner === 1 }))
}

export function messagesFromIdentity(handle: Database, platform: string, userId: string, limit = 500): (ChatMessage & { chatId: string })[] {
  const rows = handle.prepare('SELECT messageKey, chatId, platformMessageId, senderUserId, senderLabel, fromOwner, sentAt, text, replyToKey, source FROM messages WHERE senderPlatform = ? AND senderUserId = ? ORDER BY sentAtMs DESC, seq DESC LIMIT ?').all(platform, userId, limit) as (Omit<ChatMessage, 'fromOwner'> & { fromOwner: number; chatId: string })[]
  return rows.map((r) => ({ ...r, fromOwner: r.fromOwner === 1 }))
}

export function saveConversationRows(handle: Database, conversations: readonly StoredConversation[]): number {
  handle.exec('BEGIN IMMEDIATE')
  try {
    let written = 0
    for (const c of conversations) written += writeConversation(handle, c, (h, input) => insertEventRow(h, input), (h, key) => (h.prepare('SELECT text FROM messages WHERE messageKey = ?').get(key) as { text: string } | null)?.text ?? null)
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
