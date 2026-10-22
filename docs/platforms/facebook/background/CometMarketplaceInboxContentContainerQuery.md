# CometMarketplaceInboxContentContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27439893065673498` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer....CometMarketplaceInboxContent_viewer` |
| Called from | `CometMarketplaceInboxContentContainer.react` |
| rea | `ev_4bc662aadf436f5bbfbb68090747cc344b4422b8b432341560b1e61402c05bcf` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: click e156 | 1 | 200 | 466 ms | 711 ms | — |

<!-- facts:end -->

## What it does

The inbox page's frame: which tab opens by default (`marketplace_settings.preferred_inbox_viewer_role`, SELLER on Bethlehem). It fired when Inbox was clicked in Marketplace's sidebar (step 3).

## What our machine does with it

Nothing reads it. The check opens the seller tab by its URL (`?targetTab=SELLER`), whatever the default.

## What can go wrong

None seen: one call, 200 in 466 ms. Nothing of ours depends on it.
