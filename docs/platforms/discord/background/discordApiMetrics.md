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
| Called from | `runs/inspect/20261113T141543_<name:7>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:7>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:7>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:7>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 7 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 204 | 367 ms | 79666 ms | — |
| inspect | step 6: wait 6s | 1 | 204 | 379 ms | 4339 ms | — |
| inspect | step 11: type e2625 | 1 | 204 | 337 ms | 21744 ms | — |
| inspect | step 28: press Enter | 1 | 204 | 373 ms | 29174 ms | — |
| inspect | step 32: snapshot | 1 | 204 | 359 ms | 60949 ms | — |
| inspect | step 3: snapshot | 1 | 204 | 301 ms | 13477 ms | — |
| inspect | step 1: goto /login | 1 | 204 | 325 ms | 1082791 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:7>**, step 1: goto /login: 204, 325 ms

Sent:

```json
{
  "metrics": [
    {
      "name": "<name:1>",
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
      "value": 3102
    }
  ],
  "client_info": {
    "built_at": "1794471646034",
    "build_number": "671535"
  }
}
```

Answered:

```json
null
```

**runs/inspect/20261030T222341_<name:7>**, step 3: snapshot: 204, 301 ms

Sent:

```json
{
  "metrics": [
    {
      "name": "<name:1>",
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
      "value": 903
    },
    {
      "name": "<name:2>",
      "type": "count",
      "tags": [
        "design_id:2",
        "quest_content:QUEST_BAR_V2",
        "platform:web",
        "release_channel:stable"
      ]
    },
    {
      "name": "<name:3>",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:true",
        "delivery:network",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 437
    },
    {
      "name": "<name:4>",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:true",
        "delivery:network",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 321
    },
    {
      "name": "<name:5>",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:true",
        "delivery:network",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 706201
    },
    {
      "name": "<name:6>",
      "type": "distribution",
      "tags": [
        "design_id:2",
        "br:true",
        "delivery:network",
        "platform:web",
        "release_channel:stable"
      ],
      "value": 2261175
    }
  ],
  "client_info": {
    "built_at": "1793344820826",
    "build_number": "657850"
  }
}
```

Answered:

```json
null
```

**runs/inspect/20261028T065202_<name:7>**, step 2: snapshot: 204, 367 ms

Sent:

```json
{
  "metrics": [
    {
      "name": "<name:1>",
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
      "name": "<name:3>",
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
      "name": "<name:4>",
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
      "name": "<name:5>",
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
      "name": "<name:6>",
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
      "name": "<name:3>",
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

<!-- facts:end -->

## What it does

The client's own performance and error counters, sent in the background.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
