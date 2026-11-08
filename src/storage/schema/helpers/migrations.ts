import type { Database } from 'bun:sqlite'
import type { Migration } from '../types'
import { INBOX_TABLES } from './inbox'
import { PLATFORM_TABLES } from './platformTables'
import { typeStoredEvents } from '../../platform/client'

function hasColumn(handle: Database, table: string, column: string): boolean {
  return (handle.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]).some((c) => c.name === column)
}

export const TIME_COLUMNS: readonly (readonly [string, string, string])[] = [
  ['messages', 'sentAtMs', 'INTEGER'],
  ['messages', 'receivedAtMs', 'INTEGER'],
  ['messages', 'timeSource', 'TEXT'],
  ['interactions', 'atMs', 'INTEGER'],
  ['chats', 'lastMessageAtMs', 'INTEGER'],
  ['ledger', 'atMs', 'INTEGER'],
  ['events', 'sourceAtMs', 'INTEGER'],
  ['events', 'receivedAtMs', 'INTEGER'],
  ['events', 'messageKey', 'TEXT'],
]

export const TIME_INDEXES: readonly string[] = [
  'DROP INDEX IF EXISTS messagesByChat',
  'DROP INDEX IF EXISTS messagesBySender',
  'DROP INDEX IF EXISTS messagesBySentAt',
  'DROP INDEX IF EXISTS interactionsByActor',
  'DROP INDEX IF EXISTS interactionsByAccount',
  'DROP INDEX IF EXISTS ledgerByKind',
  'DROP INDEX IF EXISTS ledgerByAccount',
  'CREATE INDEX IF NOT EXISTS messagesByChatTime ON messages (chatId, sentAtMs, seq)',
  'CREATE INDEX IF NOT EXISTS messagesBySenderTime ON messages (senderPlatform, senderUserId, sentAtMs, seq)',
  'CREATE INDEX IF NOT EXISTS messagesByTime ON messages (sentAtMs, seq)',
  'CREATE INDEX IF NOT EXISTS interactionsByActorTime ON interactions (platform, actorUserId, atMs)',
  'CREATE INDEX IF NOT EXISTS interactionsByAccountTime ON interactions (platform, account, atMs)',
  'CREATE INDEX IF NOT EXISTS ledgerByKindTime ON ledger (kind, atMs)',
  'CREATE INDEX IF NOT EXISTS ledgerByAccountTime ON ledger (kind, platform, account, atMs)',
  'CREATE UNIQUE INDEX IF NOT EXISTS eventsByMessageKey ON events (messageKey) WHERE messageKey IS NOT NULL',
]

export const RECORD_COLUMNS: readonly (readonly [string, string, string])[] = [
  ['events', 'rawHash', 'TEXT'],
  ['events', 'ownerId', 'TEXT'],
  ['events', 'typedAt', 'INTEGER'],
  ['messages', 'extenderVersion', 'INTEGER'],
  ['interactions', 'extenderVersion', 'INTEGER'],
  ['attachments', 'path', 'TEXT'],
  ['attachments', 'error', 'TEXT'],
]

export const IDENTITY_TABLES: readonly string[] = [
  'CREATE TABLE IF NOT EXISTS accounts (platform TEXT NOT NULL, account TEXT NOT NULL, userId TEXT NOT NULL, learnedAt TEXT NOT NULL, PRIMARY KEY (platform, account)) WITHOUT ROWID',
  'CREATE TABLE IF NOT EXISTS handleAliases (platform TEXT NOT NULL, handle TEXT NOT NULL, userId TEXT NOT NULL, firstSeenAt TEXT NOT NULL, lastSeenAt TEXT NOT NULL, PRIMARY KEY (platform, handle, userId)) WITHOUT ROWID',
  'CREATE INDEX IF NOT EXISTS handleAliasesByUser ON handleAliases (platform, userId)',
  'CREATE TABLE IF NOT EXISTS identityMerges (seq INTEGER PRIMARY KEY, platform TEXT NOT NULL, fromId TEXT NOT NULL, toId TEXT NOT NULL, at TEXT NOT NULL, reason TEXT NOT NULL)',
]

export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    name: 'inboxBaseline',
    apply(handle) {
      for (const statement of INBOX_TABLES) handle.exec(statement)
      if (!hasColumn(handle, 'events', 'source')) handle.exec(`ALTER TABLE events ADD COLUMN source TEXT NOT NULL DEFAULT 'live'`)
    },
  },
  {
    version: 2,
    name: 'platformTables',
    apply(handle) {
      for (const statement of PLATFORM_TABLES) handle.exec(statement)
    },
  },
  {
    version: 3,
    name: 'typeStoredEvents',
    apply(handle) {
      typeStoredEvents(handle)
    },
  },
  {
    version: 4,
    name: 'ledgerColumns',
    apply(handle) {
      if (!hasColumn(handle, 'ledger', 'subject')) handle.exec('ALTER TABLE ledger ADD COLUMN subject TEXT')
      if (!hasColumn(handle, 'ledger', 'code')) handle.exec('ALTER TABLE ledger ADD COLUMN code TEXT')
    },
  },
  {
    version: 5,
    name: 'chatBoxAndMemberOrder',
    apply(handle) {
      if (!hasColumn(handle, 'chats', 'box')) handle.exec('ALTER TABLE chats ADD COLUMN box TEXT')
      if (!hasColumn(handle, 'memberships', 'position')) handle.exec('ALTER TABLE memberships ADD COLUMN position INTEGER')
    },
  },
  {
    version: 6,
    name: 'integerTimesAndMessageKeys',
    apply(handle) {
      for (const [table, column, type] of TIME_COLUMNS) if (!hasColumn(handle, table, column)) handle.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`)
      for (const statement of TIME_INDEXES) handle.exec(statement)
    },
  },
  {
    version: 7,
    name: 'eventsAsTheRecord',
    apply(handle) {
      for (const [table, column, type] of RECORD_COLUMNS) if (!hasColumn(handle, table, column)) handle.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`)
      handle.exec('CREATE INDEX IF NOT EXISTS eventsUntyped ON events (seq) WHERE typedAt IS NULL')
      handle.exec('CREATE INDEX IF NOT EXISTS eventsWithoutTime ON events (seq) WHERE receivedAtMs IS NULL')
    },
  },
  {
    version: 8,
    name: 'stableIdentities',
    apply(handle) {
      for (const statement of IDENTITY_TABLES) handle.exec(statement)
    },
  },
]

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version
