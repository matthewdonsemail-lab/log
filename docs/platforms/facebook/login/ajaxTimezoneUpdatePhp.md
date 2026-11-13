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
| inspect | step 8: click e53 | 1 | 200 | 1245 ms | 17510 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261111T081957_<id:1>**, step 8: click e53: 200, 1245 ms

Sent:

```json
{
  "gmt_off": "-420",
  "is_forced": "true",
  "tz": "America/Vancouver",
  "qpl_active_flow_ids": "1056839232"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "A8AQUkc02_1CMTnMkV7iXUH",
  "payload": null,
  "lid": "7706829268722279569"
}
```

**runs/host/20261024T222706_<id:3>**, step 28: clickRole button "…": 200, 602 ms

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
  "rid": "ANNb6IV3KUGN8UoCOsqImyq",
  "payload": null,
  "lid": "7700365765260980866"
}
```

**runs/host/20261024T211541_<id:2>**, step 3: clickRole button "…": 200, 1051 ms

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
