# CommentListComponentsRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29409681848615704` |
| Path | `/api/graphql/` |
| Sends | `commentsIntentToken`, `feedLocation`, `feedbackSource`, `focusCommentID`, `id`, `scale`, `useDefaultActor`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider` |
| Reads | `node....useCometUFITopLevelCommentListComponents_feedback` |
| Called from | `useCometUFITopLevelCommentListComponents_feedback.graphql` |
| rea | `ev_29ce496a3b9bd75206ce21e277f754b153a86abe0412914df481eb662ef8fbb0` |

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 28: clickRole menuitem "…" | 1 | 200 | 694 ms | 1226 ms | — |
| inspect | step 34: clickRole menuitem "…" | 1 | 200 | 659 ms | 1868 ms | — |
| inspect | step 7: clickRole menuitem "…" | 1 | 200 | 791 ms | 1241 ms | — |

<!-- facts:end -->

## What it does

Loads a post's top-level comment list in the sort the viewer picked (`useCometUFITopLevelCommentListComponents_feedback`), by the post's feedback `id` and a `commentsIntentToken`. It fired once, 1.2 s after "Newest" was picked in the post dialog's comment sort (run 20261020T151100, step 7), with `REVERSE_CHRONOLOGICAL_UNFILTERED_INTENT_V1`, and answered the first 10 comments, newest first, each with its replies, and `comments.page_info` (`end_cursor`, `has_next_page: true`).

## What our machine does with it

It is how the group read (`src/group/read`, `commentsFromResponse`) gets every comment of a post: the dialog and the post's own page show "Most relevant" first, which hides some (10 of 16 on the run); Newest shows all but potential spam. A comment is kept only with its `legacy_fbid`, its post (the relay id decodes to `comment:<postId>_<commentId>`), its group (`group_comment_info.group.id`) and `created_time`; replies come in each comment's `replies_connection`, linked by `comment_direct_parent`. When `has_next_page` is true, the read scrolls the dialog for `CommentsListComponentsPaginationQuery`.

## What can go wrong

None seen: it answered 200 in 791 ms. If it failed, the list would stay on the sort it had, so the read would have only the comments the dialog or the page already showed, and would not count the post's comments as read through.
