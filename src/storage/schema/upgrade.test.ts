import { Database } from 'bun:sqlite'
import { afterEach, describe, expect, test } from 'bun:test'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { INBOX_TABLES, MIGRATIONS, PLATFORM_TABLES, SCHEMA_VERSION, migrate, missingObjectsOf, schemaVersionOf } from './index'
import { recordTyping, typingNow } from '../../inbox/typing/index'
import { FRESH_DB_MS } from '../../../scripts/tests/timeouts.ts'

const SHIPPED_LISTS: readonly { version: number; list: readonly string[]; objects: readonly string[] }[] = [
  { version: 1, list: INBOX_TABLES, objects: ['events', 'eventsByChat', 'cursors', 'owners', 'claims', 'chatGenerations', 'actions', 'actionsByChat', 'alerts', 'timings', 'eventTypes', 'searchIndex', 'positions', 'gaps', 'gapsOpen', 'embeddings', 'aiIndexes', 'media', 'mediaByStatus', 'people', 'spans', 'spansByTool', 'spansByCall'] },
  { version: 2, list: PLATFORM_TABLES, objects: ['eventsByConversation', 'blobs', 'blobChunks', 'identities', 'identitiesByPerson', 'identitiesByHandle', 'chats', 'messages', 'messagesByChat', 'messagesBySender', 'messagesBySentAt', 'attachments', 'interactions', 'interactionsByActor', 'interactionsByAccount', 'memberships', 'membershipsByUser', 'ledger', 'ledgerByKind', 'ledgerByAccount', 'transcripts', 'imports'] },
]

function objectsOf(handle: Database): string[] {
  return (handle.prepare("SELECT type || ' ' || name AS name FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY name").all() as { name: string }[]).map((r) => r.name)
}

function columnsOf(handle: Database): Record<string, string[]> {
  const tables = (handle.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all() as { name: string }[]).map((r) => r.name)
  return Object.fromEntries(tables.map((table) => [table, (handle.prepare(`PRAGMA table_xinfo(${table})`).all() as { name: string }[]).map((c) => c.name).sort()]))
}

function databaseAt(version: number, handle: Database = new Database(':memory:')): Database {
  for (const migration of MIGRATIONS) {
    if (migration.version > version) break
    migration.apply(handle)
  }
  handle.exec(`PRAGMA user_version = ${version}`)
  return handle
}

const savedDb = process.env.LOG_DB

afterEach(() => {
  if (savedDb === undefined) delete process.env.LOG_DB
  else process.env.LOG_DB = savedDb
})

describe('a database made before a table was added catches up', () => {
  test('a database at 21 without the typing table gets it from migration 22, and the typing check before a Discord send works', () => {
    const path = join(mkdtempSync(join(tmpdir(), 'typingUpgrade')), 'log.db')
    const old = databaseAt(21, new Database(path, { create: true }))
    old.exec('DROP TABLE IF EXISTS typing')
    expect(() => old.prepare('SELECT userId FROM typing').all()).toThrow('no such table: typing')
    const now = new Date('2026-11-20T00:00:00Z')
    expect(migrate(old, now)).toEqual([{ version: 22, name: 'typing', appliedAt: now.toISOString() }, { version: 23, name: 'engineStores', appliedAt: now.toISOString() }, { version: 24, name: 'pipeline', appliedAt: now.toISOString() }, { version: 25, name: 'conventionCorpus', appliedAt: now.toISOString() }, { version: 26, name: 'secrets', appliedAt: now.toISOString() }, { version: 27, name: 'network', appliedAt: now.toISOString() }, { version: 28, name: 'chatPlaces', appliedAt: now.toISOString() }, { version: 29, name: 'networkRings', appliedAt: now.toISOString() }, { version: 30, name: 'networkFit', appliedAt: now.toISOString() }, { version: 31, name: 'chatGroups', appliedAt: now.toISOString() }, { version: 32, name: 'personFacts', appliedAt: now.toISOString() }])
    expect(schemaVersionOf(old)).toBe(SCHEMA_VERSION)
    expect(missingObjectsOf(old, ['typing'])).toEqual([])
    old.close()
    process.env.LOG_DB = path
    const chat = { platform: 'discord', account: 'upgradeAccount', conversationId: 'c1' }
    recordTyping(chat, 'ada', now)
    expect(typingNow(chat, new Date(now.getTime() + 1_000))).toEqual(['ada'])
  }, FRESH_DB_MS)

  test('a database at 27 whose network people carry the old score column keeps them, renamed to fit, and gains the ring tables', () => {
    const old = databaseAt(26)
    old.exec('CREATE TABLE networkPeople (handleLower TEXT PRIMARY KEY, handle TEXT NOT NULL, ring INTEGER, band TEXT, score REAL, followsOwner INTEGER NOT NULL DEFAULT 0) WITHOUT ROWID')
    old.prepare("INSERT INTO networkPeople (handleLower, handle, score) VALUES ('ada_codes', 'ada_codes', 0.9)").run()
    for (const migration of MIGRATIONS.filter((m) => m.version === 27)) migration.apply(old)
    old.exec('PRAGMA user_version = 27')
    const now = new Date('2026-11-21T00:00:00Z')
    expect(migrate(old, now)).toEqual([{ version: 28, name: 'chatPlaces', appliedAt: now.toISOString() }, { version: 29, name: 'networkRings', appliedAt: now.toISOString() }, { version: 30, name: 'networkFit', appliedAt: now.toISOString() }, { version: 31, name: 'chatGroups', appliedAt: now.toISOString() }, { version: 32, name: 'personFacts', appliedAt: now.toISOString() }])
    expect(old.prepare("SELECT fit FROM networkPeople WHERE handleLower = 'ada_codes'").get()).toEqual({ fit: 0.9 })
    expect(missingObjectsOf(old, ['networkRings', 'networkTalks', 'networkRingState'])).toEqual([])
  })

  test('a database already at the latest version that lost the typing table has it repaired', () => {
    const handle = databaseAt(SCHEMA_VERSION)
    handle.exec('DROP TABLE typing')
    const now = new Date('2026-11-20T00:00:00Z')
    expect(migrate(handle, now)).toEqual([{ version: 22, name: 'typing', appliedAt: now.toISOString(), repaired: ['typing'] }])
    expect(missingObjectsOf(handle, ['typing'])).toEqual([])
  })

  test('a database left at any earlier version ends with the same tables, indexes and columns as a fresh one', () => {
    const fresh = new Database(':memory:')
    migrate(fresh)
    const want = { objects: objectsOf(fresh), columns: columnsOf(fresh) }
    for (let version = 0; version < SCHEMA_VERSION; version++) {
      const old = databaseAt(version)
      migrate(old)
      expect({ version, objects: objectsOf(old), columns: columnsOf(old) }).toEqual({ version, ...want })
    }
  }, FRESH_DB_MS)

  test('a list an early migration runs keeps exactly the objects it shipped with, so a new one comes in a new migration', () => {
    const safe = /^\s*CREATE\s+(?:UNIQUE\s+)?(?:VIRTUAL\s+)?(?:TABLE|INDEX)\s+IF\s+NOT\s+EXISTS\s+(\w+)/i
    for (const shipped of SHIPPED_LISTS) expect({ version: shipped.version, objects: shipped.list.map((s) => safe.exec(s)?.[1]) }).toEqual({ version: shipped.version, objects: [...shipped.objects] })
  })
})
