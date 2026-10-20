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

Seen 7 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 3 | 200 | 433–483 ms | 2644–2918 ms | — |
| inspect | step 10: goto /groups/<id>/ | 1 | 200 | 434 ms | 1821 ms | — |
| inspect | step 11: goto /groups/<id>/ | 1 | 200 | 406 ms | 1673 ms | — |
| inspect | step 4: goto /groups/<id>/ | 1 | 200 | 382 ms | 1177 ms | — |
| inspect | step 1: goto / | 1 | 200 | 558 ms | 5079 ms | — |

<!-- facts:end -->

## What it does

Checks the account's youth time-limit rules (supervision). Loads on every page; the answer is empty for an adult account.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
