# voyagerApiVoyagermessagingdashsecondaryinbox

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerMessagingDashSecondaryInbox` |
| Sends | — |
| Reads | `data.entityUrn`, `data.elements`, `data.paging`, `data.$type`, `included` |
| Called from | — |
| rea | `ev_4e68409b3766c448f9fdffd322b326a6b8f826035dc526aef63ca4ebb00f4a8f` |

Seen 10 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 152 ms | 206596 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 112 ms | 4473 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 82 ms | 4037 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 73 ms | 4001 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 132 ms | 4526 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 96 ms | 3403 ms | — |
| chrome | step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open | 2 | 200 | 155–275 ms | 24166–24167 ms | — |
| chrome | step 8: comment on a post, by hand | 2 | 200 | 97–212 ms | 7500–7501 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 152 ms

Sent:

```json
{
  "query": {
    "q": "previewBanner"
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

**runs/inspect/20261107T161246_<name:1>**, step 4: goto /feed/: 200, 112 ms

Sent:

```json
{
  "query": {
    "q": "previewBanner"
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

**runs/inspect/20261107T161246_<name:1>**, step 5: goto /feed/: 200, 82 ms

Sent:

```json
{
  "query": {
    "q": "previewBanner"
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

LinkedIn's web client asks for the secondary inbox's preview banner (`q=previewBanner`), the strip that points at messages held outside the primary inbox. It fired on every page load of one inspect run, and every answer was empty.

## What our machine does with it

Background traffic: nothing in log's LinkedIn direct-API engine (`python/linkedinApi/`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) sends this call, waits on it or reads its answer. `log linkedin inbox` reads only the primary inbox (`PRIMARY_INBOX` in `python/linkedinApi/messaging.py`), so whatever this banner points at is not read by the engine.

## What can go wrong

Every call answered 200 with nothing to show, in about 70 to 150 ms. A non-empty answer would mean messages waiting outside the primary inbox, which `log linkedin inbox` does not list; none has been recorded yet. rea has not read it yet.
