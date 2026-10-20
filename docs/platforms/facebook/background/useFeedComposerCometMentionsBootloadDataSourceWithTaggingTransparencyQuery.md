# useFeedComposerCometMentionsBootloadDataSourceWithTaggingTransparencyQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28627214963600515` |
| Path | `/api/graphql/` |
| Sends | `limit`, `mention_types`, `post_id`, `profile_id`, `scale`, `session_id`, `surface`, `tag_type` |
| Reads | `xfb_tag_suggestion_search.suggestions` |
| Called from | `useFeedComposerCometMentionsBootloadDataSourceWithTaggingTransparency` |
| rea | `ev_8d387b00b3cc69329a57d19248dc4993264e6b7ef7f54dc0fcb42d78f7ea8224` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 20: clickRole button "…" | 1 | 200 | 862 ms | 3298 ms | — |

<!-- facts:end -->

## What it does

The share composer's tag suggestions (`xfb_tag_suggestion_search`), loaded for the session (`session_id`, `surface`, `tag_type`) when the share sheet opens; the group comment box has its own groups version. In run 20261020T153648 step 20 it fired 3.3 s after the Share group click, 862 ms, 200.

## What our machine does with it

No machine sends it on purpose and none reads it. It fires by itself when the share sheet opens: in the flow [`groupHeaderMenus`](../flows/groupHeaderMenus.md) the Share group step opens the sheet and Escape closes it, nothing is shared.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, only the sheet's tag suggestions would be missing.
