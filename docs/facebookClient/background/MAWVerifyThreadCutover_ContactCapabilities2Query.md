# MAWVerifyThreadCutover_ContactCapabilities2Query

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9948369021930229` |
| Path | `/api/graphql/` |
| Sends | `id` |
| Reads | `user.message_capabilities2_str` |
| Called from | `MAWVerifyThreadCutover` |
| rea | `ev_2ef4fcf81840e4c44dfd19b7c86b9e3e65429109c06595cfc96262bcea9f2bc2` |

Seen 14 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Auto-login: typing the email. | 1 | 200 | 357 ms | 3896 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 2 | 200 | 326–410 ms | 4012–4299 ms | — |
| inspect | step 2: click e53 | 1 | 200 | 400 ms | 8574 ms | — |
| publish | Opening /marketplace/create/item | 7 | 200 | 306–345 ms | 8478–15307 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 2 | 200 | 359–371 ms | 3899–6189 ms | — |
| publish | Category: Miscellaneous | 1 | 200 | 312 ms | 1727 ms | — |

<!-- facts:end -->

## What it does

Messenger's end-to-end encrypted chat: checks what the contacts' clients support.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
