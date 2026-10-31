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
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:254 statement`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:206 statement` |
| rea | `ev_47a4beb204f955e674b76416a65f5657484f4170026f07eb71bde5adf2f7eb12` |

Seen 6 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 140 ms | 6698 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 215 ms | 5335 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 81 ms | 4472 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 82 ms | 4217 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 177 ms | 10004 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 150 ms | 47846 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 2: snapshot: 200, 150 ms

Sent:

```json
null
```

Answered:

```json
{
  "page": {
    "id": "srhpyqt94yxb",
    "name": "Discord",
    "url": "https://discordstatus.com",
    "time_zone": "America/Los_Angeles",
    "updated_at": "2026-10-30T15:10:10.138-07:00"
  },
  "scheduled_maintenances": []
}
```

**runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder**, step 1: goto /login: 200, 177 ms

Sent:

```json
null
```

Answered:

```json
{
  "page": {
    "id": "srhpyqt94yxb",
    "name": "Discord",
    "url": "https://discordstatus.com",
    "time_zone": "America/Los_Angeles",
    "updated_at": "2026-10-28T00:17:35.842-07:00"
  },
  "scheduled_maintenances": []
}
```

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 140 ms

Sent:

```json
null
```

Answered:

```json
"eyJwYWdlIjp7ImlkIjoic3JocHlxdDk0eXhiIiwibmFtZSI6IkRpc2NvcmQiLCJ1cmwiOiJodHRwczovL2Rpc2NvcmRzdGF0dXMuY29tIiwidGltZV96b25lIjoiQW1lcmljYS9Mb3NfQW5nZWxlcyIsInVwZGF0ZWRfYXQiOiIyMDI2LTEwLTI3VDIzOjI4OjE2LjI4Mi0wNzowMCJ9LCJzY2hlZHVsZWRfbWFpbnRlbmFuY2VzIjpbXX0="
```

<!-- facts:end -->

## What it does

Reads Discord's status page for upcoming maintenance, to show a banner.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
