# FBYRPTimeLimitsEnforcementQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28566509569671415` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | not read yet |

Seen 10 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /reel/ | 2 | 200 | 344–378 ms | 2016–2521 ms | — |
| inspect | rea read step 13_dwell600s: exit 0, ev_e8922deafb7ba9951a51bda6f8cd82b5b68c41db19bfe0cd164 | 1 | 200 | 359 ms | 655 ms | — |
| inspect | step 23: goto /reel/<id> | 1 | 200 | 324 ms | 1251 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 650 ms | 3072 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 578 ms | 1032 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 400 ms | 1667 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 327 ms | 1438 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 465 ms | 4009 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 333 ms | 4910 ms | — |

<!-- facts:end -->

## What it does

Checks the account's youth time-limit rules (supervision). Loads on every page; the answer is empty for an adult account.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
