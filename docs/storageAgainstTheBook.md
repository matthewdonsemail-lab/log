# Storage against the book: what Designing Data-Intensive Applications says about the unifyStorage work

matt, 2026-11-08: the book (Kleppmann, *Designing Data-Intensive Applications*) is the basis for log's data modelling from here on. This page checks what the `unifyStorage` branch has built so far (#96, #97, PR #98) against it. For each point it gives the book's section, what log does today, and what has to change. Chapters 1 to 4, 7 and 11 to 12 were read in full; chapters 8 and 9 for what applies to several processes sharing one machine.

`docs/unifyStorage.md` is the plan. This page is the correction to it.

## What is already right

- **One SQLite database on one machine** (ch. 1, "Approaches for Coping with Load"): the book's advice is to keep the database on a single node until scale forces otherwise. log's load is nowhere near that.
- **One writer at a time** (ch. 7, "Actual Serial Execution"): WAL with `BEGIN IMMEDIATE` makes every write transaction serializable.
- **Immutable content kept by its hash** (ch. 11, "Advantages of immutable events"; ch. 3, log-structured storage): the planned `blobs` store fits.
- **Cursors as consumer offsets** (ch. 11, "Consumer offsets"): each reader keeps its own position in `events`.
- **Claims are taken in one transaction** (ch. 7, "Materializing conflicts"): read and write of a claim happen together.
- **Refusing to send while behind** (ch. 12, "Timeliness and Integrity"): integrity comes before speed, as the book says it should.

## What has to change before #98 merges

### 1. Time is stored as text from three clocks

*Book:* an index only helps if its sort order is the order you mean (ch. 3, "SSTables and LSM-Trees", "Multi-column indexes"). Wall clocks from different sources can't order events (ch. 8, "Timestamps for ordering events"). Event time and processing time are different things (ch. 11, "Reasoning About Time").

*Today:* `messages.sentAt`, `interactions.at`, `chats.lastMessageAt` and `ledger.at` are ISO text in mixed shapes (`…Z` and `…213000+00:00` both appear in `log.db`). `sentAt` quietly falls back to the time log received the event. Catch-up filters with a text compare (`m.at > gap.fromAt`).

*Change:*
- Store `sentAtMs`, `receivedAtMs` and `atMs` as UTC milliseconds (`INTEGER NOT NULL`), normalised once at the boundary. The raw string stays in the raw payload.
- Add `timeSource` (`platform` or `received`) so a fallback is visible.
- Order by `(sentAtMs, seq)`. Inside the database, `seq` decides order; across platforms, the platform's own ids do.
- Indexes become `messagesByChat (chatId, sentAtMs, seq)` and `messagesBySender (senderPlatform, senderUserId, sentAtMs, seq)`.

### 2. The typed tables have to be derived from the log, and only from it

*Book:* the event log is the system of record and every other table is derived from it, so any table can be rebuilt by replaying the log (ch. 11, "State, Streams, and Immutability"; ch. 12, "Application code as a derivation function"). Events are never changed in place (ch. 11, "Advantages of immutable events").

*Today:*
- Full reads and the conversation import write `messages`, `chats`, `identities` and `memberships` directly, with no `events` row, and then `UPDATE messages.text` in place.
- `addToPayload` patches a stored event with `json_patch`.
- `appendEvent` cuts the payload at 20,000 characters. A cut payload is no longer valid JSON, so deriving from it silently gets `{}`.
- Deriving depends on things outside the log: a per-process guess of the account's own id, and reads of `inboxSync.json`.
- Migration 3 only adds rows, so a bad row is never corrected.

*Change:*
- Every read, catch-up, backfill and import appends to `events` first (`source` = `read`, `catchUp`, `backfill`, `import`). Typed rows come only from deriving events.
- A change is a new event (`messageEdited`, `attachmentsSeen`), never an edit of an old one.
- The full raw answer is kept, compressed in `blobs` (`rawHash`), never cut.
- Anything looked up (a handle, the account's own id) is written into the event when it is appended, so replaying never reads files or caches.
- `log storage rebuild` clears the typed tables and replays `events` in `seq` order. `log storage verify` replays into a scratch database and compares counts and row hashes with the live tables. CI runs it on a fixture.
- Each derived row records the `extenderVersion` that made it, so rows from an older extender can be re-derived.

### 3. Identities need stable ids, not names

*Book:* store an id that means nothing to people and never changes, and keep the name in one place (ch. 2, "Many-to-One and Many-to-Many Relationships").

*Today:* where a platform gives no id, the person is keyed by their handle (`@deepman`). One person can become two rows (`@deepman` and `12345`), and a renamed handle splits them for good. The account's own messages are keyed `self:<account>` or by a guessed id. The name is copied into `messages.senderLabel`, `events.withWho` and others. `people` and `identities` hold the same fact twice.

*Change:*
- `accounts (platform, account, userId)` holds each account's own real id, written when its session starts.
- `handleAliases (platform, handle, userId, firstSeenAt, lastSeenAt)`. A sender seen only by handle gets a `pending:` id until the real id is known. When it is learned, its rows are re-keyed in one transaction and the merge is logged in `identityMerges`.
- Names are read through a join on `identities`, not copied into every row.
- `people` is retired.
- Every id is stored as text (X ids are larger than JSON numbers can hold exactly).

### 4. The owner's generation number has to fence every write

*Book:* a process that held a lease can pause (garbage collection, a sleeping laptop) and wake up still believing it holds it. The storage has to refuse a write that carries an old token, rather than trusting the writer to check (ch. 8, "Process Pauses", "Fencing tokens").

*Today:* each new owner raises `owners.generation`, but `appendEvent`, `recordPosition`, `openGap` and `markGap` never check it, so an owner that has been replaced keeps writing. A process is judged dead on any error, including permission errors. On Windows a reused pid can look alive. After the laptop sleeps, every heartbeat is stale and the first hook can kill a healthy owner.

*Change:*
- Every owner write runs inside `BEGIN IMMEDIATE` together with `SELECT generation FROM owners`. On a mismatch it rolls back and the process exits.
- Store the process start time with the pid. Treat a permission error as alive. Require two stale readings 10 s apart before killing an owner.
- Retry the heartbeat on `SQLITE_BUSY` instead of letting one busy database stop the owner.

### 5. Chat claims have to fence each part of a send

*Book:* the same fencing rule (ch. 8), and decisions made on a read outside the transaction that acts on them (ch. 7, "Write Skew and Phantoms").

*Today:* taking a claim is correct, but `stillHeld` is a plain read before the send. The holder is the bare pid, so two calls inside one MCP server look like the same holder. Only Discord and Slack check `stillHeld`; X DMs, the X queue and Instagram don't, though rule 134 says every send does.

*Change:*
- Holder = pid + process start time + a random id per call.
- Each part of a send: one transaction checks holder, generation and expiry, renews the claim and writes an `intent` action with an operation id. Then send. Then record `sent` under the same check.
- The operation id is matched against the account's own echo, so a retry after a crash can tell the message already went out (ch. 12, "Operation identifiers").
- Just before a send, refuse if any event for that chat landed after the `seq` the voice gate read up to.

### 6. A gap can be closed over a newer drop

*Book:* lost updates and phantoms when a check and an insert are separate (ch. 7, "Preventing Lost Updates", "Write Skew and Phantoms").

*Today:* `openGap` checks, then inserts, outside a transaction. If the socket drops again during a catch-up, the existing gap is returned, and `markGap(closed)` then closes it, so the messages from the second drop are lost and the account reads as current.

*Change:* a partial unique index on `gaps (platform, account)` for open statuses, a `drops` counter that `openGap` raises, and closing with compare-and-set (`WHERE id = ? AND status = 'catchingUp' AND drops = ?`). If nothing changed, catch up again.

### 7. One stable key per message

*Book:* a retried append has to be recognised by an id that means the same thing end to end (ch. 11, "Idempotence"; ch. 12, "The end-to-end argument").

*Today:* `eventIdOf` hashes the time text and the message text, which differ between the watch, the catch-up and a read (time formats, the `(audio: …)` label). So one message can get several ids. Two different messages with the same time and text collide.

*Change:* the key is `platform:account:conversation:platformMessageId`, unique in `events`. Only a message with no platform id falls back to normalised time plus raw text.

### 8. Transactions have to be short

*Book:* serial execution only works if every transaction is short (ch. 7, "Actual Serial Execution").

*Today:* migration 3, `typeAllEvents`, the conversation import (20 s on the real data) and `saveConversationRows` hold the write lock for their whole run, longer than the 5 s every other writer waits. Imports write row by row and mark themselves done afterwards, so a crash in between imports twice.

*Change:* bulk work runs in batches of about 1,000 rows, each batch with its progress mark in the same transaction, resumable from that mark. Migrations only change the schema; moving data is a resumable job, not part of the migration.

### 9. Old code and new code share the file

*Book:* while processes on different versions share a database, new code must read old data and old code must read new data. Only additive, defaulted changes keep both working, and data outlives code (ch. 4, "Dataflow Through Databases", "Modes of Dataflow").

*Today:* any database newer than the code is refused (`schemaTooNew`), though every change so far only adds tables and nullable columns. The other way round is worse: watchers still running older code append events without typed rows, and nothing ever types them.

*Change:*
- A `meta` table with `minReaderVersion`. Only a breaking migration raises it, and code is refused only below it.
- Migrations only add. New columns are nullable or defaulted. Nothing is renamed, retyped or dropped in place.
- `events.typedAt`, plus a paced background sweep that derives every event where it is null.
- Data migrations are frozen copies, not calls into live code that keeps changing.

## Performance: how it is measured and what it must meet

### 10. Measure response time as a distribution, at the caller, with its tail

*Book (ch. 1, "Describing Performance", "Percentiles in Practice"):*
- Response time is a distribution. Report percentiles, not the mean: p50, p95, p99 and p99.9.
- Measure what the caller waits for, queueing included, not only the work itself.
- When one request needs several calls, it waits for the slowest, so a rare slow call becomes common (tail latency amplification).
- Percentiles over a rolling window are kept with histograms (HdrHistogram, t-digest). Percentiles are never averaged; histograms are added.
- A load test sends at fixed times whatever the answers, or it hides queueing.

*Today:*
- `log timing` reports p50, p95 and p99. There is no p99.9, no window, and no count of how many samples a percentile rests on.
- `benchStorage.ts` measures only the old `events` table. Its "whole store" figure is one sample. The chat read has 600 samples, so its p99 rests on 6 values and p99.9 can't be computed.
- The numbers in PR #98 were 300 serial queries from one process with nothing else writing, so lock waits never showed.
- Targets were set per read, not per call.

*Change:*
- `log timing` adds p99.9 and shows `n` beside every percentile, refusing a percentile with too few samples behind it (p99 needs at least 1,000, p99.9 at least 10,000).
- `spanRollups (tool, stage, windowStartMs, histogram BLOB)`: HdrHistogram buckets per 10 minutes, added together for any longer window, never averaged.
- Lock wait (`SQLITE_BUSY`) is its own span.
- `benchStorage.ts` seeds a scratch database at 500,000 messages and 50,000 identities with skewed chat sizes, takes at least 10,000 samples per read path, and runs each path while owner processes append at their measured peak, sending at fixed times.
- Targets are set per call. A send makes about 20 storage reads; for 1 call in 100 to wait on a slow read, each read has to meet its target at p99.9, not p99. The send's whole storage time is held to p99 ≤ 50 ms.
- Reads that cover a whole person (every identity linked to them) are one query with `IN` or a join, not one query per identity.

### 11. Describe the load

*Book:* name the few numbers that drive the load, skew included, before talking about growth (ch. 1, "Describing Load").

*Change:* `log storage load` reports, from the spans and the database:
- writer processes at once, and events per second per owner (live, and at backfill peak);
- write transaction length at p99, and lock waits;
- reads per write for each tool;
- messages per chat (p99 and max) and identities per person.

### 12. Indexes follow the queries

*Book:* every index costs a write on every insert; keep the ones a query uses (ch. 3, "Comparing B-Trees and LSM-Trees", "Other Indexing Structures").

*Today and change:*
- `messagesBySentAt` serves no query: drop it.
- `chats` has `chatId` and a `UNIQUE (platform, account, conversationId)` that say the same thing: keep one.
- `events` uses `AUTOINCREMENT`, which costs a write per insert for nothing: a plain rowid does.
- The full-text index stores each text a third time: make it external-content over `messages`.
- `ledgerRows` filters by kind and account and sorts by `seq`: add `(kind, account, seq)`.
- `chatEvents` and `ownTextsSince` filter by platform, account, type and time: add `(platform, account, type, receivedAtMs)`.

### 13. Online reads fetch rows by key; full scans are batch jobs

*Book:* online paths read a few rows through an index; scanning everything belongs to batch and analytics (ch. 3, "Transaction Processing or Analytics?"; ch. 2, "Data locality for queries").

*Today:* `loadConversations` reads every message, attachment and membership and rebuilds them in memory. Its account filter only applies to chats. Its cache check counts every row.

*Change:* the full scan is kept only for building the search index, as a streaming read filtered by account. The voice gate and every other per-chat or per-person reader use indexed queries. The cache is keyed on a `dataVersion` counter raised inside each write transaction.

### 14. Analytics read rollups, not the live tables

*Book:* reports aggregate precomputed data instead of competing with live writes (ch. 3, "Aggregation: Data Cubes and Materialized Views").

*Change:* `log timing` reads `spanRollups` and only the columns it needs from `spans`. Old spans are deleted in batches.

## The person model for #95

### 15. One person across platforms is many-to-many

*Book:* once data is interconnected, relationships need references and joins (ch. 2, "Many-to-One and Many-to-Many Relationships"). A property graph is a vertices table and an edges table indexed both ways, and recursive queries walk it (ch. 2, "Property Graphs", "Graph Queries in SQL").

*Today:* `identities.personId` is one column, with no evidence, confidence, record of who linked it, or way to undo a link. `interactions` has no target person. A group seen by two accounts is two rooms.

*Change:*
- `persons (personId, displayName, createdAt)`.
- `identityLinks (personId, platform, userId, evidence, confidence, linkedBy, atMs, revokedAtMs)`, indexed by person and by identity. A person's identities are the links that haven't been revoked.
- `rooms (platform, platformRoomId)`, with each account's view of a room pointing at it.
- `interactions.targetUserId`.
- An `edges` view over messages, interactions and memberships. The relationship router queries it with `WITH RECURSIVE`. SQLite is enough at this size; a graph database isn't needed.

## Storage details

### 16. Blobs and vectors

*Book:* clustering stores the whole row in the index, which only pays for small rows (ch. 3, "Storing values within the index"). Deleting from immutable storage needs compaction (ch. 3, "SSTables and LSM-Trees"). An encoding that can change needs its version stored with it (ch. 4, Avro's writer's schema).

*Change:*
- `blobs` keeps its metadata `WITHOUT ROWID`, and the bytes go in rowid `blobChunks` of 256 KB to 1 MB. Hashes are stored as 32-byte BLOBs.
- `auto_vacuum = INCREMENTAL` with a scheduled `incremental_vacuum` is the compaction step. The WAL is size-limited.
- The SHA-256 is checked on every read.
- int8 vectors carry a format byte (scale, byte order, version).

### 17. The X live feed becomes events

*Book:* readers follow a log by offset; the log, not a file of its own, is what they follow (ch. 11, "Consumer offsets"; ch. 12, "Pushing state changes to clients").

*Today:* `live.jsonl` is read by byte offset per session, but the offset is taken in bytes and applied in characters, so an emoji or a non-English name skips or repeats events. A half-written line is skipped and lost. Agents are told to `tail -F` the file.

*Change:* the badge poll appends `badge`, `notification` and `pollRefused` to `events` in the owner's transaction. Each hook session reads with a cursor. `log inbox follow --after <seq>` streams new events over the owner's relay (rule 132), and replaces `tail -F`. `live.jsonl` and `.hookSessions` are retired.

## Order of work

1. Time as integer milliseconds, and the stable message key (items 1, 7).
2. Everything enters through `events`; typed tables are derived only; rebuild and verify (item 2).
3. Accounts, handle aliases and identity merges (item 3).
4. Fencing for owners and claims, and the gap fix (items 4, 5, 6).
5. Short, resumable bulk work and compatible migrations (items 8, 9).
6. Measurement: p99.9, histograms, the 500,000-row benchmark under concurrent writes, per-call budgets, the load report (items 10, 11, 14).
7. Indexes and indexed readers (items 12, 13).
8. The X live feed as events (item 17).
9. The person model for #95 (item 15), then blobs and vectors (item 16).

Each step is measured before and after with the benchmark from step 6 (built first if a step needs its numbers), and lands as its own commit naming #96 or #97.
