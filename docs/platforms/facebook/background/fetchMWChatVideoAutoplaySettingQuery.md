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

Seen 10 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /reel/ | 2 | 200 | 390–401 ms | 2256–2493 ms | — |
| inspect | rea read step 13_dwell600s: exit 0, ev_e8922deafb7ba9951a51bda6f8cd82b5b68c41db19bfe0cd164 | 1 | 200 | 369 ms | 637 ms | — |
| inspect | step 23: goto /reel/<id> | 1 | 200 | 323 ms | 1231 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 561 ms | 3053 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 602 ms | 1010 ms | — |
| inspect | step 20: goto /reel/<id> | 1 | 200 | 551 ms | 1649 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 486 ms | 1736 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 622 ms | 4066 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 332 ms | 4888 ms | — |

<!-- facts:end -->

## What it does

Messenger's video autoplay setting, for the chat panel.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
