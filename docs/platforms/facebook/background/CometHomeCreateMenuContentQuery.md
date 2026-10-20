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

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 9: snapshot | 1 | 200 | 504 ms | 12158 ms | — |

<!-- facts:end -->

## What it does

The "Create" half of the Menu panel (post, story, reel, page, ad, group…).

## What our machine does with it

Nothing; fetched with the other menu queries on a hover of the menu button.

## What can go wrong

Harmless.
