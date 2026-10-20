# useGroupsCometMentionsBootloadDataSourceWithTaggingTransparencyQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `32718853531093343` |
| Path | `/api/graphql/` |
| Sends | `count`, `first_degree_filters`, `group_id`, `post_id`, `scale`, `session_id`, `surface`, `tag_type` |
| Reads | `xfb_tag_suggestion_search.suggestions` |
| Called from | `useGroupsCometMentionsBootloadDataSourceWithTaggingTransparency` |
| rea | `ev_534f8a3a8503f74518584157008704d25271d0228a6b93408b4f3a7bee430d1f` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: clickRole button "…" | 1 | 200 | 368 ms | 2520 ms | — |
| inspect | scroll: +1731px in 35 wheel steps, 2093 ms | 1 | 200 | 1056 ms | 3236 ms | — |

<!-- facts:end -->

## What it does

Loads the people a viewer can mention in a group post's comment box (`xfb_tag_suggestion_search.suggestions`, from `group_id` and `post_id`). It fired once, 3.2 s into a scroll inside an opened group post, when its comment box came on screen.

## What our machine does with it

Nothing in our machines reads it. It comes with a group post opened by the feed warm-up's `openComments`; comments are read, never written (rule 8), so nothing is ever mentioned.

## What can go wrong

None seen: one answer, 200 in 1056 ms. Nothing waits on it.
