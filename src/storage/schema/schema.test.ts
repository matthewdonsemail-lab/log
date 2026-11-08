import { Database } from 'bun:sqlite'
import { describe, expect, test } from 'bun:test'
import { MIGRATIONS, SCHEMA_VERSION, SchemaTooNewError, migrate, schemaVersionOf } from './index'

function tablesOf(handle: Database): string[] {
  return (handle.prepare("SELECT name FROM sqlite_master WHERE type IN ('table', 'index') ORDER BY name").all() as { name: string }[]).map((r) => r.name)
}

describe('versioned schema', () => {
  test('a new database gets every migration once and ends at the latest version', () => {
    const handle = new Database(':memory:')
    const applied = migrate(handle)
    expect(applied.map((m) => m.version)).toEqual(MIGRATIONS.map((m) => m.version))
    expect(schemaVersionOf(handle)).toBe(SCHEMA_VERSION)
    for (const table of ['events', 'identities', 'chats', 'messages', 'attachments', 'interactions', 'memberships', 'blobs', 'ledger', 'transcripts', 'eventsByConversation']) expect(tablesOf(handle)).toContain(table)
  })

  test('opening again applies nothing', () => {
    const handle = new Database(':memory:')
    migrate(handle)
    expect(migrate(handle)).toEqual([])
  })

  test('a version 0 database made by the old code keeps its rows and gains the source column only if missing', () => {
    const handle = new Database(':memory:')
    handle.exec(`CREATE TABLE events (seq INTEGER PRIMARY KEY AUTOINCREMENT, eventId TEXT NOT NULL UNIQUE, platform TEXT NOT NULL, account TEXT NOT NULL, conversationId TEXT NOT NULL DEFAULT '', type TEXT NOT NULL, known INTEGER NOT NULL DEFAULT 1, withWho TEXT NOT NULL DEFAULT '', text TEXT NOT NULL DEFAULT '', box TEXT NOT NULL DEFAULT '', payload TEXT NOT NULL DEFAULT '{}', sourceAt TEXT NOT NULL DEFAULT '', receivedAt TEXT NOT NULL, appendedAt TEXT NOT NULL, ownerPid INTEGER NOT NULL DEFAULT 0, source TEXT NOT NULL DEFAULT 'live')`)
    handle.prepare("INSERT INTO events (eventId, platform, account, type, receivedAt, appendedAt) VALUES ('e1', 'discord', 'a', 'message', 'now', 'now')").run()
    migrate(handle)
    expect((handle.prepare('SELECT COUNT(*) AS n FROM events').get() as { n: number }).n).toBe(1)
    expect(schemaVersionOf(handle)).toBe(SCHEMA_VERSION)
  })

  test('a database newer than the code is refused and left as it is', () => {
    const handle = new Database(':memory:')
    handle.exec(`PRAGMA user_version = ${SCHEMA_VERSION + 1}`)
    expect(() => migrate(handle)).toThrow(SchemaTooNewError)
    expect(tablesOf(handle)).toEqual([])
  })

  test('a chat read by conversation alone uses an index, not a scan', () => {
    const handle = new Database(':memory:')
    migrate(handle)
    const plan = (handle.prepare("EXPLAIN QUERY PLAN SELECT * FROM events WHERE conversationId = 'c' ORDER BY seq DESC LIMIT 100").all() as { detail: string }[]).map((r) => r.detail).join(' ')
    expect(plan).not.toMatch(/SCAN events(?! USING)/)
    const messages = (handle.prepare("EXPLAIN QUERY PLAN SELECT * FROM messages WHERE chatId = 'c' ORDER BY sentAt DESC LIMIT 100").all() as { detail: string }[]).map((r) => r.detail).join(' ')
    expect(messages).toContain('messagesByChat')
  })
})
