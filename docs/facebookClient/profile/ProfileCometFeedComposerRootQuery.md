# ProfileCometFeedComposerRootQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `28551060007882075` |
| Path | `/api/graphql/` |
| Sends | `callerName`, `customPartnerParams`, `isBizWeb`, `isLinksInPostEnabled`, `privacySelectorRenderLocation`, `privacyWriteID`, `profile_id`, `scale`, `serviceNames`, `__relay_internal__pv__CometUnifiedVideoCreation_showPrivacyMergerelayprovider`, `__relay_internal__pv__ShouldEnableSimplifiedComposerIconsrelayprovider`, `__relay_internal__pv__CometUGCPublicCreation_showComposerPublicAwarenessTooltiprelayprovider`, `__relay_internal__pv__ProfileCometComposerRoot_shouldFetchCrosspostMetadatarelayprovider` |
| Reads | `user....FeedComposerComet_ownerBusinessProfile`, `user.delegate_page`, `user.has_professional_features_for_watch`, `user.has_profile_comet_mentions_tab`, `user.is_memorialized`, `user.posted_item_privacy_scope`, `user.short_name`, `viewer.actor`, `viewer.feed_comet_composer`, `viewer....FeedComposerComet_viewer`, `privacy_selector....FeedComposerComet_scope` |
| Called from | `ProfileCometFeedComposerRoot.react` |
| rea | `ev_707ed2d0b800f5a37aabe9528cbad4bf698cd97e6638a5708ad807ed8f142a6c` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 5: clickRole button "…" | 1 | 200 | 836 ms | 10692 ms | — |
| inspect | now on /profile.php "…" after 2734 ms; 0 request(s) | 1 | 200 | 531 ms | 1448 ms | — |

<!-- facts:end -->

## What it does

Redraws the profile's "What's on your mind?" composer after the profile picture changes.

## What our machine does with it

Nothing: it follows the picture save.

## What can go wrong

Harmless; its sighting after a save means the profile redrew.
