# statusApiScheduledMaintenancesUpcomingJson

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `status.discord.com/api/scheduled-maintenances/upcoming.json` |
| Sends | — |
| Reads | `page.id`, `page.name`, `page.url`, `page.time_zone`, `page.updated_at`, `scheduled_maintenances` |
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:23 statement`, `runs/inspect/20261111T233723_deepman2/script10.js:23 statement` |
| rea | `ev_951f5493389bbfeb61083ec3de9e46811ab01c131074667dabb29a16432902ce` |

Seen 14 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 140 ms | 6698 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 215 ms | 5335 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 81 ms | 4472 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 82 ms | 4217 ms | — |
| inspect | step 1: goto /login | 7 | 200 | 82–310 ms | 10004–1044521 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 150 ms | 47846 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 131 ms | 22080 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 80 ms | 1967 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 131 ms

Sent:

```json
null
```

Answered:

```json
{
  "page": {
    "id": "<id:1>",
    "name": "<name:1>",
    "url": "https://discordstatus.com",
    "time_zone": "America/Los_Angeles",
    "updated_at": "2026-11-13T15:05:46.029-08:00"
  },
  "scheduled_maintenances": []
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 102 ms

Sent:

```json
null
```

Answered:

```json
{
  "page": {
    "id": "<id:1>",
    "name": "<name:1>",
    "url": "https://discordstatus.com",
    "time_zone": "America/Los_Angeles",
    "updated_at": "2026-11-11T14:05:02.778-08:00"
  },
  "scheduled_maintenances": []
}
```

**runs/inspect/20261109T192314_deepman2**, step 1: goto /channels/@me: 200, 80 ms

Sent:

```json
null
```

Answered:

```json
"eyJwYWdlIjp7ImlkIjoic3JocHlxdDk0eXhiIiwibmFtZSI6IkRpc2NvcmQiLCJ1cmwiOiJodHRwczovL2Rpc2NvcmRzdGF0dXMuY29tIiwidGltZV96b25lIjoiQW1lcmljYS9Mb3NfQW5nZWxlcyIsInVwZGF0ZWRfYXQiOiIyMDI2LTExLTA5VDA5OjQ0OjQzLjE0NC0wODowMCJ9LCJzY2hlZHVsZWRfbWFpbnRlbmFuY2VzIjpbXX0="
```

<!-- facts:end -->

## What it does

Reads Discord's status page for upcoming maintenance, to show a banner.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
