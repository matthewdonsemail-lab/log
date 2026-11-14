---
title: "X notifications"
---

# X notifications

Who liked, reposted, replied to, quoted or followed an X account, read through the account's one session and kept in `~/.logCli/twitter/<account>/notifications.json`, one row per person per thing they did. X's notifications name only some of the people behind an aggregated notification, so the read also unrolls a post's whole likers and reposters lists into the same rows. Rules 6, 94 and 105.

## The feed

### REQ-XNOTIFICATIONS-01: The feed is read new first, then back through the history, and kept

The engine's `notifications` action (`sync_notifications` in `python/twitterApi/notifications.py`) reads pages of 40 notifications through the account's one session: the newest pages until it meets rows already kept, then with `full` back through the history from the kept bottom cursor. Each page goes through the governor after a read's spacing. `rows_of` keeps one row per person per thing under a key (`like:<userId>:<postId>`, `repost:<userId>:<postId>`, `reply:<tweetId>`), marked `source: "notification"`, and never keeps the account's own action. A 429 or a governor stop ends the read with what came kept.

Checked by: code and SubQ

## The unroll

### REQ-XNOTIFICATIONS-02: A post's likers and reposters are paged through the same session

The engine's `postEngagers` action (`post_engagers` in `python/twitterApi/engine.py`) is a read. It pages one post's likers (twikit's `get_favoriters`, X's Favoriters operation) or reposters (`get_retweeters`, Retweeters) through the account's one client, 40 a page, at most 5 pages a call unless told fewer, sleeping a read's spacing and asking the governor before every page after the first. It refuses with `engagersOperationUnknown`, calling nothing, when X's live operation for that list isn't in `xOperations.json`; `web_client` reads the `bundle.TweetActivity` scripts so the table can hold it. A 429 answers `rateLimited` and a governor stop `governorBlocked`, each with the rows and the place kept.

Checked by: code and SubQ

### REQ-XNOTIFICATIONS-03: Unrolled people merge into the same rows, once each

`unroll_engagers` writes each person from a list under the same key a notification row uses, with `source: "engagements"` and no time, through `add_rows`. A person a notification already named stays one row and keeps its time and its `source`; a person unrolled first and named by a notification later becomes `source: "notification"` and takes that time. The account itself is never kept. The store keeps its version and every row it had: a store without `engagements` is given an empty one when read.

Checked by: code and SubQ

### REQ-XNOTIFICATIONS-04: Each list's place is kept so a stopped read goes on

The store's `engagements` holds, per post and per kind, the cursor, whether the list was read to its end (`done`), the pages read, the people seen and added, and when (`syncedAt`), written after every page. A list ends at a page with no people, no bottom cursor, or the cursor it was asked with. A read that stopped goes on from the kept cursor; a list already read to its end is read again from the top.

Checked by: code and SubQ

### REQ-XNOTIFICATIONS-05: One state machine drives the read and stops on a refusal

`notificationUnrollMachine` (`src/twitter/notification/unroll/machine.ts`) runs every `log twitter notifications` read that calls X: `syncingFeed`, `choosingPosts`, then for each post `readingLikers` and `readingReposters`, one engine call at a time, ending `done`, `stopped` or `crashed`. `choosePosts` takes the post given with `--post` (both lists) and, with `--full`, every post of the account's with an aggregated like or repost notification that its lists have not been read to the end since (`unrollCandidatesOf`). An engine answer that is not ok at any stage ends `stopped` with the refusal and what was kept, with no retry and no further call; so does spending the run's 40 unroll pages (`UNROLL_RUN_PAGES`). An invoke that throws ends `crashed`.

Checked by: code and SubQ

### REQ-XNOTIFICATIONS-06: The command says per post what came from where, and when it stopped early

`notificationsCommand` prints, for each post unrolled or asked for with `--post`, the likers and the reposters from notifications, added by unrolling, and their total, with whether each list was read to the end, stopped before the end, or not unrolled (`engagerLine`, counted from the store by `engagerSummaryOf`). When the run stopped before the end it says so on its own line with the refusal, and exits 1 for a refusal. `--json` carries the same as `unroll` and `engagerPosts`. `--stored` calls nothing.

Checked by: code and SubQ
