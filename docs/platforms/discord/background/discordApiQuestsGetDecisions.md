# discordApiQuestsGetDecisions

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/quests/get-decisions` |
| Sends | — |
| Reads | `request_id`, `decisions` |
| Called from | `runs/inspect/20261113T044840_<name:1>/script0.js:232 625075`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 559868`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 961943`, `runs/inspect/20261113T044840_<name:1>/script1294.js:1 634654` |
| rea | `ev_75e0c23fd6444f1c48be7aa1d3fb551ec7962bf2d92d7d99e9551f5632a33218` |

Seen 7 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 450 ms | 14921 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 362 ms | 16903 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 692 ms | 15056 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 523 ms | 15461 ms | — |
| inspect | step 1: goto /login | 2 | 200 | 395–7336 ms | 24174–48704 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 508 ms | 53252 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T044840_<name:1>**, step 1: goto /login: 200, 7336 ms

Sent:

```json
{
  "query": {
    "placement": "3",
    "num_decisions_requested": "1",
    "client_heartbeat_session_id": "18fa4278-989f-4a8a-a0cd-a6ac55dae24e",
    "client_ad_session_id": "f20855a6-d7de-453b-9ffc-da1aa6c9dfe7"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "05f4c160-2b54-4f5b-9181-81700c8a6c74",
  "decisions": []
}
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 508 ms

Sent:

```json
{
  "query": {
    "placement": "3",
    "num_decisions_requested": "1",
    "client_heartbeat_session_id": "89081172-35da-4e8d-8b5c-da5e1bf81773",
    "client_ad_session_id": "a683df8e-3741-4919-9185-22ceb745e6fb"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "b5af6f95-b8d1-436e-bf9b-d90acf885631",
  "decisions": []
}
```

**runs/inspect/20261028T065202_<name:1>**, step 1: goto /channels/@me/<id>: 200, 450 ms

Sent:

```json
{
  "query": {
    "placement": "3",
    "num_decisions_requested": "1",
    "client_heartbeat_session_id": "76647484-56eb-47e1-a676-e51ce70342ac",
    "client_ad_session_id": "c139cbba-8718-4677-a6a8-4401494e07df"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "a5280851-3126-4788-8a5f-1d6052692aa7",
  "decisions": []
}
```

<!-- facts:end -->

## What it does

The batch version of the Quest decision, for several surfaces at once.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
