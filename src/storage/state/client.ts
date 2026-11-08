import type { Database } from 'bun:sqlite'
import { existsSync, readFileSync } from 'node:fs'
import { defaultDbPath, openDatabase } from '../schema/client'
import type { StateRow, StateScope } from './types'

function handleOf(): Database {
  return openDatabase(defaultDbPath())
}

const importedFiles = new Set<string>()

function importFileOnce(handle: Database, scope: StateScope, key: string, file: string | undefined, parse: (raw: string) => unknown): void {
  if (!file) return
  const store = `state:${scope}:${key}`
  if (importedFiles.has(store)) return
  importedFiles.add(store)
  if (handle.prepare("SELECT 1 FROM imports WHERE store = ? AND state = 'done'").get(store)) return
  const now = new Date().toISOString()
  handle.exec('BEGIN IMMEDIATE')
  try {
    let rows = 0
    if (existsSync(file) && !handle.prepare('SELECT 1 FROM state WHERE scope = ? AND key = ?').get(scope, key)) {
      try {
        const body = parse(readFileSync(file, 'utf8'))
        if (body !== undefined) {
          handle.prepare('INSERT INTO state (scope, key, body, updatedAt) VALUES (?, ?, ?, ?)').run(scope, key, JSON.stringify(body), Date.now())
          rows = 1
        }
      } catch {}
    }
    handle.prepare("INSERT INTO imports (store, state, files, rows, detail, startedAt, endedAt) VALUES (?, 'done', 1, ?, ?, ?, ?) ON CONFLICT(store) DO UPDATE SET state = 'done', rows = excluded.rows, endedAt = excluded.endedAt").run(store, rows, file, now, now)
    handle.exec('COMMIT')
  } catch (error) {
    handle.exec('ROLLBACK')
    throw error
  }
}

export interface StateOptions {
  legacyFile?: string
  parse?: (raw: string) => unknown
}

export function getState<T>(scope: StateScope, key: string, options: StateOptions = {}, handle: Database = handleOf()): StateRow<T> | null {
  importFileOnce(handle, scope, key, options.legacyFile, options.parse ?? ((raw) => JSON.parse(raw)))
  const row = handle.prepare('SELECT body, updatedAt FROM state WHERE scope = ? AND key = ?').get(scope, key) as { body: string; updatedAt: number } | null
  if (!row) return null
  try {
    return { body: JSON.parse(row.body) as T, updatedAt: row.updatedAt }
  } catch {
    return null
  }
}

export function putState(scope: StateScope, key: string, body: unknown, now: number = Date.now(), handle: Database = handleOf()): void {
  handle.prepare('INSERT INTO state (scope, key, body, updatedAt) VALUES (?, ?, ?, ?) ON CONFLICT(scope, key) DO UPDATE SET body = excluded.body, updatedAt = excluded.updatedAt').run(scope, key, JSON.stringify(body), now)
}

export function deleteState(scope: StateScope, key: string, handle: Database = handleOf()): void {
  handle.prepare('DELETE FROM state WHERE scope = ? AND key = ?').run(scope, key)
}

export function claimState(scope: StateScope, key: string, body: unknown, graceMs: number, now: number = Date.now(), handle: Database = handleOf()): boolean {
  handle.exec('BEGIN IMMEDIATE')
  try {
    const held = handle.prepare('SELECT updatedAt FROM state WHERE scope = ? AND key = ?').get(scope, key) as { updatedAt: number } | null
    if (held && now - held.updatedAt < graceMs) {
      handle.exec('COMMIT')
      return false
    }
    putState(scope, key, body, now, handle)
    handle.exec('COMMIT')
    return true
  } catch (error) {
    handle.exec('ROLLBACK')
    throw error
  }
}

export function pruneState(scope: StateScope, keyPrefix: string, olderThan: number, handle: Database = handleOf()): number {
  return handle.prepare("DELETE FROM state WHERE scope = ? AND substr(key, 1, ?) = ? AND updatedAt < ?").run(scope, keyPrefix.length, keyPrefix, olderThan).changes
}
