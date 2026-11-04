# edgeapiCacheUsersCounts

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | people |
| Kind | endpoint |
| doc_id | — |
| Path | `edgeapi.slack.com/cache/users/counts` |
| Sends | — |
| Reads | `channel`, `counts.everyone`, `counts.people`, `counts.members`, `counts.guests`, `counts.bots`, `counts.apps`, `counts.by_team`, `ok` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script38.js:771 anonymous` |
| rea | `ev_c768a8dd3a32ade2e987e251d0627a66b7d798dc007c87a92e41828826c7a8e2` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 498 ms | 8084 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 498 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"xoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\",\"channel\":\"C0C4L7RSTGX\",\"as_admin\":false}"
}
```

Answered:

```json
{
  "channel": "C0C4L7RSTGX",
  "counts": {
    "everyone": 1,
    "people": 1,
    "members": 1,
    "guests": 0,
    "bots": 0,
    "apps": 0,
    "by_team": {
      "T0C4VCD06MR": 1
    }
  },
  "ok": true
}
```

<!-- facts:end -->

## What it does

Asks the cache service how many people a channel has (`channel: C0C4L7RSTGX`): it answered `counts.everyone: 1`, `people: 1`, `members: 1`, `guests: 0`, `bots: 0`, `by_team` for `T0C4VCD06MR`. Fired once, 8.1 s into step 4 (`goto /client`), 498 ms, 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded.

## What can go wrong

A channel the account can't see would answer with `ok: false` and an `error`; the one recorded call was 200 with `ok: true`.
