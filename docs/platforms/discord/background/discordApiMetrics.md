# discordApiMetrics

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/metrics` |
| Sends | `metrics`, `client_info` |
| Reads | — |
| Called from | `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1059.js:1 parse`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_2070dc40e13af93274e72f1888affeb563d50467d7eb14b18189f1443a1c0d33` |

Seen 5 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 204 | 367 ms | 79666 ms | — |
| inspect | step 6: wait 6s | 1 | 204 | 379 ms | 4339 ms | — |
| inspect | step 11: type e2625 | 1 | 204 | 337 ms | 21744 ms | — |
| inspect | step 28: press Enter | 1 | 204 | 373 ms | 29174 ms | — |
| inspect | step 32: snapshot | 1 | 204 | 359 ms | 60949 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 2: snapshot: 204, 367 ms

Sent:

```json
{
  "metrics": [
    {
      "name": "badge_directory_catalog_fetch",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "viewed_user:self",
        "result:success",
        "catalog_state:non_empty",
        "attempt:initial",
        "platform:web",
        "… 1 more"
      ],
      "value": 1225
    },
    {
      "name": "wasm_asset_fetch_duration",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:true",
        "delivery:cache",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 8
    },
    {
      "name": "wasm_asset_body_duration",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:true",
        "delivery:cache",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 6
    },
    {
      "name": "wasm_asset_encoded_bytes",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:true",
        "delivery:cache",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 65052
    },
    {
      "name": "wasm_asset_decoded_bytes",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:true",
        "delivery:cache",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 193784
    },
    {
      "name": "wasm_asset_fetch_duration",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:true",
        "delivery:cache",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 16
    },
    "… 15 more"
  ],
  "client_info": {
    "built_at": "1793113957288",
    "build_number": "652418"
  }
}
```

Answered:

```json
null
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 6: wait 6s: 204, 379 ms

Sent:

```json
{
  "metrics": [
    {
      "name": "badge_directory_catalog_fetch",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "viewed_user:self",
        "result:success",
        "catalog_state:non_empty",
        "attempt:initial",
        "platform:web",
        "… 1 more"
      ],
      "value": 3645
    },
    {
      "name": "wasm_asset_fetch_duration",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:false",
        "delivery:network",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 976
    },
    {
      "name": "wasm_asset_body_duration",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:false",
        "delivery:network",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 846
    },
    {
      "name": "wasm_asset_encoded_bytes",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:false",
        "delivery:network",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 867528
    },
    {
      "name": "wasm_asset_decoded_bytes",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:false",
        "delivery:network",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 2260349
    },
    {
      "name": "wasm_asset_fetch_duration",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:false",
        "delivery:network",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 773
    },
    "… 3 more"
  ],
  "client_info": {
    "built_at": "1793113957288",
    "build_number": "652418"
  }
}
```

Answered:

```json
null
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 11: type e2625: 204, 337 ms

Sent:

```json
{
  "metrics": [
    {
      "name": "badge_directory_catalog_fetch",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "viewed_user:self",
        "result:success",
        "catalog_state:non_empty",
        "attempt:initial",
        "platform:web",
        "… 1 more"
      ],
      "value": 627
    },
    {
      "name": "wasm_asset_fetch_duration",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:true",
        "delivery:network",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 644
    },
    {
      "name": "wasm_asset_body_duration",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:true",
        "delivery:network",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 577
    },
    {
      "name": "wasm_asset_encoded_bytes",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:true",
        "delivery:network",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 705769
    },
    {
      "name": "wasm_asset_decoded_bytes",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:true",
        "delivery:network",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 2260349
    },
    {
      "name": "wasm_asset_fetch_duration",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:true",
        "delivery:network",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 591
    },
    "… 3 more"
  ],
  "client_info": {
    "built_at": "1793113957288",
    "build_number": "652418"
  }
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

The client's own performance and error counters, sent in the background.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
