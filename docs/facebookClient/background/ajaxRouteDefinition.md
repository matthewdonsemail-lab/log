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
| rea | `ev_30f60226a59f365c7c1e25467854266c4129fbf5993cbb4ef0029ac439aa491c` |

Seen 11 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Marketplace location: Reading 19601 US | 1 | 200 | 458 ms | 23198 ms | — |
| inspect | step 15: click e1354 | 1 | 200 | 4521 ms | 1319 ms | — |
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
