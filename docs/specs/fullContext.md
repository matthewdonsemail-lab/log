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

### REQ-CONTEXT-04: The queue reads the thread and activity again before each send

Right before each queued dm, reply or quote, the run reads that person's thread and the account's notifications again, before the engine is asked to send.

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

A queued like only goes out after its own item was sent in the same run (`sentAtRun` is this plan), so it follows the context read made right before that send and needs no read of its own. The parts of one dm split into lines are one send: the context is read once before the first part, and the rest follow it. A read that fails before a send, or an item with no handle, holds the item instead of sending it on half its context.

Checked by: SubQ
