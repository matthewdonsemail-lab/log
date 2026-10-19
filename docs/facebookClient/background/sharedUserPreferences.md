# sharedUserPreferences

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/shared/user_preferences/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_1daee983dec9df0b8bba1a9122070a89dc7fbb0b15d6d0f3a67f020dc86e2d8f` |

Seen 8 time(s) in 8 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1321 | 1 | 200 | 5181 ms | 25566 ms | — |
| inspect | step 1: goto /marketplace/ | 1 | 200 | 707 ms | 18862 ms | — |
| flow | POST 200 CometNotificationsDropdownQuery (2480 ms) | 1 | 200 | 708 ms | 3872 ms | — |
| flow | step 1: goto /me | 1 | 200 | 411 ms | 18167 ms | — |
| inspect | POST 200 useMWEncryptedBackupsFetchBackupIdsV2Query (332 ms) | 1 | 200 | 495 ms | 2349 ms | — |
| inspect | page has 61 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T110 | 1 | 200 | 393 ms | 2237 ms | — |
| publish | Uploading 5 photo(s) | 1 | 200 | 395 ms | 517 ms | — |
| publish | Category: Miscellaneous | 1 | 200 | 445 ms | 3493 ms | — |

<!-- facts:end -->

## What it does

Saves a small UI preference for the user (for example a dismissed tip).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
