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
| Called from | `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:206 statement` |
| rea | `ev_0b9e8638c708d23e0eafbf94a992d31b28202ab915f0909b372b749417d2a866` |

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 140 ms | 6698 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 215 ms | 5335 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 81 ms | 4472 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 82 ms | 4217 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 177 ms | 10004 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

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

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 215 ms

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
    "updated_at": "2026-10-27T23:28:16.282-07:00"
  },
  "scheduled_maintenances": []
}
```

<!-- facts:end -->

## What it does

Reads Discord's status page for upcoming maintenance, to show a banner.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
