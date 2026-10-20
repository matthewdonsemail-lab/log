# OhaiWebPublicKeyConfigQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26996952523264441` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | not read yet |

Seen 7 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 3 | 200 | 394–448 ms | 3362–3704 ms | — |
| inspect | step 10: goto /groups/<id>/ | 1 | 200 | 428 ms | 2626 ms | — |
| inspect | step 11: goto /groups/<id>/ | 1 | 200 | 433 ms | 2348 ms | — |
| inspect | step 4: goto /groups/<id>/ | 1 | 200 | 344 ms | 1944 ms | — |
| inspect | step 1: goto / | 1 | 200 | 312 ms | 5981 ms | — |

<!-- facts:end -->

## What it does

Fetches a public key the page uses to encrypt some data it sends (likely for Messenger or logging).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
