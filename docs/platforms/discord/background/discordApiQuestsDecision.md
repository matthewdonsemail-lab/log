# discordApiQuestsDecision

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/quests/decision` |
| Sends | — |
| Reads | `request_id`, `quest`, `creative.creative_type`, `creative.creative_content`, `creative.starts_at`, `creative.ends_at`, `ad_identifiers`, `ad_context`, `response_ttl_seconds`, `metadata_sealed`, `traffic_metadata_raw`, `traffic_metadata_sealed` and 1 more |
| Called from | `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1059.js:1 parse`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_2070dc40e13af93274e72f1888affeb563d50467d7eb14b18189f1443a1c0d33` |

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 644 ms | 5017 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 783 ms | 8359 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 607 ms | 3121 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 580 ms | 2467 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 887 ms | 13524 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder**, step 1: goto /login: 200, 887 ms

Sent:

```json
{
  "query": {
    "placement": "1",
    "client_heartbeat_session_id": "042a6464-5284-440e-831b-0ed816011058",
    "client_ad_session_id": "8b8ce89d-11bc-4e79-b242-5c10647e14f5",
    "visible_guild_ids": "1514320796837875834"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "19366263-b934-4150-a562-410d493413cb",
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
  "response_ttl_seconds": 2649,
  "metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLMTRjSDBZV28zYlNsQXQ3NHNYTUlTSnVadzJyaGc0WkFpOVM1RFR4T1ZPQm5ib2dkdURHa21obFVnYU1RbmZCNGZETk55YnVSM0J6RXVuQVNFb2p3bVdxZGlvOXRuZUUwa1htemh1TWxUbHNyOE4yUFdzM09OeG1pZUNaZHNOUmxpcVE3TVBzUmFCWWtOdWw0R3ZRZmhwTVNzSGVEU0pRcFVLUmhYZlpHazNKUE1OTzFKTWwwQmxCNyt6NUlzaUhxdk1LSkhBR0d1MnlVdmQyaWxhK0ZuQWF1cEtnRDVHM1V6aUtJLzdVaGVraEtBdTJFdjNmVFFFT3Y0aDhZ… (740 chars)",
  "traffic_metadata_raw": "EAIYAQ==",
  "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dMcFNhN1prazcvTVhOTGFSNnZnOElUYitQZXdmKzhaRm1wb3ZtQmdkZGNMZ3ZsUGJ3N0F1REh6UWZFWnpycEN6VHFjc05XaGRvV2pUOGVoZUZVSC9qOFFMdGU3UmtzT0Jxb29hMEdNdGJMV3N4OVlhREFlbUoxQkRVMzQ1M1UifQ==",
  "provenance_metadata_sealed": null
}
```

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 644 ms

Sent:

```json
{
  "query": {
    "placement": "1",
    "client_heartbeat_session_id": "76647484-56eb-47e1-a676-e51ce70342ac",
    "client_ad_session_id": "c139cbba-8718-4677-a6a8-4401494e07df"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "7b13193f-5dab-45e4-997b-ba1a38c7278a",
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
  "response_ttl_seconds": 2053,
  "metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJanNrb1NNdWdtcVRqRVpISFlqQXpEOWVjclpiejB5c2N0SlFjTjRKV1M1WmpIYUFFN2x4YVpQZUFKdWI1TmVRTWUrd3Yvd2xHTzNkeXJWemRPWm9CR0JTMTBGcnNBRlg0Nm8wYnowczJxTlFEa1ZTbmdPbFRWeXJ5aWtVZHBQZUNrbWo2anA3Tk9OTEovWDVZNlAyQVhmV0VKZ1FjKzhrdmNVaXJScHE2bjU0akxTNTBvUkNWMGtnYzNiTWlLWjZKck8rY3dibnVnQ1J3a0RYK0w1N01Lek1lNzFxZFdIS0Y2ZXdxSDdUTTRxQkY2eHNOQmZ3SFg5SmwzdUVv… (740 chars)",
  "traffic_metadata_raw": "EAIYAQ==",
  "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKV0c1TVlrZDIyR2dPS0xGRlhmZ2VESGlldStxQ3RJWEl5MFdoTDNxT1hqY0pPRHh3ejVlK05tZUY5OTdSaGlYeWNuUTJkRVlYYTJqaHVuMm1hNFdwazB6VFgva1NmM3hKd0FjYlBBUUxaM1ZFeVYxdHptV1NURGZaT0N0QnIifQ==",
  "provenance_metadata_sealed": null
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 783 ms

Sent:

```json
{
  "query": {
    "placement": "1",
    "client_heartbeat_session_id": "76647484-56eb-47e1-a676-e51ce70342ac",
    "client_ad_session_id": "01396277-976e-4ef1-a8ee-7d799a5a8a20",
    "visible_guild_ids": "1514320796837875834"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "304a725f-c9d6-4fef-a883-e233240a5866",
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
  "response_ttl_seconds": 2363,
  "metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dJd0szVzJ1ZkxsREQ1cmZSUEMrb2hoaDNIVVNjcWZqVmsvVENQdFJ3TmhhbWxvaG00WXJhWWxwVmlicWNyQW1PTVZiTThQWUxVUlcyOWw1dTlPM0QwRlJuTDk1ODNmRm5BNVpNV01yS1NEanY0dHQvUjFwVDI4QkwvQ1dGTTNpSG9BVThQNzBxdFhvYjdVY1ViV3ZsUzdmRUNDelo4bDRaVm1ObTQwTVdzRG81RGY1MGVGTkFjLzdZWG1XOXVRa0VEU01HL1JvOUs0L3F2M09DUkF6b3dsVWxPaFFsazhCaFBvekJpWXdXZnBqT1RxTGg1NmxEa0swTGp6YXV3… (740 chars)",
  "traffic_metadata_raw": "EAIYAQ==",
  "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLanU0QzhSeEVDRjMrSWVsQmhBSFhXdmtIQ1R2VlVvVnNRYW1ZbHVXL3d2b1VWYTVNUE5Id2puSjNJVlpJemI0Q0xpaXRDZFFzc0VPc1VDclJLUjZQcUJ5Y05NUlNSSHlFNEcxMUFSNzg1NWFnd3I1RGRISS94enBjTTRJTDgifQ==",
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
