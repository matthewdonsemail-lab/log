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
| Called from | `fetchMWChatVideoAutoplaySetting` |
| rea | `ev_cec3d0049369021eb11311f83bae206c05ab77298da76206b6788d2cdc5c8ee1` |

Seen 25 time(s) in 10 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 346 ms | 6619 ms | — |
| inspect | step 1: goto / | 5 | 200 | 459–551 ms | 3226–8392 ms | — |
| inspect | step 7: goto / | 1 | 200 | 465 ms | 1788 ms | — |
| inspect | rea read step 33_dwell028s: exit 0, ev_d164a9c78021b1afb8ce6c5a24456a0d8f46efdbc7c54440f7f | 1 | 200 | 604 ms | 2275 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 574 ms | 1994 ms | — |
| inspect | rea read step 21_dwell078s: exit 0, ev_87a54a6ea91a3418cb413686bdc6108f946bdf45884c8230e49 | 1 | 200 | 530 ms | 141 ms | — |
| inspect | step 27: goto / | 1 | 200 | 463 ms | 2136 ms | — |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 533 ms | 5300 ms | — |
| inspect | step 1: goto /groups/<id>/ | 1 | 200 | 565 ms | 5407 ms | — |
| inspect | step 1: goto /reel/ | 3 | 200 | 330–401 ms | 2256–3534 ms | — |
| inspect | step 71: goto /reel/ | 1 | 200 | 415 ms | 2981 ms | — |
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
