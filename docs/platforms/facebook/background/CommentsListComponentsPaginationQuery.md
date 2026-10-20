# CommentsListComponentsPaginationQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29265821953021786` |
| Path | `/api/graphql/` |
| Sends | `commentsAfterCount`, `commentsAfterCursor`, `commentsBeforeCount`, `commentsBeforeCursor`, `commentsIntentToken`, `feedLocation`, `focusCommentID`, `id`, `scale`, `targetDialect`, `useDefaultActor`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider` |
| Reads | `node....useCometUFITopLevelCommentListComponents_paginationFeedback` |
| Called from | `useCometUFITopLevelCommentListComponents_paginationFeedback.graphql` |
| rea | `ev_a2877f95582af5773dfc0f8ab6c1b53eb0081d00bb5a7ead9456cca6c5942d9f` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 8: scrollIn dialog "…" 4 x 800px | 1 | 200 | 688 ms | 1367 ms | — |

<!-- facts:end -->

## What it does

Loads the next page of a post's top-level comments (`useCometUFITopLevelCommentListComponents_paginationFeedback`): the post's feedback `id`, the same `commentsIntentToken` as the list, and `commentsAfterCursor`, the `end_cursor` of the page before. It fired once, as the post dialog was scrolled after the sort was set to Newest (run 20261020T151100, step 8), and answered the 5 remaining comments with `has_next_page: false`.

## What our machine does with it

The group read (`src/group/read`, `commentsFromResponse`) reads its comments the same way as `CommentListComponentsRootQuery`'s and scrolls the dialog again while `has_next_page` is true: the list is read through when it is false. On the run, the two pages gave 15 distinct comments of the 16 Facebook counts (the one left is filtered as potential spam, which only "All comments" shows).

## What can go wrong

None seen: it answered 200 in 688 ms. If it failed or never fired (the dialog not scrolled to its end), the read has only the pages before it, and the post's comments stay unread past that cursor until the next pass.
