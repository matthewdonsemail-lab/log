# FBYRPTimeLimitsEnforcementQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28566509569671415` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `xfb_youth_regulatory_config_platform.query_configs_by_handler` |
| Called from | `FBYRPTimeLimitsEnforcement.react` |
| rea | `ev_ed1a3cfe4b9656a9ad3ddf8f3e05b4767495c0d780a6a027450c86c6d19c34c6` |

Seen 45 time(s) in 37 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Auto-login: answered automatedBehaviour. | 2 | 200 | 301–448 ms | 4962–5634 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 4 | 200 | 303–367 ms | 2494–5110 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1321 | 1 | 200 | 2421 ms | 15592 ms | — |
| inspect | step 3: goto /marketplace/item/<id>/ | 1 | 200 | 3414 ms | 9288 ms | — |
| inspect | step 10: goto /marketplace/item/<id>/ | 1 | 200 | 6260 ms | 8489 ms | — |
| publish | Opening /marketplace/create/item | 14 | 200 | 297–1407 ms | 6059–29472 ms | — |
| publish | Marketplace location: Reading 19601 US | 1 | 200 | 2287 ms | 37693 ms | — |
| inspect | step 1: goto /marketplace/ | 7 | 200 | 308–537 ms | 5692–12777 ms | — |
| inspect | step 16: goto /marketplace/create/item | 1 | 200 | 450 ms | 4161 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 5 | 200 | 343–513 ms | 1479–5302 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1223 | 1 | 200 | 667 ms | 2665 ms | — |
| inspect | step 2: waitRole link "…" | 1 | 200 | 1505 ms | 2968 ms | — |
| inspect | POST 0 /ajax/qm/ (0 ms) | 1 | 200 | 415 ms | 2913 ms | — |
| flow | step 1: goto /me | 2 | 200 | 317–395 ms | 6911–12551 ms | — |
| connect | Auto-login: typing the email. | 1 | 200 | 316 ms | 2764 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 462 ms | 11788 ms | — |
| inspect | step 2: click e53 | 1 | 200 | 351 ms | 5967 ms | — |

<!-- facts:end -->

## What it does

Checks the account's youth time-limit rules (supervision). Loads on every page; the answer is empty for an adult account.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
