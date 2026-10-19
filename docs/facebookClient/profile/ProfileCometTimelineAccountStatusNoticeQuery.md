# ProfileCometTimelineAccountStatusNoticeQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `38918627047782071` |
| Path | `/api/graphql/` |
| Sends | `userID` |
| Reads | `ix_account_status` |
| Called from | `ProfileCometTimelineAccountStatusNotice.react` |
| rea | `ev_e7ce85b4fb4b9a65d3881daa538a13ccf21782d27a77bd4283d96483a17f3a67` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | POST 200 /ajax/bulk-route-definitions/ (752 ms) | 1 | 200 | 409 ms | 5062 ms | — |
| host | step 9: saveState | 1 | 200 | 382 ms | 1527 ms | — |

<!-- facts:end -->

## What it does

Asks whether a notice about the account's standing should show on its own timeline (`ix_account_status`): restrictions and warnings Facebook places above the profile's posts. Fired with the header, 5 s after `/me`, in about 0.4 s.

## What our machine does with it

It is the profile page's own word on the account's standing, read in the same load as the header. The account check today reads the page text; this answer is the request to read instead (rule 25) when a restricted account (Pittsburgh, Wilkes-Barre) is checked.

## What can go wrong

A non-empty `ix_account_status` means Facebook shows a notice: the account is restricted or warned, a reason to stop acting on it. Empty means no notice.
