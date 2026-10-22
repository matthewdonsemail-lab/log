# CometHomeCreateMenuContentQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28430483319975420` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer.actor`, `viewer.account_user`, `viewer.can_create_page`, `viewer.can_create_nonprofit_fundraiser`, `viewer.marketplace_nav_tab_visible`, `viewer.marketplace_feature_access_status`, `lwi.should_direct_to_lwi` |
| Called from | `CometHomeCreateMenuContent.react` |
| rea | `ev_ce3a3e0411d4d96c98fb842dce351a191c4e1062c311b30b7ceaf8d2c63e104c` |

Seen 8 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 27: dwell 0.29s | 1 | 200 | 451 ms | 65 ms | — |
| inspect | post: "…", 103 words, 0 image(s), scrolled 70 px | 1 | 200 | 886 ms | 648 ms | — |
| inspect | step 12: dwell 0.14s | 1 | 200 | 494 ms | 808 ms | — |
| inspect | clickRole failed: RuntimeError: no visible button "…" | 1 | 200 | 327 ms | 15180 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 401 ms | 745295 ms | — |
| inspect | step 67: dwell 1s | 1 | 200 | 706 ms | 50 ms | — |
| inspect | setLocation failed: TimeoutError: Locator.wait_for: Timeout 30000ms exceeded. | 1 | 200 | 1685 ms | 456 ms | — |
| inspect | step 16: type e232 | 1 | 200 | 377 ms | 9063 ms | — |

<!-- facts:end -->

## What it does

The "Create" half of the Menu panel (post, story, reel, page, ad, group…).

## What our machine does with it

Nothing; fetched with the other menu queries on a hover of the menu button.

## What can go wrong

Harmless.
