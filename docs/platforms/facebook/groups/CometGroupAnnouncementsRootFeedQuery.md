# CometGroupAnnouncementsRootFeedQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `39360209206957399` |
| Path | `/api/graphql/` |
| Sends | `feedLocation`, `feedbackSource`, `focusCommentID`, `groupID`, `orderby`, `privacySelectorRenderLocation`, `referringStoryRenderLocation`, `renderLocation`, `scale`, `useDefaultActor`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider`, `__relay_internal__pv__GroupsCometGroupChatLazyLoadLastMessageSnippetrelayprovider` |
| Reads | — |
| Called from | `CometGroupAnnouncementsRoot.react` |
| rea | `ev_a4e433f9b0e4a77467e8120142e87d5943f78d8f81b8b21a16d19e499d0ac209` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: clickRole tab "…" | 1 | 200 | 4341 ms | 1710 ms | — |

<!-- facts:end -->

## What it does

The Featured tab (`CometGroupAnnouncementsRoot.react`, `/groups/<id>/announcements`): by `groupID` it loads the group's featured posts as a feed, with the same story fields as the Discussion feed. In run 20261020T153648 the Featured click was step 3; the query started 1.7 s after it and took 4341 ms, so its response landed in step 4.

## What our machine does with it

No machine waits for it or reads it. The group read (`src/group/read`) stays on the Discussion tab and never opens this one. The flow [`groupTabs`](../flows/groupTabs.md) clicks the tab and waits for no request: a page-load query isn't a confirming request, only a mutation is (`confirmingRequest`). A step that clicks this tab should wait for the response: at 4.3 s it outlasts the step's settle time.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the tab would show Facebook's own error panel instead of its content; the flow's click would still pass, and nothing on Facebook changes, since it only reads.
