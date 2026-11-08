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

A message's key is `platform:account:conversation:platformMessageId` (`messageKeyOf`), the same in `events.messageKey` and `messages.messageKey`. `events.messageKey` is unique where set (`eventsByMessageKey`), so the same message from the live watch, a catch-up and a read is stored once, and two different messages with the same time and text are kept apart. `eventIdOf` derives the event id from the key when there is one, and only a message with no platform id falls back to its instant (not its time text) plus its text. Every watcher's inbox message carries the platform's id (X Chat's event id, Discord's message id, Slack's ts, Instagram's item id), and both catch-ups pass it on. When a keyed message meets an older copy of itself stored without a key, `adoptUnkeyed` gives that copy the key instead of storing a second event.

Checked by: code and SubQ

### REQ-STORAGE-03: Old rows are filled in batches that resume

Migration 6 only adds the columns and indexes. `runBackfill` (`src/storage/schema/helpers/backfill.ts`) fills old rows after every migrate, in transactions of `BACKFILL_BATCH` rows. The column being filled is its own progress mark, set in the same transaction, so a crash resumes at the next unfilled row and a finished backfill costs only its checks. Only the first event of a message keeps the key; later copies stay unkeyed.

Checked by: code and SubQ
