# ajaxBz

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/bz` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_5a868e88094489f9152e54cf6c06833679ecdfeb9dffddf5d9f9fabd280635b9` |

Seen 79 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Opening Marketplace > Selling. | 35 | -1 | -1 ms | 5887–11459 ms | — |
| connect | Auto-login: typing the email. | 6 | -1 | -1 ms | 179–2808 ms | — |
| connect | Auto-login: submitting (Enter). | 12 | -1 | -1 ms | 26–127 ms | — |
| connect | Auto-login: typing the password. | 5 | -1 | -1 ms | 988–3293 ms | — |
| connect | says: (no text) / buttons: none | 7 | -1 | -1 ms | 2226–4353 ms | — |
| inspect | step 1: goto /marketplace/you/selling | 7 | -1 | -1 ms | 5911–8926 ms | — |
| inspect | page has 61 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T110 | 1 | -1 | -1 ms | 86 ms | — |
| inspect | step 2: click e675 | 3 | -1 | -1 ms | 920–3340 ms | — |
| inspect | POST 0 /ajax/bz (0 ms) | 2 | -1 | -1 ms | 1710–1965 ms | — |
| inspect | signIn: password typed; submitting with Enter | 1 | -1 | -1 ms | 97 ms | — |

<!-- facts:end -->

## What it does

Telemetry: the page's error and event logging, batched.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
