# ajaxTimezoneUpdatePhp

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/timezone/update.php` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_22820a70d07184e3dad79cde4fbbaad7a75a8f7b85ef130a99a5d8f7eb75f99e` |

Seen 5 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Page: loggedIn /marketplace/selling/ "…" | 1 | 200 | 651 ms | 6073 ms | — |
| host | step 3: clickRole button "…" | 1 | 200 | 1051 ms | 8962 ms | — |
| host | step 28: clickRole button "…" | 2 | 200 | 602–636 ms | 7931–7933 ms | — |
| host | step 18: clickRole button "…" | 1 | 200 | 760 ms | 9752 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T164654_61594285317994**, step 18: clickRole button "…": 200, 760 ms

Sent:

```json
{
  "gmt_off": "-420",
  "is_forced": "true",
  "tz": "America/Vancouver"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AZ3qeORAqmlkjVaYW0ayDkp",
  "payload": null,
  "lid": "7701020101913726670"
}
```

<!-- facts:end -->

## What it does

The page reports the browser's timezone to Facebook right after sign-in (`/ajax/timezone/update.php`), about 4 s after the signed-in page opens.

## What our machine does with it

Nothing waits for it, but rule 17's launch self-check exists for it: the timezone sent here must be the exit IP's, or Facebook sees a browser in one place on an IP in another.

## What can go wrong

This is where a timezone mismatch would reach Facebook. The self-check closes the browser before any page loads if the timezone is wrong, so this should always carry the exit IP's zone.
