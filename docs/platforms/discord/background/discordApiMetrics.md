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
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_35bf0d2333561938695fbf5e33c483e5b7f2d5333e1d21acfaaf75011bb02edf` |

Seen 9 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 204 | 367 ms | 79666 ms | — |
| inspect | step 6: wait 6s | 1 | 204 | 379 ms | 4339 ms | — |
| inspect | step 11: type e2625 | 1 | 204 | 337 ms | 21744 ms | — |
| inspect | step 28: press Enter | 1 | 204 | 373 ms | 29174 ms | — |
| inspect | step 32: snapshot | 1 | 204 | 359 ms | 60949 ms | — |
| inspect | step 3: snapshot | 1 | 204 | 301 ms | 13477 ms | — |
| inspect | step 1: goto /login | 2 | 204 | 200–325 ms | 121304–1082791 ms | — |
| inspect | step 6: wait 45s | 1 | 204 | 127 ms | 8832 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 204, 127 ms

Sent:

```json
{
  "metrics": [
    {
      "name": "<name:1>",
      "type": "count",
      "tags": [
        "design_id:2",
        "event_name:initial-load",
        "captcha_service:hcaptcha",
        "platform:web",
        "release_channel:stable"
      ]
    },
    {
      "name": "<name:1>",
      "type": "count",
      "tags": [
        "design_id:2",
        "event_name:open",
        "captcha_service:hcaptcha",
        "platform:web",
        "release_channel:stable"
      ]
    },
    {
      "name": "<name:1>",
      "type": "count",
      "tags": [
        "design_id:2",
        "event_name:verify",
        "captcha_service:hcaptcha",
        "platform:web",
        "release_channel:stable"
      ]
    }
  ],
  "client_info": {
    "built_at": "1794557937257",
    "build_number": "672800"
  }
}
```

Answered:

```json
null
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 204, 200 ms

Sent:

```json
{
  "metrics": [
    {
      "name": "<name:2>",
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
      "value": 820
    },
    {
      "name": "<name:3>",
      "type": "count",
      "tags": [
        "design_id:2",
        "reason:played",
        "platform:web",
        "release_channel:stable"
      ]
    },
    {
      "name": "<name:3>",
      "type": "count",
      "tags": [
        "design_id:2",
        "reason:played",
        "platform:web",
        "release_channel:stable"
      ]
    }
  ],
  "client_info": {
    "built_at": "1794298758702",
    "build_number": "670026"
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
