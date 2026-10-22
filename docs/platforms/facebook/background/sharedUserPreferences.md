# sharedUserPreferences

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/shared/user_preferences/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_315f7692a209571048ce2c004c2bb681d1989abf8498737a4e591be11f714362` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 975 ms | 19172 ms | — |

<!-- facts:end -->

## What it does

Saves a small UI preference for the user (for example a dismissed tip).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
