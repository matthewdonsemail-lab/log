# GroupsCometFeedRegularStoriesPaginationQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `39852225757724348` |
| Path | `/api/graphql/` |
| Sends | `count`, `cursor`, `feedLocation`, `feedType`, `feedbackSource`, `filterTopicId`, `focusCommentID`, `id`, `privacySelectorRenderLocation`, `referringStoryRenderLocation`, `renderLocation`, `scale`, `sortingSetting`, `stream_initial_count`, `useDefaultActor`, `youthIntegrityHostID`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider` |
| Reads | `node....GroupsCometFeedRegularStories_paginationGroup` |
| Called from | `GroupsCometFeedRegularStories_paginationGroup.graphql` |
| rea | `ev_1cee7d22d2b7ab4c747006eb28c7c434b538da0f8ff727b0036a4b435670f996` |

Seen 18 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: scroll 2 x 700px | 1 | 200 | 1113 ms | 959 ms | — |
| inspect | scroll: +700px in 16 wheel steps, 796 ms | 1 | 200 | 1174 ms | 703 ms | — |
| inspect | step 4: scroll 2 x 700px | 1 | 200 | 1303 ms | 605 ms | — |
| inspect | scroll: +700px in 16 wheel steps, 984 ms | 1 | 200 | 1945 ms | 3398 ms | — |
| inspect | step 7: scroll 2 x 700px | 1 | 200 | 1180 ms | 268 ms | — |
| inspect | step 13: press Escape | 1 | 200 | 1422 ms | 75 ms | — |
| inspect | step 24: scroll 2 x 500-700px | 1 | 200 | 1198 ms | 1467 ms | — |
| inspect | step 43: clickRole link "…" | 1 | 200 | 2996 ms | 1023 ms | — |
| inspect | step 45: clickRole button "…" | 1 | 200 | 1716 ms | 2313 ms | — |
| inspect | step 1: goto /groups/<id>/ | 1 | 200 | 2623 ms | 4640 ms | — |
| inspect | step 2: scroll 1 x 600px | 1 | 200 | 1216 ms | 1269 ms | — |
| inspect | step 3: scroll 2 x 700px | 1 | 200 | 1346 ms | 877 ms | — |
| inspect | scroll: +700px in 16 wheel steps, 766 ms | 1 | 200 | 926 ms | 1091 ms | — |
| inspect | scroll: +700px in 15 wheel steps, 672 ms | 1 | 200 | 1010 ms | 3119 ms | — |
| inspect | scroll: +700px in 15 wheel steps, 766 ms | 1 | 200 | 1349 ms | 3089 ms | — |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 951 ms | 6923 ms | — |
| inspect | step 3: scroll 1 x 700px | 1 | 200 | 1001 ms | 1292 ms | — |
| inspect | step 5: scroll 2 x 600-800px | 1 | 200 | 876 ms | 735 ms | — |

<!-- facts:end -->

## What it does

Loads a group's discussion feed, three posts a page (`count: 3`), newest first (`sortingSetting: CHRONOLOGICAL`, `feedType: DISCUSSION`), by the group's `id` and a `cursor`. One query serves the whole feed: it fired as the group page loaded (951 ms) and again on the first and third scroll (1001 ms, 876 ms), its cursor's `main_feed_position` moving 2, 5, 8 (inspect 20261020T134155, Bethlehem in "Recommendations of Bethlehem, PA", doc_id `28956948070566246`). The response is streamed: 4 to 10 JSON chunks, the post first and its deferred parts after. Every page held each post's `post_id`, the group (only the expected group id), its `creation_time`, the author (`actors`), the text (`message.text`), the permalink, the `feedback` id, and the next `end_cursor` with `has_next_page`.

## What our machine does with it

It is what the group read (issue #27, `docs/groupRead.md`) reads posts from: the page sends it on its own as the account scrolls, and every step's HAR already records the response (rule 22), so the read never calls GraphQL itself. The first page's posts (the cursor's position 2 at load) arrive embedded in the group page's HTML, which the HAR keeps since `MAX_DOCUMENT_BODY` (the 2 MB cap dropped the 2.3 MB page before). There the same chunks sit in the page's JSON script blocks as `__bbox.result`s of `CometGroupDiscussionRootSuccessQuery`'s preloader, with the feed under `data.group.group_feed` (not `data.node`), and the first edge is a `GroupsSectionHeaderUnit` ("New posts"), not a post (run 20261020T143506): the read skips any unit that isn't a `Story`. A post is kept only with its `post_id`, this group's id and its `creation_time`, as facebook-camofox-client's extractor required; `end_cursor` and `creation_time` give the read its cursor, so each read yields only new posts.

## What can go wrong

None seen: all three answered 200 in 876-1001 ms. A page that never fires it (a group not joined, a checkpoint) leaves the read with no posts; the page state hook (rules 54-55) reports a checkpoint or login page, and a group the account isn't in shows its Join button (`log facebook join group`). A streamed chunk missing a post's id, group or time is dropped and counted, never patched.
