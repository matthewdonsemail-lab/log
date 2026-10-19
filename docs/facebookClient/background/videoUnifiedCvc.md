# videoUnifiedCvc

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/video/unified_cvc/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | not read yet |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 1 | 200 | 380 ms | 15096 ms | — |

<!-- facts:end -->

## What it does

The video player's view-count beacon (`/video/unified_cvc/`): a video in the feed reports that it was shown and played. Fired 15 s after the sign-in, with the feed's first autoplaying video.

## What our machine does with it

Nothing: it is part of what a person's feed sends anyway. The warm-up's dwell on a video (`warmupFeedBrowse`) makes more of these, as a person watching would.

## What can go wrong

Nothing for our runs; a failure is not shown on the page.
