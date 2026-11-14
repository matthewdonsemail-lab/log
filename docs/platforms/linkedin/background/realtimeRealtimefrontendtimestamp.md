# realtimeRealtimefrontendtimestamp

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/realtime/realtimeFrontendTimestamp` |
| Sends | — |
| Reads | `timestamp` |
| Called from | `runs/inspect/20261107T170649_<name:1>/script10.js:16 anonymous`, `runs/inspect/20261107T170649_<name:1>/script31.js:9758 anonymous`, `runs/inspect/20261107T170649_<name:1>/script31.js:2179 statement`, `runs/inspect/20261107T170649_<name:1>/script31.js:4448 statement` |
| rea | `ev_af9b463eaa074cb3bb1a37cc50d2176f28894247e549ead97ba8387ade677134` |

Seen 8 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 200 | 71 ms | 3362 ms | — |
| inspect | step 6: click e2157 | 1 | 200 | 72 ms | 1518272 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 61 ms | 205821 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 56 ms | 3800 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 55 ms | 3256 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 104 ms | 3290 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 125 ms | 3810 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 53 ms | 2539 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 71 ms

Sent:

```json
null
```

Answered:

```json
{
  "timestamp": 1794071203274
}
```

**runs/inspect/20261107T170649_<name:1>**, step 6: click e2157: 200, 72 ms

Sent:

```json
null
```

Answered:

```json
{
  "timestamp": 1794072821413
}
```

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 71 ms

Sent:

```json
null
```

Answered:

```json
{
  "timestamp": 1794071203274
}
```

<!-- facts:end -->

## What it does

The realtime client asks for LinkedIn's server time and reads back one `timestamp` in milliseconds. It sends nothing and fires once on each profile and feed load, about 2.5 to 3.8 seconds in, in 53 to 125 ms.

## What our machine does with it

Nothing: log's LinkedIn direct-API engine (`python/linkedinApi`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) never sends it. The engine takes time from the machine's own clock (the `lastUpdatedBefore` of its inbox read in `python/linkedinApi/messaging.py`).

## What can go wrong

Every answer in our runs is 200. A failure only affects the browser's realtime client; a direct-API run doesn't use it.
