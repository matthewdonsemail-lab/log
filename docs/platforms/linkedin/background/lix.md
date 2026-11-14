# lix

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/lix` |
| Sends | `ids`, `explicitUrnLiXList`, `evaluationContext` |
| Reads | `statuses`, `results.web.flagship-web.infra.force-refresh.timestamp`, `results.web.flagship-web.infra.force-refresh.version`, `results.web.infra.client-lix-refresh-tracking`, `results.web.flagship-web.infra.force-refresh.immediate`, `errors`, `results.voyager.web.infra.force-refresh.timestamp`, `results.voyager.web.infra.force-refresh.immediate` |
| Called from | — |
| rea | `ev_99f341f871ab6a7fd99a5029ee1e64c2ae5a59824eea1a83c8954a6041b5977d` |

Seen 19 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: click e2157 | 6 | 200 | 50–107 ms | 497841–1699814 ms | — |
| inspect | step 11: click e1733 | 4 | 200 | 56–72 ms | 427101–1028266 ms | — |
| inspect | step 24: click e640 | 2 | 200 | 55–57 ms | 1515–2933 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/server-request (273 ms) | 2 | 200 | 54–57 ms | 592577–593992 ms | — |
| inspect | step 13: snapshot | 1 | 200 | 64 ms | 32577 ms | — |
| inspect | step 25: snapshot | 1 | 200 | 130 ms | 39330 ms | — |
| inspect | step 32: snapshot | 3 | 200 | 113–156 ms | 251592–1451597 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 6: click e2157: 200, 50 ms

Sent:

```json
{
  "ids": "List(web.flagship-web.infra.force-refresh.timestamp,web.flagship-web.infra.force-refresh.immediate,web.flagship-web.infra.force-refresh.version,web.infra.client-lix-refresh-tracking)",
  "explicitUrnLiXList": "List()",
  "evaluationContext": "(context:())"
}
```

Answered:

```json
{
  "statuses": {},
  "results": {
    "web.flagship-web.infra.force-refresh.timestamp": {
      "treatment": "value_1775017876462",
      "testKey": "web.flagship-web.infra.force-refresh.timestamp"
    },
    "web.flagship-web.infra.force-refresh.version": {
      "treatment": "control",
      "testKey": "web.flagship-web.infra.force-refresh.version"
    },
    "web.infra.client-lix-refresh-tracking": {
      "treatment": "control",
      "testKey": "web.infra.client-lix-refresh-tracking"
    },
    "web.flagship-web.infra.force-refresh.immediate": {
      "treatment": "control",
      "testKey": "web.flagship-web.infra.force-refresh.immediate"
    }
  },
  "errors": {}
}
```

**runs/inspect/20261107T161246_<name:1>**, step 11: click e1733: 200, 56 ms

Sent:

```json
{
  "ids": "List(web.flagship-web.infra.force-refresh.timestamp,web.flagship-web.infra.force-refresh.immediate,web.flagship-web.infra.force-refresh.version,web.infra.client-lix-refresh-tracking)",
  "explicitUrnLiXList": "List()",
  "evaluationContext": "(context:())"
}
```

Answered:

```json
{
  "statuses": {},
  "results": {
    "web.flagship-web.infra.force-refresh.timestamp": {
      "treatment": "value_1775017876462",
      "testKey": "web.flagship-web.infra.force-refresh.timestamp"
    },
    "web.flagship-web.infra.force-refresh.version": {
      "treatment": "control",
      "testKey": "web.flagship-web.infra.force-refresh.version"
    },
    "web.infra.client-lix-refresh-tracking": {
      "treatment": "control",
      "testKey": "web.infra.client-lix-refresh-tracking"
    },
    "web.flagship-web.infra.force-refresh.immediate": {
      "treatment": "control",
      "testKey": "web.flagship-web.infra.force-refresh.immediate"
    }
  },
  "errors": {}
}
```

**runs/inspect/20261107T161246_<name:1>**, step 24: click e640: 200, 57 ms

Sent:

```json
{
  "ids": "List(web.flagship-web.infra.force-refresh.timestamp,web.flagship-web.infra.force-refresh.immediate,web.flagship-web.infra.force-refresh.version,web.infra.client-lix-refresh-tracking)",
  "explicitUrnLiXList": "List()",
  "evaluationContext": "(context:())"
}
```

Answered:

```json
{
  "statuses": {},
  "results": {
    "web.flagship-web.infra.force-refresh.timestamp": {
      "treatment": "value_1775017876462",
      "testKey": "web.flagship-web.infra.force-refresh.timestamp"
    },
    "web.flagship-web.infra.force-refresh.version": {
      "treatment": "control",
      "testKey": "web.flagship-web.infra.force-refresh.version"
    },
    "web.infra.client-lix-refresh-tracking": {
      "treatment": "control",
      "testKey": "web.infra.client-lix-refresh-tracking"
    },
    "web.flagship-web.infra.force-refresh.immediate": {
      "treatment": "control",
      "testKey": "web.flagship-web.infra.force-refresh.immediate"
    }
  },
  "errors": {}
}
```

<!-- facts:end -->

## What it does

The web client asks LinkedIn's experiment service (LiX) for its treatment on a list of test keys and reads back each key's `treatment`. The keys seen are the client's own force-refresh switches (`web.flagship-web.infra.force-refresh.timestamp`, `.version`, `.immediate`, `voyager.web.infra.force-refresh.*`) and `web.infra.client-lix-refresh-tracking`, so the page learns whether it must reload onto a newer build. It fires again and again while a page stays open, up to about 28 minutes into a long inspect step, each in 50 to 156 ms.

## What our machine does with it

Nothing: log's LinkedIn direct-API engine (`python/linkedinApi`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) never sends it and reads no experiment treatment. It is background browser traffic of an open page.

## What can go wrong

Every answer in our runs is 200 with empty `statuses` and `errors`. A treatment that asks for a refresh only reloads the browser page; it has no effect on a direct-API run.
