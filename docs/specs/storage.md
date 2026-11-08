---
title: "Storage"
---

# Storage

How log keeps what it reads and does: one SQLite database, `~/.logCli/log.db`, with every message entering as an event and the typed tables built from those events. The order of work and the reasons, from Designing Data-Intensive Applications, are in `docs/storageAgainstTheBook.md`. Issues #96 and #97.

## Time and identity of a message

### REQ-STORAGE-01: Every time is stored as integer milliseconds, normalised once

`msOf` (`src/storage/platform/helpers/time.ts`) turns every shape a platform or log has written (`…Z`, `…+00:00` with any number of fraction digits, epoch seconds or milliseconds, Slack's `1699999999.123456`) into UTC milliseconds, and gives null for anything else. `messages.sentAtMs`, `messages.receivedAtMs`, `interactions.atMs`, `chats.lastMessageAtMs`, `ledger.atMs`, `events.sourceAtMs` and `events.receivedAtMs` hold it, written where the row is written. `messageTimeOf` records in `timeSource` whether a message's time came from the platform or fell back to when log received it. Readers order a chat by `(sentAtMs, seq)` through `messagesByChatTime`, and a person by `messagesBySenderTime`. A catch-up keeps a message only when `afterGap` finds its instant later than the gap's start, never by comparing text.

Checked by: code and SubQ

### REQ-STORAGE-02: One stable key per message

A message's key is `platform:account:conversation:platformMessageId` (`messageKeyOf`), the same in `events.messageKey` and `messages.messageKey`. `events.messageKey` is unique where set (`eventsByMessageKey`), so the same message from the live watch, a catch-up and a read is stored once, and two different messages with the same time and text are kept apart. `eventIdOf` derives the event id from the key when there is one, and only a message with no platform id falls back to its instant (not its time text) plus its text. Every watcher's inbox message carries the platform's id (X Chat's event id, Discord's message id, Slack's ts, Instagram's item id), and both catch-ups pass it on. When a keyed message meets an older copy of itself stored without a key, `adoptUnkeyed` stores no second copy: it leaves the old event as it is and appends an `attachmentsSeen` event that gives the old copy's message its platform id and any attachments.

Checked by: code and SubQ

### REQ-STORAGE-03: Old rows are filled in batches that resume

Migration 6 only adds the columns and indexes. `runBackfill` (`src/storage/schema/helpers/backfill.ts`) fills old rows after every migrate, in transactions of `BACKFILL_BATCH` rows. The column being filled is its own progress mark, set in the same transaction, so a crash resumes at the next unfilled row and a finished backfill costs only its checks. Only the first event of a message keeps the key; later copies stay unkeyed.

Checked by: code and SubQ

## The events are the record

### REQ-STORAGE-04: Every typed row comes from an event

`insertEventRow` (`src/storage/platform/client.ts`) is the one way a row enters `events`, and it derives the typed rows (messages, attachments, chats, identities, memberships, interactions) from that event in the same transaction. `appendEvent`, the conversation import (`saveConversationRows`, `writeConversation`) and every read, catch-up and backfill go through it, so nothing writes a typed row without an event. A change is a new event, never an edit of an old one: attachments seen later are `attachmentsSeen` (`addToPayload`, `adoptUnkeyed`), a text a read finds changed is `messageEdited`, and a conversation's box and members are `conversationSeen`. Chats are read back from the typed tables (`chatMessages`), so what those events add is seen.

Checked by: code and SubQ

### REQ-STORAGE-05: Nothing a replay needs is cut or looked up again

A payload longer than `PAYLOAD_INLINE_LIMIT` is kept whole, gzip-compressed, in `blobs` (`putBlob`), with `events.rawHash` pointing at it, and a replay reads it back (`readBlob`, `eventInputOf`). The account's own id is written into `events.ownerId` when the event is appended, from a per-database tally of its conversation pairs (`notePairConversation`), so a replay never guesses it again. Each derived message and interaction records the `EXTENDER_VERSION` that made it.

Checked by: code and SubQ

### REQ-STORAGE-06: The typed tables can be rebuilt and verified from the events

`rebuildDerived` clears the typed tables and replays every event in `seq` order in one transaction. `verifyDerived` does the same on a scratch copy and compares each table's rows (`derivedFingerprint`) with the live ones. `log storage verify` and `log storage rebuild --apply` (MCP `storageVerify`, `storageRebuild`) run them. Before the first rebuild, the backfill gives every typed row with no event an `import` event carrying its original key (`eventsForTypedRows`), records any text changed in place as `messageEdited` (`editsForChangedText`), and types any event older code left untyped (`untypedEvents`, `events.typedAt`). The steps that read every row run once (`once`).

Checked by: code and SubQ

## Who is who

### REQ-STORAGE-07: People and accounts have stable ids, and names live in one place

`accounts (platform, account, userId)` holds each account's own real id, learned from its session check: `recordPlatformSession` and `recordTwitterSession` call `identifyAccount`, which appends an `accountIdentified` event once per id. Deriving it moves the account's own messages from `self:<account>` to that id, only in that account's chats (`rekeyIdentity`). `handleAliases (platform, handle, userId)` maps each handle, lower-cased, to the id behind it, from `identityLearned` events (`rememberPerson`, whenever an event carries both a sender id and a handle). Deriving one re-keys every row keyed by `@handle` (messages, memberships, interactions, identities) to the real id and logs it in `identityMerges`. Later messages from that handle are keyed by the id (`userIdOfHandle`). Reads (`storeRead`) keep the sender's id (`fromId`, `senderId` or `userId`) so ids are learned from every read and catch-up. A name is read through `identities` (`personOf`, `handleOfIdentity`, the join in `chatMessages`), and `people` is no longer read or written: its rows were imported once as `identityLearned` events (`peopleToAliases`). Every id is stored as text.

Checked by: code and SubQ

## One owner at a time

### REQ-STORAGE-08: A replaced owner's writes are refused by the database, not by its own good behaviour

When a watcher wins ownership (`claimWatcher`) it holds that generation as its fence (`holdFence`). Everything the owner itself writes (the events its push channel brings, its catch-up, its positions and gaps) runs inside its owner scope (`asOwner`, from `ownOrAttach`), and `appendEvent`, `recordPosition`, `openGap` and `markGap` check, in the same `BEGIN IMMEDIATE` as the write, that `owners` still names this process with that generation (`checkFence`). A replaced owner gets `OwnerFencedError` on every write after that. It raises one `ownerFenced` alert and writes nothing more. Writes the same process makes outside the owner scope (an ordinary read or send) aren't affected. A pid that refuses a liveness probe with EPERM counts as alive. An owner is stopped only after two stale readings at least `STALE_CONFIRM_MS` apart (`staleSeenAt`, cleared by any heartbeat). If its pid now belongs to a process with a different start time (`pidStartedAt`, `processStartedAt`), nothing is killed and `ownerPidReused` is alerted. A heartbeat that meets a busy database is retried rather than dropped.

Checked by: code and SubQ

### REQ-STORAGE-09: A gap is never closed over a newer drop

An account has at most one open gap (`gapsOneOpen`, a partial unique index; migration 9 closes any extra into the oldest). When the socket drops again while a gap is open, `openGap` raises its `drops` counter. The catch-up runner closes the gap only if `drops` is still what it was when the catch-up started (`markGap` with `expectDrops`). Otherwise the gap goes back to open, and the next run catches up again.

Checked by: code and SubQ

### REQ-STORAGE-10: Each part of a send is fenced by its claim

A send takes its chat's claim (`guardSend`), then a send lease inside the claim with an operation id of its own (`claims.sendingOp`). A second call in the same process that tries to send into that chat meanwhile is refused (`A SEND IS ALREADY GOING OUT`), though the session's earlier `inboxClaim` still counts as its own. Before each part, one transaction (`part`) checks that the claim still names this holder and generation, hasn't expired and still carries this operation id; renews it; and records an `intent` action with the operation id, part number and text hash. After the platform answers, `partSent` records the send the same way. A part whose claim was lost is held (`lost`, `chatClaimLost`). Before the first part, a message in that chat after the `seq` the voice gate read up to (`readUpTo`, taken just before the gate) stops the send (`movedOn`, `chatMovedOn`), naming what they wrote. A part whose text was intended by an earlier operation that never recorded its send, and whose echo is already in the chat as the account's own message, is not sent again (`alreadySent`, `echoedBefore`). The Discord, Slack, X DM, X queue, Instagram and voice-note sends all go through it.

Checked by: code and SubQ

## Short and compatible

### REQ-STORAGE-11: Bulk work is short and resumable, and old and new code share the file

Bulk writes commit in batches of about 1,000 rows. `saveConversationRows` groups conversations into transactions of `CONVERSATION_BATCH_MESSAGES` messages. `importOldLedgers` writes each old file in `inBatches` of `BACKFILL_BATCH` lines, recording how many lines it has done in `imports` in the same transaction (`importing`), so a crash resumes after them and nothing is imported twice. Migrations only change the schema: migration 3's data move is gone, and its work is done by the batched `untypedEvents` step. Migrations only add tables, columns and indexes. `meta.minReaderVersion` (`MIN_READER_VERSION`) says the oldest code that can read the file, and only a breaking migration raises it. Code meets a newer file by opening it as it is. It's refused (`SchemaTooNewError`) only when `minReaderVersionOf` is above its own version. Events that older code appended without typed rows are typed by `untypedEvents` on every open, and by each owner every `RECHECK_GAP_MS` (`sweepUntyped`, at most `SWEEP_LIMIT` at a time).

Checked by: code and SubQ

## The loose stores, moved in

### REQ-STORAGE-12: The X queues live in log.db

Each X queue is one document in `queues` (its JSON, its account and a version that rises with every save), keyed by its resolved path, so every command that names a queue by its file still finds it (`loadQueue`, `saveQueue`, through `readQueueBody` and `writeQueueBody`). What a run logs goes to `queueLog` (`queueLog`, `appendQueueLog`). The queue hook reads it with one cursor per Claude session (`queue:<session>`, `queueReader`) and shows the queue by its short name (`queueLabel`). Items added during a run are `queueIncoming` rows taken in one transaction. The run lock is a row in `queueLocks` that is taken over when its pid has died (`takeQueueLock`, `queueLockHolder`, `clearDeadQueueLockRows`), and a nudge is a row in `queueNudges`. A queue file already on disk is imported once with its `.log` and `.incoming.jsonl` (`importQueueFile`, `importQueueFiles`) and isn't read again. `queue build` refuses to overwrite a queue that is in the store or on disk.

Checked by: code and SubQ

### REQ-STORAGE-13: The MCP jobs live in log.db

A long MCP call that comes back as a job is a row in `jobs` (its tool, arguments, account, pid, status, result and whether a cancel was asked for), and its progress lines are rows in `jobLines` numbered from 0. `startJob`, `appendProgress`, `finishJob`, `requestCancel`, `readJob`, `readProgress`, `listJobs` and `busyJob` read and write them in transactions (`src/mcp/jobs/client.ts`), replacing the `.json`, `.jsonl` and `.cancel` files in `~/.logCli/mcp/jobs`. A job whose pid is gone still reads as lost. The old files are imported once (`importJobFiles`), and a cancel file becomes `cancelRequested`.

Checked by: code and SubQ

### REQ-STORAGE-14: Transcripts live in log.db

Every voice-note transcript is a row in `transcripts`, keyed by the sha256 of its audio, with its text, length and whole answer (`body`). Which message each one belongs to is a row in `transcriptLinks`. `readTranscript`, `writeTranscript`, `readLinks` and `linkMessages` (`src/media/voiceNotes/helpers/store.ts`) read and write them, so search, the voice gate and profiles find voice notes beside the events. The old `~/.logCli/transcripts` files and their `messages.json` are imported once (`importTranscriptFiles`).

Checked by: code and SubQ

### REQ-STORAGE-15: The small logs are records, and hook timings are spans

The Facebook warm-up's stage log, each run prune and each meme rating are rows in `records`, with a kind (`stageLog`, `prunedRun`, `memeRating`), a key (the account, the run) and the body (`appendRecord`, `readRecords`, `src/storage/records`). `appendStageLog`, `readStageLog`, `pruneRuns`, `addRating` and `readRatings` go through it, and each old file is imported once (`importRecordFile`). Every context-layer hook timing (`logTiming`) is a span in `spans`, tool `hook:<event>:<provider>`, so `log timing` reports hook costs beside tool calls instead of in `timings.jsonl`.

Checked by: code and SubQ

### REQ-STORAGE-16: Nothing new writes shared state outside log.db

`bun run check:oneDatabase` (`scripts/checks/checkOneDatabase.ts`, lefthook pre-commit and pre-push, and `bun run check`) counts every `appendFileSync` and `writeFileSync` in log's own tracked code, leaving out tests and vendored libraries. A file that writes to disk must be in `ALLOWED` with how many writes it has and a kind from `WHY`: inside the repo, a capture, a dataset or export, an index, media, a log people watch, or a private session file; there is no kind for shared state, so none can be listed. A new writer, or more writes in a listed one, fails the commit, and a listed file that no longer writes is named so it is dropped. The old `inbox/pending.jsonl` is retired (`retirePendingFile`): any row not already in `events` is appended, and then the file is renamed `pending.jsonl.imported`, not deleted. A file with an unreadable line is left where it is.

Checked by: code and SubQ

### REQ-STORAGE-17: The small shared state is keyed rows in log.db

Every small piece of shared state is a row in `state`, keyed by scope and key, with its value and when it changed (`getState`, `putState`, `deleteState`, `claimState`, `pruneState`, `src/storage/state`, migration 16). That covers the page-state hook's memory (`hookMemory`), the engines hook's last answer (`lastHook`), each Claude session's hook offsets (`hookOffsets`, rows older than 3 days pruned), the context service's address (`contextService`) and its start claim (`contextServiceStarting`, held for its grace), matt's meme taste (`memeTaste`), the voice clones (`voiceClone`), each account's chat list cache (`chatList`), the MCP server's code stamp (`mcpServerStart`) and the reload proxy's state (`mcpReload`), and recent voice-gate passes (`voicePasses`). Each row is keyed by the path the old file had (the chat list by platform and account), so tests and moved folders stay apart, and that old file is imported once on first read (`legacyFile`, recorded in `imports`), never again after.

Checked by: code and SubQ
