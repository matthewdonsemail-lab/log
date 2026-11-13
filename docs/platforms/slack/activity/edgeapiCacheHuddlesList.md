# edgeapiCacheHuddlesList

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | activity |
| Kind | endpoint |
| doc_id | — |
| Path | `edgeapi.slack.com/cache/huddles/list` |
| Sends | — |
| Reads | `huddles`, `ok` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script38.js:771 anonymous` |
| rea | `ev_c768a8dd3a32ade2e987e251d0627a66b7d798dc007c87a92e41828826c7a8e2` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 516 ms | 7654 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 1 | 200 | 57 ms | 4993 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 516 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"<slackToken>\"}"
}
```

Answered:

```json
{
  "huddles": [],
  "ok": true
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 57 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"<slackToken>\"}"
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

Asks Slack's edge cache for the list of huddles running in the workspace: it sent only the `token` and answered `huddles: []`, `ok: true`, once on step 4 goto /client (516 ms) and once on step 6 goto the DM (57 ms).

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`, actions ping, workspaces, chats, read, send, watch over `vendor/gabrielSlack`) never uses this endpoint; it is Slack's web client's own traffic, seen only because the `log inspect` AdsPower run on mattSlack loaded the page.

## What can go wrong

Both calls were 200. If it answered `ok: false` the client would simply show no huddles; nothing of ours reads it.
