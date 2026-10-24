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

A background Messenger (MAW, the encrypted web inbox) query: rea traced it to `MAWRotateCAT`, which rotates the inbox's client access token on a timer. It sends no variables and fires on its own while a page is open, whatever our step does (here, during a scroll on a group's members page, eight minutes into the step).

## What our machine does with it

No machine waits for it or reads it: it is background traffic and never confirms a step. Its answer still counts as a read of the account (rule 73): an error answer here is Facebook saying the account is restricted, even while the page we are on still renders.

## What can go wrong

On 2026-10-24 (61594063207669, inspect 20261024T060921) it answered HTTP 200 with `error 1357053` "Please review your account" ("Your account is currently restricted from performing this action") and `redirectTo: /checkpoint/...`. That is a checkpoint: the account's next page load goes to `/checkpoint`, which the page states `checkpointStart` / `checkpoint` take from there. Nothing is retried; the run reads the checkpoint page next.
