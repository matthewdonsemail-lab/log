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
| rea | `ev_665985514aead86360df4e46335be347d3f3fa994781fc63d0d47e511a65ef69` |

Seen 24 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | signIn: password typed; submitting with Enter | 4 | 200 | 396–501 ms | 14366–16358 ms | — |
| host | step 9: saveState | 1 | 200 | 345 ms | 114 ms | — |
| host | step 10: goto /marketplace/selling/ | 2 | 200 | 360–561 ms | 1224–6781 ms | — |
| host | step 12: goto /me | 2 | 200 | 338–516 ms | 347–7512 ms | — |
| host | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\host\20261019T163027 | 1 | 200 | 375 ms | 13678 ms | — |
| connect | says: <name> We suspect automated behaviour on your account To prevent your account from b | 1 | 200 | 341 ms | 2782 ms | — |
| connect | Auto-login: answered automatedBehaviour. | 1 | 200 | 339 ms | 454 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 3 | 200 | 346–442 ms | 1563–6856 ms | — |
| warmup | mouse: 2 wander; 0 idle drift move(s) | 1 | 200 | 330 ms | 80 ms | — |
| warmup | POST 200 /ajax/qm/ (591 ms) | 2 | 200 | 337–349 ms | 811–1808 ms | — |
| warmup | scroll: +423px in 11 wheel steps, 703 ms | 1 | 200 | 322 ms | 1443 ms | — |
| warmup | scroll: +513px in 13 wheel steps, 812 ms | 1 | 200 | 356 ms | 390 ms | — |
| warmup | mouse: move failed (TimeoutError) | 3 | 200 | 351–354 ms | 423–7428 ms | — |
| warmup | POST 200 useCometAISupportConversationLoggerMutation (355 ms) | 1 | 200 | 322 ms | 163 ms | — |

<!-- facts:end -->

## What it does

Telemetry: the page's performance and interaction logging, batched. The most frequent request (61).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
