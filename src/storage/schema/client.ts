import { Database } from 'bun:sqlite'
import { mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { MIGRATIONS, SCHEMA_VERSION } from './helpers'
import { SchemaTooNewError } from './types'
import type { AppliedMigration } from './types'

export function schemaVersionOf(handle: Database): number {
  return (handle.prepare('PRAGMA user_version').get() as { user_version: number }).user_version
}

export function migrate(handle: Database, now: Date = new Date()): AppliedMigration[] {
  const found = schemaVersionOf(handle)
  if (found > SCHEMA_VERSION) throw new SchemaTooNewError(found, SCHEMA_VERSION)
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
  return applied
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
  handles.set(path, handle)
  return handle
}
