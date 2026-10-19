# RTWebCallBlockSettingHooksQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 11 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Opening /marketplace/create/item | 7 | 200 | 311–377 ms | 8421–15148 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 2 | 200 | 311–336 ms | 3766–6189 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 1 | 200 | 418 ms | 4293 ms | — |
| publish | Category: Miscellaneous | 1 | 200 | 327 ms | 1942 ms | — |

<!-- facts:end -->

## What it does

Messenger calling: whether incoming calls are blocked.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
