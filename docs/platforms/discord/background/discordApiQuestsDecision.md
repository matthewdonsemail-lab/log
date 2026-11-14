# discordApiQuestsDecision

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/quests/decision` |
| Sends | — |
| Reads | `request_id`, `quest`, `creative.creative_type`, `creative.creative_content`, `creative.starts_at`, `creative.ends_at`, `ad_identifiers`, `ad_context`, `response_ttl_seconds`, `metadata_sealed`, `traffic_metadata_sealed`, `provenance_metadata_sealed` and 2 more |
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_a075d6b161976dbb3945bd19366294eb825108e52c5c2a149ceec48e35cdb702` |

Seen 16 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 644 ms | 5017 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 783 ms | 8359 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 607 ms | 3121 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 580 ms | 2467 ms | — |
| inspect | step 1: goto /login | 7 | 200 | 299–8655 ms | 13524–1047414 ms | — |
| inspect | step 1: goto /channels/@me | 3 | 401, 200 | 149–464 ms | 1227–9647 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 505 ms | 48946 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 636 ms | 22730 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 636 ms

Sent:

```json
{
  "query": {
    "placement": "1",
    "client_heartbeat_session_id": "cffd82cb-9599-4f81-b608-3478c0ebc298",
    "client_ad_session_id": "af98833d-5f77-4668-a5de-227e26811adf",
    "visible_guild_ids": "737009125862408274"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "07095d19-b21a-4d73-b2c6-e7cc28ed1930",
  "quest": null,
  "creative": {
    "creative_type": 4,
    "creative_content": {
      "ad_content_id": "0"
    },
    "starts_at": null,
    "ends_at": null
  },
  "ad_identifiers": null,
  "ad_context": null,
  "response_ttl_seconds": 2247,
  "metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMQUtoWHRkV2FpV3dWU0MwVi9adFpHQVZpYkwzajVLNE41MWJyeXZTWHpacXlFNlcvYjYvV0xxdGJNcTRZSXFJVTYwcjZmUkdEWjNoNkZ6UnpIK2JNY3NOa1VsSk5QZW1zWkF5OGxyYk90dmU0R2xHRlU0Um9RYTQ2RGVoQ3h5c3k5OXVGWUJsQUtHNGQrQzBmVXllc3NsRitlNlp4ZWZsOC9CTUphUXBHS2NLWkk0alRLRkkrRENiYklMaGprUEZWUWZUODdOOVA5T0ZualVtRGVwbzEzWVpzL285aExlVW1MTTBjKzFyYVF1bHhNQlZibEZ6TDBiNzNFTjZK… (768 chars)",
  "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKTzZnN1p2bnJraEU3NVlIZXJGVVhJbUNUdE9reGJBUkNrNSs3cWtqY0tuRFM2ZHlQSUliaHhGRm9oQlZmNGQ2TjhaYXNrVGdsQzhnNzgwYU55YVZXdi9ldmRxNnJzSjlsanl5TTFVTVBxT3lxV2FCQktub2NBWkpGbWI2RmVjdGpiZ01oYjJjMHJ4dkplZ3N0R1VzelZZUT09In0=",
  "provenance_metadata_sealed": null
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 819 ms

Sent:

```json
{
  "query": {
    "placement": "1",
    "client_heartbeat_session_id": "30c3d4ef-2b9a-4b4c-9a1c-30b16e540d5e",
    "client_ad_session_id": "f733fcca-d313-4cc3-bc70-62be786db5cf",
    "visible_guild_ids": "646488127980044348"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "ac6d8a2b-c888-40a8-8423-300858fb778f",
  "quest": null,
  "creative": {
    "creative_type": 4,
    "creative_content": {
      "ad_content_id": "0"
    },
    "starts_at": null,
    "ends_at": null
  },
  "ad_identifiers": null,
  "ad_context": null,
  "response_ttl_seconds": 1904,
  "metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKRHNadks0SFdtNzkrcnhEVGFadWU1UzR4bndoV0kyZEpMaFU5N3Q1MUVObG50TW1wL2FYRmFhTTM2bzdmdDRkMUVmN1E4RGkzcTNITUFhaDBZNTVTYjRoelZjRjZvQ1RLM2hmdVM5dmhoaDZ2MXg3R2RyWjdmYmhmMEZOaSt0emxmSERrV0Fxbkt5VWJ5Y3hJRXFkMGVLemN3amRDZXl6ZVE5eDRxNTF1T0JMY3NxcUZYZlBTYW1KK3duMk9HUTNEazdvNXozUkxMa1p5S214NEhTZ3NiRVNmMG5pZXpKcWpCdGdVMUQ3R256UEdLY05VMWVuc1B4blhnRHZz… (768 chars)",
  "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLRS94QkdaQTREZ1RLd055UCtkM2JDOTEzc1R3akdhY0tNM0JTVnAraGVaSWZqSGNlcFNKY2d2ZGt1UnhyTEhtT243a2taaGVLdHFKTUxreWhjTll6eEVqb292aGZJZFVjMGxEVS80cVhpR2pzYVRjeldmT3ovU2hoaWhLcTdaeGxyWnBKQkJYYmxmQklrcVZDYkg1Smxtdz09In0=",
  "provenance_metadata_sealed": null
}
```

**runs/inspect/20261109T193411_deepman2**, step 1: goto /channels/@me: 401, 149 ms

Sent:

```json
{
  "query": {
    "placement": "1",
    "client_heartbeat_session_id": "632d3126-b263-4648-9842-2930fe948640",
    "client_ad_session_id": "2a1af903-73dc-4bf6-bd72-c1813dc422ca"
  },
  "body": null
}
```

Answered:

```json
{
  "message": "<messageText>",
  "code": 0
}
```

<!-- facts:end -->

## What it does

Asks which Quest (sponsored task) to show the account on a surface.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
