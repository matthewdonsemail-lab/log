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
| rea | `ev_262d88fab3be7aa47300d07ddd7f69a8108be9bd772dc983116781db97cc2690` |

Seen 16 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 1: goto /me | 1 | 200 | 310 ms | 9066 ms | — |
| flow | step 3: clickRole menuitem "…" | 1 | 200 | 405 ms | 442 ms | — |
| flow | step 5: clickRole button "…" | 1 | 200 | 322 ms | 6428 ms | — |
| flow | step 6: clickRole button "…" | 1 | 200 | 353 ms | 240 ms | — |
| flow | step 7: uploadRole menuitem "…" | 1 | 200 | 310 ms | 282 ms | — |
| flow | step 12: clickRole button "…" | 1 | 200 | 503 ms | 1301 ms | — |
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
