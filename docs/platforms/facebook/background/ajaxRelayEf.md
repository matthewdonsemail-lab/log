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
| rea | `ev_4bb3e0322d035f08a136122015975f24f87a85da63b2a5a25f606a6b131115e2` |

Seen 63 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /reel/ | 1 | 200 | 1107 ms | 11286 ms | — |
| inspect | step 2: clickRole button "…" | 1 | 200 | 337 ms | 1733 ms | — |
| inspect | step 3: clickRole button "…" | 4 | 200 | 307–341 ms | 1630–5352 ms | — |
| inspect | rea read step 11_clickroleButtonNextCard: exit 0, ev_189e7df832ac014018be21a4d2fe3eb4b862d | 1 | 200 | 348 ms | 588 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 5 | 200 | 326–404 ms | 182–7657 ms | — |
| inspect | rea read step 13_dwell600s: exit 0, ev_e8922deafb7ba9951a51bda6f8cd82b5b68c41db19bfe0cd164 | 4 | 200 | 344–848 ms | 2954–10083 ms | — |
| inspect | rea read step 20_clickroleButtonNextCard: exit 0, ev_b8ad981adedd3a055cbb6fd651deb9976e71e | 1 | 200 | 339 ms | 847 ms | — |
| inspect | rea read step 22_dwell600s: exit 0, ev_59385bb1add05e2efe91692d85b295ae9cd6334beafd2bccb4a | 1 | 200 | 343 ms | 10833 ms | — |
| inspect | step 24: clickRole button "…" | 2 | 200 | 345–370 ms | 2648–3168 ms | — |
| inspect | rea read step 24_clickroleButtonNextCard: exit 0, ev_08bd0b0aa3e491db75fd341d53b6ccf63883a | 4 | 200 | 314–341 ms | 17473–202836 ms | — |
| inspect | POST 200 RTWebCallBlockSettingHooksQuery (342 ms) | 1 | 200 | 323 ms | 1763 ms | — |
| inspect | POST 200 /ajax/relay-ef/ (323 ms) | 2 | 200 | 334–459 ms | 1573–1639 ms | — |
| inspect | step 6: scrollIn heading "…" 2-3 x 300-500px | 1 | 200 | 393 ms | 646 ms | — |
| inspect | step 7: clickRole button "…" | 1 | 200 | 369 ms | 544 ms | — |
| inspect | POST 200 /ajax/relay-ef/ (369 ms) | 1 | 200 | 331 ms | 1377 ms | — |
| inspect | step 8: clickAny 1 x link /see owner profile$/ | 1 | 200 | 320 ms | 1757 ms | — |
| inspect | page has 44 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T052 | 1 | 200 | 363 ms | 140 ms | — |
| inspect | step 9: goto /reel/<id> | 1 | 200 | 383 ms | 5654 ms | — |
| inspect | step 10: clickRole button "…" | 1 | 200 | 329 ms | 2196 ms | — |
| inspect | page has 38 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T052 | 1 | 200 | 370 ms | 36213 ms | — |
| inspect | step 11: goto /reel/ | 1 | 200 | 383 ms | 2614 ms | — |
| inspect | POST 200 OhaiWebPublicKeyConfigQuery (630 ms) | 1 | 200 | 341 ms | 4133 ms | — |
| inspect | POST 200 /ajax/bnzai (347 ms) | 1 | 200 | 376 ms | 2547 ms | — |
| inspect | step 18: clickRole button "…" | 1 | 200 | 329 ms | 74 ms | — |
| inspect | step 20: goto /reel/<id> | 4 | 200 | 409–1554 ms | 4546–9491 ms | — |
| inspect | page has 39 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T052 | 1 | 200 | 492 ms | 2275 ms | — |
| inspect | step 22: goto /reel/ | 2 | 200 | 1585–1632 ms | 2429–5077 ms | — |
| inspect | POST 200 /ajax/relay-ef/ (1632 ms) | 1 | 200 | 369 ms | 2236 ms | — |
| inspect | step 26: dwell 3s | 2 | 200 | 321–336 ms | 3390–5381 ms | — |
| inspect | mouse: 1 wander, 1 flick; 1 idle drift move(s) | 1 | 200 | 320 ms | 466 ms | — |
| inspect | step 28: dwell 2s | 1 | 200 | 1196 ms | 3345 ms | — |
| inspect | step 35: clickRole button "…" | 1 | 200 | 318 ms | 4746 ms | — |
| inspect | step 48: clickRole button "…" | 1 | 200 | 329 ms | 4171 ms | — |
| inspect | mouse: 1 wander, 1 approach, 1 flick; 1 idle drift move(s) | 1 | 200 | 1404 ms | 252 ms | — |
| inspect | step 53: goto /reel/ | 1 | 200 | 464 ms | 14232 ms | — |
| inspect | step 54: clickRole button "…" | 1 | 200 | 320 ms | 15 ms | — |
| inspect | step 62: clickRole button "…" | 1 | 200 | 372 ms | 1584 ms | — |
| inspect | step 67: dwell 1s | 4 | 200 | 490–708 ms | 3777–4089 ms | — |
| inspect | page has 45 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T052 | 2 | 200 | 315–320 ms | 517–1064 ms | — |

<!-- facts:end -->

## What it does

Relay's error/event flush: the GraphQL client reporting on itself.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
