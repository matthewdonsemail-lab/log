import { Database } from 'bun:sqlite'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { INTERNAL_TYPES, KNOWN_TYPES } from './types'
import type { GapRow, GapStatus, Stage, StoredEvent } from './types'

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS events (seq INTEGER PRIMARY KEY AUTOINCREMENT, eventId TEXT NOT NULL UNIQUE, platform TEXT NOT NULL, account TEXT NOT NULL, conversationId TEXT NOT NULL DEFAULT '', type TEXT NOT NULL, known INTEGER NOT NULL DEFAULT 1, withWho TEXT NOT NULL DEFAULT '', text TEXT NOT NULL DEFAULT '', box TEXT NOT NULL DEFAULT '', payload TEXT NOT NULL DEFAULT '{}', sourceAt TEXT NOT NULL DEFAULT '', receivedAt TEXT NOT NULL, appendedAt TEXT NOT NULL, ownerPid INTEGER NOT NULL DEFAULT 0)`,
  `CREATE INDEX IF NOT EXISTS eventsByChat ON events (platform, account, conversationId, seq)`,
  `CREATE TABLE IF NOT EXISTS cursors (reader TEXT PRIMARY KEY, seq INTEGER NOT NULL, updatedAt TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS owners (platform TEXT NOT NULL, account TEXT NOT NULL, pid INTEGER NOT NULL, hostname TEXT NOT NULL DEFAULT '', startedAt TEXT NOT NULL, heartbeat TEXT NOT NULL, status TEXT NOT NULL, port INTEGER NOT NULL DEFAULT 0, token TEXT NOT NULL DEFAULT '', subscribers INTEGER NOT NULL DEFAULT 0, generation INTEGER NOT NULL DEFAULT 1, PRIMARY KEY (platform, account))`,
  `CREATE TABLE IF NOT EXISTS claims (chatKey TEXT PRIMARY KEY, platform TEXT NOT NULL, account TEXT NOT NULL, conversationId TEXT NOT NULL, parties TEXT NOT NULL, withWho TEXT, eventId TEXT, holder INTEGER NOT NULL, generation INTEGER NOT NULL, claimedAt TEXT NOT NULL, expiresAt TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS chatGenerations (chatKey TEXT PRIMARY KEY, generation INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS actions (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, kind TEXT NOT NULL, platform TEXT NOT NULL, account TEXT NOT NULL, conversationId TEXT NOT NULL, withWho TEXT, eventId TEXT, holder INTEGER NOT NULL, generation INTEGER, stateBefore TEXT, detail TEXT)`,
  `CREATE INDEX IF NOT EXISTS actionsByChat ON actions (platform, account, conversationId, id)`,
  `CREATE TABLE IF NOT EXISTS alerts (id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, platform TEXT NOT NULL, account TEXT NOT NULL, kind TEXT NOT NULL, detail TEXT NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS timings (eventId TEXT NOT NULL, stage TEXT NOT NULL, at TEXT NOT NULL, PRIMARY KEY (eventId, stage))`,
  `CREATE TABLE IF NOT EXISTS eventTypes (platform TEXT NOT NULL, type TEXT NOT NULL, status TEXT NOT NULL, firstSeenAt TEXT NOT NULL, sample TEXT NOT NULL DEFAULT '{}', PRIMARY KEY (platform, type))`,
  `CREATE VIRTUAL TABLE IF NOT EXISTS searchIndex USING fts5(source, ref, platform, account, conversationId, text)`,
  `CREATE TABLE IF NOT EXISTS positions (platform TEXT NOT NULL, account TEXT NOT NULL, scope TEXT NOT NULL DEFAULT '', position TEXT NOT NULL, updatedAt TEXT NOT NULL, PRIMARY KEY (platform, account, scope))`,
  `CREATE TABLE IF NOT EXISTS gaps (id INTEGER PRIMARY KEY AUTOINCREMENT, platform TEXT NOT NULL, account TEXT NOT NULL, fromAt TEXT NOT NULL, toAt TEXT, reason TEXT NOT NULL, status TEXT NOT NULL, detail TEXT, appended INTEGER NOT NULL DEFAULT 0, openedAt TEXT NOT NULL, closedAt TEXT)`,
  `CREATE INDEX IF NOT EXISTS gapsOpen ON gaps (platform, account, status)`,
]

const MIGRATIONS = [`ALTER TABLE events ADD COLUMN source TEXT NOT NULL DEFAULT 'live'`]

let opened: { path: string; db: Database } | null = null

export function dbPath(): string {
  if (process.env.LOG_DB) return process.env.LOG_DB
  if (process.env.LOG_INBOX_STATE) return join(process.env.LOG_INBOX_STATE, 'log.db')
  return join(homedir(), '.logCli', 'log.db')
}

export function db(): Database {
  const path = dbPath()
  if (opened?.path === path) return opened.db
  mkdirSync(dirname(path), { recursive: true })
  const handle = new Database(path, { create: true })
  handle.exec('PRAGMA journal_mode = WAL')
  handle.exec('PRAGMA busy_timeout = 5000')
  handle.exec('PRAGMA synchronous = NORMAL')
  for (const statement of SCHEMA) handle.exec(statement)
  for (const statement of MIGRATIONS) {
    try {
      handle.exec(statement)
    } catch {}
  }
  const seed = handle.prepare(`INSERT INTO eventTypes (platform, type, status, firstSeenAt) VALUES (?, ?, 'known', ?) ON CONFLICT(platform, type) DO UPDATE SET status = 'known'`)
  const now = new Date().toISOString()
  for (const [platform, types] of Object.entries(KNOWN_TYPES)) for (const type of types) seed.run(platform, type, now)
  opened = { path, db: handle }
  return handle
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

export function eventIdOf(event: { platform: string; account: string; conversationId: string; at: string; text: string }): string {
  return createHash('sha1').update([event.platform, event.account, event.conversationId, event.at, event.text].join('|')).digest('hex').slice(0, 12)
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

export function appendEvent(input: AppendInput, now: Date = new Date()): { seq: number; eventId: string; known: boolean } | null {
  const receivedAt = input.receivedAt ?? now.toISOString()
  const eventId = input.eventId ?? eventIdOf({ platform: input.platform, account: input.account, conversationId: input.conversationId ?? '', at: input.sourceAt ?? receivedAt, text: input.text ?? JSON.stringify(input.payload ?? {}) })
  return immediate((handle) => {
    const known = typeStatus(input.platform, input.type, input.payload ?? {}, now, handle) === 'known'
    const result = handle.prepare(`INSERT OR IGNORE INTO events (eventId, platform, account, conversationId, type, known, withWho, text, box, payload, sourceAt, receivedAt, appendedAt, ownerPid, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(eventId, input.platform, input.account, input.conversationId ?? '', input.type, known ? 1 : 0, input.with ?? '', input.text ?? '', input.box ?? '', JSON.stringify(input.payload ?? {}).slice(0, 20000), input.sourceAt ?? '', receivedAt, now.toISOString(), process.pid, input.source ?? 'live')
    if (!result.changes) return null
    markStage(eventId, 'received', new Date(receivedAt), handle)
    markStage(eventId, 'appended', now, handle)
    if (input.text) {
      handle.prepare('INSERT INTO searchIndex (source, ref, platform, account, conversationId, text) VALUES (?, ?, ?, ?, ?, ?)').run('event', eventId, input.platform, input.account, input.conversationId ?? '', `${input.with ?? ''} ${input.text}`)
      markStage(eventId, 'indexed', now, handle)
    }
    return { seq: Number(result.lastInsertRowid), eventId, known }
  })
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
  db().prepare('INSERT INTO positions (platform, account, scope, position, updatedAt) VALUES (?, ?, ?, ?, ?) ON CONFLICT(platform, account, scope) DO UPDATE SET position = excluded.position, updatedAt = excluded.updatedAt').run(platform, account, scope, position, now.toISOString())
}

export function positionsOf(platform: string, account: string): Record<string, string> {
  const rows = db().prepare('SELECT scope, position FROM positions WHERE platform = ? AND account = ?').all(platform, account) as { scope: string; position: string }[]
  return Object.fromEntries(rows.map((r) => [r.scope, r.position]))
}

export function openGapOf(platform: string, account: string, handle: Database = db()): GapRow | null {
  return (handle.prepare("SELECT * FROM gaps WHERE platform = ? AND account = ? AND status IN ('open', 'catchingUp', 'refused') ORDER BY id LIMIT 1").get(platform, account) as GapRow | null) ?? null
}

export function openGap(platform: string, account: string, fromAt: string, reason: string, now: Date = new Date(), handle: Database = db()): GapRow {
  const held = openGapOf(platform, account, handle)
  if (held) return held
  const result = handle.prepare("INSERT INTO gaps (platform, account, fromAt, reason, status, openedAt) VALUES (?, ?, ?, ?, 'open', ?)").run(platform, account, fromAt, reason, now.toISOString())
  addAlertRow({ platform, account, kind: 'gapOpened', detail: `${platform} ${account} is behind from ${fromAt} (${reason}): its owner catches up through its own session, and a send that needs its context waits for that` }, now, handle)
  return handle.prepare('SELECT * FROM gaps WHERE id = ?').get(Number(result.lastInsertRowid)) as GapRow
}

export function markGap(id: number, status: GapStatus, detail: string | null = null, appended = 0, now: Date = new Date()): void {
  const closing = status === 'closed'
  const sql = closing ? 'UPDATE gaps SET status = ?, detail = COALESCE(?, detail), appended = appended + ?, toAt = ?, closedAt = ? WHERE id = ?' : 'UPDATE gaps SET status = ?, detail = COALESCE(?, detail), appended = appended + ? WHERE id = ?'
  db().prepare(sql).run(...(closing ? [status, detail, appended, now.toISOString(), now.toISOString(), id] : [status, detail, appended, id]))
  const gap = db().prepare('SELECT platform, account FROM gaps WHERE id = ?').get(id) as { platform: string; account: string } | null
  if (gap && status === 'refused') addAlertRow({ platform: gap.platform, account: gap.account, kind: 'catchUpRefused', detail: `catching up ${gap.platform} ${gap.account} was refused: ${detail ?? ''}; it stays behind and nothing resumes until matt says so (rule 94)` }, now)
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
