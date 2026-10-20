# FBUnifiedVideoSeenStateMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | reels |
| Kind | mutation |
| doc_id | `9749301061815436` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `xfb_fb_shorts_seen_state_mutation.viewer` |
| Called from | `FBUnifiedVideoSeenStateMutation` |
| rea | `ev_5b1d67703bcc2154905f7461407849c35b29d19eaf9efca5ad6f5e1b8f46008a` |

Seen 40 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 7: clickRole button "…" | 1 | 200 | 442 ms | 1157 ms | — |
| inspect | rea read step 07_clickroleButtonNextCard: exit 0, ev_ac2f1b78c729cc75b64c1d83adf62e19bf4fb | 1 | 200 | 384 ms | 628 ms | — |
| inspect | rea read step 08_clickroleButtonNextCard: exit 0, ev_f6a7635960b1919bdfac52d21fd673ed4dc6c | 1 | 200 | 427 ms | 307 ms | — |
| inspect | step 10: clickRole button "…" | 1 | 200 | 401 ms | 1371 ms | — |
| inspect | rea read step 10_clickroleButtonNextCard: exit 0, ev_17439a83fec6c79d70749d0ff71f7f7e2203f | 1 | 200 | 398 ms | 668 ms | — |
| inspect | rea read step 11_clickroleButtonNextCard: exit 0, ev_189e7df832ac014018be21a4d2fe3eb4b862d | 1 | 200 | 383 ms | 1156 ms | — |
| inspect | step 15: clickRole button "…" | 1 | 200 | 373 ms | 1170 ms | — |
| inspect | page has 44 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T062 | 1 | 200 | 407 ms | 475 ms | — |
| inspect | step 18: clickRole button "…" | 1 | 200 | 494 ms | 2454 ms | — |
| inspect | rea read step 18_clickroleButtonNextCard: exit 0, ev_33faffe301518f4ece688324618192249fe69 | 1 | 200 | 372 ms | 1741 ms | — |
| inspect | rea read step 19_clickroleButtonNextCard: exit 0, ev_dbdf0cdb2b743ae09d78694266dab13d60941 | 1 | 200 | 359 ms | 434 ms | — |
| inspect | rea read step 20_clickroleButtonNextCard: exit 0, ev_b8ad981adedd3a055cbb6fd651deb9976e71e | 1 | 200 | 365 ms | 1297 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 478 ms | 1446 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 503 ms | 1467 ms | — |
| inspect | step 8: clickAny 1 x link /see owner profile$/ | 1 | 200 | 377 ms | 2073 ms | — |
| inspect | step 14: clickRole button "…" | 1 | 200 | 519 ms | 1010 ms | — |
| inspect | step 19: clickAny 1 x link /see owner profile$/ | 1 | 200 | 477 ms | 2310 ms | — |
| inspect | step 22: goto /reel/ | 1 | 200 | 414 ms | 39 ms | — |
| inspect | step 25: clickRole button "…" | 1 | 200 | 428 ms | 2395 ms | — |
| inspect | step 27: clickRole button "…" | 1 | 200 | 377 ms | 1358 ms | — |
| inspect | step 29: clickRole button "…" | 1 | 200 | 402 ms | 2620 ms | — |
| inspect | step 31: clickRole button "…" | 1 | 200 | 3601 ms | 1240 ms | — |
| inspect | step 33: clickRole button "…" | 1 | 200 | 2210 ms | 2499 ms | — |
| inspect | step 35: clickRole button "…" | 1 | 200 | 433 ms | 1532 ms | — |
| inspect | step 37: clickRole button "…" | 1 | 200 | 381 ms | 1297 ms | — |
| inspect | step 39: clickRole button "…" | 1 | 200 | 388 ms | 1624 ms | — |
| inspect | step 41: clickRole button "…" | 1 | 200 | 464 ms | 1420 ms | — |
| inspect | step 43: clickRole button "…" | 1 | 200 | 433 ms | 1441 ms | — |
| inspect | step 46: clickRole button "…" | 1 | 200 | 452 ms | 1595 ms | — |
| inspect | step 57: clickRole button "…" | 1 | 200 | 407 ms | 1484 ms | — |
| inspect | step 62: clickRole button "…" | 1 | 200 | 478 ms | 1406 ms | — |
| inspect | step 65: clickRole button "…" | 1 | 200 | 403 ms | 2097 ms | — |
| inspect | step 69: clickRole button "…" | 1 | 200 | 450 ms | 1145 ms | — |
| inspect | step 72: clickRole button "…" | 1 | 200 | 421 ms | 1133 ms | — |
| inspect | step 76: clickRole button "…" | 1 | 200 | 498 ms | 1526 ms | — |
| inspect | step 80: clickRole button "…" | 1 | 200 | 490 ms | 1288 ms | — |
| inspect | step 83: clickRole button "…" | 1 | 200 | 540 ms | 2213 ms | — |
| inspect | step 88: clickRole button "…" | 1 | 200 | 787 ms | 2077 ms | — |
| inspect | step 92: clickRole button "…" | 1 | 200 | 727 ms | 1249 ms | — |
| inspect | step 96: clickRole button "…" | 1 | 200 | 1449 ms | 1597 ms | — |

<!-- facts:end -->

## What it does

Marks a reel as seen for the account (`xfb_fb_shorts_seen_state_mutation`); it sends `input` and reads back the `viewer`. It fired 40 times, about 0.4-2.6 s after each step that left a reel: `Next card`, the `see owner profile` link and goto /reel/.

## What our machine does with it

The `swipe` step (`button "Next card"`) sends it, and `reel.ts` records it as Facebook's answer to Next card (run 20261020T050610, step 11). The machine does not wait for it: a swipe passes when the URL changes to the next `/reel/<id>` (`checkStep`).

## What can go wrong

None seen: 40 calls, all 200, mostly under 800 ms, at most 3601 ms. If a swipe did not move on, the URL stays the same and `checkStep` reports `the URL didn't change`. If the step fails anyway, `checkStep` reports it as an issue: `log warmup facebook reel record` goes on and outlines it, a `run` stops there, and a checkpoint or login page ends it as `blocked`.
