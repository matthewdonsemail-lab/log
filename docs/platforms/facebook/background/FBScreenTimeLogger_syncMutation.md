# FBScreenTimeLogger_syncMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `28969188822673160` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `screen_time_sync.aggs` |
| Called from | `FBScreenTimeLogger.react` |
| rea | `ev_9c20c08fbf4c14d62fa5b772be9b8dc2f4b32b06aa445a78cfb8f8ea86ba73c3` |

Seen 27 time(s) in 8 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | rea read step 21_postbuttonSeeMore: exit 0, ev_6554716166c312b82c145726603d0285e9ee80b92d3 | 1 | 200 | 764 ms | 18338 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T105 | 1 | 200 | 912 ms | 4 ms | — |
| inspect | page has 64 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T103 | 1 | 200 | 538 ms | 2269 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T103 | 2 | 200 | 660–845 ms | 935–85573 ms | — |
| inspect | page has 67 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T102 | 2 | 200 | 539–704 ms | 208498–508771 ms | — |
| inspect | page has 46 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T082 | 1 | 200 | 497 ms | 319 ms | — |
| inspect | rea read step 70_clickany1XLink: exit 1 | 1 | 200 | 396 ms | 271512 ms | — |
| inspect | page has 45 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T062 | 1 | 200 | 447 ms | 1459 ms | — |
| inspect | rea read step 24_clickroleButtonNextCard: exit 0, ev_08bd0b0aa3e491db75fd341d53b6ccf63883a | 6 | 200 | 426–5897 ms | 258787–1759534 ms | — |
| inspect | step 17: scrollIn heading "…" 2-3 x 300-500px | 1 | 200 | 412 ms | 36 ms | — |
| inspect | step 44: dwell 18s | 1 | 200 | 474 ms | 790 ms | — |
| inspect | page has 45 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T052 | 8 | 200 | 386–1201 ms | 173296–1675414 ms | — |
| inspect | now on /reel/<id> "…" after 2875 ms; 1 request(s) | 1 | 200 | 425 ms | 2181 ms | — |

<!-- facts:end -->

## What it does

Logs time spent on screen.

## What our machine does with it

Nothing. The flow generator ignores it as a confirmation.

## What can go wrong

Harmless.
