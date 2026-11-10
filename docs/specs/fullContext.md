---
title: "Full context before a send"
---

# Full context before a send

Before anything goes to a person on X, log reads that person's full context through the tool: their whole thread, read from X, and what they did on the account's posts. It reads both again right before each queued send and holds the item when anything happened since it was drafted. Rule 109, with rule 110's notification freshness.

## Before drafting

### REQ-CONTEXT-01: twitterDms with a handle gives the thread and the person's activity

`log twitter dms --with <handle>` (MCP `twitterDms` { with }) returns the whole thread with that person, read from X, and what they did on the account's posts, taken from the account's notifications and matched by their user id or handle, newest first.

Checked by: code and SubQ

### REQ-CONTEXT-02: Activity names what they did and their words

Each activity row says whether they liked, retweeted, replied to or quoted a post, mentioned the account or followed it, with the post and, for a reply or quote, their own words.

Checked by: code and SubQ

### REQ-CONTEXT-03: Notifications are read again only when older than 2 minutes

Reading a person's context reads the account's notifications from X only when the saved notifications were not synced in the last 2 minutes; otherwise it uses the saved ones.

Checked by: code and SubQ

## Right before each send

### REQ-CONTEXT-04: The queue reads the context again from the .db before each send

Right before each queued dm, reply or quote, the run reads that person's messages both ways and what they did on the account's posts again, from the .db, once the account has caught up (rule 136), before the engine is asked to send. X is not read for it.

Checked by: SubQ

### REQ-CONTEXT-05: Changes are counted since the item was drafted

What counts as a change is any message either way in the thread, and any like, retweet, reply, quote, mention or follow of theirs, after the item's `draftedAt` (the queue's creation time when the item has none).

Checked by: code and SubQ

### REQ-CONTEXT-06: An item whose context changed is held, not sent

When anything changed, the item is not sent: its status becomes `held`, `heldFor` says what changed, its other events in the run are dropped, and the agent is alerted with a `HELD` line saying to redraft it and put it back with `twitterQueueEdit`.

Checked by: code and SubQ

## Putting it back

### REQ-CONTEXT-07: A held item is put back only with queue edit

`log twitter queue edit <queue> --n --text --by` (MCP `twitterQueueEdit`) puts new copy on a pending or held item, stamps a new `draftedAt`, sets it pending, clears `heldFor`, plans a held item again inside the window, and approves the queue as it then stands.

Checked by: code and SubQ

### REQ-CONTEXT-08: An item cannot be edited while its run is going

`queue edit` is refused with `queueBusy` while a run holds the queue's lock, so the run's saves can't undo the edit.

Checked by: code and SubQ

### REQ-CONTEXT-09: A like and the parts of a split dm ride on their send's context read

A queued like only goes out after its own item was sent in the same run (`sentAtRun` is this plan), so it follows the context read made right before that send and needs no read of its own. The parts of one dm split into lines are one send: the context is read once before the first part, and the rest follow it. An account still behind or whose catch-up was refused (rule 135), or an item with neither a handle nor a user id, holds the item instead of sending it on half its context.

Checked by: SubQ

### REQ-CONTEXT-10: The context before a send is read from the .db once the account has caught up

The queue's context check first waits for the account to catch up (rule 135), and an account still behind or whose catch-up was refused holds the item with the reason. It then takes that person's messages from either side and their activity (likes, retweets, replies, quotes, mentions, follows) from the .db, matched by their user id, handle or chat, and never calls the inbox or notifications engine actions. Rule 136.

Checked by: code and SubQ

### REQ-CONTEXT-11: A read for one chat or person answers from the .db, and the platform only fills it

`readSourceFor` in `src/inbox/dbRead/client.ts` decides where a read for one chat comes from:
- no live owner for the account (`sessionLive` over `readSession`): the platform;
- a catch-up that was refused (`behindOf` with status `refused`): a refusal, never a platform read (rule 94);
- a catch-up still running: the platform at once for this one chat (`catchingUp`), never a wait;
- a chat marked backfilled (`markBackfilled`, a `backfill:` position): the .db;
- a chat the .db holds at least the limit of: the .db;
- otherwise: the platform, once.

`log discord read` takes a server channel from Discord, because the watcher keeps only mentions and replies from one. A DM or group comes from `chatMessages`, filtered by `--after`, with no engine call. A platform read stores what it read and marks the chat backfilled. `log twitter dms --with` (without `--full` or `--force`) decides the same, before the X session is opened. On the .db path it takes the person's messages from `chatContextOf` (handle, and user id from `userIdOfHandle`) and their activity from the kept notification store, calling no engine action. A platform read marks `with:<handle>` backfilled after `backfillThread`. Finding a Discord chat by name (`findInChatList`) matches the kept chat list first (`cachedChatList`, fresh for `CHAT_LIST_FRESH_MS`), and lists from Discord (then keeps the list) only when the name isn't in it: `log discord read`, `send`, `delete`, `react` and `voice`. Each read says where its answer came from (`sourceLine`). matt, 2026-11-07. Rule 160. matt, 2026-11-07, after a read of 8 messages waited 37 s on a catch-up: "we're not achieving p99", so a read never waits on a catch-up.

Checked by: code and SubQ

### REQ-CONTEXT-12: Who wrote last is one rule over the .db, in time order, on every platform

`lastWordOf` in `src/inbox/lastWord/client.ts` decides who wrote last for every DM and group in `log.db`, on every platform, from each chat's newest messages (`RECENT_PER_CHAT`):
- messages are taken in time order (`sentAtMs`, then `seq` for the same moment), never the order they were stored in, since a backfill stores older messages after live ones;
- one person's chats are judged together (`personKeyOf`: an X user's old DM `a-b` and X Chat `a:b`);
- a text of `MIN_MIRROR_CHARS` or more that appears from both sides is counted once, as whoever sent its earliest copy (`withoutMirrors`): matt's opener mirrored into X Chat with the other person as sender is still his;
- reactions, read markers, "could not open" and call or channel notices (`NOT_SAID`) are never the last word; an empty message is (a voice note, image or sticker);
- their reaction after matt's last message is a follow-up (`followUp`), never a reply waiting on him; matt's reaction alone after theirs leaves them waiting (`youReactedOnly`).

A "DM" with more than one other sender is a group. `log inbox waiting` (MCP `inboxWaiting`) lists it for every platform and account. `log twitter dms --waiting` takes each person's last word from it over X's pages and the saved files (`withDbLastWord`), and the SessionStart hook's X list (`storedWaiting`) reads it too. matt, 2026-11-08, after the waiting list showed @W2Warrior and @wolfie_ as waiting when he had written last: "fix who i last message and who is last to message me in order of the database".

Checked by: code and SubQ
