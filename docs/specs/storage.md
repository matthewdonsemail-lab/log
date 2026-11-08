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
