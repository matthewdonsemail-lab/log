# useFeedComposerCometMentionsNullstateDataSourceWithTaggingTransparencyQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28514457521508322` |
| Path | `/api/graphql/` |
| Sends | `limit`, `mention_types`, `post_id`, `profile_id`, `scale`, `session_id`, `surface`, `tag_type` |
| Reads | `xfb_tag_suggestion_search.suggestions` |
| Called from | `useFeedComposerCometMentionsNullstateDataSourceWithTaggingTransparency` |
| rea | `ev_8b0329e14c4f35ad3ddbb0b020461ec3a6d58633405ba9747ea7802a082a47bc` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 20: clickRole button "…" | 1 | 200 | 775 ms | 3301 ms | — |

<!-- facts:end -->

## What it does

The share composer's suggestions for an empty @ (the null state): who to suggest before a letter is typed. It fires with the bootload query above when the share sheet opens. In run 20261020T153648 step 20 it fired 3.3 s after the Share group click, 775 ms, 200.

## What our machine does with it

No machine sends it on purpose and none reads it. It fires by itself when the share sheet opens: in the flow [`groupHeaderMenus`](../flows/groupHeaderMenus.md) the Share group step opens the sheet and Escape closes it, nothing is shared.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, only the empty-@ suggestions would be missing.
