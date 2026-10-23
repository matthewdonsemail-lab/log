# ProfileCometFeedComposerRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `28551060007882075` |
| Path | `/api/graphql/` |
| Sends | `callerName`, `customPartnerParams`, `isBizWeb`, `isLinksInPostEnabled`, `privacySelectorRenderLocation`, `profile_id`, `scale`, `serviceNames`, `__relay_internal__pv__CometUnifiedVideoCreation_showPrivacyMergerelayprovider`, `__relay_internal__pv__ShouldEnableSimplifiedComposerIconsrelayprovider`, `__relay_internal__pv__CometUGCPublicCreation_showComposerPublicAwarenessTooltiprelayprovider`, `__relay_internal__pv__ProfileCometComposerRoot_shouldFetchCrosspostMetadatarelayprovider` |
| Reads | — |
| Called from | — |
| rea | `ev_8d2616a8bba7dfcdf08975a36a292da275c91dff3a9ca75dc57e356fc42840cf` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: clickRole button "…" | 1 | 200 | 1169 ms | 304 ms | — |

<!-- facts:end -->

## What it does

Redraws the profile's "What's on your mind?" composer after the profile picture changes.

## What our machine does with it

Nothing: it follows the picture save.

## What can go wrong

Harmless; its sighting after a save means the profile redrew.
