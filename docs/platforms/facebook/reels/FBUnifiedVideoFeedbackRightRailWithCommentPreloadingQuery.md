# FBUnifiedVideoFeedbackRightRailWithCommentPreloadingQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | reels |
| Kind | query |
| doc_id | `29079032155042331` |
| Path | `/api/graphql/` |
| Sends | `feedLocation`, `feedbackSource`, `focusCommentID`, `initial_node_id`, `scale`, `useDefaultActor`, `__relay_internal__pv__FBUnifiedVideoDescriptionWithEntities_comet_translations_revamp_sync_caption_with_audio_gkrelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider` |
| Reads | `video.creation_story` |
| Called from | `FBUnifiedVideoFeedbackRightRailWithCommentPreloading.react` |
| rea | `ev_ef51bf429e9a556285182a803a3bcfc710b9288ce82047b0e69760e04d6c8e9e` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: clickRole button "…" | 1 | 200 | 842 ms | 1879 ms | — |
| inspect | step 5: clickRole button "…" | 1 | 200 | 982 ms | 880 ms | — |
| inspect | step 16: clickRole button "…" | 1 | 200 | 1171 ms | 2036 ms | — |
| inspect | step 48: clickRole button "…" | 1 | 200 | 961 ms | 1174 ms | — |

<!-- facts:end -->

## What it does

Loads the comments side panel of a reel (`FBUnifiedVideoFeedbackRightRailWithCommentPreloading.react`), from `initial_node_id` and `focusCommentID`; it reads the video's `creation_story`. It fired 0.9-2 s after clickRole button steps (3, 5, 16, 48), and `domainOf.ts` records it as the comments.

## What our machine does with it

The `openComments` step (`button "Comment"`) is what sends it. The machine does not read this response: the step passes when the snapshot shows `heading "Comments"`, and `scrollComments` and `closeComments` check that heading too (`checkStep`). It only runs with `--live` (rule 8).

## What can go wrong

None seen: four calls, all 200 in 842-1171 ms. If the panel did not open, `checkStep` reports `no heading "Comments" after it`. If the step fails anyway, `checkStep` reports it as an issue: `log facebook warmup reel record` goes on and outlines it, a `run` stops there, and a checkpoint or login page ends it as `blocked`.
