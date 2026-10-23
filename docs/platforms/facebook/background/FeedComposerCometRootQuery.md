# FeedComposerCometRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29266302386340694` |
| Path | `/api/graphql/` |
| Sends | `callerName`, `customPartnerParams`, `hasStory`, `isBizWeb`, `isLinksInPostEnabled`, `privacySelectorRenderLocation`, `privacyWriteID`, `profileID`, `scale`, `serviceNames`, `storyID`, `__relay_internal__pv__ShouldEnableSimplifiedComposerIconsrelayprovider`, `__relay_internal__pv__CometUnifiedVideoCreation_showPrivacyMergerelayprovider`, `__relay_internal__pv__CometUGCPublicCreation_showComposerPublicAwarenessTooltiprelayprovider`, `__relay_internal__pv__FeedComposerCometRoot_shouldFetchCrosspostMetadatarelayprovider` |
| Reads | `viewer.actor`, `viewer.feed_comet_composer`, `viewer....FeedComposerComet_viewer` |
| Called from | `FeedComposerCometRoot.react` |
| rea | `ev_a7cba304334bc4e14c20455ee7a779e8ff76be7fa130500c1daa6ddab11f6589` |

Seen 9 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 1: goto / | 1 | 200 | 1402 ms | 25511 ms | — |
| inspect | step 27: goto / | 1 | 200 | 614 ms | 4855 ms | — |
| inspect | step 1: goto / | 3 | 200 | 658–801 ms | 7877–22524 ms | — |
| inspect | step 7: goto / | 2 | 200 | 594–778 ms | 10909–45148 ms | — |
| inspect | post: "…", 123 words, 0 image(s), scrolled 53 px | 1 | 200 | 3856 ms | 70245 ms | — |
| inspect | step 3: likePost Like | 1 | 200 | 422 ms | 21003 ms | — |

<!-- facts:end -->

## What it does

Loads the "What's on your mind?" post composer at the top of the home feed for the signed-in account (`viewer.feed_comet_composer`). It fires when the home feed renders, 22 s after the sign-in's Enter, in 0.7 s.

## What our machine does with it

Nothing: no machine opens the composer or posts to the feed (rule 8). Its sighting only shows the home feed loaded signed in.

## What can go wrong

Nothing for our runs. A failure only hides the composer box; it doesn't block the feed, Marketplace or the warm-up.
