# discordApiQuestsDecision

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/quests/decision` |
| Sends | — |
| Reads | `message`, `code`, `request_id`, `quest`, `creative.creative_type`, `creative.creative_content`, `creative.starts_at`, `creative.ends_at`, `ad_identifiers`, `ad_context`, `response_ttl_seconds`, `metadata_sealed` and 3 more |
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_03bcffcd69a918fd135e1ae1b5e039a12252bf3b33ae9c150c92f932462ca60e` |

Seen 7 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 644 ms | 5017 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 783 ms | 8359 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 607 ms | 3121 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 580 ms | 2467 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 887 ms | 13524 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 401 | 359 ms | 9647 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 505 ms | 48946 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me: 401, 359 ms

Sent:

```json
{
  "query": {
    "placement": "1",
    "client_heartbeat_session_id": "89078896-68d6-43c2-8cf6-7676bb88761e",
    "client_ad_session_id": "7aa0183c-a722-4bb4-a9c7-700cd2fff0fa"
  },
  "body": null
}
```

Answered:

```json
{
  "message": "401: Unauthorized",
  "code": 0
}
```

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 2: snapshot: 200, 505 ms

Sent:

```json
{
  "query": {
    "placement": "1",
    "client_heartbeat_session_id": "89081172-35da-4e8d-8b5c-da5e1bf81773",
    "client_ad_session_id": "a683df8e-3741-4919-9185-22ceb745e6fb",
    "visible_guild_ids": "1493969349747146974"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "a2646947-3f50-4e19-b8dc-6ed90abde68e",
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
  "response_ttl_seconds": 1890,
  "metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKRHB5b1RJa3JlVENHdE5KR3lGUWY0VUpTTGh6b1VsTGE0OVhNcU9OcitNb3dXVW1DRUVSN3gycm1KUVRkbUxtejdtd1VsbFM0SWh5bDMzRjNJb2d6SE1UemVYTWNvVmErUSsrRW0vallHdDdGZis0eDNOeldidXBWRUlEL2pYZWg2UUVudXpzaS8vRHJGS1pXeTdnV2xnUk9jU1BqK0daVnVoNlkyM0txRlF2T3NSVi90TEFtYWQwem5Kb1NkVmY5bzdYWjVDY2hUQmFHTGh5V0s2S04xNUcvRG14ZU1uNFpnSTFER1dIM1BEdGc1WmJoQmQ5emFGRlBzbGVI… (740 chars)",
  "traffic_metadata_raw": "EAIYAQ==",
  "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLSHFxSTBGQ2NGOE9IOTRxSXRuTVRESjVLeWhYL0xlZzFnNTRLdmN5clN2SXVhN083eElidDVBYjN0T04zQTJsYXdsTkVVVjZ0ZEdXeUxFWTNLVDRqa1dyMUVRSEZQdHArbWJHdTU1VTl5cWJsOHI5dVpHY2RsbU11M3phb1dtOWtoZFg1d080eWVpNU5JdmljSitrNHYvQT09In0=",
  "provenance_metadata_sealed": null
}
```

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

<!-- facts:end -->

## What it does

Asks which Quest (sponsored task) to show the account on a surface.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
