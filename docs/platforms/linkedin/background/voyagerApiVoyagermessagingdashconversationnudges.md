# voyagerApiVoyagermessagingdashconversationnudges

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerMessagingDashConversationNudges` |
| Sends | — |
| Reads | `data.entityUrn`, `data.elements`, `data.paging`, `data.$type`, `included` |
| Called from | — |
| rea | `ev_0ef826cb05e19f39f41e2f0a2dd8b1469e44e174f5d12eb85c921686c6b6ca5f` |

Seen 11 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 200 | 103 ms | 5828 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 154 ms | 206597 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 120 ms | 4473 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 93 ms | 4037 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 97 ms | 4002 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 172 ms | 4527 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 106 ms | 3403 ms | — |
| chrome | step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open | 2 | 200 | 154–275 ms | 24166–24167 ms | — |
| chrome | step 8: comment on a post, by hand | 2 | 200 | 96–208 ms | 7500–7501 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 103 ms

Sent:

```json
null
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

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 103 ms

Sent:

```json
null
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

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 154 ms

Sent:

```json
null
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

LinkedIn's web client asks for nudges on the account's conversations, prompts to follow up on a chat. It fires on every profile and feed page load in our inspect runs, and every answer was an empty list.

## What our machine does with it

Background traffic: nothing in log's LinkedIn direct-API engine (`python/linkedinApi/`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) sends this call, waits on it or reads its answer. `log linkedin inbox` and `messages` read conversations through the messaging GraphQL instead (`python/linkedinApi/messaging.py`).

## What can go wrong

Every call answered 200 with no nudges, in about 90 to 170 ms. No nudge has been recorded yet, so what a non-empty answer holds is not known; log never sends this call. rea has not read it yet.
