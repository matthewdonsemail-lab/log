# How log reads its data: where JSON fits, time series, locality, cache and atomicity

matt, 2026-11-08: the tables have to be flexible without losing a correct schema, time-series events have to fit SQLite even though it isn't built for them, and a tool call's context has to arrive whole, in the right order, atomically and fast, with as few disk reads as possible. This page works that out from *Designing Data-Intensive Applications* (Kleppmann) and from measurements on a copy of the real `log.db` (2026-11-08: 120,375 messages, 5,034 events, SQLite 3.53.2, 4 KB pages). It builds on `docs/storageAgainstTheBook.md`.

## What a tool call actually waits for

The book says to measure response time where the caller sees it, queueing and all (ch. 1, "Describing Performance"). So the first thing measured was the whole call, not just the query.

| Step, in a fresh process (how every hook runs today) | Time |
| --- | --- |
| Start Bun and load the store module, open `log.db`, check its schema | about 280 to 300 ms |
| A whole fresh process that opens `log.db` and reads one chat | about 390 to 500 ms |
| The query itself: the last 100 messages of the busiest live chat | 0.6 to 0.9 ms the first time, 0.3 to 0.5 ms after |

So today a hook spends over 99% of its time starting up, and under 1% reading data. The query matters as the data grows and as one call fans out into many reads (a send makes about 20), but the first saving is not starting a process at all. The context layer already does this for routing (rule 159: one warm service on `127.0.0.1:47317`, reached with one curl). The same service, or the MCP server that is already running, should answer every hook's data question, so the database is open, its pages are in memory and its statements are prepared before the hook asks.

## A hybrid model: typed columns where they are queried, JSON where the platform decides

### What the book says

- A schema-on-read document (JSON) fits data whose structure is set by outside systems you don't control and that may change at any time, or data with many kinds of objects that don't each deserve a table. Where all records share a structure, a schema documents and enforces it (ch. 2, "Schema flexibility in the document model").
- The book's view is that relational and document models complement each other, and that a hybrid of the two is the right route (ch. 2, "Convergence of document and relational databases").
- A schemaless field still has a schema: the code that reads it assumes one. It just isn't enforced (same section).
- Binary encodings are more compact and faster to read than textual JSON (ch. 4, "Binary encoding").

### The rule for log

Every field is one of three things:

1. **A typed column**, if any query filters, joins, sorts or groups on it, if an index needs it, if a machine's state lives in it, or if every platform has it. Examples: who sent a message, when, in which chat, its text, whether it's ours, what it replies to.
2. **The row's `extra` column (JSONB)**, if only one platform has it and nothing queries it. It is shown, passed to SubQ or kept for later, but never searched on. It is written once, with the row, and never edited, so the book's warning about rewriting a growing document doesn't apply.
3. **The raw answer**, kept whole in `blobs` under `rawHash`, for rule one (reading the internal API). Nothing reads it in a normal path; derivation reads it when a row is rebuilt.

`extra` is stored as SQLite JSONB (SQLite 3.53 has it), the binary form, so reading a field doesn't reparse text. A `CHECK (extra IS NULL OR json_valid(extra, 8))` keeps it valid.

When a field in `extra` starts being queried, it is promoted without moving any data: `ALTER TABLE … ADD COLUMN x … GENERATED ALWAYS AS (extra ->> '$.x') VIRTUAL`, then an index on it. That is the bridge between flexible and correct. The field becomes queryable and indexed the moment a query needs it, and the old rows don't have to be rewritten.

### What goes where, platform by platform

From the payloads in `log.db` today:

| Table | Typed for every platform | `extra`, per platform |
| --- | --- | --- |
| `messages` | chat, sender id, from us or not, sent time, text, replies to, platform message id | Discord: message flags (a voice message is 8192), embeds, bot, mentions us, replies to us. Slack: subtype, thread reply count. X: box (X Chat or old DMs), unopened state. Instagram: item kind (`xma_clip`, `voice_media`), thread title |
| `attachments` | kind (image, gif, video, audio, file, link), name, content type, `blobHash`, length, description, transcript | Discord: waveform. Images and video: width, height |
| `interactions` | kind, who did it, to whom, on what, when | X: follows you, you follow them, their follower count, the post's link |
| `identities` | platform, user id, handle, display name | bio, follower count, verified, picture link. LinkedIn: headline, positions, schools |
| `chats` | platform, account, conversation, kind, server | Discord: server name, channel topic. Slack: workspace name |

LinkedIn's profile is the book's own example (ch. 2, "The Object-Relational Mismatch"). A résumé is a tree of positions and schools that is read whole, so it fits a document. The moment positions are linked to companies across people, that part becomes many-to-one and gets its own table.

### What stays out of JSON

`events.payload` is JSON text today, and the typed rows are guessed from it with chains of fallback key names. Each platform's extender should read its own platform's answer by name and fail loudly when a field it needs is missing (ch. 4, schemas as documentation). JSON is never where a shared field lives.

## Time series in SQLite

### What is time series in log

These are append-only, ordered by time, read by key plus a time range, and summarised:
- `events` (the push channel), `interactions` (likes, follows, replies), `spans` (timings), `ledger` (money, launches, captchas) and `media` status.
- The X live feed, once it moves into `events`.

### What SQLite can't do for them (its limits, plainly)

- **It stores rows, not columns** (ch. 3, "Column-Oriented Storage"). A query that summarises one number across a month still reads every whole row. There's no column compression.
- **It has no time partitions** (ch. 6, "Partitioning by Key Range"). Dropping last month means deleting rows one by one and leaving free pages, not dropping a file.
- **One writer at a time** (ch. 7, "Actual Serial Execution"). Every insert waits for the lock, so a long write delays everyone.
- **JSON is parsed when it's read**, so time or ids kept inside JSON can't be range-scanned. They have to be typed columns.

### What does work, and what log does

- **Integer time.** UTC milliseconds in an `INTEGER` column, never text (`storageAgainstTheBook.md` item 1).
- **Cluster each series by its key, then time.** A series table is `WITHOUT ROWID` with `PRIMARY KEY (seriesKey, atMs, seq)`. A range read, such as one account's interactions this week or one tool's spans today, is then one contiguous run of pages. This is the book's sensor example: keys kept in sorted order make range scans easy (ch. 6, "Partitioning by Key Range"; ch. 3, "Storing values within the index").
- **Summaries are materialised on write** (ch. 3, "Aggregation: Data Cubes and Materialized Views").
  - `spanRollups` holds one histogram per tool and stage per 10 minutes.
  - `ledgerRollups` holds totals per kind, account and day.
  - `interactionCounts` holds per person and kind per day.

  Each is updated in the same transaction as the row it counts, so reports read a few rows instead of scanning. Histograms are added, never averaged (ch. 1).
- **Retention by time range, in batches.** Delete one hour or one day at a time in short transactions. `auto_vacuum = INCREMENTAL` gives the space back.
- **Keep series off the hot path.** Spans and rollups are written in their own short transactions after the call has answered, so timing a call never slows the call.

## Data locality: one tool call, one place on disk

### What the book says

- A document is stored as one continuous string, so when you need most of it at once there's a speed advantage: one read instead of several index lookups and seeks. The advantage only holds if you need large parts of it at the same time and the document stays small (ch. 2, "Data locality for queries").
- Grouping related data together is not only for documents. Relational databases get the same locality by storing child rows inside their parent's key range (Spanner's interleaved tables), and a clustered index stores the row inside the index itself (same section; ch. 3, "Storing values within the index").
- A materialised view is a precomputed copy kept up to date as the data changes (ch. 3; ch. 11, "Maintaining materialized views").

### Measured: how scattered a tool call's data is today

`messages` is a rowid table, so rows sit in the order they arrived, like the book's heap file. A chat's messages are mixed in with every other chat that was active at the same time. Counting 4 KB pages per read, from `dbstat` (11.8 messages fit on a page):

| Read | Pages today (p50 / p95 / max) | Pages if stored by chat, then time |
| --- | --- | --- |
| Last 100 messages of a chat | 9 / 16 / 21 | 7 / 9 / 9 |
| Same, chats with live traffic | 13 / 19 / 21 | 7 / 9 / 9 |
| Last 200 things one person said | 16 / 61 / 75 | 7 / 17 / 17 |

The index lookups come on top of these: `messagesByChat` alone is 3,224 pages. The message key averages 80 bytes, because it spells out the platform, account and chat in full, and every index repeats it.

### The design: normalised to record, a document to read

This is the opposite of how the data is stored, on purpose. The system of record stays normalised and derived from `events`. The read side gets a document per thing a tool call reads.

1. **Small keys.** `chats` gets an integer `chatNo`. Messages, attachments and memberships key on `chatNo` instead of the 80-byte text, so every index shrinks and more of each index fits on a page.
2. **Messages stored by chat.** `messages` becomes `WITHOUT ROWID` with `PRIMARY KEY (chatNo, sentAtMs, messageNo)`. Rows average about 340 bytes, small enough to cluster. A chat's history is then one contiguous run. The sender index refers to that key, as InnoDB's secondary indexes refer to the primary key (ch. 3).
3. **Attachments next to their message.** `attachments` is keyed `(chatNo, sentAtMs, messageNo, n)`, so it sorts right beside its message. Its description (from the media describer) and transcript (from AssemblyAI) are columns on it, not files. The bytes live in `blobs` by hash.
4. **A context document per chat.** `chatContext (chatNo, uptoSeq, body JSONB, builtAtMs)` holds what a send and the voice gate read about a chat:
   - the last messages (up to 50 or about 8 KB), each media item already written as text ("[image: …]", "(voice note: "…")");
   - who is in the chat, named, never as ids (rule 154);
   - who spoke last, and what has happened since our last message.

   It is rebuilt in the same transaction as each event for that chat, so it's never stale. It's derived from `events`, so it can always be rebuilt. It stays small, as the book says documents must.
5. **A context document per person** (`personContext`, with #95): their identities, recent messages across platforms, and what they did on our posts. It's built the same way.

A hook or the voice gate then reads one row, one or two pages, instead of 13 to 75 pages over five tables. The book's caveat is kept: the document holds only what is read together, nothing more, and anything else is still a normal indexed query.

## Cache: keep the hot pages in memory, without depending on it

### What the book says

A disk-based database may never touch the disk if there's enough memory, because the operating system keeps recently used blocks in memory. An in-memory database is faster mainly because it skips turning in-memory structures into the on-disk format, not because it skips the disk (ch. 3, "Keeping everything in memory").

### Today

- Each connection has SQLite's default page cache, 2 MB (`cache_size = -2000`). Memory mapping is off (`mmap_size = 0`).
- Every hook is a new process with an empty cache, so it rereads pages the operating system has cached and pays roughly 300 ms of startup before it even asks.
- `loadConversations` builds the whole store as JavaScript objects and caches that per process. That's the in-memory shape the book describes, but rebuilt in each process.

### The design

- **Long-lived processes hold the database open and warm.** That means the MCP server, the account owners and the context service. They set `mmap_size` (256 MB, more than the whole file), so reads come straight from the operating system's cache without a copy, and `cache_size` around 64 MB.
- **Hooks never open `log.db`.** They ask the context service over localhost, which answers from a warm connection. Its answer is already the `chatContext` document, so there's no encoding work either.
- **Prepared statements are reused** for every hot query.
- **A memory cache is keyed by `uptoSeq`.** The context service may keep the last few `chatContext` bodies in memory. Each is valid while its `uptoSeq` is the latest event for that chat, checked by one indexed lookup, so it can't serve stale data across processes.
- **Disk reads are measured.** `benchStorage.ts` reports pages touched for every read path (from `dbstat`, as above), next to its p50, p95, p99 and p99.9.

## Atomicity: a tool call sees one moment, and the stream arrives in order

### What the book says

- Reading several things in separate statements while writes go on can mix two moments (read skew). Reading them inside one snapshot gives one consistent view (ch. 7, "Snapshot Isolation and Repeatable Read").
- A derived view, such as a cache or an index, has to be updated in step with the data it comes from, or readers see a mix (ch. 11, "Keeping Systems in Sync").

### The design

- **Write.** One `BEGIN IMMEDIATE` covers:
  - the event and its typed rows;
  - its `chatContext` rebuild and its rollups;
  - the owner's generation check (`storageAgainstTheBook.md` item 4).

  Either all of it lands or none of it does. Bulk work runs in batches of about 1,000 rows so no transaction is long.
- **Read.** A tool call that needs several things (the account's catch-up state, the chat's context, its claim, the person's context) reads them inside one read transaction (`BEGIN` … `COMMIT`). With WAL, that snapshot never blocks a writer and a writer never blocks it.
- **Order.** Inside `log.db`, `seq` is the order. `chatContext.uptoSeq` says how far a context reaches. Just before a send, if any event for that chat has a higher `seq` than the context the draft was written from, the send is held. This is the same check as `stillHeld`, applied to what the draft knew.
- **The stream.** Every source (the watch, the catch-up, history reads, imports) appends to `events` first, with one stable key per message (`storageAgainstTheBook.md` items 2 and 7). Typed rows and context documents come only from there, so every reader sees the same order.

## Targets, measured at the caller

| Path | p99 | p99.9 | Pages touched |
| --- | --- | --- | --- |
| A hook's data question, end to end (through the warm service) | ≤ 30 ms | ≤ 60 ms | 1 to 3 |
| A chat's context (`chatContext`, one row) | ≤ 1 ms | ≤ 2 ms | 1 to 2 |
| A send's storage reads, all of them together | ≤ 20 ms | ≤ 50 ms | ≤ 20 |
| Appending one event with its typed rows, context and rollups | ≤ 5 ms | ≤ 15 ms | |
| A day's `log timing` report (from rollups) | ≤ 20 ms | | |

Each is measured on the 500,000-message benchmark while owner processes write at their peak rate, with at least 10,000 samples per path. The sample count is shown beside every percentile.

## Order of work (added to `storageAgainstTheBook.md`)

1. The warm service answers hooks' data questions, with `mmap_size`, a larger cache and prepared statements. This is the largest saving, and it doesn't wait on the schema.
2. Integer `chatNo` and integer time; messages and attachments stored by chat, then time.
3. `extra` JSONB columns per table, and the generated-column way to promote a field.
4. `chatContext`, rebuilt in the event's transaction; reads in one snapshot; the `uptoSeq` check before a send.
5. Time-series tables clustered by key and time, rollups written on insert, retention by range.
6. `personContext` with #95.
