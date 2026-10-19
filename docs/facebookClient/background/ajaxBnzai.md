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
| rea | `ev_5bee8bac109273dd2b1630de0e43a0c730549523f08b21408d80e39b9bc8e0f3` |

Seen 61 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Opening /marketplace/create/item | 26 | 200 | 287–1068 ms | 9686–42348 ms | — |
| publish | Uploading 5 photo(s) | 6 | 200 | 287–325 ms | 17943–21981 ms | — |
| connect | Auto-login: answered automatedBehaviour. | 5 | -1, 200 | -1–300 ms | 206–1037 ms | — |
| connect | Page: loggedIn /marketplace/selling/ "…" | 1 | 200 | 332 ms | 4379 ms | — |
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
