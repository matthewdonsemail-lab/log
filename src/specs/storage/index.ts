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

export const storage = {
  description: 'One SQLite database: times as integer milliseconds, one stable key per message, and old rows filled in resumable batches',
  specPath: 'docs/specs/storage.md',
  codePaths: [TIME, BASE, TYPED, MIGRATIONS, BACKFILL, SCHEMA, STORE, CATCH_UP, X_CHAT],
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
    'REQ-STORAGE-03': [
      { kind: 'symbol', file: BACKFILL, name: 'runBackfill' },
      { kind: 'symbol', file: BACKFILL, name: 'BACKFILL_BATCH' },
      { kind: 'uses', file: SCHEMA, name: 'runBackfill' },
    ],
  },
  rubrics: {
    'REQ-STORAGE-01': noul('Does msOf in src/storage/platform/helpers/time.ts parse ISO times with any fraction digits and offset, epoch seconds and milliseconds as numbers or numeric strings, and return null otherwise; does writeTypedRows write sentAtMs, timeSource, receivedAtMs, interactions atMs and chats lastMessageAtMs, appendEvent write sourceAtMs and receivedAtMs, and writeLedger write atMs; do lastMessagesOf and messagesFromIdentity order by sentAtMs then seq; and do the catch-ups in src/inbox/catchUp/client.ts and src/cli/twitter/helpers/chat.ts keep a message only when afterGap says its instant is after the gap start?'),
    'REQ-STORAGE-02': noul('Is the message key platform:account:conversation:platformMessageId from messageKeyOf, used by the base extender for messages.messageKey and by appendEvent for events.messageKey under the partial unique index eventsByMessageKey; does eventIdOf hash the key when an id or key is given and otherwise the instant in milliseconds plus the text; do the X Chat, Discord, Slack and Instagram inbox message builders and both catch-ups carry the platform message id; and does adoptUnkeyed set the key on an older unkeyed event with the same chat, instant and text instead of a second event being stored?'),
    'REQ-STORAGE-03': noul('Does migration 6 only add columns and indexes, and does runBackfill, called after migrate in openDatabase and useDatabase, fill unfilled rows in transactions of at most BACKFILL_BATCH rows, each batch setting the column that marks its progress, keying only the first event of each message?'),
    unspecifiedBehavior: noul('Does the storage code order messages by text times, store the same message twice when it has a platform id, or hold the write lock for a whole backfill, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-STORAGE-01': MET,
    'REQ-STORAGE-02': MET,
    'REQ-STORAGE-03': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
