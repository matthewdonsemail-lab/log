# CometMarketplaceSetBrowseRadiusMutation

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `27350813454583510` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_set_browse_radius.viewer` |
| Called from | `CometMarketplaceSetBrowseRadiusMutation` |
| rea | `ev_de8df333d384b2ad1cb2aac17072e4f280e3ef041a7fecc4615138d38c3313f9` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 15: click e1354 | 1 | 200 | 454 ms | 1325 ms | — |

<!-- facts:end -->

## What it does

Saves the browse radius chosen in Marketplace's Change location dialog (e.g. 40 miles).

## What our machine does with it

Sent by the same Apply click as `CometMarketplaceSetBuyLocationMutation`; we keep the radius the dialog shows.

## What can go wrong

Harmless. A non-200 would mean the dialog's Apply didn't save.
