# RTWebCallBlockSettingHooksQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9989124061109700` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | `RTWebCallBlockSettingHooks` |
| rea | `ev_1cd240cd88b74ce0c02e6218c665f21c92f2ebe302e100c7ea846dce65f28ad6` |

Seen 7 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 3 | 200 | 408–428 ms | 3442–4164 ms | — |
| inspect | step 10: goto /groups/<id>/ | 1 | 200 | 416 ms | 2923 ms | — |
| inspect | step 11: goto /groups/<id>/ | 1 | 200 | 593 ms | 2704 ms | — |
| inspect | step 4: goto /groups/<id>/ | 1 | 200 | 371 ms | 2307 ms | — |
| inspect | step 1: goto / | 1 | 200 | 311 ms | 6768 ms | — |

<!-- facts:end -->

## What it does

Messenger calling: whether incoming calls are blocked.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
