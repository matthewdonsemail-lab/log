# ajaxRelayEf

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/relay-ef/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_d0bc6046b88d7ac4496521682ae9642a7371c0cb0dc6a649419b2f8d1e1795d7` |

Seen 59 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | mouse: 4 wander, 1 flick; 1 idle drift move(s) | 1 | 200 | 508 ms | 66 ms | — |
| inspect | POST 200 /ajax/bulk-route-definitions/ (489 ms) | 1 | 200 | 460 ms | 95 ms | — |
| inspect | step 2: click e220 | 2 | 200 | 379–465 ms | 472–1976 ms | — |
| inspect | step 8: click e1225 | 1 | 200 | 427 ms | 3701 ms | — |
| inspect | step 10: goto /groups/<id>/ | 1 | 200 | 424 ms | 4312 ms | — |
| inspect | page has 62 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T234 | 10 | 200 | 367–548 ms | 7174–100051 ms | — |
| inspect | step 11: goto /groups/<id>/ | 3 | 200 | 358–398 ms | 2905–8238 ms | — |
| inspect | step 1: goto /groups/<id>/ | 1 | 200 | 444 ms | 4312 ms | — |
| inspect | page has 63 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T234 | 4 | 200 | 425–589 ms | 10479–53384 ms | — |
| inspect | page has 63 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T232 | 7 | 200 | 354–431 ms | 11756–46638 ms | — |
| inspect | step 4: goto /groups/<id>/ | 2 | 200 | 386–414 ms | 2428–6076 ms | — |
| inspect | step 5: click e220 | 1 | 200 | 402 ms | 502 ms | — |
| inspect | step 9: snapshot | 4 | 200 | 338–387 ms | 148–11006 ms | — |
| inspect | step 1: goto / | 1 | 200 | 325 ms | 7001 ms | — |
| inspect | POST 200 RTWebCallBlockSettingHooksQuery (311 ms) | 1 | 200 | 316 ms | 2605 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T212 | 14 | 200 | 302–432 ms | 3607–24124 ms | — |
| inspect | step 2: type e20 | 1 | 200 | 311 ms | 812 ms | — |
| inspect | step 3: press Enter | 1 | 200 | 300 ms | 3945 ms | — |
| inspect | step 5: click e2647 | 1 | 200 | 302 ms | 140 ms | — |
| inspect | POST 200 /ajax/bulk-route-definitions/ (319 ms) | 1 | 200 | 305 ms | 2260 ms | — |
| inspect | step 6: back | 1 | 200 | 303 ms | 2110 ms | — |

<!-- facts:end -->

## What it does

Relay's error/event flush: the GraphQL client reporting on itself.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
