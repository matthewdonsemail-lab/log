import { noul } from 'jev-spec'
import { MET, NOT_VIOLATED } from '../types'

const TIME = 'src/storage/platform/helpers/time.ts'
const BASE = 'src/storage/platform/helpers/base.ts'
const TYPED = 'src/storage/platform/client.ts'
const MIGRATIONS = 'src/storage/schema/helpers/migrations.ts'
const BACKFILL = 'src/storage/schema/helpers/backfill.ts'
const SCHEMA = 'src/storage/schema/client.ts'
const STORE = 'src/inbox/store/client.ts'
const CATCH_UP = 'src/inbox/catchUp/client.ts'
const X_CHAT = 'src/cli/twitter/helpers/chat.ts'
const CONVERSATIONS = 'src/storage/platform/helpers/conversations.ts'
const DERIVED = 'src/storage/platform/helpers/derivedEvents.ts'
const DB_READ = 'src/inbox/dbRead/client.ts'
const COMMAND = 'src/cli/storage/index.ts'

export const storage = {
  description: 'One SQLite database: times as integer milliseconds, one stable key per message, and old rows filled in resumable batches',
  specPath: 'docs/specs/storage.md',
  codePaths: [TIME, BASE, TYPED, MIGRATIONS, BACKFILL, SCHEMA, STORE, CATCH_UP, X_CHAT, CONVERSATIONS, DERIVED, DB_READ, COMMAND],
  anchors: {
    'REQ-STORAGE-01': [
      { kind: 'symbol', file: TIME, name: 'msOf' },
      { kind: 'symbol', file: TIME, name: 'messageTimeOf' },
      { kind: 'symbol', file: MIGRATIONS, name: 'TIME_COLUMNS' },
      { kind: 'string', file: MIGRATIONS, includes: 'messagesByChatTime' },
      { kind: 'string', file: TYPED, includes: 'ORDER BY sentAtMs DESC, seq DESC' },
      { kind: 'symbol', file: STORE, name: 'afterGap' },
      { kind: 'uses', file: CATCH_UP, name: 'afterGap' },
      { kind: 'uses', file: X_CHAT, name: 'afterGap' },
    ],
    'REQ-STORAGE-02': [
      { kind: 'symbol', file: TIME, name: 'messageKeyOf' },
      { kind: 'uses', file: BASE, name: 'messageKeyOf' },
      { kind: 'string', file: MIGRATIONS, includes: 'eventsByMessageKey' },
      { kind: 'symbol', file: STORE, name: 'eventIdOf' },
      { kind: 'symbol', file: STORE, name: 'messageKeyOfEvent' },
      { kind: 'symbol', file: STORE, name: 'adoptUnkeyed' },
      { kind: 'uses', file: CATCH_UP, name: 'adoptUnkeyed' },
    ],
    'REQ-STORAGE-04': [
      { kind: 'symbol', file: TYPED, name: 'insertEventRow' },
      { kind: 'uses', file: STORE, name: 'insertEventRow' },
      { kind: 'symbol', file: CONVERSATIONS, name: 'writeConversation' },
      { kind: 'symbol', file: DERIVED, name: 'attachmentsSeenEvent' },
      { kind: 'symbol', file: DERIVED, name: 'messageEditedEvent' },
      { kind: 'symbol', file: DERIVED, name: 'conversationSeenEvent' },
      { kind: 'symbol', file: DB_READ, name: 'chatMessages' },
    ],
    'REQ-STORAGE-05': [
      { kind: 'symbol', file: TYPED, name: 'PAYLOAD_INLINE_LIMIT' },
      { kind: 'symbol', file: TYPED, name: 'putBlob' },
      { kind: 'symbol', file: TYPED, name: 'readBlob' },
      { kind: 'symbol', file: TYPED, name: 'notePairConversation' },
    ],
    'REQ-STORAGE-06': [
      { kind: 'symbol', file: TYPED, name: 'rebuildDerived' },
      { kind: 'symbol', file: TYPED, name: 'verifyDerived' },
      { kind: 'symbol', file: TYPED, name: 'derivedFingerprint' },
      { kind: 'symbol', file: COMMAND, name: 'storageCommand' },
      { kind: 'string', file: BACKFILL, includes: 'eventsForTypedRows' },
      { kind: 'string', file: BACKFILL, includes: 'untypedEvents' },
    ],
    'REQ-STORAGE-03': [
      { kind: 'symbol', file: BACKFILL, name: 'runBackfill' },
      { kind: 'symbol', file: BACKFILL, name: 'BACKFILL_BATCH' },
      { kind: 'uses', file: SCHEMA, name: 'runBackfill' },
    ],
  },
  rubrics: {
    'REQ-STORAGE-01': noul('Does msOf in src/storage/platform/helpers/time.ts parse ISO times with any fraction digits and offset, epoch seconds and milliseconds as numbers or numeric strings, and return null otherwise; does writeTypedRows write sentAtMs, timeSource, receivedAtMs, interactions atMs and chats lastMessageAtMs, appendEvent write sourceAtMs and receivedAtMs, and writeLedger write atMs; do lastMessagesOf and messagesFromIdentity order by sentAtMs then seq; and do the catch-ups in src/inbox/catchUp/client.ts and src/cli/twitter/helpers/chat.ts keep a message only when afterGap says its instant is after the gap start?'),
    'REQ-STORAGE-02': noul('Is the message key platform:account:conversation:platformMessageId from messageKeyOf, used by the base extender for messages.messageKey and by appendEvent for events.messageKey under the partial unique index eventsByMessageKey; does eventIdOf hash the key when an id or key is given and otherwise the instant in milliseconds plus the text; do the X Chat, Discord, Slack and Instagram inbox message builders and both catch-ups carry the platform message id; and when an older unkeyed event has the same chat, instant and text, does adoptUnkeyed store no second message event and instead append an attachmentsSeen event naming the message key of the old copy with the platform id and attachments?'),
    'REQ-STORAGE-03': noul('Does migration 6 only add columns and indexes, and does runBackfill, called after migrate in openDatabase and useDatabase, fill unfilled rows in transactions of at most BACKFILL_BATCH rows, each batch setting the column that marks its progress, keying only the first event of each message?'),
    'REQ-STORAGE-04': noul('Is insertEventRow the only code that inserts into events, deriving the typed rows with typeEvent in the same call; do appendEvent and saveConversationRows (through writeConversation) insert only through it; do addToPayload and adoptUnkeyed append an attachmentsSeen event instead of updating an existing event, writeConversation append messageEdited when the stored text differs and conversationSeen with the box and members; and does chatMessages read the messages and attachments tables rather than the events table?'),
    'REQ-STORAGE-05': noul('Does insertEventRow store a payload longer than PAYLOAD_INLINE_LIMIT gzip-compressed in blobs through putBlob with events.rawHash set, does eventInputOf read it back with readBlob, does insertEventRow write events.ownerId from notePairConversation and contextOn, and do messages and interactions record EXTENDER_VERSION?'),
    'REQ-STORAGE-06': noul('Does rebuildDerived delete every table in DERIVED_TABLES and replay every event in seq order inside one transaction; does verifyDerived rebuild a deserialized copy and compare derivedFingerprint of each table; does log storage verify change nothing and rebuild change the live tables only with --apply; and do the backfill steps eventsForTypedRows, editsForChangedText and untypedEvents give unevented typed rows an import event with their original key, record in-place text changes as messageEdited and type untyped events, the full-scan ones running once?'),
    unspecifiedBehavior: noul('Does the storage code order messages by text times, store the same message twice when it has a platform id, or hold the write lock for a whole backfill, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-STORAGE-01': MET,
    'REQ-STORAGE-02': MET,
    'REQ-STORAGE-03': MET,
    'REQ-STORAGE-04': MET,
    'REQ-STORAGE-05': MET,
    'REQ-STORAGE-06': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
