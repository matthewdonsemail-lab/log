# flagshipWebFeedForyou

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/flagship-web/feed/foryou` |
| Sends | `requestedArguments`, `isPrefetch` |
| Reads | — |
| Called from | `runs/inspect/20261107T170649_<name:1>/script13.js:12 anonymous` |
| rea | `ev_2b7a18c271a4f80536532c2cac14a9478e5ead3403f7631fd1303b375af517a7` |

Seen 5 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 200 | 1360 ms | 1150 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/app-config (501 ms) | 1 | 200 | 1023 ms | 1596 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 954 ms | 6485 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/server-request (382 ms) | 1 | 200 | 1163 ms | 6522 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 1199 ms | 1252 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 1360 ms

Sent:

```json
{
  "query": {
    "parentSpanId": "Ma/UQeHusj8="
  },
  "body": {
    "requestedArguments": {
      "payload": {},
      "states": [],
      "requestMetadata": {
        "$type": "proto.sdui.common.RequestMetadata"
      },
      "screenId": "",
      "knownTemplateIds": []
    },
    "isPrefetch": true
  }
}
```

Answered:

```json
null
```

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 1360 ms

Sent:

```json
{
  "query": {
    "parentSpanId": "Ma/UQeHusj8="
  },
  "body": {
    "requestedArguments": {
      "payload": {},
      "states": [],
      "requestMetadata": {
        "$type": "proto.sdui.common.RequestMetadata"
      },
      "screenId": "",
      "knownTemplateIds": []
    },
    "isPrefetch": true
  }
}
```

Answered:

```json
null
```

**runs/inspect/20261107T161246_<name:1>**, POST 0 /flagship-web/rsc-action/actions/app-config (501 ms): 200, 1023 ms

Sent:

```json
{
  "query": {
    "parentSpanId": "Js+CtQX2mNY="
  },
  "body": {
    "requestedArguments": {
      "payload": {},
      "states": [],
      "requestMetadata": {
        "$type": "proto.sdui.common.RequestMetadata"
      },
      "screenId": "",
      "knownTemplateIds": []
    },
    "isPrefetch": true
  }
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

A prefetch of the For you feed screen. LinkedIn's web client posts it with `isPrefetch: true`, an empty payload and no screen id while another page loads (a profile, the feed, or right after `app-config` and a `server-request`), so the feed is ready before the account opens it.

## What our machine does with it

log's LinkedIn direct-API engine never sends it: nothing in `python/linkedinApi` or `vendor/openLinkedinApi` names this path, so no run waits on it, reads it or replays it. When the engine needs the feed it loads `/feed/` itself (`version_from_feed` in `share.py`), only to learn the app version.

## What can go wrong

Every recorded call answered 200 with no body our recording kept. A failure here only means the web client's feed opens without its prefetch; it can't stop or change one of our runs.
