# voyagerApiMessagingDashPresencestatuses

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/messaging/dash/presenceStatuses` |
| Sends | `ids` |
| Reads | `data.statuses`, `data.results`, `data.errors`, `included` |
| Called from | — |
| rea | `ev_33e0da64fb8b95cef4077d523e8b5bcced0715a71770cc3ccf8c343ebae64aa8` |

Seen 7 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 200 | 86 ms | 5759 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 124 ms | 206174 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 107 ms | 4100 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 149 ms | 3645 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 114 ms | 3579 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 162 ms | 4127 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 158 ms | 3004 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 86 ms

Sent:

```json
{
  "ids": "List(urn:li:fsd_profile:<memberId>)"
}
```

Answered:

```json
{
  "data": {
    "statuses": {},
    "results": {
      "urn:li:fsd_profile:<memberId>": {
        "available": true,
        "lastActiveAt": 1794071206000,
        "instantlyReachable": true,
        "$type": "com.linkedin.voyager.dash.messaging.presence.PresenceStatus"
      }
    },
    "errors": {}
  },
  "included": []
}
```

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 86 ms

Sent:

```json
{
  "ids": "List(urn:li:fsd_profile:<memberId>)"
}
```

Answered:

```json
{
  "data": {
    "statuses": {},
    "results": {
      "urn:li:fsd_profile:<memberId>": {
        "available": true,
        "lastActiveAt": 1794071206000,
        "instantlyReachable": true,
        "$type": "com.linkedin.voyager.dash.messaging.presence.PresenceStatus"
      }
    },
    "errors": {}
  },
  "included": []
}
```

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 124 ms

Sent:

```json
{
  "ids": "List(urn:li:fsd_profile:<memberId>)"
}
```

Answered:

```json
{
  "data": {
    "statuses": {},
    "results": {
      "urn:li:fsd_profile:<memberId>": {
        "available": true,
        "lastActiveAt": 1794068179000,
        "instantlyReachable": true,
        "$type": "com.linkedin.voyager.dash.messaging.presence.PresenceStatus"
      }
    },
    "errors": {}
  },
  "included": []
}
```

<!-- facts:end -->

## What it does

The web client asks the presence of a list of profile urns (`ids`; in our runs, the account's own profile) and reads, per profile, `available`, `lastActiveAt` and `instantlyReachable`. It fires once on each profile and feed load, about 3 to 5.8 seconds in, in 86 to 162 ms.

## What our machine does with it

Nothing: log's LinkedIn direct-API engine (`python/linkedinApi`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) never sends it and reads no presence. Its messaging reads in `python/linkedinApi/messaging.py` ask only for conversations and messages.

## What can go wrong

Every answer in our runs is 200 with empty `statuses` and `errors`. A failure only affects the presence shown in the browser page; a direct-API run doesn't depend on it.
