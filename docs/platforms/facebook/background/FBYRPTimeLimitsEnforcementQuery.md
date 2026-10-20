# FBYRPTimeLimitsEnforcementQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28566509569671415` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `xfb_youth_regulatory_config_platform.query_configs_by_handler` |
| Called from | `FBYRPTimeLimitsEnforcement.react` |
| rea | `ev_ed1a3cfe4b9656a9ad3ddf8f3e05b4767495c0d780a6a027450c86c6d19c34c6` |

Seen 30 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 4 | 200 | 361–528 ms | 2885–5196 ms | — |
| inspect | step 25: goto /groups/<id>/questions | 1 | 200 | 361 ms | 4598 ms | — |
| inspect | step 4: goto /groups/<id>/permalink/<id>/ | 1 | 200 | 356 ms | 4731 ms | — |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 468 ms | 5401 ms | — |
| inspect | step 1: goto / | 5 | 200 | 482–744 ms | 3182–6402 ms | — |
| inspect | step 7: goto / | 1 | 200 | 470 ms | 1729 ms | — |
| inspect | step 34: goto /marketplace/ | 1 | 200 | 492 ms | 4880 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 479 ms | 1899 ms | — |
| inspect | step 22: goto /marketplace/ | 1 | 200 | 571 ms | 2585 ms | — |
| inspect | step 27: goto / | 1 | 200 | 501 ms | 2080 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 425 ms | 4879 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 344–445 ms | 2016–3547 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 329 ms | 3005 ms | — |
| inspect | step 14: goto /reel/<id> | 1 | 200 | 359 ms | 3554 ms | — |
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
