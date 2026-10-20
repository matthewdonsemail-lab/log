# CometMarketplaceSetProductItemSeenStateMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `9680593255390206` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_set_product_item_seen_state.product_item` |
| Called from | `CometMarketplaceSetProductItemSeenStateMutation` |
| rea | `ev_d3844ff3ba89d42ce8912082c4735babb8314eb664819e8300eecce66eb73b01` |

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | rea read step 36_scroll1X400: exit 0, ev_878f93e2480d9215dd7481db9487a1ed4fb3874251015daaf | 1 | 200 | 1029 ms | 3153 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 652 ms | 1996 ms | — |
| inspect | rea read step 24_scroll1X400: exit 0, ev_b216c28b15aac8907d6b5a345798a611d298acedb29f1a6ac | 1 | 200 | 915 ms | 1527 ms | — |

<!-- facts:end -->

## What it does

Marks Marketplace items as seen by the viewer: it sends `input` and reads `marketplace_set_product_item_seen_state.product_item`. It fired during scrolls of the Marketplace browse feed (steps 24 and 36, `scroll 1 x 400`, and a 978 px scroll), 1.5-3.2 s after the scroll began, as listings came into view.

## What our machine does with it

The feed warm-up's `scrollMarketplace` step (one scroll of 400-800 px) brings listings into view and makes the client send it. The machine does not wait for or read it; the scroll step passes on its own movement.

## What can go wrong

None seen: all three answered 200 in 652-1029 ms. Nothing waits on it, so a failure would not stop the run.
