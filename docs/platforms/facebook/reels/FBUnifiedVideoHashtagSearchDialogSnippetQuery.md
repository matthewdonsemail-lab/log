# FBUnifiedVideoHashtagSearchDialogSnippetQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | reels |
| Kind | query |
| doc_id | `26058960353727272` |
| Path | `/api/graphql/` |
| Sends | `triggerData` |
| Reads | `video_home_www_hashtag_destination_header_info.hashtag_snippet` |
| Called from | `FBUnifiedVideoHashtagSearchDialogSnippet.react` |
| rea | `ev_42edb6bfb115aea2e256a57ae3bab291549def6c304446e472aa5f9ba7e2a5e2` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /reel/ | 1 | 200 | 389 ms | 15950 ms | — |
| inspect | step 2: clickRole button "…" | 2 | 200 | 327–378 ms | 57–8108 ms | — |
| inspect | step 35: clickRole button "…" | 1 | 200 | 362 ms | 4755 ms | — |

<!-- facts:end -->

## What it does

Loads the header snippet of a hashtag's dialog in the video player (`video_home_www_hashtag_destination_header_info.hashtag_snippet`) from the `triggerData` it sends. It fired once, 4755 ms after step 35 (a clickRole button step), next to `FBReelHashtagSearchResultsQuery`.

## What our machine does with it

Nothing. No step of the Reels warm-up opens a hashtag (`src/warmup/facebook/helpers/reel.ts`). The Reels warm-up (`src/warmup/facebook`) checks each step against the page's URL and snapshot (`checkStep`), never against this response, and no code refers to it.

## What can go wrong

None seen: one call, 200 in 362 ms. A hashtag dialog over the reel can leave a step's expectation unmet, which `checkStep` names. If the step fails anyway, `checkStep` reports it as an issue: `log warmup facebook reel record` goes on and outlines it, a `run` stops there, and a checkpoint or login page ends it as `blocked`.
