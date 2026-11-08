import type { Database } from 'bun:sqlite'
import { existsSync, readFileSync } from 'node:fs'
import { defaultDbPath, openDatabase } from '../schema/client'
import type { RecordKind } from './types'

function handleOf(path: string = defaultDbPath()): Database {
  return openDatabase(path)
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

const importedFiles = new Set<string>()

export function importRecordFile(kind: RecordKind, file: string, keyOf: (body: Record<string, unknown>) => string | null = () => null, handle: Database = handleOf()): number {
  const store = `records:${kind}:${file}`
  if (importedFiles.has(store)) return 0
  importedFiles.add(store)
  if (handle.prepare("SELECT 1 FROM imports WHERE store = ? AND state = 'done'").get(store) || !existsSync(file)) return 0
  const lines = readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim())
  let count = 0
  inWrite(handle, () => {
    const insert = handle.prepare('INSERT INTO records (kind, key, at, body, source) VALUES (?, ?, ?, ?, ?)')
    for (const line of lines) {
      try {
        const body = JSON.parse(line) as Record<string, unknown>
        insert.run(kind, keyOf(body), typeof body.at === 'string' ? body.at : new Date().toISOString(), JSON.stringify(body), 'import')
        count++
      } catch {}
    }
    handle.prepare("INSERT INTO imports (store, state, files, rows, detail, startedAt, endedAt) VALUES (?, 'done', 1, ?, ?, ?, ?) ON CONFLICT(store) DO UPDATE SET state = 'done', rows = excluded.rows, endedAt = excluded.endedAt").run(store, count, file, new Date().toISOString(), new Date().toISOString())
  })
  return count
}

export function appendRecord(kind: RecordKind, body: Record<string, unknown>, key: string | null = null, handle: Database = handleOf()): number {
  const at = typeof body.at === 'string' ? body.at : new Date().toISOString()
  return inWrite(handle, () => Number(handle.prepare("INSERT INTO records (kind, key, at, body, source) VALUES (?, ?, ?, ?, 'live')").run(kind, key, at, JSON.stringify(body)).lastInsertRowid))
}

export function readRecords<T>(kind: RecordKind, options: { key?: string; last?: number } = {}, handle: Database = handleOf()): T[] {
  const where = ['kind = ?', ...(options.key !== undefined ? ['key = ?'] : [])]
  const args: (string | number)[] = [kind, ...(options.key !== undefined ? [options.key] : [])]
  const rows = (options.last !== undefined
    ? handle.prepare(`SELECT body FROM (SELECT seq, body FROM records WHERE ${where.join(' AND ')} ORDER BY seq DESC LIMIT ?) ORDER BY seq`).all(...args, options.last)
    : handle.prepare(`SELECT body FROM records WHERE ${where.join(' AND ')} ORDER BY seq`).all(...args)) as { body: string }[]
  return rows.map((r) => JSON.parse(r.body) as T)
}

export function countRecords(kind: RecordKind, key?: string, handle: Database = handleOf()): number {
  const row = (key !== undefined ? handle.prepare('SELECT COUNT(*) AS n FROM records WHERE kind = ? AND key = ?').get(kind, key) : handle.prepare('SELECT COUNT(*) AS n FROM records WHERE kind = ?').get(kind)) as { n: number }
  return row.n
}
