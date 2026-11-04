# edgeapiCacheHuddlesInfo

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | activity |
| Kind | endpoint |
| doc_id | — |
| Path | `edgeapi.slack.com/cache/huddles/info` |
| Sends | — |
| Reads | `huddles`, `ok` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script38.js:771 anonymous` |
| rea | `ev_c768a8dd3a32ade2e987e251d0627a66b7d798dc007c87a92e41828826c7a8e2` |

Seen 4 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 2 | 200 | 93–286 ms | 7947–9300 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 2 | 200 | 53–201 ms | 5512–7929 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 286 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"xoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\",\"channel_ids\":[\"C0C4L7RSTGX\"]}"
}
```

Answered:

```json
{
  "huddles": [],
  "ok": true
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 201 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"xoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\",\"channel_ids\":[\"D0C8VAE7REU\"]}"
}
```

Answered:

```json
{
  "huddles": [],
  "ok": true
}
```

<!-- facts:end -->

## What it does

Asks Slack's edge cache for huddle info on the open channels: it sent a JSON body with the `token` and `channel_ids` (`D0C8VAE7REU` on step 6) and answered `huddles: []`, `ok: true`. Seen 4 times, twice on step 4 goto /client (93-286 ms) and twice on step 6 goto the DM (53-201 ms).

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`, actions ping, workspaces, chats, read, send, watch over `vendor/gabrielSlack`) never uses this endpoint; it is Slack's web client's own traffic, seen only because the `log inspect` AdsPower run on mattSlack loaded the page. An empty `huddles` list means no huddle was running in the DM.

## What can go wrong

All four calls were 200. A non-ok answer or timeout from this edge host would only hide a huddle indicator in the client; our send, read and watch don't use it.
