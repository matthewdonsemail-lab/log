# ajaxRelayEf

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/relay-ef/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_e75ad497153a665502e8a0070e8afac84ad6ee185f5b7ab04cc7e88de2b65711` |

Seen 88 time(s) in 15 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /marketplace/ | 6 | 200 | 311–341 ms | 8130–20480 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T123 | 9 | 200 | 311–473 ms | 1346–30957 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T122 | 9 | 200 | 312–499 ms | 639–339168 ms | — |
| inspect | page has 0 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1223 | 8 | 200 | 372–523 ms | 6839–18482 ms | — |
| inspect | POST 200 useMWEncryptedBackupsFetchBackupIdsV2Query (929 ms) | 2 | 200 | 1659–2893 ms | 2539–3854 ms | — |
| inspect | step 3: highlight link "…" | 3 | 200 | 430–727 ms | 890–1198 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T121 | 4 | 200 | 402–532 ms | 3710–13805 ms | — |
| inspect | POST 200 /ajax/bulk-route-definitions/ (5348 ms) | 1 | 200 | 848 ms | 1269 ms | — |
| inspect | step 4: clickRole link "…" | 1 | 200 | 400 ms | 3588 ms | — |
| inspect | POST 200 RTWebCallBlockSettingHooksQuery (337 ms) | 2 | 200 | 311–351 ms | 2983–3122 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T120 | 6 | 200 | 302–354 ms | 16149–29272 ms | — |
| inspect | POST 200 /ajax/bulk-route-definitions/ (850 ms) | 2 | 200 | 614–1228 ms | 192–511 ms | — |
| inspect | POST 200 CometSearchBootstrapKeywordsDataSourceQuery (517 ms) | 3 | 200 | 300–306 ms | 140–3058 ms | — |
| inspect | page has 65 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T115 | 11 | 200 | 295–320 ms | 601–65420 ms | — |
| flow | step 1: goto /me | 2 | 200 | 310–345 ms | 9066–14888 ms | — |
| flow | step 3: clickRole menuitem "…" | 2 | 200 | 390–405 ms | 442–455 ms | — |
| flow | step 5: clickRole button "…" | 2 | 200 | 322–407 ms | 6428–10690 ms | — |
| flow | step 7: uploadRole menuitem "…" | 2 | 200 | 310–418 ms | 282–288 ms | — |
| flow | step 12: clickRole button "…" | 2 | 200 | 487–503 ms | 1301–1584 ms | — |
| flow | step 6: clickRole button "…" | 1 | 200 | 353 ms | 240 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 3 | -1, 200 | -1–331 ms | 62–5231 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 392 ms | 13621 ms | — |
| inspect | step 3: click e1096 | 1 | 200 | 288 ms | 617 ms | — |
| inspect | now on /profile.php "…" after 2734 ms; 0 request(s) | 1 | 200 | 330 ms | 1444 ms | — |
| inspect | POST 200 /ajax/webstorage/process_keys/ (302 ms) | 1 | 200 | 309 ms | 1098 ms | — |
| inspect | step 21: click e208 | 1 | 200 | 569 ms | 1785 ms | — |
| publish | Opening /marketplace/create/item | 2 | 200 | 313–1095 ms | 11866–15308 ms | — |

<!-- facts:end -->

## What it does

Relay's error/event flush: the GraphQL client reporting on itself.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
