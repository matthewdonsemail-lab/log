import { Database } from 'bun:sqlite'
import type { Statement } from 'bun:sqlite'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { MIGRATIONS, runBackfill, SCHEMA_VERSION } from './helpers'
import { SchemaTooNewError } from './types'
import type { AppliedMigration } from './types'

export function schemaVersionOf(handle: Database): number {
  return (handle.prepare('PRAGMA user_version').get() as { user_version: number }).user_version
}

export function minReaderVersionOf(handle: Database): number {
  const table = handle.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'meta'").get()
  if (!table) return schemaVersionOf(handle)
  const row = handle.prepare("SELECT value FROM meta WHERE key = 'minReaderVersion'").get() as { value: string } | null
  return row ? Number(row.value) : 1
}

export function migrate(handle: Database, now: Date = new Date()): AppliedMigration[] {
  const found = schemaVersionOf(handle)
  if (found > SCHEMA_VERSION) {
    const needs = minReaderVersionOf(handle)
    if (needs > SCHEMA_VERSION) throw new SchemaTooNewError(found, SCHEMA_VERSION, needs)
    return []
  }
  const applied: AppliedMigration[] = []
  for (const migration of MIGRATIONS) {
    if (migration.version <= found) continue
    handle.exec('BEGIN IMMEDIATE')
    try {
      if (schemaVersionOf(handle) >= migration.version) {
        handle.exec('COMMIT')
        continue
      }
      migration.apply(handle)
      handle.exec(`PRAGMA user_version = ${migration.version}`)
      handle.exec('COMMIT')
      applied.push({ version: migration.version, name: migration.name, appliedAt: now.toISOString() })
    } catch (error) {
      handle.exec('ROLLBACK')
      throw error
    }
  }
  return [...applied, ...repairSkipped(handle, now)]
}

export function missingObjectsOf(handle: Database, names: readonly string[]): string[] {
  const present = new Set((handle.prepare("SELECT name FROM sqlite_master WHERE type IN ('table', 'index')").all() as { name: string }[]).map((r) => r.name))
  return names.filter((name) => !present.has(name))
}

export function repairSkipped(handle: Database, now: Date = new Date()): AppliedMigration[] {
  const version = schemaVersionOf(handle)
  const repaired: AppliedMigration[] = []
  for (const migration of MIGRATIONS) {
    if (!migration.creates || migration.version > version) continue
    if (missingObjectsOf(handle, migration.creates).length === 0) continue
    handle.exec('BEGIN IMMEDIATE')
    try {
      const missing = missingObjectsOf(handle, migration.creates)
      if (missing.length > 0) migration.apply(handle)
      handle.exec('COMMIT')
      if (missing.length > 0) repaired.push({ version: migration.version, name: migration.name, appliedAt: now.toISOString(), repaired: missing })
    } catch (error) {
      handle.exec('ROLLBACK')
      throw error
    }
  }
  return repaired
}

export function defaultDbPath(env: Record<string, string | undefined> = process.env): string {
  if (env.LOG_DB) return env.LOG_DB
  if (env.LOG_INBOX_STATE) return join(env.LOG_INBOX_STATE, 'log.db')
  return join(homedir(), '.logCli', 'log.db')
}

const handles = new Map<string, Database>()

export function openDatabase(path: string = defaultDbPath()): Database {
  const held = handles.get(path)
  if (held) return held
  mkdirSync(dirname(path), { recursive: true })
  const handle = new Database(path, { create: true })
  handle.exec('PRAGMA journal_mode = WAL')
  handle.exec('PRAGMA busy_timeout = 5000')
  handle.exec('PRAGMA synchronous = NORMAL')
  migrate(handle)
  runBackfill(handle)
  handles.set(path, handle)
  return handle
}

export function useDatabase<T>(path: string, work: (handle: Database) => T): T {
  if (handles.has(path) || path === defaultDbPath()) return work(openDatabase(path))
  mkdirSync(dirname(path), { recursive: true })
  const handle = new Database(path, { create: true })
  const statements: Statement[] = []
  const prepare = handle.prepare.bind(handle)
  handle.prepare = ((...args: Parameters<typeof prepare>) => {
    const statement = prepare(...args)
    statements.push(statement)
    return statement
  }) as typeof handle.prepare
  try {
    handle.exec('PRAGMA busy_timeout = 5000')
    migrate(handle)
    runBackfill(handle)
    return work(handle)
  } finally {
    for (const statement of statements) statement.finalize()
    handle.close()
  }
}
