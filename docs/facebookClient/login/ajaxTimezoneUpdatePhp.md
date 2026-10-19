# ajaxTimezoneUpdatePhp

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/timezone/update.php` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_6877030934e576a7eb71082d63be73eb2d382fb49544ca6f4f94cc555abe167f` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Page: loggedIn /marketplace/selling/ "…" | 1 | 200 | 527 ms | 4174 ms | — |
| connect | Page: loggedIn /marketplace/selling/ | 1 | 200 | 661 ms | 3746 ms | — |

<!-- facts:end -->

## What it does

The page reports the browser's timezone to Facebook right after sign-in (`/ajax/timezone/update.php`), about 4 s after the signed-in page opens.

## What our machine does with it

Nothing waits for it, but rule 17's launch self-check exists for it: the timezone sent here must be the exit IP's, or Facebook sees a browser in one place on an IP in another.

## What can go wrong

This is where a timezone mismatch would reach Facebook. The self-check closes the browser before any page loads if the timezone is wrong, so this should always carry the exit IP's zone.
