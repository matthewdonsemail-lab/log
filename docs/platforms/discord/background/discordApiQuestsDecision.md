# discordApiQuestsDecision

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/quests/decision` |
| Sends | — |
| Reads | `request_id`, `quest`, `creative.creative_type`, `creative.creative_content`, `creative.starts_at`, `creative.ends_at`, `ad_identifiers`, `ad_context`, `response_ttl_seconds`, `metadata_sealed`, `traffic_metadata_sealed`, `provenance_metadata_sealed` and 2 more |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 17 time(s) in 14 run(s).

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
| inspect | step 9: wait 45s | 1 | 200 | 343 ms | 13717 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 9: wait 45s: 200, 343 ms

Sent:

```json
{
  "query": {
    "placement": "1",
    "client_heartbeat_session_id": "06a269e7-4427-4c9d-8f4b-df5393cfa578",
    "client_ad_session_id": "df54e80b-8af2-469b-a072-f2915c0dda0b",
    "visible_guild_ids": "737009125862408274"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "72f5cd7f-a5b3-4fa1-8e1f-f272ef092db6",
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
  "response_ttl_seconds": 1944,
  "metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMUlJmSjJrMVpDeGJuUkhPOXVnTUlXVWllSVNRRVViODI3bVR3TE81bnRKcHRTRW1LeDI3TnUza1FxdElhUVJIdy92d2J3bGpObmNwYXNKQk1DcXFRdFdyY3JncWM1ODlRdWhBdTVUYUN6bER4L1ZMQmVKNHVJd0NtMDk5ckNpOXFuVVl5UU4xS3pzUVIxQm5KS2pmNitUNlJiMk5iY09rQkp1VCtidzZrbHVjaldCZkdUQ3NxN09oeVNYMlNiZ25DZjhHK2FCOUEwQnNJVXdVQ1d3U1JWbUNCVWlSaEsyZnE2YnQwQy9oSzFZeXF0d3pYTFhWSHpxR0t0dDMz… (768 chars)",
  "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKQ2FhanNGUGFXeC9DakdGWXdVMG1NSEJ4TUVETUV4T002M09MNkFRMCtyKzdUb1RUaFhYZnNDMDBxWThNODdaanp4bU1NaHF6TXhTSnNMYUhnSWJSZlRTNENucEs1ZHpkYnVJNG5JZG1qeE8xZ2N3amJleEpDZ0F1a1czbXRIdTlxdEttWmxpWGlHeHhjdyt0T1kxRnRFdz09In0=",
  "provenance_metadata_sealed": null
}
```

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

<!-- facts:end -->

## What it does

Asks which Quest (sponsored task) to show the account on a surface.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
