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
const PLATFORM_SESSION = 'src/platformKit/session/client.ts'
const X_SESSION = 'src/twitter/account/session/client.ts'
const WATCH = 'src/inbox/watch/client.ts'
const RELAY = 'src/inbox/relay/client.ts'
const CLAIMS = 'src/inbox/claims/client.ts'
const DISCORD = 'src/cli/discord/index.ts'
const SLACK = 'src/cli/slack/index.ts'
const X_SEND = 'src/cli/twitter/helpers/send.ts'
const INSTAGRAM = 'src/cli/instagram/index.ts'

export const storage = {
  description: 'One SQLite database: times as integer milliseconds, one stable key per message, and old rows filled in resumable batches',
  specPath: 'docs/specs/storage.md',
  codePaths: [TIME, BASE, TYPED, MIGRATIONS, BACKFILL, SCHEMA, STORE, CATCH_UP, X_CHAT, CONVERSATIONS, DERIVED, DB_READ, COMMAND, PLATFORM_SESSION, X_SESSION, WATCH, RELAY, CLAIMS, DISCORD, SLACK, X_SEND, INSTAGRAM],
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
    'REQ-STORAGE-07': [
      { kind: 'string', file: MIGRATIONS, includes: 'CREATE TABLE IF NOT EXISTS accounts' },
      { kind: 'string', file: MIGRATIONS, includes: 'CREATE TABLE IF NOT EXISTS handleAliases' },
      { kind: 'symbol', file: TYPED, name: 'rekeyIdentity' },
      { kind: 'symbol', file: DERIVED, name: 'identityLearnedEvent' },
      { kind: 'symbol', file: DERIVED, name: 'accountIdentifiedEvent' },
      { kind: 'symbol', file: STORE, name: 'identifyAccount' },
      { kind: 'symbol', file: STORE, name: 'rememberPerson' },
      { kind: 'uses', file: PLATFORM_SESSION, name: 'identifyAccount' },
      { kind: 'uses', file: X_SESSION, name: 'identifyAccount' },
      { kind: 'string', file: BACKFILL, includes: 'peopleToAliases' },
    ],
    'REQ-STORAGE-08': [
      { kind: 'symbol', file: STORE, name: 'checkFence' },
      { kind: 'symbol', file: STORE, name: 'asOwner' },
      { kind: 'symbol', file: STORE, name: 'OwnerFencedError' },
      { kind: 'uses', file: WATCH, name: 'holdFence' },
      { kind: 'uses', file: RELAY, name: 'asOwner' },
      { kind: 'symbol', file: WATCH, name: 'processStartedAt' },
      { kind: 'symbol', file: WATCH, name: 'sameProcess' },
      { kind: 'string', file: RELAY, includes: 'ownerPidReused' },
    ],
    'REQ-STORAGE-09': [
      { kind: 'string', file: MIGRATIONS, includes: 'gapsOneOpen' },
      { kind: 'symbol', file: STORE, name: 'openGap' },
      { kind: 'symbol', file: STORE, name: 'markGap' },
      { kind: 'symbol', file: RELAY, name: 'catchUpRunner' },
    ],
    'REQ-STORAGE-10': [
      { kind: 'symbol', file: CLAIMS, name: 'guardSend' },
      { kind: 'symbol', file: CLAIMS, name: 'echoedBefore' },
      { kind: 'symbol', file: CLAIMS, name: 'heardAfter' },
      { kind: 'string', file: CLAIMS, includes: 'A SEND IS ALREADY GOING OUT' },
      { kind: 'string', file: MIGRATIONS, includes: 'sendingOp' },
      { kind: 'uses', file: DISCORD, name: 'partSent' },
      { kind: 'uses', file: SLACK, name: 'partSent' },
      { kind: 'uses', file: X_SEND, name: 'partSent' },
      { kind: 'uses', file: INSTAGRAM, name: 'partSent' },
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
    'REQ-STORAGE-07': noul('Do recordPlatformSession and recordTwitterSession call identifyAccount with the session answer userId, appending an accountIdentified event whose derivation upserts accounts and re-keys self:<account> senders only in that account chats through rekeyIdentity; does rememberPerson append an identityLearned event instead of writing the people table, whose derivation upserts handleAliases with the lower-cased handle, re-keys @handle rows in messages, memberships, interactions and identities to the real id and logs identityMerges; does the base extender key a handle-only sender by userIdOfHandle when an alias is known; does storeRead keep fromId, senderId or userId as senderId; and do personOf and chatMessages read names from identities, with no code reading or writing people except the one-time peopleToAliases import?'),
    'REQ-STORAGE-08': noul('Does claimWatcher hold the generation it wins with holdFence; do appendEvent, recordPosition, openGap and markGap call checkFence inside their write transaction, which throws OwnerFencedError when the current call runs inside asOwner for that account and owners no longer names this pid with that generation, and does nothing outside asOwner; does ownOrAttach run its emitted events and its catch-up inside asOwner and stop writing after OwnerFencedError with one ownerFenced alert; does processAlive treat EPERM as alive; and does replaceHungOwners kill only after two stale readings STALE_CONFIRM_MS apart, and skip the kill with an ownerPidReused alert when sameProcess says the pid start time differs?'),
    'REQ-STORAGE-09': noul('Does migration 9 close extra open gaps into the oldest and create the partial unique index gapsOneOpen; does openGap raise drops on an open or catchingUp gap instead of inserting a second; does markGap close with expectDrops only where status is catchingUp and drops still matches, returning whether it changed; and does catchUpRunner reopen the gap when that close fails?'),
    'REQ-STORAGE-10': noul('Does guardSend take the chat claim and then a send lease (claims.sendingOp) with its own operation id, refusing a second send into the same chat while the lease is live; does part check in one immediate transaction that the claim row has this holder, generation, an unexpired expiresAt and this sendingOp, renew it and record an intent action with the operation id, part number and text hash, returning lost when the check fails, movedOn on the first part when heardAfter finds a message in the chat after readUpTo, and alreadySent when echoedBefore finds an earlier unfinished intent with the same text whose ownMessage echo is in the chat; does partSent record a partSent action; does done clear the lease and release the claim; and do the discord, slack, X dm, X queue, instagram and voice note sends call part before sending and partSent after?'),
    unspecifiedBehavior: noul('Does the storage code order messages by text times, store the same message twice when it has a platform id, or hold the write lock for a whole backfill, by a route the specification does not describe?'),
  },
  assertions: {
    'REQ-STORAGE-01': MET,
    'REQ-STORAGE-02': MET,
    'REQ-STORAGE-03': MET,
    'REQ-STORAGE-04': MET,
    'REQ-STORAGE-05': MET,
    'REQ-STORAGE-06': MET,
    'REQ-STORAGE-07': MET,
    'REQ-STORAGE-08': MET,
    'REQ-STORAGE-09': MET,
    'REQ-STORAGE-10': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
