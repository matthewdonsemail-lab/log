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
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_beebdb1570e2fc7949c4d1c4ca39a65a805c2ed115413bd553d1321f08b6e40b` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 450 ms | 14921 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 362 ms | 16903 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 692 ms | 15056 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 523 ms | 15461 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 450 ms

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

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 362 ms

Sent:

```json
{
  "query": {
    "placement": "3",
    "num_decisions_requested": "1",
    "client_heartbeat_session_id": "76647484-56eb-47e1-a676-e51ce70342ac",
    "client_ad_session_id": "01396277-976e-4ef1-a8ee-7d799a5a8a20"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "c627c131-88a6-45a7-8300-4021861ffbfc",
  "decisions": []
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 9: goto /channels/@me: 200, 692 ms

Sent:

```json
{
  "query": {
    "placement": "3",
    "num_decisions_requested": "1",
    "client_heartbeat_session_id": "76647484-56eb-47e1-a676-e51ce70342ac",
    "client_ad_session_id": "516ae459-ad26-487e-9f8b-c9bb40b202c1"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "5bfd0cc0-fb0d-43e6-8f38-ef3f1418d82b",
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
