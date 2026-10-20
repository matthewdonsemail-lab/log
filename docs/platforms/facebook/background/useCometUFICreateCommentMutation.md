# useCometUFICreateCommentMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `40023273857271114` |
| Path | `/api/graphql/` |
| Sends | `canUseNicknameOnComet`, `feedLocation`, `feedbackSource`, `focusCommentID`, `groupID`, `input`, `inviteShortLinkKey`, `renderLocation`, `scale`, `translationType`, `useDefaultActor`, `__relay_internal__pv__groups_comet_use_glvrelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider` |
| Reads | `comment_create.feedback`, `comment_create.feedback_comment_edge`, `comment_create.detection_analytics_enabled` |
| Called from | `useCometUFICreateCommentMutation` |
| rea | `ev_6b2a30ce7fed847573a40255a56a05ff1dfd3c70b65609378585434e925085a0` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 8: clickRole button "…" | 1 | 200 | 2434 ms | 1372 ms | — |

<!-- facts:end -->

## What it does

Creates a comment on a post: the text and the post's feedback id go in `input`, and the answer carries the comment (`comment_create.feedback_comment_edge`) and the post's updated feedback. It fired on run 20261020T162343 when "Post comment" was pressed under Bethlehem's own post (2434 ms); the page then said "Your comment was submitted".

## What our machine does with it

The `postComment` flow waits for it after "Post comment" (`expect`); typing broadcasts around it are never what confirms the step (`NOT_CONFIRMING`, `LiveTyping`). The new comment is the same shape `src/group/read` reads (`commentOf`), so a comment we post can be read back by the comment reader. A write on Facebook: `--live` only (rule 8).

## What can go wrong

None seen. If it failed the comment box would keep its text and the step would fail on its `expect`; the flow does not retry a comment on its own.
