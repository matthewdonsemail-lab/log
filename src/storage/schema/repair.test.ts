import { Database } from 'bun:sqlite'
import { describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { MIGRATIONS, SCHEMA_VERSION, SchemaTooNewError, migrate, missingObjectsOf, schemaVersionOf } from './index'
import type { Migration } from './types'

const SAFE_STATEMENT = /^\s*CREATE\s+(UNIQUE\s+)?(TABLE|INDEX|VIRTUAL\s+TABLE)\s+IF\s+NOT\s+EXISTS\s+(\w+)/i

function recordStatements(handle: Database): string[] {
  const seen: string[] = []
  const exec = handle.exec.bind(handle)
  const prepare = handle.prepare.bind(handle)
  handle.exec = ((sql: string, ...rest: unknown[]) => {
    seen.push(sql)
    return (exec as (...args: unknown[]) => unknown)(sql, ...rest)
  }) as typeof handle.exec
  handle.prepare = ((sql: string, ...rest: unknown[]) => {
    seen.push(sql)
    return (prepare as (...args: unknown[]) => ReturnType<typeof prepare>)(sql, ...rest)
  }) as typeof handle.prepare
  return seen
}

function statementsOf(migration: Migration): string[] {
  const handle = new Database(':memory:')
  migrate(handle)
  const seen = recordStatements(handle)
  migration.apply(handle)
  handle.close()
  return seen
}

function objectsOf(handle: Database): string[] {
  return (handle.prepare("SELECT name FROM sqlite_master WHERE type IN ('table', 'index') ORDER BY name").all() as { name: string }[]).map((r) => r.name)
}

function rowCount(handle: Database, table: string): number {
  return (handle.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get() as { n: number }).n
}

describe('the migration list', () => {
  test('every version is unique and rises by one from 1', () => {
    expect(MIGRATIONS.map((m) => m.version)).toEqual(MIGRATIONS.map((_, i) => i + 1))
    expect(new Set(MIGRATIONS.map((m) => m.name)).size).toBe(MIGRATIONS.length)
    expect(SCHEMA_VERSION).toBe(MIGRATIONS.length)
  })

  test('a migration safe to re-run only creates, with IF NOT EXISTS, exactly the objects it declares', () => {
    const marked = MIGRATIONS.filter((m) => m.creates)
    expect(marked.map((m) => m.name)).toContain('identityProfiles')
    for (const migration of marked) {
      const statements = statementsOf(migration)
      for (const statement of statements) expect({ migration: migration.name, statement, safe: SAFE_STATEMENT.test(statement) }).toEqual({ migration: migration.name, statement, safe: true })
      expect(statements.map((s) => SAFE_STATEMENT.exec(s)?.[3]).sort()).toEqual([...(migration.creates ?? [])].sort())
    }
  })

  test('no later migration alters or drops an object a re-runnable migration creates', () => {
    const handle = new Database(':memory:')
    const seen: { version: number; sql: string }[] = []
    for (const migration of MIGRATIONS) {
      const statements = recordStatements(handle)
      migration.apply(handle)
      handle.exec(`PRAGMA user_version = ${migration.version}`)
      for (const sql of statements) seen.push({ version: migration.version, sql })
      handle.exec = Database.prototype.exec.bind(handle)
      handle.prepare = Database.prototype.prepare.bind(handle)
    }
    for (const migration of MIGRATIONS.filter((m) => m.creates)) {
      for (const name of migration.creates ?? []) {
        const touching = seen.filter((s) => s.version > migration.version && new RegExp(`^\\s*(ALTER\\s+TABLE|DROP\\s+(TABLE|INDEX)(\\s+IF\\s+EXISTS)?)\\s+${name}\\b`, 'i').test(s.sql))
        expect({ name, touching }).toEqual({ name, touching: [] })
      }
    }
  })
})

describe('a create-only migration skipped by another branch is repaired', () => {
  test('a database at 19 with conversationCards and no identityProfiles gets identityProfiles back and keeps everything else', () => {
    const path = join(mkdtempSync(join(tmpdir(), 'migrationRepair')), 'log.db')
    const handle = new Database(path, { create: true })
    migrate(handle)
    handle.exec('DROP TABLE identityProfiles')
    handle.exec('CREATE TABLE conversationCards (chatKey TEXT PRIMARY KEY, body TEXT NOT NULL)')
    handle.exec('PRAGMA user_version = 19')
    handle.prepare("INSERT INTO conversationCards (chatKey, body) VALUES ('c1', 'card')").run()
    handle.prepare("INSERT INTO state (scope, key, body, updatedAt) VALUES ('s', 'k', 'v', 1)").run()
    const before = objectsOf(handle)
    expect(missingObjectsOf(handle, ['identityProfiles', 'identityProfilesByFetchedAt'])).toEqual(['identityProfiles', 'identityProfilesByFetchedAt'])
    const now = new Date('2026-11-14T00:00:00Z')
    expect(migrate(handle, now)).toEqual([{ version: 19, name: 'identityProfiles', appliedAt: now.toISOString(), repaired: ['identityProfiles', 'identityProfilesByFetchedAt'] }])
    expect(schemaVersionOf(handle)).toBe(19)
    expect(objectsOf(handle)).toEqual([...before, 'identityProfiles', 'identityProfilesByFetchedAt'].sort())
    expect(handle.prepare('SELECT chatKey, body FROM conversationCards').all()).toEqual([{ chatKey: 'c1', body: 'card' }])
    expect(rowCount(handle, 'state')).toBe(1)
    handle.prepare("INSERT INTO identityProfiles (platform, userId, fetchedAt) VALUES ('discord', 'u1', 'now')").run()
    expect(migrate(handle)).toEqual([])
  })

  test('a fresh database migrates to the latest version with no repairs', () => {
    const handle = new Database(':memory:')
    const applied = migrate(handle)
    expect(applied.map((m) => m.version)).toEqual(MIGRATIONS.map((m) => m.version))
    expect(applied.filter((m) => m.repaired)).toEqual([])
    expect(schemaVersionOf(handle)).toBe(SCHEMA_VERSION)
  })

  test('a database newer than the code is still refused, or opened untouched when it is readable', () => {
    const refused = new Database(':memory:')
    migrate(refused)
    refused.exec('DROP TABLE identityProfiles')
    refused.exec(`PRAGMA user_version = ${SCHEMA_VERSION + 1}`)
    refused.prepare("UPDATE meta SET value = ? WHERE key = 'minReaderVersion'").run(String(SCHEMA_VERSION + 1))
    expect(() => migrate(refused)).toThrow(SchemaTooNewError)
    expect(missingObjectsOf(refused, ['identityProfiles'])).toEqual(['identityProfiles'])
    const readable = new Database(':memory:')
    migrate(readable)
    readable.exec('DROP TABLE identityProfiles')
    readable.exec(`PRAGMA user_version = ${SCHEMA_VERSION + 1}`)
    expect(migrate(readable)).toEqual([])
    expect(missingObjectsOf(readable, ['identityProfiles'])).toEqual(['identityProfiles'])
    expect(schemaVersionOf(readable)).toBe(SCHEMA_VERSION + 1)
  })

  test('a migration not marked safe to re-run is never run again, even when its objects are missing', () => {
    const handle = new Database(':memory:')
    migrate(handle)
    for (const name of ['transcriptLinks', 'meta']) handle.exec(`DROP TABLE ${name}`)
    for (const migration of MIGRATIONS.filter((m) => m.name === 'transcriptBodies' || m.name === 'readerVersion')) expect(migration.creates).toBeUndefined()
    const seen = recordStatements(handle)
    expect(migrate(handle)).toEqual([])
    expect(missingObjectsOf(handle, ['transcriptLinks', 'meta'])).toEqual(['transcriptLinks', 'meta'])
    expect(seen.filter((s) => /ALTER|CREATE|INSERT/i.test(s))).toEqual([])
    expect(schemaVersionOf(handle)).toBe(SCHEMA_VERSION)
  })
})
