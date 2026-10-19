# ajaxBnzai

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/bnzai` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_262d88fab3be7aa47300d07ddd7f69a8108be9bd772dc983116781db97cc2690` |

Seen 101 time(s) in 20 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 1: goto /me | 1 | 200 | 352 ms | 8222 ms | — |
| flow | step 3: clickRole menuitem "…" | 1 | 200 | 311 ms | 3117 ms | — |
| flow | step 9: goto /profiles/<id>/name | 3 | 200 | 310–332 ms | 19–4656 ms | — |
| flow | step 13: clickRole button "…" | 2 | 200 | 312–348 ms | 3376–5389 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 4 | 200, -1 | -1–564 ms | 55–5586 ms | — |
| inspect | step 1: goto /me | 2 | 200 | 322–617 ms | 13199–13254 ms | — |
| inspect | step 2: click e141 | 1 | 200 | 285 ms | 4162 ms | — |
| inspect | step 3: click e1096 | 1 | 200 | 289 ms | 3339 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T111 | 1 | 200 | 412 ms | 2287 ms | — |
| inspect | POST 200 /ajax/relay-ef/ (331 ms) | 1 | 200 | 319 ms | 1882 ms | — |
| inspect | step 14: goto /profiles/<id>/name | 1 | 200 | 530 ms | 4682 ms | — |
| inspect | page has 21 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T111 | 1 | 200 | 383 ms | 713 ms | — |
| inspect | POST 200 CometLogoutHandlerQuery (460 ms) | 2 | 200 | 301–339 ms | 1582–2749 ms | — |
| inspect | page has 5 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1112 | 1 | 200 | 385 ms | 1248 ms | — |
| inspect | step 2: click e53 | 2 | 200 | 291–369 ms | 1950–10395 ms | — |
| inspect | page has 56 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T110 | 5 | 200 | 298–347 ms | 4992–10735 ms | — |
| inspect | POST 200 useCometAISupportConversationLoggerMutation (376 ms) | 1 | 200 | 336 ms | 4681 ms | — |
| inspect | POST 200 /ajax/webstorage/process_keys/ (322 ms) | 1 | 200 | 316 ms | 1368 ms | — |
| inspect | page has 6 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1103 | 2 | 200 | 315 ms | 14979–15977 ms | — |
| inspect | POST 0 /ajax/qm/ (0 ms) | 1 | 200 | 470 ms | 3895 ms | — |
| inspect | page has 3 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1052 | 1 | 200 | 643 ms | 2931 ms | — |
| inspect | page has 5 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1052 | 2 | 200 | 315–1083 ms | 41010–42732 ms | — |
| inspect | step 3: click e66 | 1 | 200 | 358 ms | 2973 ms | — |
| inspect | page has 7 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1052 | 1 | 200 | 321 ms | 37600 ms | — |
| profile | Opening the profile (facebook.com/me). | 1 | 200 | 314 ms | 10417 ms | — |
| profile | Profile controls: picture not found; cover not found; 4 controls listed in profileFound.tx | 1 | -1 | -1 ms | 692 ms | — |
| publish | Opening /marketplace/create/item | 26 | 200 | 287–1068 ms | 9686–42348 ms | — |
| publish | Uploading 5 photo(s) | 6 | 200 | 287–325 ms | 17943–21981 ms | — |
| connect | Auto-login: answered automatedBehaviour. | 5 | -1, 200 | -1–300 ms | 206–1037 ms | — |
| connect | Signed in; session written for Twenty. | 1 | -1 | -1 ms | 802 ms | — |
| connect | Solving textImage with captchaKraken | 3 | 200 | 307–331 ms | 660–9612 ms | — |
| connect | Page: captcha /checkpoint/<id>/ | 4 | 200 | 299–313 ms | 1846–4404 ms | — |
| connect | Page: checkpoint /checkpoint/<id>/ | 6 | 200 | 306–321 ms | 637–4988 ms | — |
| publish | open failed: formNotFound no Title field on /marketplace/create/item | 1 | -1 | -1 ms | 1054 ms | — |
| publish | Category: Miscellaneous | 7 | 200 | 295–340 ms | 236–5292 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 1 | 200 | 390 ms | 6090 ms | — |

<!-- facts:end -->

## What it does

Telemetry: the page's performance and interaction logging, batched. The most frequent request (61).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
