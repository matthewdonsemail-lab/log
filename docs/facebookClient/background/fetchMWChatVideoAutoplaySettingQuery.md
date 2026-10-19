# fetchMWChatVideoAutoplaySettingQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 43 time(s) in 35 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Auto-login: answered automatedBehaviour. | 1 | 200 | 307 ms | 4977 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 5 | 200 | 299–429 ms | 257–5212 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1321 | 1 | 200 | 3513 ms | 16452 ms | — |
| inspect | step 3: goto /marketplace/item/<id>/ | 1 | 200 | 3236 ms | 9466 ms | — |
| inspect | step 10: goto /marketplace/item/<id>/ | 1 | 200 | 6257 ms | 8495 ms | — |
| publish | Opening /marketplace/create/item | 12 | 200 | 298–391 ms | 6035–13913 ms | — |
| publish | Marketplace location: Reading 19601 US | 1 | 200 | 2220 ms | 37674 ms | — |
| inspect | step 1: goto /marketplace/ | 7 | 200 | 318–644 ms | 5710–17621 ms | — |
| inspect | step 16: goto /marketplace/create/item | 1 | 200 | 409 ms | 4160 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 5 | 200 | 331–463 ms | 1695–5443 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1223 | 1 | 200 | 722 ms | 2669 ms | — |
| inspect | step 2: waitRole link "…" | 1 | 200 | 1399 ms | 3076 ms | — |
| inspect | POST 0 /ajax/qm/ (0 ms) | 1 | 200 | 904 ms | 3137 ms | — |
| flow | step 1: goto /me | 2 | 200 | 359–506 ms | 7009–12588 ms | — |
| connect | Auto-login: typing the email. | 1 | 200 | 316 ms | 3146 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 461 ms | 11843 ms | — |
| inspect | step 2: click e53 | 1 | 200 | 367 ms | 5951 ms | — |

<!-- facts:end -->

## What it does

Messenger's video autoplay setting, for the chat panel.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
