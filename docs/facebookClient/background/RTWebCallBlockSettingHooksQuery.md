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

Seen 29 time(s) in 27 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Page: loggedIn /marketplace/selling/ | 5 | 200 | 311–520 ms | 2834–6543 ms | — |
| inspect | step 1: goto /marketplace/ | 6 | 200 | 330–663 ms | 7297–20031 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1223 | 1 | 200 | 490 ms | 9920 ms | — |
| inspect | step 2: waitRole link "…" | 1 | 200 | 900 ms | 13769 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T121 | 1 | 200 | 836 ms | 605 ms | — |
| flow | step 1: goto /me | 2 | 200 | 320–437 ms | 8532–15038 ms | — |
| connect | Auto-login: typing the email. | 1 | 200 | 323 ms | 3884 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 2 | 200 | 313–418 ms | 4012–4293 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 336 ms | 13543 ms | — |
| inspect | step 2: click e53 | 1 | 200 | 322 ms | 8524 ms | — |
| publish | Opening /marketplace/create/item | 7 | 200 | 311–377 ms | 8421–15148 ms | — |
| publish | Category: Miscellaneous | 1 | 200 | 327 ms | 1942 ms | — |

<!-- facts:end -->

## What it does

Messenger calling: whether incoming calls are blocked.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
