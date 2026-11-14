# flagshipWebRscActionActionsComponent

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/flagship-web/rsc-action/actions/component` |
| Sends | `componentId`, `clientArguments` |
| Reads | — |
| Called from | `runs/inspect/20261107T170649_<name:1>/script50.js:2336 anonymous`, `runs/inspect/20261107T161246_<name:1>/script30.js:383 statement`, `runs/inspect/20261107T161246_<name:1>/script48.js:345 statement`, `runs/inspect/20261107T161246_<name:1>/script57.js:609 statement` |
| rea | `ev_c1abdf33053dc1d7030ab762ec70be7a4792316ed5a5874ffa3d4ae200fdfc55` |

Seen 25 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 3 | 0, 200 | 354–1401 ms | 1087–1524 ms | — |
| inspect | step 6: click e2157 | 1 | 200 | 576 ms | 1139 ms | — |
| inspect | step 3: snapshot | 3 | 200 | 266–819 ms | 3123–5386 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/app-config (501 ms) | 1 | 200 | 93 ms | 25785 ms | — |
| inspect | step 5: goto /feed/ | 10 | 0, 200 | 323–1026 ms | 150–6457 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/pagination (759 ms) | 1 | 0 | 639 ms | 521 ms | — |
| inspect | step 25: goto /in/<profile>/ | 5 | 0, 200 | 312–581 ms | 1141–1260 ms | — |
| inspect | step 31: press Escape | 1 | 0 | 782 ms | 1150 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 0, 1401 ms

Sent:

```json
{
  "query": {
    "componentId": "com.linkedin.sdui.generated.profile.dsl.impl.profileCardsActivity",
    "sduiid": "com.linkedin.sdui.generated.profile.dsl.impl.profileCardsActivity",
    "parentSpanId": "v5TyGdfB4hw="
  },
  "body": {
    "componentId": "com.linkedin.sdui.generated.profile.dsl.impl.profileCardsActivity",
    "clientArguments": {
      "payload": {
        "isSelfView": false,
        "vanityName": "<username:1>"
      },
      "states": [],
      "requestMetadata": {
        "$type": "proto.sdui.common.RequestMetadata"
      },
      "screenId": "com.linkedin.sdui.flagshipnav.home.Home",
      "knownTemplateIds": []
    }
  }
}
```

Answered:

```json
null
```

**runs/inspect/20261107T170649_<name:1>**, step 6: click e2157: 200, 576 ms

Sent:

```json
{
  "query": {
    "componentId": "com.linkedin.sdui.generated.profile.dsl.impl.profileTopCardSection",
    "sduiid": "com.linkedin.sdui.generated.profile.dsl.impl.profileTopCardSection",
    "parentSpanId": "xBNu8P2CfPs="
  },
  "body": {
    "componentId": "com.linkedin.sdui.generated.profile.dsl.impl.profileTopCardSection",
    "clientArguments": {
      "payload": {
        "vanityName": "<username:1>",
        "shouldSetupReplaceableComponent": false,
        "vieweeProfileId": "<memberId>",
        "isSelfView": false,
        "isSelfViewResolved": true,
        "cameFromAddToProfile": false
      },
      "states": [],
      "requestMetadata": {
        "$type": "proto.sdui.common.RequestMetadata"
      },
      "screenId": "",
      "knownTemplateIds": []
    }
  }
}
```

Answered:

```json
"MToiNzFhZDk1MjY3YzYwNWEzNGZlZmUxMTU1YTYxZTZhZDMiCjI6IlNkdWlUcmFja2luZ1Byb3ZlbmFuY2VQcm92aWRlciIKMzpJWyIkMSIsW10sIiQyIl0KNDoiMDMwZDYwMzVjYjNhOTk3ZWZiMWNmZjdhMDA4ZDJmODkiCjU6SVsiJDQiLFtdLCJkZWZhdWx0Il0KNzoiZTllNTc0NGM5MDJmZGRiOThmMGViNjJhZWU1ZDQwMGEiCjg6SVsiJDciLFtdLCJUcmFjZWRDb21wb25lbnQiXQo5OiJmNTRhNGQ5Zjk0OTA0ZWIyMjdhNmMxMzA3MTI0ZWRkNiIKYTpJWyIkOSIsW10sIkNsaWVudENvbXBvbmVudCJdCmU6ImI1NWI2MTEwMTgy… (232084 chars)"
```

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 0, 1401 ms

Sent:

```json
{
  "query": {
    "componentId": "com.linkedin.sdui.generated.profile.dsl.impl.profileCardsActivity",
    "sduiid": "com.linkedin.sdui.generated.profile.dsl.impl.profileCardsActivity",
    "parentSpanId": "v5TyGdfB4hw="
  },
  "body": {
    "componentId": "com.linkedin.sdui.generated.profile.dsl.impl.profileCardsActivity",
    "clientArguments": {
      "payload": {
        "isSelfView": false,
        "vanityName": "<username:1>"
      },
      "states": [],
      "requestMetadata": {
        "$type": "proto.sdui.common.RequestMetadata"
      },
      "screenId": "com.linkedin.sdui.flagshipnav.home.Home",
      "knownTemplateIds": []
    }
  }
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Loads one server-driven component of a page by its `componentId`, with the page's arguments in `clientArguments` (for a profile, its vanity name and whether it is the account's own view). On a profile it filled sections such as the top card and the activity cards, and on the feed it filled the feed's parts; the answer is the component's encoded server-component stream.

## What our machine does with it

log's LinkedIn direct-API engine never sends it: nothing in `python/linkedinApi` or `vendor/openLinkedinApi` names this path, so no run waits on it, reads it or replays it. The engine posts to the `server-request` and `navigation` actions under the same `/flagship-web/rsc-action/actions/` root (`ACTIONS` in `share.py`), never to `component`.

## What can go wrong

200 carries the component. Status 0 means our recording holds no answer: the browser cut the request off or had not finished it when the step's capture closed, usually because the page moved on. These are page-loading calls in the browser only and can't stop or change one of our runs.
