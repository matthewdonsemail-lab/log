# CometMarketplaceRecordPDPDwellTimeMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `24177643518491637` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_record_pdp_dwell_time` |
| Called from | `CometMarketplaceRecordPDPDwellTimeMutation` |
| rea | `ev_7b946545027e3755bb8b1699090bf3da00216eac5a3c02a5026c1499fd521772` |

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | openAny: read /marketplace/item/<id>/ | 3 | 200 | 588–893 ms | 73–112 ms | — |

<!-- facts:end -->

## What it does

Records how long the viewer stayed on a Marketplace listing's page (PDP, product details page): it sends `input` and reads back `marketplace_record_pdp_dwell_time`. In our runs it fired 73-112 ms into each `openAny` step that read a `/marketplace/item/<id>/` listing, three times in two runs, so it reports the dwell on the listing just opened.

## What our machine does with it

The feed warm-up's `openListings` step (`src/warmup/facebook/helpers/feed.ts`, `openAny /marketplace/item/ 1-3`) opens the listing that makes Facebook's client send it; the dwell between opening and coming back is ours (`openAny`'s reading pause). The machine never waits for it or reads it: the step passes on the listing's URL. It matters because it is Facebook's own measure of how long each listing was looked at, so the reading pauses in `openAny` are what it reports.

## What can go wrong

None seen: all three answered 200 in 588-893 ms. A failure here would not stop the step (nothing waits on it). A login wall or checkpoint after it is a page state (rule 54): the agent hooks report it and the step's snapshot shows it.
