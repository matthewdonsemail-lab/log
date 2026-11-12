import { AsyncLocalStorage } from 'node:async_hooks'
import { Database } from 'bun:sqlite'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, renameSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { defaultDbPath, openDatabase } from '../../storage/schema'
import { accountIdentifiedEvent, attachmentsSeenEvent, eventIdFrom, identityLearnedEvent, insertEventRow, isBareId, MESSAGE_TYPES, messageKeyOf, msOf, platformMessageIdOf } from '../../storage/platform'
import { refreshWorkedCards } from '../card/client'
import { INTERNAL_TYPES, KNOWN_TYPES } from './types'
import type { GapRow, GapStatus, Stage, StoredEvent } from './types'

let opened: { path: string; db: Database } | null = null

export function dbPath(): string {
  return defaultDbPath()
}

export function db(): Database {
  const path = dbPath()
  if (opened?.path === path) return opened.db
  const handle = openDatabase(path)
  const seed = handle.prepare(`INSERT INTO eventTypes (platform, type, status, firstSeenAt) VALUES (?, ?, 'known', ?) ON CONFLICT(platform, type) DO UPDATE SET status = 'known'`)
  const now = new Date().toISOString()
  for (const [platform, types] of Object.entries(KNOWN_TYPES)) for (const type of types) seed.run(platform, type, now)
  opened = { path, db: handle }
  return handle
}

export class OwnerFencedError extends Error {
  readonly code = 'ownerFenced'
}

const fences = new Map<string, number>()

export const ownerScope = new AsyncLocalStorage<{ platform: string; account: string }>()

export function asOwner<T>(platform: string, account: string, work: () => T): T {
  return ownerScope.run({ platform, account }, work)
}

export function holdFence(platform: string, account: string, generation: number): void {
  fences.set(`${platform}:${account}`, generation)
}

export function dropFence(platform: string, account: string): void {
  fences.delete(`${platform}:${account}`)
}

export function fenceOf(platform: string, account: string): number | null {
  return fences.get(`${platform}:${account}`) ?? null
}

export function checkFence(handle: Database, platform: string, account: string): void {
  const scope = ownerScope.getStore()
  if (!scope || scope.platform !== platform || scope.account !== account) return
  const generation = fenceOf(platform, account)
  if (generation === null) return
  const row = handle.prepare('SELECT generation, pid FROM owners WHERE platform = ? AND account = ?').get(platform, account) as { generation: number; pid: number } | null
  if (row && row.generation === generation && row.pid === process.pid) return
  throw new OwnerFencedError(`${platform} ${account}: this process (pid ${process.pid}) owned it as generation ${generation}, but ${row ? `pid ${row.pid} owns it now as generation ${row.generation}` : 'no owner row is left'}, so its write was refused`)
}

export function inWrite<T>(handle: Database, work: (handle: Database) => T): T {
  if (handle.inTransaction) return work(handle)
  handle.exec('BEGIN IMMEDIATE')
  try {
    const result = work(handle)
    handle.exec('COMMIT')
    return result
  } catch (error) {
    handle.exec('ROLLBACK')
    throw error
  }
}

export function immediate<T>(work: (handle: Database) => T): T {
  const handle = db()
  handle.exec('BEGIN IMMEDIATE')
  try {
    const result = work(handle)
    handle.exec('COMMIT')
    return result
  } catch (error) {
    handle.exec('ROLLBACK')
    throw error
  }
}

export function eventIdOf(event: { platform: string; account: string; conversationId: string; at: string; text: string; id?: string | null; messageKey?: string | null }): string {
  return eventIdFrom({ ...event, messageKey: event.messageKey ?? messageKeyOf(event.platform, event.account, event.conversationId, event.id ?? null) })
}

export function adoptUnkeyed(event: { platform: string; account: string; conversationId: string; at: string; text: string; id: string }, extra: Record<string, unknown> = {}): boolean {
  const messageKey = messageKeyOf(event.platform, event.account, event.conversationId, event.id)
  if (!messageKey) return false
  const legacy = eventIdOf({ platform: event.platform, account: event.account, conversationId: event.conversationId, at: event.at, text: event.text })
  return immediate((handle) => {
    if (handle.prepare('SELECT 1 FROM events WHERE messageKey = ?').get(messageKey)) return false
    if (!handle.prepare('SELECT 1 FROM events WHERE eventId = ? AND messageKey IS NULL').get(legacy)) return false
    const attachments = Array.isArray(extra.attachments) ? (extra.attachments as Record<string, unknown>[]) : []
    insertEventRow(handle, attachmentsSeenEvent(event, `${event.platform}:${event.account}:${event.conversationId}:${legacy}`, attachments, event.id))
    return true
  })
}

export function afterGap(at: string | null | undefined, fromAt: string): boolean {
  if (!at) return true
  const a = msOf(at)
  const b = msOf(fromAt)
  return a !== null && b !== null ? a > b : at > fromAt
}

export function messageKeyOfEvent(input: { platform: string; account: string; conversationId?: string; type: string; payload?: unknown }): string | null {
  if (!MESSAGE_TYPES.includes(input.type) || !input.payload || typeof input.payload !== 'object') return null
  return messageKeyOf(input.platform, input.account, input.conversationId ?? '', platformMessageIdOf(input.payload as Record<string, unknown>))
}

export function markStage(eventId: string, stage: Stage, at: Date = new Date(), handle: Database = db()): void {
  handle.prepare('INSERT OR IGNORE INTO timings (eventId, stage, at) VALUES (?, ?, ?)').run(eventId, stage, at.toISOString())
}

export function stagesOf(eventId: string): { stage: string; at: string }[] {
  return db().prepare('SELECT stage, at FROM timings WHERE eventId = ? ORDER BY at').all(eventId) as { stage: string; at: string }[]
}

export function addAlertRow(alert: { platform: string; account: string; kind: string; detail: string }, now: Date = new Date(), handle: Database = db()): void {
  handle.prepare('INSERT INTO alerts (at, platform, account, kind, detail) VALUES (?, ?, ?, ?, ?)').run(now.toISOString(), alert.platform, alert.account, alert.kind, alert.detail)
}

export function typeStatus(platform: string, type: string, sample: unknown, now: Date = new Date(), handle: Database = db()): 'known' | 'unknown' {
  if (INTERNAL_TYPES.includes(type)) return 'known'
  const row = handle.prepare('SELECT status FROM eventTypes WHERE platform = ? AND type = ?').get(platform, type) as { status: string } | null
  if (row) return row.status === 'known' ? 'known' : 'unknown'
  handle.prepare(`INSERT INTO eventTypes (platform, type, status, firstSeenAt, sample) VALUES (?, ?, 'unknown', ?, ?)`).run(platform, type, now.toISOString(), JSON.stringify(sample).slice(0, 4000))
  addAlertRow({ platform, account: '', kind: 'unknownEventType', detail: `${platform} pushed an event type nobody has catalogued yet, "${type}": it is stored with its raw payload; name it in docs/platforms/${platform}/events from rea, the docs and SubQ (rule one), then mark it known` }, now, handle)
  return 'unknown'
}

export interface AppendInput {
  platform: string
  account: string
  conversationId?: string
  type: string
  with?: string
  text?: string
  box?: string
  payload?: unknown
  sourceAt?: string
  receivedAt?: string
  eventId?: string
  source?: 'live' | 'catchUp' | 'backfill'
}

export { isBareId }

export const UNNAMED = 'someone not named yet'

function senderIdOf(input: AppendInput): string {
  const payload = (input.payload ?? {}) as Record<string, unknown>
  const found = [payload.senderId, payload.userId, payload.authorId, payload.sender_id, payload.user, isBareId(input.with) ? input.with : null].find((v) => typeof v === 'string' && v.trim() !== '')
  return found ? String(found).replace(/^@/, '') : ''
}

function handleIn(input: AppendInput): string {
  const payload = (input.payload ?? {}) as Record<string, unknown>
  const found = [input.with, payload.from, payload.handle, payload.username, payload.screenName].find((v) => typeof v === 'string' && v.trim() !== '' && !isBareId(v))
  return found ? String(found).replace(/^@/, '') : ''
}

export function rememberPerson(platform: string, account: string, userId: string, handle: string, name: string | null = null, now: Date = new Date(), on: Database = db()): void {
  if (!userId || !handle || isBareId(handle)) return
  const learn = () => {
    insertEventRow(on, identityLearnedEvent(platform, account, userId, handle, name, now.toISOString()), now)
  }
  if (on.inTransaction) learn()
  else on.transaction(learn).immediate()
}

export function identifyAccount(platform: string, account: string, userId: string, now: Date = new Date(), on: Database = db()): boolean {
  if (!userId) return false
  const known = on.prepare('SELECT userId FROM accounts WHERE platform = ? AND account = ?').get(platform, account) as { userId: string } | null
  if (known?.userId === String(userId)) return false
  return on.transaction(() => insertEventRow(on, accountIdentifiedEvent(platform, account, String(userId), now.toISOString()), now) !== null).immediate()
}

export function handleOfIdentity(platform: string, userId: string, on: Database = db()): string | null {
  const alias = on.prepare('SELECT handle FROM identities WHERE platform = ? AND userId = ?').get(platform, userId) as { handle: string | null } | null
  return alias?.handle && !isBareId(alias.handle) ? alias.handle : null
}

export function personOf(platform: string, account: string, userId: string, on: Database = db()): string | null {
  if (!userId) return null
  const id = userId.replace(/^@/, '')
  const known = handleOfIdentity(platform, id, on)
  if (known) return known
  const handle = handleOfUserId(platform, account, id)
  if (!handle || isBareId(handle)) return null
  rememberPerson(platform, account, id, handle, null, new Date(), on)
  return handle
}

export function namedLabel(platform: string, account: string, label: string | null | undefined, userId = ''): string {
  if (!isBareId(label)) return String(label).replace(/^@/, '')
  return personOf(platform, account, userId || String(label ?? '')) ?? UNNAMED
}

export function addToPayload(eventId: string, extra: Record<string, unknown>): boolean {
  return immediate((handle) => {
    const target = handle.prepare('SELECT platform, account, conversationId, messageKey FROM events WHERE eventId = ?').get(eventId) as { platform: string; account: string; conversationId: string; messageKey: string | null } | null
    if (!target) return false
    const messageKey = target.messageKey ?? `${target.platform}:${target.account}:${target.conversationId}:${eventId}`
    const attachments = Array.isArray(extra.attachments) ? (extra.attachments as Record<string, unknown>[]) : []
    return insertEventRow(handle, attachmentsSeenEvent(target, messageKey, attachments)) !== null
  })
}

export function appendEvent(input: AppendInput, now: Date = new Date()): { seq: number; eventId: string; known: boolean } | null {
  const receivedAt = input.receivedAt ?? now.toISOString()
  const senderId = senderIdOf(input)
  const handleGiven = handleIn(input)
  input = { ...input, with: handleGiven || (senderId ? personOf(input.platform, input.account, senderId) ?? input.with : input.with) }
  const messageKey = messageKeyOfEvent(input)
  const eventId = input.eventId ?? eventIdOf({ platform: input.platform, account: input.account, conversationId: input.conversationId ?? '', at: input.sourceAt ?? receivedAt, text: input.text ?? JSON.stringify(input.payload ?? {}), messageKey })
  const appended = immediate((handle) => {
    checkFence(handle, input.platform, input.account)
    const known = typeStatus(input.platform, input.type, input.payload ?? {}, now, handle) === 'known'
    const inserted = insertEventRow(handle, { eventId, platform: input.platform, account: input.account, conversationId: input.conversationId ?? '', type: input.type, with: input.with ?? '', text: input.text ?? '', box: input.box ?? '', payload: (input.payload ?? {}) as Record<string, unknown>, sourceAt: input.sourceAt ?? '', receivedAt, source: input.source ?? 'live', known }, now)
    if (!inserted) return null
    const result = { lastInsertRowid: inserted.seq }
    markStage(eventId, 'received', new Date(receivedAt), handle)
    markStage(eventId, 'appended', now, handle)
    if (senderId && handleGiven) rememberPerson(input.platform, input.account, senderId, handleGiven, null, now, handle)
    if (!isBareId(input.with)) markStage(eventId, 'named', now, handle)
    if (input.text) {
      handle.prepare('INSERT INTO searchIndex (source, ref, platform, account, conversationId, text) VALUES (?, ?, ?, ?, ?, ?)').run('event', eventId, input.platform, input.account, input.conversationId ?? '', `${input.with ?? ''} ${input.text}`)
      markStage(eventId, 'indexed', now, handle)
    }
    return { seq: Number(result.lastInsertRowid), eventId, known }
  })
  if (appended && input.conversationId && MESSAGE_TYPES.includes(input.type)) {
    try {
      refreshWorkedCards(db(), input.platform, input.account, input.conversationId, now)
    } catch {
      return appended
    }
  }
  return appended
}

export function latestSeq(): number {
  return (db().prepare('SELECT COALESCE(MAX(seq), 0) AS seq FROM events').get() as { seq: number }).seq
}

export function readCursor(reader: string): number | null {
  const row = db().prepare('SELECT seq FROM cursors WHERE reader = ?').get(reader) as { seq: number } | null
  return row ? row.seq : null
}

export function writeCursor(reader: string, seq: number, now: Date = new Date()): void {
  db().prepare('INSERT INTO cursors (reader, seq, updatedAt) VALUES (?, ?, ?) ON CONFLICT(reader) DO UPDATE SET seq = excluded.seq, updatedAt = excluded.updatedAt').run(reader, seq, now.toISOString())
}

export function eventsAfter(seq: number, filter: { type?: string } = {}): StoredEvent[] {
  return db().prepare(`SELECT * FROM events WHERE seq > ? ${filter.type ? 'AND type = ?' : ''} ORDER BY seq`).all(...(filter.type ? [seq, filter.type] : [seq])) as StoredEvent[]
}

export function searchStore(query: string, limit = 20): { source: string; ref: string; platform: string; account: string; conversationId: string; text: string }[] {
  const terms = query.split(/\s+/).map((w) => w.replace(/[^\p{L}\p{N}_]/gu, '')).filter(Boolean)
  if (!terms.length) return []
  return db().prepare('SELECT source, ref, platform, account, conversationId, text FROM searchIndex WHERE searchIndex MATCH ? ORDER BY rank LIMIT ?').all(terms.map((t) => `"${t}"`).join(' '), limit) as { source: string; ref: string; platform: string; account: string; conversationId: string; text: string }[]
}

export function retirePendingFile(path: string, handle: Database = db()): { retired: boolean; rows: number; added: number; unreadable: number } {
  if (!existsSync(path)) return { retired: false, rows: 0, added: 0, unreadable: 0 }
  const lines = readFileSync(path, 'utf8').split('\n').filter((l) => l.trim())
  const found = handle.prepare("SELECT 1 FROM events WHERE platform = ? AND account = ? AND conversationId = ? AND text = ? AND type = 'message' LIMIT 1")
  let added = 0
  let unreadable = 0
  for (const line of lines) {
    try {
      const m = JSON.parse(line) as { platform: string; account: string; conversationId: string; with: string; text: string; at: string; box: string; seenAt: string }
      if (found.get(m.platform, m.account, m.conversationId ?? '', m.text ?? '')) continue
      if (appendEvent({ platform: m.platform, account: m.account, conversationId: m.conversationId, type: 'message', with: m.with, text: m.text, box: m.box, payload: m, sourceAt: m.at, receivedAt: m.seenAt || m.at, source: 'backfill' })) added++
    } catch {
      unreadable++
    }
  }
  if (unreadable) return { retired: false, rows: lines.length, added, unreadable }
  renameSync(path, `${path}.imported`)
  return { retired: true, rows: lines.length, added, unreadable: 0 }
}

export function importPendingFile(path: string): number {
  if (!existsSync(path)) return 0
  if (latestSeq() > 0) return 0
  let imported = 0
  for (const line of readFileSync(path, 'utf8').split('\n').filter(Boolean)) {
    try {
      const m = JSON.parse(line) as { platform: string; account: string; conversationId: string; with: string; text: string; at: string; box: string; seenAt: string }
      if (appendEvent({ platform: m.platform, account: m.account, conversationId: m.conversationId, type: 'message', with: m.with, text: m.text, box: m.box, payload: m, sourceAt: m.at, receivedAt: m.seenAt || m.at, eventId: eventIdOf(m) })) imported++
    } catch {}
  }
  return imported
}

export function recordPosition(platform: string, account: string, position: string, scope = '', now: Date = new Date()): void {
  inWrite(db(), (handle) => {
    checkFence(handle, platform, account)
    handle.prepare('INSERT INTO positions (platform, account, scope, position, updatedAt) VALUES (?, ?, ?, ?, ?) ON CONFLICT(platform, account, scope) DO UPDATE SET position = excluded.position, updatedAt = excluded.updatedAt').run(platform, account, scope, position, now.toISOString())
  })
}

export function positionsOf(platform: string, account: string): Record<string, string> {
  const rows = db().prepare('SELECT scope, position FROM positions WHERE platform = ? AND account = ?').all(platform, account) as { scope: string; position: string }[]
  return Object.fromEntries(rows.map((r) => [r.scope, r.position]))
}

export function openGapOf(platform: string, account: string, handle: Database = db()): GapRow | null {
  return (handle.prepare("SELECT * FROM gaps WHERE platform = ? AND account = ? AND status IN ('open', 'catchingUp', 'refused') ORDER BY id LIMIT 1").get(platform, account) as GapRow | null) ?? null
}

export function openGap(platform: string, account: string, fromAt: string, reason: string, now: Date = new Date(), handle: Database = db()): GapRow {
  return inWrite(handle, (h) => {
    checkFence(h, platform, account)
    const held = openGapOf(platform, account, h)
    if (held) {
      if (held.status === 'refused') return held
      h.prepare('UPDATE gaps SET drops = drops + 1, detail = ? WHERE id = ?').run(`dropped again (${reason}) at ${now.toISOString()}${held.detail ? `; ${held.detail}` : ''}`, held.id)
      return h.prepare('SELECT * FROM gaps WHERE id = ?').get(held.id) as GapRow
    }
    const result = h.prepare("INSERT INTO gaps (platform, account, fromAt, reason, status, openedAt) VALUES (?, ?, ?, ?, 'open', ?)").run(platform, account, fromAt, reason, now.toISOString())
    addAlertRow({ platform, account, kind: 'gapOpened', detail: `${platform} ${account} is behind from ${fromAt} (${reason}): its owner catches up through its own session, and a send that needs its context waits for that` }, now, h)
    return h.prepare('SELECT * FROM gaps WHERE id = ?').get(Number(result.lastInsertRowid)) as GapRow
  })
}

export function markGap(id: number, status: GapStatus, detail: string | null = null, appended = 0, now: Date = new Date(), expectDrops: number | null = null): boolean {
  return inWrite(db(), (handle) => {
    const gap = handle.prepare('SELECT platform, account FROM gaps WHERE id = ?').get(id) as { platform: string; account: string } | null
    if (gap) checkFence(handle, gap.platform, gap.account)
    const closing = status === 'closed'
    const guard = closing && expectDrops !== null ? " AND status = 'catchingUp' AND drops = ?" : ''
    const sql = closing ? `UPDATE gaps SET status = ?, detail = COALESCE(?, detail), appended = appended + ?, toAt = ?, closedAt = ? WHERE id = ?${guard}` : 'UPDATE gaps SET status = ?, detail = COALESCE(?, detail), appended = appended + ? WHERE id = ?'
    const args = closing ? [status, detail, appended, now.toISOString(), now.toISOString(), id, ...(guard ? [expectDrops as number] : [])] : [status, detail, appended, id]
    const changed = handle.prepare(sql).run(...args).changes > 0
    if (gap && status === 'refused') addAlertRow({ platform: gap.platform, account: gap.account, kind: 'catchUpRefused', detail: `catching up ${gap.platform} ${gap.account} was refused: ${detail ?? ''}; it stays behind and nothing resumes until matt says so (rule 94)` }, now, handle)
    return changed
  })
}

export function resumeGap(platform: string, account: string, by: string, now: Date = new Date()): GapRow | null {
  return immediate((handle) => {
    const gap = openGapOf(platform, account, handle)
    if (!gap || gap.status !== 'refused') return null
    handle.prepare("UPDATE gaps SET status = 'open', detail = ? WHERE id = ?").run(`resumed by ${by} at ${now.toISOString()} after: ${gap.detail ?? 'refused'}`, gap.id)
    addAlertRow({ platform, account, kind: 'gapResumed', detail: `${by} said to resume ${platform} ${account}: its owner catches up from ${gap.fromAt} again through its own session` }, now, handle)
    return handle.prepare('SELECT * FROM gaps WHERE id = ?').get(gap.id) as GapRow
  })
}

export function handleOfUserId(platform: string, account: string, userId: string): string | null {
  const row = db().prepare("SELECT withWho FROM events WHERE platform = ? AND account = ? AND type = 'notification' AND withWho != '' AND json_extract(payload, '$.userId') = ? ORDER BY seq DESC LIMIT 1").get(platform, account, String(userId)) as { withWho: string } | null
  const handle = row?.withWho ? row.withWho.replace(/^@/, '') : ''
  if (handle && !isBareId(handle)) return handle
  return platform === 'twitter' ? xInboxHandleOf(account, String(userId)) : null
}

export function xInboxHandleOf(account: string, userId: string, root: string = process.env.LOG_TWITTER_STATE || join(homedir(), '.logCli', 'twitter')): string | null {
  const file = join(root, account, 'inboxSync.json')
  if (!userId || !existsSync(file)) return null
  try {
    const state = JSON.parse(readFileSync(file, 'utf8')) as { xchat?: Record<string, { handles?: Record<string, string> }> }
    for (const conversation of Object.values(state.xchat ?? {})) {
      const handle = conversation.handles?.[userId]?.replace(/^@/, '')
      if (handle && !isBareId(handle)) return handle
    }
  } catch {
    return null
  }
  return null
}

export function behindOf(platform: string, account: string): GapRow | null {
  return openGapOf(platform, account)
}

export function lastEventAt(platform: string, account: string, handle: Database = db()): string | null {
  const row = handle.prepare('SELECT MAX(receivedAt) AS at FROM events WHERE platform = ? AND account = ?').get(platform, account) as { at: string | null }
  return row.at
}

export function chatEvents(platform: string, account: string, match: (conversationId: string, withWho: string) => boolean, since = ''): StoredEvent[] {
  const rows = db().prepare("SELECT * FROM events WHERE platform = ? AND account = ? AND receivedAt > ? AND type IN ('message', 'ownMessage', 'notification') ORDER BY seq").all(platform, account, since) as StoredEvent[]
  return rows.filter((r) => match(r.conversationId, r.withWho))
}

export function ownTextsSince(platform: string, account: string, since: string): { conversationId: string; to: string; text: string }[] {
  const rows = db().prepare("SELECT conversationId, withWho, text FROM events WHERE platform = ? AND account = ? AND type = 'ownMessage' AND receivedAt > ? ORDER BY seq").all(platform, account, since) as { conversationId: string; withWho: string; text: string }[]
  const byChat = new Map<string, { conversationId: string; to: string; lines: string[] }>()
  for (const row of rows) {
    const chat = byChat.get(row.conversationId) ?? { conversationId: row.conversationId, to: row.withWho || row.conversationId, lines: [] }
    if (row.text) chat.lines.push(row.text)
    byChat.set(row.conversationId, chat)
  }
  return [...byChat.values()].map((c) => ({ conversationId: c.conversationId, to: c.to, text: c.lines.join('\n') }))
}

export function textHash(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 32)
}

export function vectorsFor(model: string, dimensions: number, texts: readonly string[]): (Float32Array | null)[] {
  const read = db().prepare('SELECT vector FROM embeddings WHERE hash = ? AND model = ? AND dimensions = ?')
  return texts.map((text) => {
    const row = read.get(textHash(text), model, dimensions) as { vector: Uint8Array } | null
    if (!row) return null
    const bytes = Uint8Array.from(row.vector)
    return new Float32Array(bytes.buffer, 0, bytes.byteLength / 4)
  })
}

export function saveVectors(model: string, dimensions: number, items: readonly { text: string; vector: ArrayLike<number>; kind?: string }[], now: Date = new Date()): void {
  if (!items.length) return
  immediate((handle) => {
    const write = handle.prepare('INSERT OR IGNORE INTO embeddings (hash, model, dimensions, kind, text, vector, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)')
    for (const item of items) write.run(textHash(item.text), model, dimensions, item.kind ?? 'text', item.text.slice(0, 4000), Buffer.from(Float32Array.from(item.vector).buffer), now.toISOString())
  })
}

export function saveAiIndex(name: string, model: string, meta: unknown, now: Date = new Date()): void {
  db().prepare('INSERT INTO aiIndexes (name, model, meta, builtAt) VALUES (?, ?, ?, ?) ON CONFLICT(name) DO UPDATE SET model = excluded.model, meta = excluded.meta, builtAt = excluded.builtAt').run(name, model, JSON.stringify(meta), now.toISOString())
}

export function aiIndexOf(name: string): { model: string; meta: string; builtAt: string } | null {
  return (db().prepare('SELECT model, meta, builtAt FROM aiIndexes WHERE name = ?').get(name) as { model: string; meta: string; builtAt: string } | null) ?? null
}

export function storedEmbedder<E extends { model: string; dimensions: number; embed(texts: string[]): Promise<Float32Array[]>; stop?(): void }>(inner: E, kind = 'text'): E {
  return {
    ...inner,
    async embed(texts: string[]) {
      if (!texts.length) return []
      const held = vectorsFor(inner.model, inner.dimensions, texts)
      const missing = [...new Set(texts.filter((_, i) => !held[i]))]
      const made = new Map<string, Float32Array>()
      if (missing.length) {
        const fresh = await inner.embed(missing)
        missing.forEach((text, i) => made.set(text, fresh[i]))
        saveVectors(inner.model, inner.dimensions, missing.map((text, i) => ({ text, vector: fresh[i], kind })))
      }
      return texts.map((text, i) => held[i] ?? made.get(text)!)
    },
    stop: () => inner.stop?.(),
  }
}
