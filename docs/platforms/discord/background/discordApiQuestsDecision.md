# discordApiQuestsDecision

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/quests/decision` |
| Sends | — |
| Reads | `request_id`, `quest`, `creative.creative_type`, `creative.creative_content`, `creative.starts_at`, `creative.ends_at`, `ad_identifiers`, `ad_context`, `response_ttl_seconds`, `metadata_sealed`, `traffic_metadata_sealed`, `provenance_metadata_sealed` |
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 9 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 644 ms | 5017 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 783 ms | 8359 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 607 ms | 3121 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 580 ms | 2467 ms | — |
| inspect | step 1: goto /login | 3 | 200 | 887–8655 ms | 13524–1047414 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 401 | 359 ms | 9647 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 505 ms | 48946 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 200, 969 ms

Sent:

```json
{
  "query": {
    "placement": "1",
    "client_heartbeat_session_id": "ee3b2ed0-a8b3-4c1c-a140-de9d15be9685",
    "client_ad_session_id": "01455f41-69fa-4b5c-b99a-57a872bda1ba",
    "visible_guild_ids": "1529710922749181963"
  },
  "body": null
}
```

Answered:

```json
{
  "request_id": "6c096432-beab-4122-8869-5f74cfec63d9",
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
  "response_ttl_seconds": 2493,
  "metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dLUmthZ2FtMFkvSExYalhEa2QyZmV2YXErSzErV2ttMzkxSjNycDh0NGthbnh0dmtSaXJqY1VSOEhUSmVlc3pRcjR1d0dhTzQrdUN2ZmpyWGNkY3g1NWJ5djBSdmFRdXVwQWVmc3QrTmlGeTNTeHkxNzdzNW9MV1pmZUtta0ZJVDZUZ1lrVnlEd0h5VTlJdFhxU01kdGJkZFRzL21UOElxbWgycEZ0M0QvWFdWRVhKN2MwQVVXZ01XYjhIQVQzSGIvdkpjZDZaU2U5UEtKdnM2N1NuMmx5Q3NYTUhTL3pwa0FsaFdQZy9pa3NFRkw4VzhxUUFSSU81akpIQjg4… (852 chars)",
  "traffic_metadata_sealed": "eyJrZXlfZmluZ2VycHJpbnQiOiI4ZGUwNzVmMiIsInBheWxvYWQiOiJBWHdMd2dKTEZ4Z2l1Wi9vcGxtY3lNRjJMamZFWDF0cEVjTUM2bXJJMng2ck5vd2t2VTZEcVpjQ0pONUZGZjRHa2tmdlZQRFYxcjhWOExNS2FRUThDU0xhYk8ybjVvTG4rTG5sQjBKV3pzSG9Id3NxbXpNb0R3K1NZTTlHTU5uK0w4bC91QjVmRUxwcmI1TXdJanBKNWhITWNFRHRkdz09In0=",
  "provenance_metadata_sealed": null
}
```

**runs/inspect/20261030T222341_<name:1>**, step 1: goto /channels/@me: 401, 359 ms

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
  "message": "<messageText>",
  "code": 0
}
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 505 ms

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

<!-- facts:end -->

## What it does

Asks which Quest (sponsored task) to show the account on a surface.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
