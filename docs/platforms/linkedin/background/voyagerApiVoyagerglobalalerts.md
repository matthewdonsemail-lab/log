# voyagerApiVoyagerglobalalerts

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerGlobalAlerts` |
| Sends | — |
| Reads | `data.entityUrn`, `data.elements`, `data.paging`, `data.$type`, `included` |
| Called from | `runs/inspect/20261107T170649_<name:1>/script50.js:3394 anonymous` |
| rea | `ev_e88964642826cde394707eaf9c1815ed21d722ca1a297149ccd3aac36c1a357a` |

Seen 7 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 200 | 131 ms | 3182 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 86 ms | 205620 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 90 ms | 3548 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 91 ms | 3093 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 138 ms | 3039 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 87 ms | 3554 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 90 ms | 2371 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 131 ms

Sent:

```json
{
  "query": {
    "adHocAlerts": "true",
    "alertWithActions": "true",
    "q": "findAlerts"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "entityUrn": "<userId:1>",
    "elements": [],
    "paging": {
      "count": 10,
      "start": 0,
      "links": []
    },
    "$type": "com.linkedin.restli.common.CollectionResponse"
  },
  "included": []
}
```

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 131 ms

Sent:

```json
{
  "query": {
    "adHocAlerts": "true",
    "alertWithActions": "true",
    "q": "findAlerts"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "entityUrn": "<userId:1>",
    "elements": [],
    "paging": {
      "count": 10,
      "start": 0,
      "links": []
    },
    "$type": "com.linkedin.restli.common.CollectionResponse"
  },
  "included": []
}
```

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 86 ms

Sent:

```json
{
  "query": {
    "adHocAlerts": "true",
    "alertWithActions": "true",
    "q": "findAlerts"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "entityUrn": "<userId:1>",
    "elements": [],
    "paging": {
      "count": 10,
      "start": 0,
      "links": []
    },
    "$type": "com.linkedin.restli.common.CollectionResponse"
  },
  "included": []
}
```

<!-- facts:end -->

## What it does

LinkedIn's web client fetches the account's site-wide alerts (`q=findAlerts`, with ad-hoc alerts and alerts that carry actions) to draw any banner over the page. It fires on every profile and feed page load in our inspect runs, and every answer was an empty list.

## What our machine does with it

Background traffic: nothing in log's LinkedIn direct-API engine (`python/linkedinApi/`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) sends this call, waits on it or reads its answer. An alert shown here would be seen in an inspect step's page and its recording, not by the engine.

## What can go wrong

Every call answered 200 with no alerts, in about 85 to 140 ms. A non-empty list is the page's way of showing an account-wide notice; none has been recorded yet, so what each kind means is not known, and log never sends this call.
