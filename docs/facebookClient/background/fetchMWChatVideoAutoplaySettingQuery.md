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

Seen 5 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 1 | 200 | 415 ms | 12164 ms | — |
| host | step 10: goto /marketplace/selling/ | 1 | 200 | 445 ms | 3683 ms | — |
| host | step 12: goto /me | 1 | 200 | 443 ms | 4258 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 2 | -1, 200 | -1–349 ms | 1755–4096 ms | — |

<!-- facts:end -->

## What it does

Messenger's video autoplay setting, for the chat panel.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
