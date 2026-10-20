# useInstreamAdsHaloFetcherQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27513705568291109` |
| Path | `/api/graphql/` |
| Sends | `hostVideoId`, `instreamVideoAdType`, `isSponsorHostVideo`, `playerFormat`, `playerSubOrigin`, `storyIdentifier`, `tracePolicy` |
| Reads | `scrubber.instream_video_ad_breaks`, `scrubber.post_roll_ad_break` |
| Called from | `useInstreamAdsHaloFetcher` |
| rea | `ev_bc80c702731406ede85a4bf0d106132ad8d196bcbbe7bed37ed3b4a3a542a982` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 1 | 200 | 763 ms | 15415 ms | — |

<!-- facts:end -->

## What it does

Asks for the ad breaks of a video in the feed (`instream_video_ad_breaks`, `post_roll_ad_break`) when a video post comes into view and its player loads. Fired 15 s after the sign-in, as the home feed rendered.

## What our machine does with it

Nothing: the warm-up scrolls past or dwells on videos, and no machine plays ads or waits for them.

## What can go wrong

Nothing for our runs; an error only means the video plays without ad breaks.
