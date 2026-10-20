# ajaxBnzai

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/bnzai` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_e642c5ea830afe2876447a54b55015ae0e0f3c5ada04188796278a671712d802` |

Seen 29 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /groups/<id>/ | 4 | 200 | 443–863 ms | 5965–8923 ms | — |
| inspect | step 2: click e220 | 1 | 200 | 454 ms | 3415 ms | — |
| inspect | step 10: goto /groups/<id>/ | 1 | 200 | 774 ms | 5567 ms | — |
| inspect | page has 62 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T234 | 5 | 200, 0 | 0–413 ms | 13565–163139 ms | — |
| inspect | step 11: goto /groups/<id>/ | 1 | 200 | 765 ms | 5532 ms | — |
| inspect | page has 63 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T234 | 2 | 200 | 367–403 ms | 5094–35091 ms | — |
| inspect | page has 63 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T232 | 2 | 200 | 385–394 ms | 4996–35008 ms | — |
| inspect | step 4: goto /groups/<id>/ | 1 | 200 | 726 ms | 5040 ms | — |
| inspect | step 7: wait 4s | 1 | 200 | 359 ms | 4550 ms | — |
| inspect | POST 200 /ajax/relay-ef/ (338 ms) | 1 | 200 | 382 ms | 3455 ms | — |
| inspect | step 2: type e20 | 1 | 200 | 298 ms | 1157 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T212 | 3 | 200 | 302–325 ms | 4822–13113 ms | — |
| inspect | step 1: goto / | 2 | 200 | 360–371 ms | 8806–8927 ms | — |
| inspect | POST 200 /ajax/bnzai (360 ms) | 2 | 200 | 360–1837 ms | 2063–2613 ms | — |
| inspect | page has 5 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T2127 | 2 | 200 | 364–365 ms | 1854–3859 ms | — |

<!-- facts:end -->

## What it does

Telemetry: the page's performance and interaction logging, batched. The most frequent request (61).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
