# litmsApiEventsExtTagLoad

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/litms/api/events/ext-tag-load` |
| Sends | `profileName`, `tags`, `eventType`, `eventSource`, `pageKey`, `controlUrn`, `referrer`, `blockedTags`, `compliance` |
| Reads | — |
| Called from | `runs/inspect/20261107T170649_<name:3>/script20.js:1 _fireAuditEvent`, `runs/inspect/20261107T170649_<name:3>/script31.js:460 anonymous` |
| rea | `ev_890dffbeab0fd1f58d6ce5b2dba067b19d32ad578ae22676f51f5ebcfa824d94` |

Seen 10 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: click e2157 | 1 | 200 | 62 ms | 767 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 58 ms | 208530 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/app-config (501 ms) | 1 | 200 | 104 ms | 7306 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 66 ms | 2550 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/server-request (382 ms) | 1 | 200 | 82 ms | 7946 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 179 ms | 2738 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/pagination (759 ms) | 1 | 200 | 58 ms | 187 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 252 ms | 2664 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 66 ms | 3592 ms | — |
| inspect | clearSession: linkedin cookies cleared on 1 domain(s): .linkedin.com | 1 | 200 | 61 ms | 6466 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:3>**, step 6: click e2157: 200, 62 ms

Sent:

```json
{
  "profileName": "<name:1>",
  "tags": [
    {
      "tagId": "150",
      "version": 202205051955
    },
    {
      "tagId": "156",
      "version": 202505060052
    }
  ],
  "eventType": "ControlInteractionEvent",
  "eventSource": "ember",
  "pageKey": "voyager_web_app",
  "controlUrn": "urn:li:control:voyager_web_app-m2m_invite",
  "referrer": "https://www.linkedin.com/"
}
```

Answered:

```json
null
```

**runs/inspect/20261107T161246_<name:3>**, step 2: snapshot: 200, 58 ms

Sent:

```json
{
  "profileName": "<name:2>",
  "tags": [
    {
      "tagId": "189",
      "version": 202201252329
    },
    {
      "tagId": "190",
      "version": 202201252329
    },
    {
      "tagId": "193",
      "version": 202301251738
    },
    {
      "tagId": "234",
      "version": 202603191821
    },
    {
      "tagId": "236",
      "version": 202506190202
    },
    {
      "tagId": "237",
      "version": 202506190202
    },
    "… 3 more"
  ],
  "blockedTags": [
    {
      "tagId": "130"
    },
    {
      "tagId": "205"
    },
    {
      "tagId": "210"
    },
    {
      "tagId": "223"
    }
  ],
  "compliance": {
    "isCCPAOptIn": true,
    "isLinkedInEmployee": false,
    "isResearchInvitationsOptIn": true,
    "isGDPRCountryResident": false,
    "isFunctionalOptIn": true,
    "isGeoOptIn": true,
    "isGDPROptIn": true,
    "isAdvertisingOptIn": true,
    "isAnalyticsAndResearchOptIn": true
  },
  "eventType": "PageViewEvent",
  "eventSource": "nile",
  "pageKey": "d_flagship3_feed",
  "referrer": "https://www.linkedin.com/login/?session_redirect=https%3A%2F%2Fwww.linkedin.com%2Ffeed%2F"
}
```

Answered:

```json
null
```

**runs/inspect/20261107T161246_<name:3>**, POST 0 /flagship-web/rsc-action/actions/app-config (501 ms): 200, 104 ms

Sent:

```json
{
  "profileName": "<name:2>",
  "tags": [
    {
      "tagId": "189",
      "version": 202201252329
    },
    {
      "tagId": "190",
      "version": 202201252329
    },
    {
      "tagId": "193",
      "version": 202301251738
    },
    {
      "tagId": "234",
      "version": 202603191821
    },
    {
      "tagId": "236",
      "version": 202506190202
    },
    {
      "tagId": "237",
      "version": 202506190202
    },
    "… 3 more"
  ],
  "blockedTags": [
    {
      "tagId": "130"
    },
    {
      "tagId": "205"
    },
    {
      "tagId": "210"
    },
    {
      "tagId": "223"
    }
  ],
  "compliance": {
    "isCCPAOptIn": true,
    "isLinkedInEmployee": false,
    "isResearchInvitationsOptIn": true,
    "isGDPRCountryResident": false,
    "isFunctionalOptIn": true,
    "isGeoOptIn": true,
    "isGDPROptIn": true,
    "isAdvertisingOptIn": true,
    "isAnalyticsAndResearchOptIn": true
  },
  "eventType": "PageViewEvent",
  "eventSource": "nile",
  "pageKey": "d_flagship3_feed",
  "referrer": "https://www.linkedin.com/login/?session_redirect=https%3A%2F%2Fwww.linkedin.com%2Ffeed%2F"
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

LinkedIn's tag manager reporting which external tags it loaded on the page: their tag ids and versions, the event type and source, the page key, the control that triggered it, the referrer, and any tags it blocked with the compliance state. It fired on page loads and clicks, and once just after our inspect step cleared the session's cookies.

## What our machine does with it

log's LinkedIn direct-API engine never sends it: nothing in `python/linkedinApi` or `vendor/openLinkedinApi` names this path, so no run waits on it, reads it or replays it. It is tag-loading telemetry the browser sends on its own.

## What can go wrong

Every recorded call answered 200 with no body in under 300 ms. A failure would only lose LinkedIn this report; it can't affect our runs.
