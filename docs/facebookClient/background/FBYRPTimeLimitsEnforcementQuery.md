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

Seen 5 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 1 | 200 | 447 ms | 10722 ms | — |
| host | step 10: goto /marketplace/selling/ | 1 | 200 | 358 ms | 3681 ms | — |
| host | step 12: goto /me | 1 | 200 | 349 ms | 3968 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 2 | 200 | 350–362 ms | 1615–3816 ms | — |

<!-- facts:end -->

## What it does

Checks the account's youth time-limit rules (supervision). Loads on every page; the answer is empty for an adult account.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
