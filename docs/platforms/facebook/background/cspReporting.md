# cspReporting

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/csp/reporting/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_4621b73d8b9b816243f5682004e9502ffdc0cf1e2ec8364d65e1974481381e99` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Page: loggedIn /marketplace/selling/ "…" | 1 | -1 | -1 ms | 2140 ms | — |

<!-- facts:end -->

## What it does

The browser reporting a Content-Security-Policy violation on the page to Facebook.

## What our machine does with it

Nothing.

## What can go wrong

Worth noticing only if it grows: it is the page reporting something it did not expect to load.
