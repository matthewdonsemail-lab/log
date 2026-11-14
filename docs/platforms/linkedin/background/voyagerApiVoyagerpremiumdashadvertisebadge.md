# voyagerApiVoyagerpremiumdashadvertisebadge

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerPremiumDashAdvertiseBadge` |
| Sends | — |
| Reads | `data.count`, `data.$type`, `included` |
| Called from | — |
| rea | `ev_99f341f871ab6a7fd99a5029ee1e64c2ae5a59824eea1a83c8954a6041b5977d` |

Seen 25 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 200 | 138 ms | 6000 ms | — |
| inspect | step 6: click e2157 | 6 | 200 | 63–89 ms | 22974–1583052 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 130 ms | 206178 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 154 ms | 4135 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 74 ms | 3713 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 285 ms | 3694 ms | — |
| inspect | step 9: wait 8s | 1 | 200 | 79 ms | 32447 ms | — |
| inspect | step 11: click e1733 | 4 | 200 | 71–101 ms | 69298–909343 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 86 ms | 4209 ms | — |
| inspect | step 14: wait 90s | 1 | 200 | 70 ms | 60659 ms | — |
| inspect | step 17: click e783 | 1 | 200 | 64 ms | 13827 ms | — |
| inspect | step 18: wait 90s | 1 | 200 | 67 ms | 102809 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/server-request (382 ms) | 1 | 200 | 71 ms | 4582 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/server-request (273 ms) | 1 | 200 | 69 ms | 474900 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 132 ms | 2975 ms | — |
| inspect | step 29: snapshot | 1 | 200 | 68 ms | 27522 ms | — |
| chrome | step 8: comment on a post, by hand | 1 | 200 | 76 ms | 4112 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 138 ms

Sent:

```json
null
```

Answered:

```json
{
  "data": {
    "count": 0,
    "$type": "com.linkedin.voyager.dash.premium.ads.BadgeCount"
  },
  "included": []
}
```

**runs/inspect/20261107T170649_<name:1>**, step 6: click e2157: 200, 78 ms

Sent:

```json
null
```

Answered:

```json
{
  "data": {
    "count": 0,
    "$type": "com.linkedin.voyager.dash.premium.ads.BadgeCount"
  },
  "included": []
}
```

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 138 ms

Sent:

```json
null
```

Answered:

```json
{
  "data": {
    "count": 0,
    "$type": "com.linkedin.voyager.dash.premium.ads.BadgeCount"
  },
  "included": []
}
```

<!-- facts:end -->

## What it does

LinkedIn's web client asks for the count on its Advertise badge, the Premium advertising entry in the top bar. It fires on page loads and again during clicks, waits and LinkedIn's own server actions in our inspect runs (24 times in 2 runs), and every answer was a count of 0.

## What our machine does with it

Background traffic: nothing in log's LinkedIn direct-API engine (`python/linkedinApi/`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) sends this call, waits on it or reads its answer. It is a Premium upsell badge with nothing log needs.

## What can go wrong

Every call answered 200 in about 60 to 290 ms. A failure would only leave the badge blank; it never affects a log run.
