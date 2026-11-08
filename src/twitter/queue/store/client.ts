import type { Database } from 'bun:sqlite'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { db } from '../../../inbox/store/index'
import { inBatches, BACKFILL_BATCH } from '../../../storage/schema/helpers/backfill'

export function queueName(path: string): string {
  return resolve(path).split('\\').join('/').replace(/\.json$/i, '')
}

export function queueLabel(name: string): string {
  return basename(name)
}

function inWrite<T>(handle: Database, work: () => T): T {
  if (handle.inTransaction) return work()
  handle.exec('BEGIN IMMEDIATE')
  try {
    const result = work()
    handle.exec('COMMIT')
    return result
  } catch (error) {
    handle.exec('ROLLBACK')
    throw error
  }
}

const stamp = (at: Date) => at.toISOString().replace('T', ' ').slice(0, 19)

export function importQueueFile(path: string, handle: Database = db(), now: Date = new Date()): boolean {
  const name = queueName(path)
  const store = `queueFile:${name}`
  if (handle.prepare("SELECT 1 FROM imports WHERE store = ? AND state = 'done'").get(store)) return false
  if (!existsSync(path)) return false
  let body: string
  try {
    body = readFileSync(path, 'utf8')
    const parsed = JSON.parse(body) as { account?: unknown; items?: unknown }
    if (typeof parsed.account !== 'string' || !Array.isArray(parsed.items)) return false
  } catch {
    return false
  }
  const stem = path.replace(/\.json$/i, '')
  const logLines = existsSync(`${stem}.log`) ? readFileSync(`${stem}.log`, 'utf8').split(/\r?\n/).filter((l) => l.trim()) : []
  const incoming = existsSync(`${stem}.incoming.jsonl`) ? readFileSync(`${stem}.incoming.jsonl`, 'utf8').split(/\r?\n/).filter((l) => l.trim()) : []
  inWrite(handle, () => {
    if (!handle.prepare('SELECT 1 FROM queues WHERE name = ?').get(name)) handle.prepare('INSERT INTO queues (name, account, body, version, path, updatedAt) VALUES (?, ?, ?, 1, ?, ?)').run(name, (JSON.parse(body) as { account: string }).account, body, path, now.toISOString())
  })
  inBatches(handle, logLines, BACKFILL_BATCH, (batch) => {
    const insert = handle.prepare('INSERT INTO queueLog (name, at, line, source) VALUES (?, ?, ?, ?)')
    for (const line of batch) insert.run(name, line.slice(0, 19), line.slice(20), 'import')
  })
  inWrite(handle, () => {
    const insert = handle.prepare('INSERT INTO queueIncoming (name, addition, addedAt) VALUES (?, ?, ?)')
    for (const line of incoming) insert.run(name, line, now.toISOString())
    handle.prepare("INSERT INTO imports (store, state, files, rows, detail, startedAt, endedAt) VALUES (?, 'done', 1, ?, ?, ?, ?) ON CONFLICT(store) DO UPDATE SET state = 'done', rows = excluded.rows, detail = excluded.detail, endedAt = excluded.endedAt").run(store, logLines.length, path, now.toISOString(), now.toISOString())
  })
  return true
}

export function importQueueFiles(root: string, handle: Database = db()): number {
  if (!existsSync(root)) return 0
  let imported = 0
  for (const file of readdirSync(root).filter((f) => f.endsWith('.json') && !f.startsWith('.'))) if (importQueueFile(join(root, file), handle)) imported++
  return imported
}

export function readQueueBody(path: string, handle: Database = db()): string | null {
  importQueueFile(path, handle)
  const row = handle.prepare('SELECT body FROM queues WHERE name = ?').get(queueName(path)) as { body: string } | null
  return row?.body ?? null
}

export function writeQueueBody(path: string, account: string, body: string, handle: Database = db(), now: Date = new Date()): number {
  const name = queueName(path)
  return inWrite(handle, () => {
    handle.prepare('INSERT INTO queues (name, account, body, version, path, updatedAt) VALUES (?, ?, ?, 1, ?, ?) ON CONFLICT(name) DO UPDATE SET account = excluded.account, body = excluded.body, version = queues.version + 1, path = excluded.path, updatedAt = excluded.updatedAt').run(name, account, body, path, now.toISOString())
    return (handle.prepare('SELECT version FROM queues WHERE name = ?').get(name) as { version: number }).version
  })
}

export function queueExists(path: string, handle: Database = db()): boolean {
  importQueueFile(path, handle)
  return !!handle.prepare('SELECT 1 FROM queues WHERE name = ?').get(queueName(path))
}

export function appendQueueLog(path: string, line: string, now: Date = new Date(), handle: Database = db()): string {
  const at = stamp(now)
  inWrite(handle, () => handle.prepare("INSERT INTO queueLog (name, at, line, source) VALUES (?, ?, ?, 'live')").run(queueName(path), at, line))
  return `${at} ${line}`
}

export function queueLogLines(path: string, handle: Database = db()): string[] {
  importQueueFile(path, handle)
  return (handle.prepare('SELECT at, line FROM queueLog WHERE name = ? ORDER BY seq').all(queueName(path)) as { at: string; line: string }[]).map((r) => `${r.at} ${r.line}`)
}

export function queueLogAfter(seq: number, handle: Database = db()): { seq: number; name: string; at: string; line: string }[] {
  return handle.prepare('SELECT seq, name, at, line FROM queueLog WHERE seq > ? ORDER BY seq').all(seq) as { seq: number; name: string; at: string; line: string }[]
}

export function latestQueueLogSeq(handle: Database = db()): number {
  return (handle.prepare('SELECT COALESCE(MAX(seq), 0) AS seq FROM queueLog').get() as { seq: number }).seq
}

export function queueLockHolder(path: string, alive: (pid: number) => boolean, handle: Database = db()): number {
  const name = queueName(path)
  return inWrite(handle, () => {
    const row = handle.prepare('SELECT pid FROM queueLocks WHERE name = ?').get(name) as { pid: number } | null
    if (!row) return 0
    if (alive(row.pid)) return row.pid
    handle.prepare('DELETE FROM queueLocks WHERE name = ? AND pid = ?').run(name, row.pid)
    return 0
  })
}

export function takeQueueLock(path: string, pid: number, alive: (pid: number) => boolean, handle: Database = db(), now: Date = new Date()): { ok: true } | { ok: false; holder: number } {
  const name = queueName(path)
  return inWrite(handle, () => {
    const row = handle.prepare('SELECT pid FROM queueLocks WHERE name = ?').get(name) as { pid: number } | null
    if (row && row.pid !== pid && alive(row.pid)) return { ok: false as const, holder: row.pid }
    handle.prepare('INSERT INTO queueLocks (name, pid, takenAt) VALUES (?, ?, ?) ON CONFLICT(name) DO UPDATE SET pid = excluded.pid, takenAt = excluded.takenAt').run(name, pid, now.toISOString())
    return { ok: true as const }
  })
}

export function releaseQueueLock(path: string, pid: number, handle: Database = db()): void {
  inWrite(handle, () => handle.prepare('DELETE FROM queueLocks WHERE name = ? AND pid = ?').run(queueName(path), pid))
}

export function clearDeadQueueLockRows(alive: (pid: number) => boolean, handle: Database = db()): string[] {
  return inWrite(handle, () => {
    const rows = handle.prepare('SELECT name, pid FROM queueLocks').all() as { name: string; pid: number }[]
    const cleared = rows.filter((r) => !alive(r.pid))
    for (const r of cleared) handle.prepare('DELETE FROM queueLocks WHERE name = ? AND pid = ?').run(r.name, r.pid)
    return cleared.map((r) => r.name)
  })
}

export function addQueueNudge(path: string, replies: number, handle: Database = db()): number {
  const name = queueName(path)
  return inWrite(handle, () => {
    handle.prepare('INSERT INTO queueNudges (name, replies) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET replies = queueNudges.replies + excluded.replies').run(name, replies)
    return (handle.prepare('SELECT replies FROM queueNudges WHERE name = ?').get(name) as { replies: number }).replies
  })
}

export function takeQueueNudge(path: string, handle: Database = db()): number {
  const name = queueName(path)
  return inWrite(handle, () => {
    const row = handle.prepare('SELECT replies FROM queueNudges WHERE name = ?').get(name) as { replies: number } | null
    handle.prepare('DELETE FROM queueNudges WHERE name = ?').run(name)
    return row && row.replies > 0 ? Math.floor(row.replies) : 0
  })
}

export function addQueueIncoming(path: string, addition: unknown, handle: Database = db(), now: Date = new Date()): void {
  inWrite(handle, () => handle.prepare('INSERT INTO queueIncoming (name, addition, addedAt) VALUES (?, ?, ?)').run(queueName(path), JSON.stringify(addition), now.toISOString()))
}

export function takeQueueIncoming(path: string, handle: Database = db(), now: Date = new Date()): unknown[] {
  const name = queueName(path)
  return inWrite(handle, () => {
    const rows = handle.prepare('SELECT seq, addition FROM queueIncoming WHERE name = ? AND takenAt IS NULL ORDER BY seq').all(name) as { seq: number; addition: string }[]
    const mark = handle.prepare('UPDATE queueIncoming SET takenAt = ? WHERE seq = ?')
    for (const r of rows) mark.run(now.toISOString(), r.seq)
    return rows.map((r) => JSON.parse(r.addition) as unknown)
  })
}
