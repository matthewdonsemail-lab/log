# ajaxNavigation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/navigation/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_234c75aefcc329813686b684e1147f5131974c702880e6b21ab1650509b614db` |

Seen 43 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +127px in 4 wheel steps, 125 ms | 1 | 200 | 1326 ms | 2303 ms | — |
| warmup | scroll: -605px in 14 wheel steps, 687 ms | 1 | 200 | 382 ms | 1893 ms | — |
| warmup | step 10: openAny 2-4 x /marketplace/item/ | 1 | 200 | 1358 ms | 2348 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 412 ms | 3499 ms | — |
| warmup | scroll: -756px in 16 wheel steps, 656 ms | 1 | 200 | 477 ms | 869 ms | — |
| inspect | step 3: clickRole tab "…" | 1 | 200 | 2729 ms | 1900 ms | — |
| inspect | step 4: clickRole tab "…" | 1 | 200 | 1531 ms | 1255 ms | — |
| inspect | step 6: clickRole tab "…" | 1 | 200 | 664 ms | 2248 ms | — |
| inspect | step 7: clickRole tab "…" | 1 | 200 | 618 ms | 1154 ms | — |
| inspect | step 8: clickRole tab "…" | 1 | 200 | 616 ms | 856 ms | — |
| inspect | step 9: clickRole tab "…" | 1 | 200 | 526 ms | 896 ms | — |
| inspect | step 10: clickRole tab "…" | 1 | 200 | 533 ms | 1508 ms | — |
| inspect | step 11: clickRole tab "…" | 1 | 200 | 612 ms | 2213 ms | — |
| inspect | step 32: clickRole link "…" | 1 | 200 | 1027 ms | 2308 ms | — |
| inspect | step 42: clickRole tab "…" | 1 | 200 | 2896 ms | 945 ms | — |
| inspect | scroll: +705px in 15 wheel steps, 656 ms | 1 | 200 | 1643 ms | 1231 ms | — |
| inspect | step 45: clickRole button "…" | 1 | 200 | 607 ms | 2357 ms | — |
| inspect | step 48: clickRole button "…" | 1 | 200 | 369 ms | 1324 ms | — |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 633 ms | 2586 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 713 ms | 989 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 535 ms | 1508 ms | — |
| inspect | step 12: clickAny 1 x link /see owner profile$/ | 1 | 200 | 661 ms | 2490 ms | — |
| inspect | step 21: clickAny 1 x link /see owner profile$/ | 1 | 200 | 508 ms | 1984 ms | — |
| inspect | step 8: clickAny 1 x link /see owner profile$/ | 1 | 200 | 544 ms | 2125 ms | — |
| inspect | step 19: clickAny 1 x link /see owner profile$/ | 1 | 200 | 533 ms | 2388 ms | — |
| inspect | step 4: click e191 | 1 | 200 | 606 ms | 2277 ms | — |
| inspect | step 10: click e1174 | 1 | 200 | 439 ms | 2558 ms | — |
| inspect | step 24: click e367 | 1 | 200 | 455 ms | 1472 ms | — |
| inspect | step 25: click e1241 | 1 | 200 | 605 ms | 8407 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 569 ms | 18835 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 412 ms | 15969 ms | — |
| inspect | step 1: goto /marketplace/inbox | 2 | 200 | 365–878 ms | 20925–22722 ms | — |
| inspect | step 3: click e156 | 1 | 200 | 469 ms | 884 ms | — |
| inspect | step 3: goto /marketplace/inbox | 9 | 200 | 390–795 ms | 471777–1354663 ms | — |

<!-- facts:end -->

## What it does

Logs an in-app navigation.

## What our machine does with it

Nothing.

## What can go wrong

Harmless.
