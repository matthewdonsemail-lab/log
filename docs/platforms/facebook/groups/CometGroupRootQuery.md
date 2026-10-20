# CometGroupRootQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `28401524729543492` |
| Path | `/api/graphql/` |
| Sends | `currentSection`, `groupID`, `inviteShortLinkKey`, `isChainingRecommendationUnit`, `scale`, `__relay_internal__pv__GroupsCometGroupChatLazyLoadLastMessageSnippetrelayprovider`, `__relay_internal__pv__GroupsCometGYSJUnifiedUnitCardImageHeightrelayprovider` |
| Reads | — |
| Called from | `CometGroupRoot.react` |
| rea | `ev_a98ebd6ffd0f02b69adb73f0d74cab822ba3a52a2acce66518c4c73a7975606e` |

Seen 9 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: clickRole tab "…" | 1 | 200 | 2501 ms | 1707 ms | — |
| inspect | step 4: clickRole tab "…" | 1 | 200 | 1575 ms | 1084 ms | — |
| inspect | step 6: clickRole tab "…" | 1 | 200 | 612 ms | 2073 ms | — |
| inspect | step 7: clickRole tab "…" | 1 | 200 | 801 ms | 970 ms | — |
| inspect | step 8: clickRole tab "…" | 1 | 200 | 718 ms | 753 ms | — |
| inspect | step 9: clickRole tab "…" | 1 | 200 | 563 ms | 742 ms | — |
| inspect | step 10: clickRole tab "…" | 1 | 200 | 707 ms | 1331 ms | — |
| inspect | step 11: clickRole tab "…" | 1 | 200 | 670 ms | 2106 ms | — |
| inspect | step 42: clickRole tab "…" | 1 | 200 | 2004 ms | 846 ms | — |

<!-- facts:end -->

## What it does

Loads the group page's root (`CometGroupRoot.react`) by `groupID`, with the section and invite link key it sends. It fired 1885 ms after step 5 (click e2647) and 6102 ms after step 7 (click e2606), each time a group page opened.

## What our machine does with it

Nothing. `groupJoin` (`opening`, `reading`) reads the membership from the group page's own HTML (`viewer_join_state`, `readJoinOptions`) and the Join or Joined button from the snapshot (`readGroupPage`). This request is only named in a domain test (`facebookClient.test.ts`); no state waits for it or reads it.

## What can go wrong

None seen: both calls 200, in 571-1128 ms. If the page did not render a Join or Joined button, `groupJoin` stops with `groupGateUnknown`. If the step fails anyway, `groupJoin` stops on the page, not on this request: a checkpoint or login page (`pageProblem`) or a failed step gives `groupPageNotOpened` or `groupJoinNotConfirmed`.
