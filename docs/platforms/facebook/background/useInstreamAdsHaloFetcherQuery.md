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

Seen 45 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | page has 45 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T082 | 9 | 200 | 342–811 ms | 72–729 ms | — |
| inspect | step 9: clickRole button "…" | 1 | 200 | 527 ms | 1013 ms | — |
| inspect | page has 46 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T082 | 8 | 200 | 374–973 ms | 4–678 ms | — |
| inspect | page has 44 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T082 | 3 | 200 | 500–975 ms | 65–178 ms | — |
| inspect | page has 49 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T082 | 3 | 200 | 362–1050 ms | 114–126 ms | — |
| inspect | page has 50 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T082 | 1 | 200 | 459 ms | 56 ms | — |
| inspect | page has 43 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T082 | 1 | 200 | 602 ms | 138 ms | — |
| inspect | step 41: clickRole button "…" | 1 | 200 | 519 ms | 911 ms | — |
| inspect | mouse: 2 rest; 0 idle drift move(s) | 1 | 200 | 441 ms | 1 ms | — |
| inspect | rea read step 07_clickroleButtonNextCard: exit 0, ev_ac2f1b78c729cc75b64c1d83adf62e19bf4fb | 1 | 200 | 465 ms | 888 ms | — |
| inspect | rea read step 18_clickroleButtonNextCard: exit 0, ev_33faffe301518f4ece688324618192249fe69 | 1 | 200 | 373 ms | 2002 ms | — |
| inspect | rea read step 19_clickroleButtonNextCard: exit 0, ev_dbdf0cdb2b743ae09d78694266dab13d60941 | 1 | 200 | 348 ms | 703 ms | — |
| inspect | rea read step 22_dwell600s: exit 0, ev_59385bb1add05e2efe91692d85b295ae9cd6334beafd2bccb4a | 1 | 200 | 347 ms | 2241 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 695 ms | 5260 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 1409 ms | 5267 ms | — |
| inspect | step 27: clickRole button "…" | 1 | 200 | 417 ms | 1710 ms | — |
| inspect | step 31: clickRole button "…" | 1 | 200 | 2895 ms | 2036 ms | — |
| inspect | step 33: clickRole button "…" | 1 | 200 | 1776 ms | 3300 ms | — |
| inspect | step 35: clickRole button "…" | 1 | 200 | 620 ms | 1803 ms | — |
| inspect | step 39: clickRole button "…" | 1 | 200 | 410 ms | 2420 ms | — |
| inspect | step 57: clickRole button "…" | 1 | 200 | 373 ms | 2330 ms | — |
| inspect | step 62: clickRole button "…" | 1 | 200 | 463 ms | 2216 ms | — |
| inspect | step 65: clickRole button "…" | 1 | 200 | 2292 ms | 2895 ms | — |
| inspect | step 69: clickRole button "…" | 1 | 200 | 418 ms | 1949 ms | — |
| inspect | step 76: clickRole button "…" | 1 | 200 | 380 ms | 2323 ms | — |
| inspect | step 83: clickRole button "…" | 1 | 200 | 507 ms | 3016 ms | — |

<!-- facts:end -->

## What it does

Asks for the ad breaks of a video in the feed (`instream_video_ad_breaks`, `post_roll_ad_break`) when a video post comes into view and its player loads. Fired 15 s after the sign-in, as the home feed rendered.

## What our machine does with it

Nothing: the warm-up scrolls past or dwells on videos, and no machine plays ads or waits for them.

## What can go wrong

Nothing for our runs; an error only means the video plays without ad breaks.
