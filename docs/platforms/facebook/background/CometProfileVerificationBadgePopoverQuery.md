# CometProfileVerificationBadgePopoverQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9684350218300346` |
| Path | `/api/graphql/` |
| Sends | `profileID` |
| Reads | `node.id`, `node.__typename` |
| Called from | `CometProfileVerificationBadgePopover.react` |
| rea | `ev_30cb73a9fa4178a0bd1e40df058036b7959d3c2ac3c9f1ce44965dc85a402bb8` |

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 340 ms | 222326 ms | — |
| inspect | step 21: clickRole button "…" | 1 | 200 | 459 ms | 3352 ms | — |
| inspect | step 78: dwell 1s | 2 | 200 | 347 ms | 3630–4167 ms | — |
| inspect | scroll: +376px in 9 wheel steps, 328 ms | 1 | 200 | 1360 ms | 7393 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T060921_61594063207669**, scroll: +376px in 9 wheel steps, 328 ms: 200, 1360 ms

Sent:

```json
{
  "qpl_active_flow_ids": "431626709",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometProfileVerificationBadgePopoverQuery",
  "server_timestamps": "true",
  "variables": {
    "profileID": "100011448242903"
  },
  "doc_id": "9684350218300346",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=431626709"
  ]
}
```

Answered:

```json
{
  "data": {
    "node": {
      "id": "100011448242903",
      "__typename": "User"
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792822302462,
      "time_at_flush_ms": 1792822302486
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Loads the popover for a profile's verification badge, by `profileID`; it reads back only `node.id` and `node.__typename`. In our Reels recordings it fired after step 21 (a clickRole button step) and twice when the page settled on /reel/<id>, with no step of ours clicking a badge (`src/facebook/warmup/activities/helpers/reel.ts` has none).

## What our machine does with it

Nothing. The Reels warm-up (`src/facebook/warmup/activities`) checks each step against the page's URL and snapshot (`checkStep`), never against this response, and no code refers to it.

## What can go wrong

None seen: three calls, all 200 in 347-459 ms. If it failed, only the popover's data would be missing. If the step fails anyway, `checkStep` reports it as an issue: `log facebook warmup reel record` goes on and outlines it, a `run` stops there, and a checkpoint or login page ends it as `blocked`.
