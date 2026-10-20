# FeedComposerCometRootQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28742010355419170` |
| Path | `/api/graphql/` |
| Sends | `callerName`, `customPartnerParams`, `hasStory`, `isBizWeb`, `isLinksInPostEnabled`, `privacySelectorRenderLocation`, `privacyWriteID`, `profileID`, `scale`, `serviceNames`, `storyID`, `__relay_internal__pv__ShouldEnableSimplifiedComposerIconsrelayprovider`, `__relay_internal__pv__CometUnifiedVideoCreation_showPrivacyMergerelayprovider`, `__relay_internal__pv__CometUGCPublicCreation_showComposerPublicAwarenessTooltiprelayprovider`, `__relay_internal__pv__FeedComposerCometRoot_shouldFetchCrosspostMetadatarelayprovider` |
| Reads | `viewer.actor`, `viewer.feed_comet_composer`, `viewer....FeedComposerComet_viewer` |
| Called from | `FeedComposerCometRoot.react` |
| rea | `ev_74df5fe04dcbed1ebf7e87e31af1f3fdfc75be3825828c415b2e908697f06b2b` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 1 | 200 | 698 ms | 21717 ms | — |

<!-- facts:end -->

## What it does

Loads the "What's on your mind?" post composer at the top of the home feed for the signed-in account (`viewer.feed_comet_composer`). It fires when the home feed renders, 22 s after the sign-in's Enter, in 0.7 s.

## What our machine does with it

Nothing: no machine opens the composer or posts to the feed (rule 8). Its sighting only shows the home feed loaded signed in.

## What can go wrong

Nothing for our runs. A failure only hides the composer box; it doesn't block the feed, Marketplace or the warm-up.
