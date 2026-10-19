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

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 1 | 200 | 461 ms | 12867 ms | — |
| host | step 10: goto /marketplace/selling/ | 1 | 200 | 343 ms | 5376 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 1 | 200 | 453 ms | 6146 ms | — |

<!-- facts:end -->

## What it does

Messenger's end-to-end encrypted chat: checks what the contacts' clients support.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
