# voyagerApiVoyagernotificationsdashbadgingitemcounts

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerNotificationsDashBadgingItemCounts` |
| Sends | — |
| Reads | `data.entityUrn`, `data.elements`, `data.paging`, `data.$type`, `included` |
| Called from | — |
| rea | `ev_31ba50f25de2e81706b1d2f33fd34afcae420bb251c36010fd5140dc97f649c7` |

Seen 7 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 200 | 172 ms | 6000 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 143 ms | 206178 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 170 ms | 4135 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 104 ms | 3713 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 206 ms | 3694 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 94 ms | 4209 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 153 ms | 2975 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 172 ms

Sent:

```json
null
```

Answered:

```json
{
  "data": {
    "entityUrn": "<userId:1>",
    "elements": [
      {
        "count": 1,
        "badgingItem": "NOTIFICATIONS",
        "$type": "com.linkedin.voyager.dash.notifications.BadgingItemCount"
      },
      {
        "count": 0,
        "badgingItem": "NURTURE",
        "$type": "com.linkedin.voyager.dash.notifications.BadgingItemCount"
      },
      {
        "count": 0,
        "badgingItem": "MESSAGING",
        "$type": "com.linkedin.voyager.dash.notifications.BadgingItemCount"
      },
      {
        "count": 1,
        "badgingItem": "MY_NETWORK",
        "$type": "com.linkedin.voyager.dash.notifications.BadgingItemCount"
      }
    ],
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

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 172 ms

Sent:

```json
null
```

Answered:

```json
{
  "data": {
    "entityUrn": "<userId:1>",
    "elements": [
      {
        "count": 1,
        "badgingItem": "NOTIFICATIONS",
        "$type": "com.linkedin.voyager.dash.notifications.BadgingItemCount"
      },
      {
        "count": 0,
        "badgingItem": "NURTURE",
        "$type": "com.linkedin.voyager.dash.notifications.BadgingItemCount"
      },
      {
        "count": 0,
        "badgingItem": "MESSAGING",
        "$type": "com.linkedin.voyager.dash.notifications.BadgingItemCount"
      },
      {
        "count": 1,
        "badgingItem": "MY_NETWORK",
        "$type": "com.linkedin.voyager.dash.notifications.BadgingItemCount"
      }
    ],
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

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 143 ms

Sent:

```json
null
```

Answered:

```json
{
  "data": {
    "entityUrn": "<userId:1>",
    "elements": [
      {
        "count": 1,
        "badgingItem": "MY_NETWORK",
        "$type": "com.linkedin.voyager.dash.notifications.BadgingItemCount"
      },
      {
        "count": 6,
        "badgingItem": "NOTIFICATIONS",
        "$type": "com.linkedin.voyager.dash.notifications.BadgingItemCount"
      },
      {
        "count": 0,
        "badgingItem": "NURTURE",
        "$type": "com.linkedin.voyager.dash.notifications.BadgingItemCount"
      },
      {
        "count": 0,
        "badgingItem": "MESSAGING",
        "$type": "com.linkedin.voyager.dash.notifications.BadgingItemCount"
      }
    ],
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

LinkedIn's web client asks for the counts on its navigation badges: notifications, nurture, messaging and My Network. It fires a few seconds into every profile and feed page load in our inspect runs, to draw the counts in the top bar.

## What our machine does with it

Background traffic: nothing in log's LinkedIn direct-API engine (`python/linkedinApi/`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) sends this call, waits on it or reads its answer. The engine's own My Network follow-ups clear a badge the way the browser does (`mojoTabsBadge`, `python/linkedinApi/network.py`), but they never read these counts.

## What can go wrong

Every call answered 200 in about 90 to 210 ms. A failure would only leave the badges blank; it never affects a log run. rea has not read it yet.
