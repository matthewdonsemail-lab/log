# CometPhotoRootContentQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | photos |
| Kind | query |
| doc_id | `29243150988655410` |
| Path | `/api/graphql/` |
| Sends | `feedLocation`, `feedbackSource`, `focusCommentID`, `glbFileURIHackToRenderAs3D_DO_NOT_USE`, `isMediaset`, `mediasetToken`, `nodeID`, `privacySelectorRenderLocation`, `renderLocation`, `scale`, `shouldShowComments`, `useDefaultActor`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__TestPilotShouldIncludeDemoAdUseCaserelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__CometImmersivePhotoCanUserDisable3DMotionrelayprovider` |
| Reads | `...CometPhotoRootRenderer_data` |
| Called from | `CometPhotoRootContent.react` |
| rea | `ev_e20336a5ca34fe44c4b2a2f71f07ffc8b50b44930f1d50a7c3150974244d8a1c` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: +705px in 15 wheel steps, 656 ms | 3 | 200 | 1172–1906 ms | 770–2833 ms | — |

<!-- facts:end -->

## What it does

The photo viewer (`CometPhotoRootContent.react`, `/photo/`): by `nodeID` (the photo) and the post's `mediasetToken` it loads the photo, the post beside it and its comments. In run 20261020T153648 step 43 (a post's photo link clicked on the Discussion feed) it fired three times, 0.8-2.8 s after the step began, 1172-1906 ms, 200: the photo shown and the next ones in the set, preloaded. The table names the step by the scroll that brought the photo into view.

## What our machine does with it

No machine waits for it or reads it. A photo's link is named by Facebook's description of the picture, which differs on every post, so no flow is built from this step; the viewer's Close button closes it (step 45). The group read takes images from the feed query instead.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the viewer would open empty; nothing on Facebook changes.
