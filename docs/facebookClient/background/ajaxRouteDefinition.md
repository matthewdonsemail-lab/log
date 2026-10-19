# ajaxRouteDefinition

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/route-definition/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_e89b4b4853e5521050423e76344972186d48822a2b5af8ef4142efec32bfba51` |

Seen 9 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 1: goto /me | 4 | 200 | 683–1626 ms | 8169–13348 ms | — |
| flow | step 5: clickRole button "…" | 2 | 200 | 733–1598 ms | 6325–10563 ms | — |
| inspect | step 1: goto /me | 2 | 200 | 669–871 ms | 13195–13196 ms | — |
| inspect | now on /profile.php "…" after 2734 ms; 0 request(s) | 1 | 200 | 892 ms | 1341 ms | — |

<!-- facts:end -->

## What it does

Fetches the code and data for a page the client navigates to without a full reload (the profile after a save).

## What our machine does with it

Nothing.

## What can go wrong

Harmless; part of every in-app navigation.
