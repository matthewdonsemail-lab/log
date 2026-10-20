# useGroupsCometMentionsNullstateDataSourceWithTaggingTransparencyQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `32525175867125771` |
| Path | `/api/graphql/` |
| Sends | `count`, `first_degree_filters`, `group_id`, `post_id`, `scale`, `session_id`, `surface`, `tag_type` |
| Reads | `xfb_tag_suggestion_search.suggestions` |
| Called from | `useGroupsCometMentionsNullstateDataSourceWithTaggingTransparency` |
| rea | `ev_31e1bb1ed4650cf3dec8b243999fc5e8a274807f4d3169d297a5fc186417fe52` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: +1731px in 35 wheel steps, 2093 ms | 1 | 200 | 1146 ms | 3238 ms | — |

<!-- facts:end -->

## What it does

The empty-box mention suggestions for a group post's comment box (`xfb_tag_suggestion_search.suggestions`), loaded before anything is typed. It fired once, with the bootload request beside it, 3.2 s into a scroll inside an opened group post.

## What our machine does with it

Nothing in our machines reads it; it comes with a group post's comment box, opened by `openComments` (read only, rule 8).

## What can go wrong

None seen: one answer, 200 in 1146 ms. Nothing waits on it.
