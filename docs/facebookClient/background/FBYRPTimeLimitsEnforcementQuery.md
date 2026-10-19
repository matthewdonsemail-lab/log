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

Seen 18 time(s) in 17 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 1: goto /me | 1 | 200 | 317 ms | 6911 ms | — |
| connect | Auto-login: typing the email. | 1 | 200 | 316 ms | 2764 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 2 | 200 | 310–346 ms | 2494–4161 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 462 ms | 11788 ms | — |
| inspect | step 2: click e53 | 1 | 200 | 351 ms | 5967 ms | — |
| publish | Opening /marketplace/create/item | 10 | 200 | 297–1407 ms | 6097–29472 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 2 | 200 | 343–373 ms | 2601–3955 ms | — |

<!-- facts:end -->

## What it does

Checks the account's youth time-limit rules (supervision). Loads on every page; the answer is empty for an adult account.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
