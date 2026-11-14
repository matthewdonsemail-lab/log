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
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_7a525aed00bc250f2d78abf5e6721b142bcec911114b9df420a19b0ab47e0c32` |

Seen 14 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 450 ms | 14921 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 362 ms | 16903 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 692 ms | 15056 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 523 ms | 15461 ms | — |
| inspect | step 1: goto /login | 7 | 200 | 207–7336 ms | 24174–1059434 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 508 ms | 53252 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 258 ms | 30799 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 257 ms | 9915 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 258 ms

Sent:

```json
{
  "query": {
    "placement": "3",
    "num_decisions_requested": "1",
    "client_heartbeat_session_id": "cffd82cb-9599-4f81-b608-3478c0ebc298",
    "client_ad_session_id": "af98833d-5f77-4668-a5de-227e26811adf"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "c63590fd-e048-491a-8064-8757368fafa0",
  "decisions": []
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 217 ms

Sent:

```json
{
  "query": {
    "placement": "3",
    "num_decisions_requested": "1",
    "client_heartbeat_session_id": "30c3d4ef-2b9a-4b4c-9a1c-30b16e540d5e",
    "client_ad_session_id": "f733fcca-d313-4cc3-bc70-62be786db5cf"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "b6a40f37-e081-46e4-92ee-f6f341c771dd",
  "decisions": []
}
```

**runs/inspect/20261109T192314_deepman2**, step 1: goto /channels/@me: 200, 257 ms

Sent:

```json
{
  "query": {
    "placement": "3",
    "num_decisions_requested": "1",
    "client_heartbeat_session_id": "632d3126-b263-4648-9842-2930fe948640",
    "client_ad_session_id": "d3e19332-c1be-4a1f-a7c5-fbb9920245a3"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "4d96c3d3-077d-46ad-b5cf-31ae6fd89725",
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
