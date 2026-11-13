# edgeapiCachePermissionsInfo

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | people |
| Kind | endpoint |
| doc_id | — |
| Path | `edgeapi.slack.com/cache/permissions/info` |
| Sends | — |
| Reads | `allowed`, `allowed_per_team`, `ok` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script38.js:771 anonymous` |
| rea | `ev_c768a8dd3a32ade2e987e251d0627a66b7d798dc007c87a92e41828826c7a8e2` |

Seen 12 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 5 | 200 | 73–425 ms | 7942–9350 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 6 | 200 | 49–185 ms | 5523–14987 ms | — |
| inspect | step 9: press Control+a | 1 | 200 | 101 ms | 16052 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 282 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"<slackToken>\",\"user_id\":\"<userId:1>\",\"permissions\":[\"ACCESS_SLACK_AI_TODAY\"],\"as_admin\":true}"
}
```

Answered:

```json
{
  "allowed": [],
  "allowed_per_team": {},
  "ok": true
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 184 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"<slackToken>\",\"user_id\":\"<userId:1>\",\"permissions\":[\"ACCESS_SLACK_AI_TODAY\"],\"as_admin\":true}"
}
```

Answered:

```json
{
  "allowed": [],
  "allowed_per_team": {},
  "ok": true
}
```

**runs/inspect/20261103T065639_mattSlack**, step 9: press Control+a: 200, 101 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"<slackToken>\",\"user_id\":\"<userId:1>\",\"permissions\":[\"MANAGE_SALESFORCE_CONNECTIONS\",\"MANAGE_SALESFORCE_MCP_SERVERS\"],\"as_admin\":true}"
}
```

Answered:

```json
{
  "allowed": [],
  "allowed_per_team": {},
  "ok": true
}
```

<!-- facts:end -->

## What it does

Asks Slack's cache service which things the account is allowed to look up (`allowed`, `allowed_per_team`): it answered `allowed: []` and `allowed_per_team: {}` with `ok: true`. Seen 5 times in step 4 (`goto /client`, 73-425 ms), 6 times in step 6 and once in step 9 (`press Control+a`, 101 ms), all 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded. Gabriel's EdgeAPI calls are `users/info` and `channels/info` through `call_edge_api` (`vendor/gabrielSlack/gabriel/client/hydrator.py`), neither used by the engine.

## What can go wrong

The answer is empty for this account, so the client has no extra permissions to read. If the cache service refuses, the answer carries `ok: false` and an `error`; every recorded answer was 200.
