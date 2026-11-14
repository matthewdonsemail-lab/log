# realtimeConnect

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/realtime/connect` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261107T170649_<name:1>/script31.js:9748 F`, `runs/inspect/20261107T170649_<name:1>/script8.js:3 isRealtimeTelemetryRequest`, `runs/inspect/20261107T170649_<name:1>/script10.js:16 statement`, `runs/inspect/20261107T170649_<name:1>/script61.js:246 anonymous` |
| rea | `ev_d94202cf3fdca670507050a7f1df2433508b971a4c96e7d25d1337e450111def` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 0 | 775096 ms | 3276 ms | — |
| inspect | step 6: click e2157 | 1 | 0 | 841081 ms | 676120 ms | — |
| inspect | step 6: goto /feed/ | 1 | 0 | 818092 ms | 3115 ms | — |
| inspect | step 12: goto /feed/ | 1 | 0 | 776123 ms | 3653 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 0, 775096 ms

Sent:

```json
{
  "query": {
    "rc": "1"
  },
  "body": null
}
```

Answered:

```json
null
```

**runs/inspect/20261107T170649_<name:1>**, step 6: click e2157: 0, 841081 ms

Sent:

```json
{
  "query": {
    "rc": "1"
  },
  "body": null
}
```

Answered:

```json
null
```

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 0, 775096 ms

Sent:

```json
{
  "query": {
    "rc": "1"
  },
  "body": null
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

The web client's realtime connection: a long-lived request (`rc=1` in the query) that LinkedIn holds open to push live events to the page. It opens about 3 seconds after a profile or feed load and stays open for 13 to 14 minutes in our recordings.

## What our machine does with it

Nothing: log's LinkedIn direct-API engine (`python/linkedinApi`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) never sends it and opens no realtime connection. Its inbox and messages reads (`inbox`, `messages`, through `python/linkedinApi/messaging.py`) ask the messaging GraphQL each time instead of listening here.

## What can go wrong

Status 0 in every row means the recording ended while the connection was still open, not that LinkedIn refused it; no answer body is recorded. It never affects a direct-API run.
