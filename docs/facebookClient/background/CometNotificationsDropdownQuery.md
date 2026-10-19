# CometNotificationsDropdownQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29240849615602606` |
| Path | `/api/graphql/` |
| Sends | `count`, `environment`, `scale` |
| Reads | `viewer....CometNotificationsListWrapper_viewer` |
| Called from | `CometNotificationsDropdown.react` |
| rea | `ev_ab1965911932cb7fcf25b222bf92e0487c624ad5aa06bc6a0e5e7860bc09d85a` |

Seen 16 time(s) in 15 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 1: goto /me | 1 | 200 | 1054 ms | 8226 ms | — |
| connect | Auto-login: typing the email. | 1 | 200 | 1082 ms | 3415 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 2 | 200 | 1156–1816 ms | 2946–4169 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 648 ms | 13200 ms | — |
| inspect | step 2: click e53 | 1 | 200 | 1076 ms | 6006 ms | — |
| publish | Opening /marketplace/create/item | 8 | 200 | 534–1513 ms | 6242–14222 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 2 | 200 | 1100–1491 ms | 3673–4317 ms | — |

<!-- facts:end -->

## What it does

The notifications menu's contents. Loads on every signed-in page.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
