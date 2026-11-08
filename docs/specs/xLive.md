---
title: "X live"
---

# X live

While an account's X Chat watch is open, its one session keeps X's own notification refresher going the way x.com does, writes each count and each new like, retweet, reply, quote, mention or follow to the account's `live.jsonl`, and a hook puts them in front of every Claude session, each with its own place in the file. Rule 115.

## The poll

### REQ-XLIVE-01: The watch polls X's badge counts every 120 seconds

While the X Chat watch is open, its session reads `ViewerBadgeCounts` about every 120 seconds, with the `x-twitter-polling: true` header, through the account's governor. Rule 115.

Checked by: code and SubQ

### REQ-XLIVE-02: A rise in unread notifications reads one page of new ones

When `ntab_unread_count` rises, the session reads one page of new notifications, and only the new like, retweet, reply, quote, mention or follow from the last day is passed on. Rule 115.

Checked by: code and SubQ

### REQ-XLIVE-03: Every count and new event goes into log.db

Every changed count and every new event is sent on the watch's own stream (`live_line`). The account's one owner appends it to `events` in `log.db` (types `badge`, `notification`, `pollRefused`, `notificationsRefused`), stamped with the time it was received. Nothing is written to a file. The old `live.jsonl` files are imported once (`importLiveFiles`), each line under the same event id the owner gives it (`liveEventId`), so nothing is stored twice. Rules 115, 134.

Checked by: code and SubQ

### REQ-XLIVE-04: A refused read stops the poll

When X refuses a live read (the badge count or the notifications page), the refusal goes into `events` and the poll stops on that account; nothing resumes until matt says so. A dropped connection (a network error, not X answering) is written too and the poll goes on. Rules 94 and 115.

Checked by: code and SubQ

## The hook

### REQ-XLIVE-05: The X live hook puts new events in front of the agent

On SessionStart, every prompt and every log tool or shell call, the X live hook reads what is new in `events` for every X account and puts it in the agent's context as `>>> X LIVE`, telling the agent to say it to matt first. Rule 115.

Checked by: code and SubQ

### REQ-XLIVE-06: Each Claude session reads from its own cursor

The hook keeps one cursor per Claude session in `cursors` (`xLive:<session_id>`, `liveReader`), so two sessions both see every event once. A session's first look starts at the newest event and shows each account's latest counts (`latestBadgeOf`). The Monitor it tells the agent to start (`LIVE_MONITOR`) follows `log.db` the same way (`scripts/inbox/followEvents.ts`). Rules 115, 134.

Checked by: code and SubQ

### REQ-XLIVE-07: A refused read is said to matt

When the new events hold a refused live read that is not only a network error, the hook says that the poll on that account stopped and nothing resumes until matt says so. Rules 94 and 115.

Checked by: code and SubQ
