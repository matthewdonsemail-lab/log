import type { Database } from 'bun:sqlite'
import type { Migration } from '../types'
import { INBOX_TABLES, TYPING_TABLES } from './inbox'
import { PLATFORM_TABLES } from './platformTables'
import { repairChatPlaces } from '../../platform/helpers/places'
import { repairChatGroups } from '../../platform/helpers/members'
import { rebuildRingsIn, ringState } from '../../../relate/network/helpers/rings'

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

export const MEDIA_COLUMNS: readonly (readonly [string, string])[] = [
  ['sha256', 'TEXT'],
  ['sizeBytes', 'INTEGER'],
  ['durationMs', 'INTEGER'],
  ['width', 'INTEGER'],
  ['height', 'INTEGER'],
  ['preview', 'BLOB'],
  ['previewMime', 'TEXT'],
  ['scenes', 'TEXT'],
  ['transcript', 'TEXT'],
  ['providers', 'TEXT'],
  ['fileRemovedAt', 'TEXT'],
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

export const PEOPLE_TABLES: readonly string[] = [
  'CREATE TABLE IF NOT EXISTS persons (personId TEXT PRIMARY KEY, name TEXT, createdAt TEXT NOT NULL, updatedAt TEXT NOT NULL) WITHOUT ROWID',
  'CREATE TABLE IF NOT EXISTS identityLinks (personId TEXT NOT NULL, platform TEXT NOT NULL, userId TEXT NOT NULL, evidence TEXT, linkedBy TEXT NOT NULL, linkedAt TEXT NOT NULL, linkedEventId TEXT NOT NULL, revokedAt TEXT, revokedBy TEXT, PRIMARY KEY (personId, platform, userId, linkedEventId)) WITHOUT ROWID',
  'CREATE UNIQUE INDEX IF NOT EXISTS identityLinksActive ON identityLinks (platform, userId) WHERE revokedAt IS NULL',
  'CREATE INDEX IF NOT EXISTS identityLinksByPerson ON identityLinks (personId) WHERE revokedAt IS NULL',
  'CREATE TABLE IF NOT EXISTS identityNotLinked (platformA TEXT NOT NULL, userIdA TEXT NOT NULL, platformB TEXT NOT NULL, userIdB TEXT NOT NULL, decidedBy TEXT NOT NULL, decidedAt TEXT NOT NULL, PRIMARY KEY (platformA, userIdA, platformB, userIdB)) WITHOUT ROWID',
]

export const IDENTITY_PROFILE_TABLES: readonly string[] = [
  'CREATE TABLE IF NOT EXISTS identityProfiles (platform TEXT NOT NULL, userId TEXT NOT NULL, bio TEXT, avatarHash TEXT REFERENCES blobs (hash), followerCount INTEGER, verified INTEGER, extra TEXT CHECK (extra IS NULL OR json_valid(extra)), fetchedAt TEXT NOT NULL, PRIMARY KEY (platform, userId)) WITHOUT ROWID',
  'CREATE INDEX IF NOT EXISTS identityProfilesByFetchedAt ON identityProfiles (fetchedAt)',
]

export const ENGINE_STATE_TABLES: readonly string[] = [
  'CREATE TABLE IF NOT EXISTS engineState (platform TEXT NOT NULL, account TEXT NOT NULL, store TEXT NOT NULL, part TEXT NOT NULL, body TEXT NOT NULL, updatedAt INTEGER NOT NULL, PRIMARY KEY (platform, account, store, part)) WITHOUT ROWID',
]

export const SECRET_TABLES: readonly string[] = [
  'CREATE TABLE IF NOT EXISTS secrets (ref TEXT PRIMARY KEY, kind TEXT NOT NULL, keyId TEXT NOT NULL, alg TEXT NOT NULL, nonce BLOB NOT NULL, ciphertext BLOB NOT NULL, updatedAt TEXT NOT NULL) WITHOUT ROWID',
  "CREATE TABLE IF NOT EXISTS secretKeys (keyId TEXT NOT NULL, method TEXT NOT NULL, wrapped BLOB, salt BLOB, params TEXT NOT NULL DEFAULT '{}', createdAt TEXT NOT NULL, PRIMARY KEY (keyId, method)) WITHOUT ROWID",
]

export const PIPELINE_TABLES: readonly string[] = [
  'CREATE TABLE IF NOT EXISTS chatPipeline (platform TEXT NOT NULL, account TEXT NOT NULL, person TEXT NOT NULL, lastSeq INTEGER NOT NULL, who TEXT NOT NULL, stage TEXT, confidence REAL NOT NULL, margin REAL NOT NULL, movedBySeq INTEGER, movedById TEXT, source TEXT NOT NULL, model TEXT NOT NULL, scores TEXT NOT NULL, features TEXT NOT NULL, emotions TEXT, vector BLOB, labelledAt TEXT NOT NULL, PRIMARY KEY (platform, account, person)) WITHOUT ROWID',
  'CREATE TABLE IF NOT EXISTS pipelineHeads (id INTEGER PRIMARY KEY AUTOINCREMENT, model TEXT NOT NULL, head TEXT NOT NULL, trainedAt TEXT NOT NULL)',
]

export const CONVENTION_CORPUS_TABLES: readonly string[] = [
  'CREATE TABLE IF NOT EXISTS conventionCorpus (id TEXT PRIMARY KEY, side TEXT NOT NULL, family TEXT NOT NULL, model TEXT, source TEXT NOT NULL, chatKey TEXT NOT NULL, momentKey TEXT, text TEXT NOT NULL, at TEXT, addedAt TEXT NOT NULL) WITHOUT ROWID',
  'CREATE INDEX IF NOT EXISTS conventionCorpusBySide ON conventionCorpus (side, source)',
]

export const NETWORK_TABLES: readonly string[] = [
  'CREATE TABLE IF NOT EXISTS networkImports (id INTEGER PRIMARY KEY CHECK (id = 1), formatVersion INTEGER NOT NULL, mapVersion TEXT, generatedAt TEXT, source TEXT NOT NULL, account TEXT, counts TEXT NOT NULL, ms INTEGER NOT NULL, importedAt TEXT NOT NULL)',
  'CREATE TABLE IF NOT EXISTS networkPeople (handleLower TEXT PRIMARY KEY, handle TEXT NOT NULL, name TEXT, followers INTEGER, degree INTEGER, ring INTEGER, band TEXT, bandProbabilities TEXT, fit REAL, components TEXT, themes TEXT, topThemes TEXT, workflowStage TEXT, passesGates INTEGER, followsOwner INTEGER NOT NULL DEFAULT 0, company TEXT, rank INTEGER, role TEXT, bio TEXT, tieStrength REAL, lastPostText TEXT, lastPostAtMs INTEGER) WITHOUT ROWID',
  'CREATE INDEX IF NOT EXISTS networkPeopleByBand ON networkPeople (band, ring)',
  'CREATE TABLE IF NOT EXISTS networkLeaders (handleLower TEXT PRIMARY KEY, handle TEXT NOT NULL, name TEXT, followers INTEGER, world TEXT) WITHOUT ROWID',
  'CREATE TABLE IF NOT EXISTS networkCommunities (communityId TEXT PRIMARY KEY, name TEXT, url TEXT, platform TEXT, topic TEXT) WITHOUT ROWID',
  'CREATE TABLE IF NOT EXISTS networkRuns (leaderLower TEXT NOT NULL, communityId TEXT NOT NULL, PRIMARY KEY (leaderLower, communityId)) WITHOUT ROWID',
  'CREATE TABLE IF NOT EXISTS networkCircles (personLower TEXT NOT NULL, leaderLower TEXT NOT NULL, PRIMARY KEY (personLower, leaderLower)) WITHOUT ROWID',
  'CREATE INDEX IF NOT EXISTS networkCirclesByLeader ON networkCircles (leaderLower)',
  'CREATE TABLE IF NOT EXISTS networkMentions (fromLower TEXT NOT NULL, toLower TEXT NOT NULL, times INTEGER NOT NULL, lastAtMs INTEGER, PRIMARY KEY (fromLower, toLower)) WITHOUT ROWID',
]

export const NETWORK_RING_TABLES: readonly string[] = [
  'CREATE TABLE IF NOT EXISTS networkRings (platform TEXT NOT NULL, userId TEXT NOT NULL, ring INTEGER NOT NULL, reason TEXT NOT NULL, sinceMs INTEGER, follows INTEGER NOT NULL DEFAULT 0, via TEXT, seq INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (platform, userId)) WITHOUT ROWID',
  'CREATE INDEX IF NOT EXISTS networkRingsBySeq ON networkRings (seq)',
  'CREATE TABLE IF NOT EXISTS networkTalks (platform TEXT NOT NULL, fromId TEXT NOT NULL, toId TEXT NOT NULL, times INTEGER NOT NULL, firstAtMs INTEGER, PRIMARY KEY (platform, fromId, toId)) WITHOUT ROWID',
  'CREATE INDEX IF NOT EXISTS networkTalksByTo ON networkTalks (platform, toId)',
  'CREATE TABLE IF NOT EXISTS networkRingState (id INTEGER PRIMARY KEY CHECK (id = 1), throughSeq INTEGER NOT NULL, lastAtMs INTEGER, builtAt TEXT NOT NULL, builtMs INTEGER NOT NULL)',
]

export const PERSON_FACT_TABLES: readonly string[] = [
  'CREATE TABLE IF NOT EXISTS personFacts (factId TEXT PRIMARY KEY, eventId TEXT NOT NULL, personId TEXT, platform TEXT, userId TEXT, slot TEXT NOT NULL, text TEXT NOT NULL, quote TEXT NOT NULL, sourceMessageKeys TEXT NOT NULL, validFrom TEXT NOT NULL, validTo TEXT, recordedAt TEXT NOT NULL, closedAt TEXT, supersededBy TEXT, confidence REAL NOT NULL, extractedBy TEXT NOT NULL) WITHOUT ROWID',
  'CREATE INDEX IF NOT EXISTS personFactsByIdentity ON personFacts (platform, userId, slot)',
  'CREATE INDEX IF NOT EXISTS personFactsByPerson ON personFacts (personId, slot)',
  'CREATE TABLE IF NOT EXISTS factCandidates (messageKey TEXT PRIMARY KEY, chatId TEXT NOT NULL, kind TEXT NOT NULL, confidence REAL NOT NULL, marks TEXT NOT NULL, model TEXT NOT NULL, decided TEXT, markedAt TEXT NOT NULL) WITHOUT ROWID',
  'CREATE INDEX IF NOT EXISTS factCandidatesOpen ON factCandidates (chatId) WHERE decided IS NULL',
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
    creates: ['accounts', 'handleAliases', 'handleAliasesByUser', 'identityMerges'],
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
    creates: ['queues', 'queueLog', 'queueLogByName', 'queueIncoming', 'queueIncomingWaiting', 'queueLocks', 'queueNudges'],
    apply(handle) {
      for (const statement of QUEUE_TABLES) handle.exec(statement)
    },
  },
  {
    version: 13,
    name: 'jobTables',
    creates: ['jobs', 'jobsByAccount', 'jobsByStart', 'jobLines'],
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
    creates: ['records', 'recordsByKind'],
    apply(handle) {
      handle.exec('CREATE TABLE IF NOT EXISTS records (seq INTEGER PRIMARY KEY, kind TEXT NOT NULL, key TEXT, at TEXT NOT NULL, body TEXT NOT NULL, source TEXT NOT NULL)')
      handle.exec('CREATE INDEX IF NOT EXISTS recordsByKind ON records (kind, key, seq)')
    },
  },
  {
    version: 16,
    name: 'state',
    creates: ['state'],
    apply(handle) {
      handle.exec('CREATE TABLE IF NOT EXISTS state (scope TEXT NOT NULL, key TEXT NOT NULL, body TEXT NOT NULL, updatedAt INTEGER NOT NULL, PRIMARY KEY (scope, key)) WITHOUT ROWID')
    },
  },
  {
    version: 17,
    name: 'mediaRepresentation',
    apply(handle) {
      for (const [column, type] of MEDIA_COLUMNS) if (!hasColumn(handle, 'media', column)) handle.exec(`ALTER TABLE media ADD COLUMN ${column} ${type}`)
      handle.exec('CREATE INDEX IF NOT EXISTS mediaByEvent ON media (eventId)')
      handle.exec('CREATE INDEX IF NOT EXISTS mediaByPath ON media (path)')
    },
  },
  {
    version: 18,
    name: 'operations',
    creates: ['operations', 'operationsByState'],
    apply(handle) {
      handle.exec(`CREATE TABLE IF NOT EXISTS operations (
        id TEXT PRIMARY KEY,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL,
        operationId TEXT NOT NULL UNIQUE,
        requesterUserId TEXT,
        grantId TEXT,
        teamId TEXT NOT NULL,
        workspaceId TEXT NOT NULL,
        idempotencyKey TEXT NOT NULL,
        requestHash TEXT NOT NULL,
        tool TEXT NOT NULL,
        args TEXT NOT NULL,
        state TEXT NOT NULL CHECK (state IN ('accepted', 'running', 'succeeded', 'failed', 'cancelled', 'unknown')),
        generation INTEGER NOT NULL,
        live INTEGER NOT NULL DEFAULT 0,
        jobId TEXT,
        result TEXT,
        error TEXT,
        evidenceRef TEXT,
        startedAt INTEGER,
        endedAt INTEGER,
        UNIQUE (teamId, idempotencyKey)
      )`)
      handle.exec('CREATE INDEX IF NOT EXISTS operationsByState ON operations (state, updatedAt)')
    },
  },
  {
    version: 19,
    name: 'identityProfiles',
    creates: ['identityProfiles', 'identityProfilesByFetchedAt'],
    apply(handle) {
      for (const statement of IDENTITY_PROFILE_TABLES) handle.exec(statement)
    },
  },
  {
    version: 20,
    name: 'conversationCards',
    apply(handle) {
      if (!hasColumn(handle, 'conversationCards', 'throughSeq')) handle.exec('DROP TABLE IF EXISTS conversationCards')
      handle.exec('CREATE TABLE IF NOT EXISTS conversationCards (key TEXT PRIMARY KEY, platform TEXT NOT NULL, account TEXT NOT NULL, throughSeq INTEGER NOT NULL, card TEXT NOT NULL, builtAt TEXT NOT NULL) WITHOUT ROWID')
      handle.exec('DELETE FROM conversationCards')
      handle.exec('CREATE INDEX IF NOT EXISTS conversationCardsByAccount ON conversationCards (platform, account)')
    },
  },
  {
    version: 21,
    name: 'people',
    creates: ['persons', 'identityLinks', 'identityLinksActive', 'identityLinksByPerson', 'identityNotLinked'],
    apply(handle) {
      for (const statement of PEOPLE_TABLES) handle.exec(statement)
    },
  },
  {
    version: 22,
    name: 'typing',
    creates: ['typing'],
    apply(handle) {
      for (const statement of TYPING_TABLES) handle.exec(statement)
    },
  },
  {
    version: 23,
    name: 'engineStores',
    creates: ['engineState'],
    apply(handle) {
      for (const statement of ENGINE_STATE_TABLES) handle.exec(statement)
    },
  },
  {
    version: 24,
    name: 'pipeline',
    creates: ['chatPipeline', 'pipelineHeads'],
    apply(handle) {
      for (const statement of PIPELINE_TABLES) handle.exec(statement)
    },
  },
  {
    version: 25,
    name: 'conventionCorpus',
    creates: ['conventionCorpus', 'conventionCorpusBySide'],
    apply(handle) {
      for (const statement of CONVENTION_CORPUS_TABLES) handle.exec(statement)
    },
  },
  {
    version: 26,
    name: 'secrets',
    creates: ['secrets', 'secretKeys'],
    apply(handle) {
      for (const statement of SECRET_TABLES) handle.exec(statement)
    },
  },
  {
    version: 27,
    name: 'network',
    creates: ['networkImports', 'networkPeople', 'networkPeopleByBand', 'networkLeaders', 'networkCommunities', 'networkRuns', 'networkCircles', 'networkCirclesByLeader', 'networkMentions'],
    apply(handle) {
      for (const statement of NETWORK_TABLES) handle.exec(statement)
    },
  },
  {
    version: 28,
    name: 'chatPlaces',
    apply(handle) {
      repairChatPlaces(handle)
    },
  },
  {
    version: 29,
    name: 'networkRings',
    creates: ['networkRings', 'networkRingsBySeq', 'networkTalks', 'networkTalksByTo', 'networkRingState'],
    apply(handle) {
      for (const statement of NETWORK_RING_TABLES) handle.exec(statement)
    },
  },
  {
    version: 30,
    name: 'networkFit',
    apply(handle) {
      if (hasColumn(handle, 'networkPeople', 'score')) handle.exec('ALTER TABLE networkPeople RENAME COLUMN score TO fit')
    },
  },
  {
    version: 31,
    name: 'chatGroups',
    apply(handle) {
      const moved = repairChatPlaces(handle) + repairChatGroups(handle)
      if (moved && ringState(handle)) rebuildRingsIn(handle)
    },
  },
  {
    version: 32,
    name: 'personFacts',
    creates: ['personFacts', 'personFactsByIdentity', 'personFactsByPerson', 'factCandidates', 'factCandidatesOpen'],
    apply(handle) {
      for (const statement of PERSON_FACT_TABLES) handle.exec(statement)
    },
  },
]

export const SCHEMA_VERSION = MIGRATIONS[MIGRATIONS.length - 1].version
