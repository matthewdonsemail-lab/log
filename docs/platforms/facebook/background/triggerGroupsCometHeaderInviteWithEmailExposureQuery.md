# triggerGroupsCometHeaderInviteWithEmailExposureQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29605900845690284` |
| Path | `/api/graphql/` |
| Sends | `groupId` |
| Reads | `node` |
| Called from | `triggerGroupsCometHeaderInviteWithEmailExposure` |
| rea | `ev_aad9ad487178cdc2acebcde04201704888fc46d694dc36701e22fb1f0b1882b9` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 18: clickRole button "…" | 1 | 200 | 790 ms | 1341 ms | — |

<!-- facts:end -->

## What it does

An experiment check that fires with the Invite dialog (`triggerGroupsCometHeaderInviteWithEmailExposure`): by `groupId` it records that the account was shown the invite-by-email variant and returns the group `node`. In run 20261020T153648 step 18 it fired 1.3 s after the Invite click, 790 ms, 200.

## What our machine does with it

No machine waits for it or reads it. The flow [`groupHeaderMenus`](../flows/groupHeaderMenus.md) opens the Invite dialog and closes it with Escape; no one is invited (rule 8).

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the dialog still opens; nothing on Facebook changes.
