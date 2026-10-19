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

Seen 11 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Opening /marketplace/create/item | 8 | 200 | 298–380 ms | 6083–13913 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 2 | 200 | 331–370 ms | 2884–4158 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 1 | 200 | 429 ms | 4197 ms | — |

<!-- facts:end -->

## What it does

Messenger's video autoplay setting, for the chat panel.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
