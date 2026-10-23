# useGroupsCometVisitMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | mutation |
| doc_id | `27788177020768038` |
| Path | `/api/graphql/` |
| Sends | `bookmarkID`, `input`, `scale` |
| Reads | `viewer_groups_tab_log_group_visit.group_bookmark`, `viewer_groups_tab_log_group_visit.viewer_for_homepage_unread_count`, `viewer_groups_tab_log_group_visit.viewer` |
| Called from | `useGroupsCometVisitMutation` |
| rea | `ev_2c88e3ef14f464196a06b0ac6105cdffb275c24ee965feffc7bee400f8fa9337` |

Seen 7 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 4 | 200 | 541–697 ms | 3115–6334 ms | — |
| inspect | step 11: clickRole tab "…" | 1 | 200 | 726 ms | 2952 ms | — |
| inspect | step 42: clickRole tab "…" | 1 | 200 | 1155 ms | 5132 ms | — |
| inspect | step 1: goto /groups/<id> | 1 | 200 | 726 ms | 5607 ms | — |

<!-- facts:end -->

## What it does

Logs a visit to a group for the account's Groups tab (`viewer_groups_tab_log_group_visit`), with the group's `bookmarkID`; it reads back the group bookmark and the home page's unread count. It fired 2858 ms after step 5 (click e2647) and 7513 ms after step 7 (click e2606), each time a group page opened.

## What our machine does with it

Nothing. `groupJoin` reads the group page's HTML and snapshot, not this request; it is only named in a domain test (`facebookClient.test.ts`).

## What can go wrong

None seen: both calls 200, in 458-472 ms. Nothing of ours depends on it. If the step fails anyway, `groupJoin` stops on the page, not on this request: a checkpoint or login page (`pageProblem`) or a failed step gives `groupPageNotOpened` or `groupJoinNotConfirmed`.
