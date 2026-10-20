# GroupsCometFeedRegularStoriesPaginationQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `28956948070566246` |
| Path | `/api/graphql/` |
| Sends | `count`, `cursor`, `feedLocation`, `feedType`, `feedbackSource`, `filterTopicId`, `focusCommentID`, `id`, `privacySelectorRenderLocation`, `referringStoryRenderLocation`, `renderLocation`, `scale`, `sortingSetting`, `stream_initial_count`, `useDefaultActor`, `youthIntegrityHostID`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_reactor_facepilerelayprovider`, `__relay_internal__pv__CometFeedStory_enable_social_bubblesrelayprovider`, `__relay_internal__pv__CometFeedStory_enable_post_permalink_white_space_clickrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__FBReels_deprecate_short_form_video_context_gkrelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__FBReels_enable_view_dubbed_audio_type_gkrelayprovider`, `__relay_internal__pv__CometFeedShareMedia_shouldPrefetchShareImagerelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__IsMergQAPollsrelayprovider`, `__relay_internal__pv__FBReelsMediaFooter_comet_enable_reels_ads_gkrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__relay_provider_comet_ufi_ssr_seo_deferrelayprovider`, `__relay_internal__pv__FBReelsIFUTileContent_reelsIFUPlayOnHoverrelayprovider`, `__relay_internal__pv__GroupsCometGYSJFeedItemHeightrelayprovider`, `__relay_internal__pv__StoriesShouldEnablePhotosensitiveContentWarningrelayprovider`, `__relay_internal__pv__ShouldEnableBakedInTextStoriesrelayprovider`, `__relay_internal__pv__StoriesShouldIncludeFbNotesrelayprovider` |
| Reads | `node....GroupsCometFeedRegularStories_paginationGroup` |
| Called from | `GroupsCometFeedRegularStories_paginationGroup.graphql` |
| rea | `ev_f792b6f23388f17a7eb603f72f37e195afb43b871879be102f5697f32505edb6` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 951 ms | 6923 ms | — |
| inspect | step 3: scroll 1 x 700px | 1 | 200 | 1001 ms | 1292 ms | — |
| inspect | step 5: scroll 2 x 600-800px | 1 | 200 | 876 ms | 735 ms | — |

<!-- facts:end -->

## What it does

Loads a group's discussion feed, three posts a page (`count: 3`), newest first (`sortingSetting: CHRONOLOGICAL`, `feedType: DISCUSSION`), by the group's `id` and a `cursor`. One query serves the whole feed: it fired as the group page loaded (951 ms) and again on the first and third scroll (1001 ms, 876 ms), its cursor's `main_feed_position` moving 2, 5, 8 (inspect 20261020T134155, Bethlehem in "Recommendations of Bethlehem, PA", doc_id `28956948070566246`). The response is streamed: 4 to 10 JSON chunks, the post first and its deferred parts after. Every page held each post's `post_id`, the group (only the expected group id), its `creation_time`, the author (`actors`), the text (`message.text`), the permalink, the `feedback` id, and the next `end_cursor` with `has_next_page`.

## What our machine does with it

It is what the group read (issue #27, `docs/groupRead.md`) reads posts from: the page sends it on its own as the account scrolls, and every step's HAR already records the response (rule 22), so the read never calls GraphQL itself. The first page's posts (the cursor's position 2 at load) arrive embedded in the group page's HTML, which the HAR keeps since `MAX_DOCUMENT_BODY` (the 2 MB cap dropped the 2.3 MB page before). A post is kept only with its `post_id`, this group's id and its `creation_time`, as facebook-camofox-client's extractor required; `end_cursor` and `creation_time` give the read its cursor, so each read yields only new posts.

## What can go wrong

None seen: all three answered 200 in 876-1001 ms. A page that never fires it (a group not joined, a checkpoint) leaves the read with no posts; the page state hook (rules 54-55) reports a checkpoint or login page, and a group the account isn't in shows its Join button (`log join group`). A streamed chunk missing a post's id, group or time is dropped and counted, never patched.
