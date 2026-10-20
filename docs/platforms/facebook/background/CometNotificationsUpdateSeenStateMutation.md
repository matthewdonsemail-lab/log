# CometNotificationsUpdateSeenStateMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `32345368141745868` |
| Path | `/api/graphql/` |
| Sends | `environment`, `input` |
| Reads | `notifications_update_seen_or_read.notifications`, `notifications_update_seen_or_read.viewer` |
| Called from | `CometNotificationsUpdateSeenStateMutation` |
| rea | `ev_93bb6af69452a5ed938292ec5a182e1e93cfbf55e743c8f55451b1103fbb50e5` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 19: clickRole button "…" | 1 | 200 | 5545 ms | 1475 ms | — |

<!-- facts:end -->

## What it does

Marks the account's notifications as seen (`notifications_update_seen_or_read`). It fired on run 20261020T162343 when the notifications list, opened from "Notifications, 9 unread", was closed with Escape (5545 ms); the bell's count went from 9 to none.

## What our machine does with it

Reading notifications is recorded (step 19: each notification is a link with its text and age, and a "Mark as read" button), not yet a flow: the bell's name carries the unread count ("Notifications, 9 unread"), so a flow clicking it by exact name would break as the count changes. Opening the list marks everything seen, so a reader that must not change state reads the list without closing it this way, or accepts that it marks them seen.

## What can go wrong

None seen. A failure would leave the count showing; nothing else.
