# MAWCatQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29559957360285299` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | — |
| Called from | `MAWCatQuery`, `MAWRotateCAT` |
| rea | `ev_18dbd7206505800a8ddbf17eb0dec7d6afa310f8d76717ab45292934a46f380c` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: +515px in 13 wheel steps, 656 ms | 1 | 200 | 365 ms | 491996 ms | error 1357053: Please review your account |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T060921_61594063207669**, scroll: +515px in 13 wheel steps, 656 ms: 200, 365 ms

Sent:

```json
{
  "qpl_active_flow_ids": "1056841865,1056847537,25310984,431626709",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MAWCatQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "29559957360285299",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=1056841865,1056847537,25310984,431626709"
  ]
}
```

Answered:

```json
{
  "error": 1357053,
  "errorSummary": "Please review your account",
  "errorDescription": "Your account is currently restricted from performing this action; please review your account",
  "redirectTo": "/checkpoint/1501092823525282/"
}
```

<!-- facts:end -->

## What it does

Messenger on the web (`MAWCatQuery`, `MAWRotateCAT`) asks for its chat access token when it starts or rotates it. It sends no variables and fires in the background, not from any step of ours.

## What our machine does with it

Nothing waits for it or reads it. In run 20261024T060921 it fired during a members-tab scroll, about 8 minutes after the step started, and came back with the checkpoint (below).

## What can go wrong

It answered 200 with `error` 1357053, "Please review your account" ("Your account is currently restricted from performing this action"), and `redirectTo` `/checkpoint/1501092823525282/`. That means the account is in Facebook's checkpoint: the page goes to `/checkpoint/` and the open session sets the account to CHECKPOINT in Twenty (`watchCheckpoint`, rule 77).
