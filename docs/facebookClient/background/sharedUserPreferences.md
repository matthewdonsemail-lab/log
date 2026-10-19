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
| rea | `ev_262d88fab3be7aa47300d07ddd7f69a8108be9bd772dc983116781db97cc2690` |

Seen 5 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
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
