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

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| connect | Page: loggedIn /marketplace/selling/ "…" | 1 | 200 | 651 ms | 6073 ms | — |
| host | step 3: clickRole button "…" | 1 | 200 | 1051 ms | 8962 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261024T211541_61593939852820**, step 3: clickRole button "…": 200, 1051 ms

Sent:

```json
{
  "gmt_off": "-240",
  "is_forced": "true",
  "tz": "America/New_York"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "ACA3Fv27sucSD3jfRuLmirY",
  "payload": null,
  "lid": "7700346294843364284"
}
```

<!-- facts:end -->

## What it does

The page reports the browser's timezone to Facebook right after sign-in (`/ajax/timezone/update.php`), about 4 s after the signed-in page opens.

## What our machine does with it

Nothing waits for it, but rule 17's launch self-check exists for it: the timezone sent here must be the exit IP's, or Facebook sees a browser in one place on an IP in another.

## What can go wrong

This is where a timezone mismatch would reach Facebook. The self-check closes the browser before any page loads if the timezone is wrong, so this should always carry the exit IP's zone.
