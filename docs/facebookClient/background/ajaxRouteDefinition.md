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
| rea | `ev_262d88fab3be7aa47300d07ddd7f69a8108be9bd772dc983116781db97cc2690` |

Seen 6 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 1: goto /me | 2 | 200 | 683–755 ms | 8169–8218 ms | — |
| flow | step 5: clickRole button "…" | 1 | 200 | 733 ms | 6325 ms | — |
| inspect | step 1: goto /me | 2 | 200 | 669–871 ms | 13195–13196 ms | — |
| inspect | now on /profile.php "…" after 2734 ms; 0 request(s) | 1 | 200 | 892 ms | 1341 ms | — |

<!-- facts:end -->

## What it does

Fetches the code and data for a page the client navigates to without a full reload (the profile after a save).

## What our machine does with it

Nothing.

## What can go wrong

Harmless; part of every in-app navigation.
