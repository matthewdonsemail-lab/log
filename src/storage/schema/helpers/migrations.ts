import type { Database } from 'bun:sqlite'
import type { Migration } from '../types'
import { INBOX_TABLES } from './inbox'
import { PLATFORM_TABLES } from './platformTables'

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

export const FENCE_COLUMNS: readonly (readonly [string, string, string])[] = [
  ['owners', 'pidStartedAt', 'TEXT'],
  ['owners', 'staleSeenAt', 'TEXT'],
  ['gaps', 'drops', 'INTEGER NOT NULL DEFAULT 0'],
]

export const SEND_COLUMNS: readonly (readonly [string, string, string])[] = [
  ['claims', 'sendingOp', 'TEXT'],
  ['claims', 'sendingSince', 'TEXT'],
]

export const QUEUE_TABLES: readonly string[] = [
  'CREATE TABLE IF NOT EXISTS queues (name TEXT PRIMARY KEY, account TEXT NOT NULL, body TEXT NOT NULL, version INTEGER NOT NULL, path TEXT NOT NULL, updatedAt TEXT NOT NULL) WITHOUT ROWID',
  'CREATE TABLE IF NOT EXISTS queueLog (seq INTEGER PRIMARY KEY, name TEXT NOT NULL, at TEXT NOT NULL, line TEXT NOT NULL, source TEXT NOT NULL)',
  'CREATE INDEX IF NOT EXISTS queueLogByName ON queueLog (name, seq)',
  'CREATE TABLE IF NOT EXISTS queueIncoming (seq INTEGER PRIMARY KEY, name TEXT NOT NULL, addition TEXT NOT NULL, addedAt TEXT NOT NULL, takenAt TEXT)',
  'CREATE INDEX IF NOT EXISTS queueIncomingWaiting ON queueIncoming (name, seq) WHERE takenAt IS NULL',
  'CREATE TABLE IF NOT EXISTS queueLocks (name TEXT PRIMARY KEY, pid INTEGER NOT NULL, takenAt TEXT NOT NULL) WITHOUT ROWID',
  'CREATE TABLE IF NOT EXISTS queueNudges (name TEXT PRIMARY KEY, replies INTEGER NOT NULL) WITHOUT ROWID',
]

export const JOB_TABLES: readonly string[] = [
  'CREATE TABLE IF NOT EXISTS jobs (id TEXT PRIMARY KEY, tool TEXT NOT NULL, argv TEXT NOT NULL, account TEXT, live INTEGER NOT NULL, pid INTEGER NOT NULL, startedAt TEXT NOT NULL, endedAt TEXT, status TEXT NOT NULL, cancelRequested INTEGER NOT NULL DEFAULT 0, result TEXT, text TEXT) WITHOUT ROWID',
  'CREATE INDEX IF NOT EXISTS jobsByAccount ON jobs (account, status, startedAt)',
  'CREATE INDEX IF NOT EXISTS jobsByStart ON jobs (startedAt)',
  'CREATE TABLE IF NOT EXISTS jobLines (jobId TEXT NOT NULL, n INTEGER NOT NULL, at TEXT NOT NULL, source TEXT NOT NULL, line TEXT NOT NULL, PRIMARY KEY (jobId, n)) WITHOUT ROWID',
]

export const MIN_READER_VERSION = 1

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
    apply() {
      return
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
  {
    version: 9,
    name: 'fencedOwnersAndGaps',
    apply(handle) {
      for (const [table, column, type] of FENCE_COLUMNS) if (!hasColumn(handle, table, column)) handle.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`)
      handle.prepare(`UPDATE gaps SET status = 'closed', closedAt = COALESCE(closedAt, ?), detail = COALESCE(detail || '; ', '') || 'closed into the older open gap for this account' WHERE status IN ('open', 'catchingUp', 'refused') AND id NOT IN (SELECT MIN(id) FROM gaps WHERE status IN ('open', 'catchingUp', 'refused') GROUP BY platform, account)`).run(new Date().toISOString())
      handle.exec("CREATE UNIQUE INDEX IF NOT EXISTS gapsOneOpen ON gaps (platform, account) WHERE status IN ('open', 'catchingUp', 'refused')")
    },
  },
  {
    version: 10,
    name: 'fencedSends',
    apply(handle) {
      for (const [table, column, type] of SEND_COLUMNS) if (!hasColumn(handle, table, column)) handle.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`)
      handle.exec('CREATE INDEX IF NOT EXISTS actionsByChat ON actions (platform, account, conversationId, id)')
    },
  },
  {
    version: 11,
    name: 'readerVersion',
    apply(handle) {
      handle.exec('CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL) WITHOUT ROWID')
      handle.prepare("INSERT INTO meta (key, value) VALUES ('minReaderVersion', ?) ON CONFLICT(key) DO UPDATE SET value = MAX(CAST(meta.value AS INTEGER), CAST(excluded.value AS INTEGER))").run(String(MIN_READER_VERSION))
    },
  },
  {
    version: 12,
    name: 'queueTables',
    apply(handle) {
      for (const statement of QUEUE_TABLES) handle.exec(statement)
    },
  },
  {
    version: 13,
    name: 'jobTables',
    apply(handle) {
      for (const statement of JOB_TABLES) handle.exec(statement)
    },
  },
  {
    version: 14,
    name: 'transcriptBodies',
    apply(handle) {
      if (!hasColumn(handle, 'transcripts', 'body')) handle.exec('ALTER TABLE transcripts ADD COLUMN body TEXT')
      handle.exec('CREATE TABLE IF NOT EXISTS transcriptLinks (linkKey TEXT PRIMARY KEY, audioHash TEXT NOT NULL) WITHOUT ROWID')
    },
  },
  {
    version: 15,
    name: 'records',
    apply(handle) {
      handle.exec('CREATE TABLE IF NOT EXISTS records (seq INTEGER PRIMARY KEY, kind TEXT NOT NULL, key TEXT, at TEXT NOT NULL, body TEXT NOT NULL, source TEXT NOT NULL)')
      handle.exec('CREATE INDEX IF NOT EXISTS recordsByKind ON records (kind, key, seq)')
    },
  },
  {
    version: 16,
    name: 'state',
    apply(handle) {
      handle.exec('CREATE TABLE IF NOT EXISTS state (scope TEXT NOT NULL, key TEXT NOT NULL, body TEXT NOT NULL, updatedAt INTEGER NOT NULL, PRIMARY KEY (scope, key)) WITHOUT ROWID')
    },
  },
]

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version
