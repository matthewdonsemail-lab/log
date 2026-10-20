# fetchMWChatVideoAutoplaySettingQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9713919638685405` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | not read yet |

Seen 7 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 3 | 200 | 427–439 ms | 2724–3156 ms | — |
| inspect | step 10: goto /groups/<id>/ | 1 | 200 | 399 ms | 2340 ms | — |
| inspect | step 11: goto /groups/<id>/ | 1 | 200 | 397 ms | 1726 ms | — |
| inspect | step 4: goto /groups/<id>/ | 1 | 200 | 356 ms | 1366 ms | — |
| inspect | step 1: goto / | 1 | 200 | 322 ms | 5965 ms | — |

<!-- facts:end -->

## What it does

Messenger's video autoplay setting, for the chat panel.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
