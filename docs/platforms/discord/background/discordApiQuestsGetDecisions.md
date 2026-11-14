# discordApiQuestsGetDecisions

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/quests/get-decisions` |
| Sends | — |
| Reads | `request_id`, `decisions` |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 15 time(s) in 13 run(s).

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
| inspect | step 9: wait 45s | 1 | 200 | 406 ms | 21021 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 9: wait 45s: 200, 406 ms

Sent:

```json
{
  "query": {
    "placement": "3",
    "num_decisions_requested": "1",
    "client_heartbeat_session_id": "06a269e7-4427-4c9d-8f4b-df5393cfa578",
    "client_ad_session_id": "df54e80b-8af2-469b-a072-f2915c0dda0b"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "fb928bcf-82ac-4944-836b-bbff2ee5f3c1",
  "decisions": [
    {
      "creative": {
        "creative_type": 2,
        "creative_content": {
          "id": "<id:1>",
          "label_title": "Anniversary | Claim over $150 in rewards",
          "label_subtitle": "Zhongdu Bridge battle begins! Log in to claim a 2,580 Echo Bead outfit, Lingering Melody & more for our 1st Anniversary!",
          "hero_image": "quests/1570499799676100768/1570501248673910794.jpg",
          "hero_video": "quests/1570499799676100768/1570502386026553567.mp4",
          "sponsor_image": "quests/1570499799676100768/1570502574044356688.png",
          "cta": {
            "url": "https://store.steampowered.com/app/3564740/480?utm_source=DiscordOrbs",
            "button_label": "Play Now"
          },
          "quest_ids": [
            "1569534684185239673",
            "1560184130673840250"
          ],
          "shelf_image": "quests/1570499799676100768/1570500972868935710.jpg",
          "features": []
        },
        "starts_at": "2026-11-14T18:00:00+00:00",
        "ends_at": "2026-11-15T17:59:00+00:00"
      },
      "ad_context": {
        "is_campaign_ias_enabled": false,
        "is_campaign_ios_attribution_enabled": false
      },
      "ad_identifiers": {
        "campaign_id": "1570499799676100769",
        "ad_set_id": "1570499799676100770",
        "ad_id": "1570499799676100771",
        "creative_id": "1570499799676100768",
        "creative_type": 2,
        "served_item_id": "1571235337542303826",
        "original_served_item_id": "1571235337542303826"
      },
      "metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJZHNJTkM2VGUxODdVUFdoVjRPNFBYY2JweFdJRzZXVWVON1ozU3FtT1hzaDJsTjBQN2hXTmJGcmVDeDlUN3ZJRXRybkZiS3Y4MGVOSnN0L2h6empaOTFEaHVNaVRZY0R5cHZWYVNWVmZTc29wRGRHcWs2Y0RFS25JalY1ZzFEK1JvUjRxdmIyNHpEVC9hQUVuV0laajY2ektQTnVBeXp0T0xsOVoxL2VjL25RWjdZWDcwUGVSRXlsOWYreGJJNjlXblNWeW1sS1c3aGtCc0RyU0Z5U0FpL1pQdEV4WERQdldscWhDazc2dVBEVjBhZGNVNUZsb2NzRjZrOGJK… (1872 chars)",
      "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLZ243RitXdDhkenp4NkZKeGhVUGVZR3RURG1LTTdUa2djSEcxQllGS2cwOVF4YzNwazMvZC9hMHl4WXVOQ0dIaFNCQXo0cmJZb2dqb0VndzFXSHJGWFNlOHk1ZG9zdGM4Z3huQ2RVaUh1bGI0NHRoTGJzelk5N09OaTFJVFpadlJsMWJGN0ZRTVdKRUhoTVRVUW5xVVJldz09In0=",
      "provenance_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKWktyUGZXVjdYUmpEQ2JaMXZnd0p1QkFYYW5KQ25rRUpJWTRkZE9DVlNtSDlqKzcwaTZtMTZQOUw1Wi9oVnFNVWhNMXEvcytOdCtRaW50UHlJYm81bThyb1VwQklnZHJ0VXVsN2ZWWGExSjQwdTZtWGpEUVhFWDlJMFhTQ2p4TVpZTzgwTTh2ZkhRbmRxZTdSMklINUlDY0IxNDE3VmJkZlJDNXBUMDg5OTFIVk5KMFNmRzBHVFlYK1c3VWd6T01OajlOVlRNK0RLUHpnWFdpOGV3UCs1NDhRTm9oTDdwUXpncUkwZnBJSHZxMkcvQ3J2Y295TnhCb3R5NjYw… (432 chars)",
      "response_ttl_seconds": 2264
    }
  ]
}
```

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

<!-- facts:end -->

## What it does

The batch version of the Quest decision, for several surfaces at once.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
