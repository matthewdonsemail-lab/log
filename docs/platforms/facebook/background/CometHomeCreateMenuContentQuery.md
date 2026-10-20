# CometHomeCreateMenuContentQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28430483319975420` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer.actor`, `viewer.account_user`, `viewer.can_create_page`, `viewer.can_create_nonprofit_fundraiser`, `viewer.marketplace_nav_tab_visible`, `viewer.marketplace_feature_access_status`, `lwi.should_direct_to_lwi` |
| Called from | `CometHomeCreateMenuContent.react` |
| rea | `ev_3fc31279229a8a77c780fdc3d85b3e4a969f9714a54952d71db8fff6a6ab0305` |

Seen 6 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 27: dwell 0.29s | 1 | 200 | 451 ms | 65 ms | — |
| inspect | post: "…", 103 words, 0 image(s), scrolled 70 px | 1 | 200 | 886 ms | 648 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T103 | 1 | 200 | 494 ms | 50 ms | — |
| inspect | rea read step 72_clickroleButtonUnmute: exit 0, ev_183079e9de4526e8398a72e352c35b5ac9ce8fe | 1 | 200 | 327 ms | 8079 ms | — |
| inspect | rea read step 24_clickroleButtonNextCard: exit 0, ev_08bd0b0aa3e491db75fd341d53b6ccf63883a | 1 | 200 | 401 ms | 737520 ms | — |
| inspect | step 67: dwell 1s | 1 | 200 | 706 ms | 50 ms | — |

<!-- facts:end -->

## What it does

The "Create" half of the Menu panel (post, story, reel, page, ad, group…).

## What our machine does with it

Nothing; fetched with the other menu queries on a hover of the menu button.

## What can go wrong

Harmless.
