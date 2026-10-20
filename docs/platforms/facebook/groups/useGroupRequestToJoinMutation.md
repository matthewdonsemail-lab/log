# useGroupRequestToJoinMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | mutation |
| doc_id | `29015273194751119` |
| Path | `/api/graphql/` |
| Sends | `feedType`, `groupID`, `input`, `inviteShortLinkKey`, `isChainingRecommendationUnit`, `renderLocation`, `scale`, `__relay_internal__pv__GroupsCometGYSJUnifiedUnitCardImageHeightrelayprovider`, `__relay_internal__pv__groups_comet_use_glvrelayprovider` |
| Reads | `group_request_to_join.viewer`, `group_request_to_join.group` |
| Called from | `useGroupRequestToJoinMutation` |
| rea | `ev_ea377bd95ae26f1f3a259e14ed386581857323bd5d92238894fe34d0304ae411` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: clickRole button "…" | 1 | 200 | 1598 ms | 1335 ms | — |

<!-- facts:end -->

## What it does

Pressing Join on a private group that needs approval sends this mutation: it asks to join the group (`groupID`, `input`) and answers with the viewer's new state, `group_request_to_join.viewer` and the group. In run 20261020T101203 (Bethlehem, Northeast Bethlehem Neighbors) it fired 1.3 s after the click on `button "Join Group"`, took 1.6 s and answered `viewer_join_state: REQUESTED`. A group with no approval answers through `GroupCometJoinForumMutation` instead (`MEMBER`).

## What our machine does with it

The join machine (`src/group/join`, `log join group`) reads it in `readJoinOptions` (`joinOptions.ts`): it is one of `JOIN_MUTATIONS`, so its `viewer_join_state` becomes the group's state (`REQUESTED` → `requested` in Twenty's `joinStatus`), with this mutation as the state's source, and `inferJoinState` takes the request path from it. When the group also has membership questions (`GroupsCometMembershipQuestionsPreloadedDialogQuery`), the machine stops at `questionsShown` with the questions kept in `joinSubmission`; answers are a separate step (`--answer`, `--fill`).

## What can go wrong

Only a 200 with `REQUESTED` has been seen in our runs. If the mutation is missing or has no `viewer_join_state`, `readJoinOptions` skips it and the state falls back to the page's own HTML (`viewer_join_state` in the group page) and the snapshot; if neither confirms a join, the run says so (`groupJoinNotConfirmed`) instead of recording a state it didn't see.
