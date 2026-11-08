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
const LEDGER = 'src/storage/ledger/client.ts'
const QUEUE_STORE = 'src/twitter/queue/store/client.ts'
const QUEUE_PLAN = 'src/twitter/queue/plan/client.ts'
const QUEUE_EVENTS = 'src/twitter/queue/events/client.ts'
const JOBS = 'src/mcp/jobs/client.ts'
const TRANSCRIPTS = 'src/media/voiceNotes/helpers/store.ts'
const RECORDS = 'src/storage/records/client.ts'
const CONTEXT = 'src/contextLayer/service/client.ts'
const ONE_DB = 'scripts/checks/checkOneDatabase.ts'
const DISCORD = 'src/cli/discord/index.ts'
const SLACK = 'src/cli/slack/index.ts'
const X_SEND = 'src/cli/twitter/helpers/send.ts'
const INSTAGRAM = 'src/cli/instagram/index.ts'

export const storage = {
  description: 'One SQLite database: times as integer milliseconds, one stable key per message, and old rows filled in resumable batches',
  specPath: 'docs/specs/storage.md',
  codePaths: [TIME, BASE, TYPED, MIGRATIONS, BACKFILL, SCHEMA, STORE, CATCH_UP, X_CHAT, CONVERSATIONS, DERIVED, DB_READ, COMMAND, PLATFORM_SESSION, X_SESSION, WATCH, RELAY, CLAIMS, DISCORD, SLACK, X_SEND, INSTAGRAM, LEDGER, QUEUE_STORE, QUEUE_PLAN, QUEUE_EVENTS, JOBS, TRANSCRIPTS, RECORDS, CONTEXT, ONE_DB],
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
    'REQ-STORAGE-11': [
      { kind: 'symbol', file: TYPED, name: 'CONVERSATION_BATCH_MESSAGES' },
      { kind: 'symbol', file: BACKFILL, name: 'inBatches' },
      { kind: 'uses', file: LEDGER, name: 'inBatches' },
      { kind: 'symbol', file: MIGRATIONS, name: 'MIN_READER_VERSION' },
      { kind: 'symbol', file: SCHEMA, name: 'minReaderVersionOf' },
      { kind: 'symbol', file: BACKFILL, name: 'sweepUntyped' },
      { kind: 'uses', file: RELAY, name: 'sweepUntyped' },
    ],
    'REQ-STORAGE-12': [
      { kind: 'string', file: MIGRATIONS, includes: 'CREATE TABLE IF NOT EXISTS queues' },
      { kind: 'symbol', file: QUEUE_STORE, name: 'readQueueBody' },
      { kind: 'symbol', file: QUEUE_STORE, name: 'writeQueueBody' },
      { kind: 'symbol', file: QUEUE_STORE, name: 'importQueueFile' },
      { kind: 'uses', file: QUEUE_PLAN, name: 'readQueueBody' },
      { kind: 'uses', file: QUEUE_PLAN, name: 'appendQueueLog' },
      { kind: 'symbol', file: QUEUE_EVENTS, name: 'queueReader' },
      { kind: 'uses', file: QUEUE_EVENTS, name: 'queueLogAfter' },
    ],
    'REQ-STORAGE-13': [
      { kind: 'string', file: MIGRATIONS, includes: 'CREATE TABLE IF NOT EXISTS jobs' },
      { kind: 'string', file: MIGRATIONS, includes: 'CREATE TABLE IF NOT EXISTS jobLines' },
      { kind: 'symbol', file: JOBS, name: 'importJobFiles' },
      { kind: 'symbol', file: JOBS, name: 'appendProgress' },
      { kind: 'symbol', file: JOBS, name: 'requestCancel' },
    ],
    'REQ-STORAGE-14': [
      { kind: 'string', file: MIGRATIONS, includes: 'transcriptLinks' },
      { kind: 'symbol', file: TRANSCRIPTS, name: 'importTranscriptFiles' },
      { kind: 'symbol', file: TRANSCRIPTS, name: 'readTranscript' },
      { kind: 'symbol', file: TRANSCRIPTS, name: 'linkMessages' },
    ],
    'REQ-STORAGE-15': [
      { kind: 'string', file: MIGRATIONS, includes: 'CREATE TABLE IF NOT EXISTS records' },
      { kind: 'symbol', file: RECORDS, name: 'appendRecord' },
      { kind: 'symbol', file: RECORDS, name: 'importRecordFile' },
      { kind: 'uses', file: 'src/facebook/warmup/stages/helpers/stageLog.ts', name: 'appendRecord' },
      { kind: 'uses', file: 'src/extensions/memeTaste/helpers/trainer.ts', name: 'appendRecord' },
      { kind: 'uses', file: 'src/browser/runStore/client.ts', name: 'appendRecord' },
      { kind: 'string', file: CONTEXT, includes: 'INSERT OR IGNORE INTO spans' },
    ],
    'REQ-STORAGE-16': [
      { kind: 'symbol', file: ONE_DB, name: 'ALLOWED' },
      { kind: 'symbol', file: ONE_DB, name: 'WHY' },
      { kind: 'string', file: ONE_DB, includes: 'oneDatabase: no new loose store' },
      { kind: 'symbol', file: STORE, name: 'retirePendingFile' },
    ],
    'REQ-STORAGE-17': [
      { kind: 'string', file: MIGRATIONS, includes: 'CREATE TABLE IF NOT EXISTS state' },
      { kind: 'symbol', file: 'src/storage/state/client.ts', name: 'getState' },
      { kind: 'symbol', file: 'src/storage/state/client.ts', name: 'putState' },
      { kind: 'symbol', file: 'src/storage/state/client.ts', name: 'claimState' },
      { kind: 'uses', file: 'src/agentHooks/sessionOffsets/client.ts', name: 'putState' },
      { kind: 'uses', file: 'src/contextLayer/service/client.ts', name: 'claimState' },
      { kind: 'uses', file: 'src/extensions/voiceClone/helpers/store.ts', name: 'putState' },
      { kind: 'uses', file: 'src/mcp/reload/client.ts', name: 'putState' },
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
    'REQ-STORAGE-11': noul('Does saveConversationRows commit in groups of about CONVERSATION_BATCH_MESSAGES messages instead of one transaction; does importOldLedgers write in inBatches of BACKFILL_BATCH lines with the imports row marked importing and its line count updated in each batch, resuming after that count; does migration 3 move no data; does migrate open a file whose user_version is above SCHEMA_VERSION without changes unless minReaderVersionOf is above SCHEMA_VERSION, when it throws SchemaTooNewError; does migration 11 store MIN_READER_VERSION in meta; and does the owner relay call sweepUntyped on its recheck timer?'),
    'REQ-STORAGE-12': noul('Do loadQueue and saveQueue read and write the queue document in the queues table through readQueueBody and writeQueueBody, keyed by queueName (the resolved path), raising its version on every save; does queueLog append to queueLog; does newQueueEvents read queueLog rows after the session cursor queueReader and move it to the latest seq; are additions, the run lock and nudges rows in queueIncoming, queueLocks and queueNudges; and does importQueueFile import a queue file with its log and incoming lines once, recording it in imports?'),
    'REQ-STORAGE-13': noul('Do startJob, appendProgress, finishJob, requestCancel, readJob, readProgress, listJobs and busyJob in src/mcp/jobs/client.ts read and write the jobs and jobLines tables (cancelRequested as a column, progress lines numbered per job) instead of files, does statusOf still read a running job with a dead pid as lost, and does importJobFiles import the old json, jsonl and cancel files once, recording it in imports?'),
    'REQ-STORAGE-14': noul('Do readTranscript and writeTranscript read and write the transcripts table keyed by the audio hash with the whole answer in body, do readLinks and linkMessages read and write transcriptLinks, and does importTranscriptFiles import the old transcript files and messages.json once, recording it in imports?'),
    'REQ-STORAGE-15': noul('Do appendStageLog, readStageLog, pruneRuns, addRating and readRatings write and read records rows (kinds stageLog, prunedRun, memeRating) through appendRecord and readRecords, importing each old file once with importRecordFile, and does logTiming insert each hook timing into spans with tool hook:<event>:<provider> instead of appending to timings.jsonl?'),
    'REQ-STORAGE-16': noul('Does checkOneDatabase count appendFileSync and writeFileSync in every tracked non-test ts and mjs file under src, scripts and bin, fail when a file not in ALLOWED writes or a listed file writes more than its count, with no notMovedYet kind for shared state, and name a listed file that no longer writes; is it run by lefthook and bun run check; and does retirePendingFile append any pending.jsonl row not already in events and then rename the file to pending.jsonl.imported, keeping a file with an unreadable line?'),
    'REQ-STORAGE-17': noul('Is there a state table keyed by scope and key, written only through putState, claimState, deleteState and pruneState in src/storage/state/client.ts; do the page-state and engines hooks (src/agentHooks/answers/client.ts, scripts/hooks/engines.ts, scripts/hooks/pageState.ts), the session offsets, the context service and its start claim, memeTaste readTaste and writeTaste, the voice clone store, the chat list cache, the MCP server stamp, the reload state and the voice passes read and write it instead of files; does getState import the old file at legacyFile only once, recorded in imports; and does writeSessionOffsets prune rows older than three days under its key prefix?'),
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
    'REQ-STORAGE-11': MET,
    'REQ-STORAGE-12': MET,
    'REQ-STORAGE-13': MET,
    'REQ-STORAGE-14': MET,
    'REQ-STORAGE-15': MET,
    'REQ-STORAGE-16': MET,
    'REQ-STORAGE-17': MET,
    unspecifiedBehavior: NOT_VIOLATED,
  },
}
