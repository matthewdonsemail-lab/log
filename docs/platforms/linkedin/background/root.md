# root

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/` |
| Sends | `clientContext`, `requests` |
| Reads | `responses` |
| Called from | — |
| rea | `ev_9c6bf27e1c318663dea9d07e61ac285ed3e88595dc74767d370a6641f6d53479` |

Seen 72 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| chrome | step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open | 15 | 200 | 52–82 ms | 3851–33003 ms | — |
| chrome | step 2: send a message, by hand | 5 | 200 | 51–63 ms | 1404–9351 ms | — |
| chrome | step 3: react to a post, by hand | 10 | 200 | 67–113 ms | 381–15192 ms | — |
| chrome | step 4: repost a post, by hand | 2 | 200 | 55–62 ms | 3284–3295 ms | — |
| chrome | step 5: comment on a post, by hand | 9 | 200 | 55–86 ms | 1592–9464 ms | — |
| chrome | step 6: open the add-a-note invite, by hand | 5 | 200 | 53–76 ms | 284–625 ms | — |
| chrome | step 7: connect with a member, by hand | 14 | 200 | 53–100 ms | 296–29042 ms | — |
| chrome | step 8: comment on a post, by hand | 9 | 200 | 55–76 ms | 968–9077 ms | — |
| chrome | step 9: open My Network's invitations, by hand | 3 | 200 | 69–215 ms | 1493–5896 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/chrome/20261114T213510_<name:5>**, step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open: 200, 72 ms

Sent:

```json
{
  "[{\"eventBody\":{\"controlUrn\":\"\",\"interactionType\":\"SHAKE\",\"contentTrackingId\":\"78oNBKZKSvqFpvv6hSmD9w": "=\",\"manualFireReason\":\"PROFILE_VIEW_EVENT_TRACKING\",\"trackingScopeHierarchy\":{\"entries\":[]},\"clientBreadcrumbPointers\":[{\"id\":\"<id:8>\",\"type\":\"PROFILE_VIEW\"}],\"header\":{\"pageInstance\":{\"pageUrn\":\"urn:li:page:d_flagship3_profile_view_base\",\"trackingId\":\"kpXjpwwBRhOGeTLjnodI1w==\"},\"time\":1794692104011,\"version\":\"0.2.8598\",\"server\":\"\",\"service\":\"\",\"guid\":\"ekSsGnoHT9aI/4sRKhWqOw==\",\"memberId… (27125 chars)"
}
```

Answered:

```json
null
```

**runs/chrome/20261114T213510_<name:5>**, step 2: send a message, by hand: 200, 51 ms

Sent:

```json
{
  "clientContext": {
    "eventHeaderContext": {
      "server": "",
      "serviceName": "",
      "publicAppVersion": "1.13.48314",
      "clientApplicationInstance": {
        "applicationUrn": "urn:li:application:(voyager-web,voyager-web)",
        "version": "1.13.48314",
        "trackingId": {
          "fixedValue": "FyniBairQSKzIWN64Jry8Q=="
        }
      },
      "appName": "com.linkedin.flagship3.d_web"
    },
    "userRequestHeaderContext": {
      "theme": 1,
      "interfaceLocale": "en_US",
      "isBrowserPersistentRetryEnabled": true,
      "isFlushOnCloseBrowserTabEnabled": true,
      "clientDeviceType": 1,
      "timeZoneOffsetMinutes": -480
    }
  },
  "requests": [
    {
      "id": "<id:1>",
      "payload": {
        "name": "<name:1>",
        "payload": "eyJ1cm5zIjpbeyJ1cm5JZCI6IjEyNDA2Mjc5MjUiLCJ1cm5UeXBlIjoibWVtYmVyIiwicHJpbWFyeUV2YWx1YXRpb25Vcm4iOiJ1cm46bGk6bWVtYmVyOjEyNDA2Mjc5MjUiLCJ0cmVhdG1lbnRzIjpbeyJleHBlcmltZW50SWQiOjUyNDg1MjMsInRyZWF0bWVudEluZGV4IjowLCJzZWdtZW50SW5kZXgiOjN9LHsiZXhwZXJpbWVudElkIjo1Mjg1MDk4LCJ0cmVhdG1lbnRJbmRleCI6MSwic2VnbWVudEluZGV4IjowfV19XSwiaGVhZGVyIjp7InBhZ2VJbnN0YW5jZSI6eyJwYWdlVXJuIjoidXJuOmxpOnBhZ2U6ZF9mbGFnc2hpcDNf… (1540 chars)",
        "isPegasusEncoded": true
      },
      "clientBreadCrumbs": [],
      "isShadowEvent": false
    }
  ]
}
```

Answered:

```json
{
  "responses": [
    {
      "id": "<id:1>",
      "responseStatus": "ResponseStatus_SUCCESS"
    }
  ]
}
```

**runs/chrome/20261114T213510_<name:5>**, step 3: react to a post, by hand: 200, 67 ms

Sent:

```json
{
  "clientContext": {
    "eventHeaderContext": {
      "server": "",
      "serviceName": "",
      "publicAppVersion": "0.2.8598",
      "clientApplicationInstance": {
        "applicationUrn": "urn:li:application:(web,flagship-web)",
        "version": "0.2.8598",
        "trackingId": {
          "fixedValue": "Q0+i8zB/ShaCNxWMSn/shw=="
        }
      },
      "appName": "com.linkedin.flagship3.d_web"
    },
    "userRequestHeaderContext": {
      "theme": 1,
      "interfaceLocale": "en_US",
      "isBrowserPersistentRetryEnabled": false,
      "isFlushOnCloseBrowserTabEnabled": true,
      "clientDeviceType": 1,
      "timeZoneOffsetMinutes": -480
    }
  },
  "requests": [
    {
      "id": "<id:2>",
      "payload": {
        "name": "<name:2>",
        "payload": "eyJwYWdlTG9hZFR5cGUiOiJTVUJTRVFVRU5UX0xPQUQiLCJuZXR3b3JrSW5mb3JtYXRpb25NZXRyaWNzIjp7ImNvbm5lY3Rpb25UeXBlIjoiVU5LTk9XTiIsImVmZmVjdGl2ZVR5cGUiOiJGT1VSX0ciLCJyb3VuZFRyaXBUaW1lIjo1MCwiZG93bmxpbmtCYW5kd2lkdGgiOjEwLCJkb3dubGlua01heEJhbmR3aWR0aCI6LTF9LCJ0cmVlSWQiOiJBQVpnUXpvTldwamRPMEQ5Z2kxQnRBPT0iLCJicm93c2VyUGFnZUxvYWRTdGFydENvbnRleHQiOnsid2ViVUlGcmFtZXdvcmsiOiJSRUFDVCIsInRpbWVTb3VyY2UiOiJhcHBzIiwiaXNT… (1672 chars)",
        "isPegasusEncoded": true
      },
      "clientBreadCrumbs": [],
      "isShadowEvent": false
    },
    {
      "id": "<id:3>",
      "payload": {
        "name": "<name:3>",
        "payload": "eyJyZXNvdXJjZUtleSI6Il9fU0RVSSIsImlzTmV0d29yayI6dHJ1ZSwidGFyZ2V0Vmlld05hbWVzIjpbImRfZmxhZ3NoaXAzX2ZlZWQiXSwibG9hZFR5cGUiOiJzZXJ2ZXJzaWRlcmVzcG9uc2UiLCJyZXNvdXJjZU5ldHdvcmtDb250ZXh0Ijp7Im5leHRIb3BQcm90b2NvbCI6IlVOS05PV04iLCJyZXNvdXJjZVRyZWVJZCI6IkFBWmdRem9ubmpXUzJIQVpzU0h2c0E9PSIsInJlc3BvbnNlU3RhdHVzQ29kZSI6MjAwLCJyZXNwb25zZU1ldGFkYXRhIjoiYXZhaWxhYmlsaXR5PTEifSwicmVzb3VyY2VQcm9ncmVzc1N0YXRlcyI6W10s… (1656 chars)",
        "isPegasusEncoded": true
      },
      "clientBreadCrumbs": [],
      "isShadowEvent": false
    },
    {
      "id": "<id:4>",
      "payload": {
        "name": "<name:4>",
        "payload": "eyJwYWdlS2V5IjoiZF9mbGFnc2hpcDNfZmVlZCIsImNkbkRhdGEiOltdLCJicm93c2VyUGFnZUxvYWRFbmRDb250ZXh0Ijp7ImlzSW1wYWN0ZWRCeUhpZGRlbldpbmRvdyI6ZmFsc2V9LCJuYXZpZ2F0aW9uVGltaW5nIjp7ImJvb21lcmFuZ1N0YXJ0IjoxNzk0NjkxNzQxNjMzLCJ0aW1lRG9uZSI6NTgsIm5hdmlnYXRpb25TdGFydCI6MTc5NDY5MjE1MjMyNCwid29ya2VyU3RhcnQiOjB9LCJwYWdlTG9hZElkIjoiwrVcdTAwMTAyXHUwMDE4XGZcdTAwMThLw4bCnsKNIVxmw5fCs1/DnSIsImhlYWRlciI6eyJwYWdlSW5zdGFuY2Ui… (1356 chars)",
        "isPegasusEncoded": true
      },
      "clientBreadCrumbs": [],
      "isShadowEvent": false
    },
    {
      "id": "<id:5>",
      "payload": {
        "name": "<name:3>",
        "payload": "eyJyZXNvdXJjZUtleSI6Imh0dHBzOi8vbWVkaWEubGljZG4uY29tL2Rtcy9pbWFnZS92Mi9ENTYwM0FRR3g5Ym9aS3h0YTZBL3Byb2ZpbGUtZGlzcGxheXBob3RvLWNyb3BfODAwXzgwMC9CNTZad3NWT2o1SDBBTS0vMC8xNzcwMjcwMjg4NzY2P2U9MTc5NjI1NjAwMCZ2PWJldGEmdD1hMnhnM3BWRFJtclJTQTF4eDRUZzdlQUJqZEd2X1FkWFJYaHNUMWRjcE1ZIiwiaXNOZXR3b3JrIjpmYWxzZSwibG9hZFR5cGUiOiJpbWciLCJ0aW1lT3JpZ2luIjoxNzk0NjkxNzQxNjMzLjgsInJlc291cmNlUHJvZ3Jlc3NTdGF0ZXMiOlt7InJl… (2668 chars)",
        "isPegasusEncoded": true
      },
      "clientBreadCrumbs": [],
      "isShadowEvent": false
    },
    {
      "id": "<id:6>",
      "payload": {
        "name": "<name:3>",
        "payload": "eyJyZXNvdXJjZUtleSI6Imh0dHBzOi8vbWVkaWEubGljZG4uY29tL2Rtcy9pbWFnZS92Mi9ENTYwM0FRR3g5Ym9aS3h0YTZBL3Byb2ZpbGUtZGlzcGxheXBob3RvLWNyb3BfODAwXzgwMC9CNTZad3NWT2o1SDBBTS0vMC8xNzcwMjcwMjg4NzY2P2U9MTc5NjI1NjAwMCZ2PWJldGEmdD1hMnhnM3BWRFJtclJTQTF4eDRUZzdlQUJqZEd2X1FkWFJYaHNUMWRjcE1ZIiwiaXNOZXR3b3JrIjpmYWxzZSwibG9hZFR5cGUiOiJpbWciLCJ0aW1lT3JpZ2luIjoxNzk0NjkxNzQxNjMzLjgsInJlc291cmNlUHJvZ3Jlc3NTdGF0ZXMiOlt7InJl… (2768 chars)",
        "isPegasusEncoded": true
      },
      "clientBreadCrumbs": [],
      "isShadowEvent": false
    },
    {
      "id": "<id:7>",
      "payload": {
        "name": "<name:3>",
        "payload": "eyJyZXNvdXJjZUtleSI6Imh0dHBzOi8vbWVkaWEubGljZG4uY29tL2Rtcy9pbWFnZS92Mi9ENTYxNkFRSEFBeXdRVGlBeDRRL3Byb2ZpbGUtZGlzcGxheWJhY2tncm91bmRpbWFnZS1zaHJpbmtfMzUwXzE0MDAvQjU2WndzWDVCakl3QVktLzAvMTc3MDI3MDk4NzE2Nj9lPTE3OTYyNTYwMDAmdj1iZXRhJnQ9cFBTTUNlYzlxVW9xN0prRVoyYkh0WUpPc1JjU19Cd3drQ2FFdXdueDNHayIsImlzTmV0d29yayI6dHJ1ZSwibG9hZFR5cGUiOiJpbWciLCJ0aW1lT3JpZ2luIjoxNzk0NjkxNzQxNjMzLjgsInJlc291cmNlUHJvZ3Jlc3NT… (2788 chars)",
        "isPegasusEncoded": true
      },
      "clientBreadCrumbs": [],
      "isShadowEvent": false
    },
    "… 34 more"
  ]
}
```

Answered:

```json
{
  "responses": [
    {
      "id": "<id:2>",
      "responseStatus": "ResponseStatus_SUCCESS"
    },
    {
      "id": "<id:3>",
      "responseStatus": "ResponseStatus_SUCCESS"
    },
    {
      "id": "<id:4>",
      "responseStatus": "ResponseStatus_SUCCESS"
    },
    {
      "id": "<id:5>",
      "responseStatus": "ResponseStatus_SUCCESS"
    },
    {
      "id": "<id:6>",
      "responseStatus": "ResponseStatus_SUCCESS"
    },
    {
      "id": "<id:7>",
      "responseStatus": "ResponseStatus_SUCCESS"
    },
    "… 34 more"
  ]
}
```

<!-- facts:end -->

## What it does

The web client's event tracking, posted to the root path. The recorded bodies are batches of tracking events (`eventBody` with view durations and view fractions, served events for feed updates, comments and profile cards, breadcrumbs and page instances) or a `clientContext` with `requests` carrying Pegasus-encoded payloads. The recording shows it during the send-a-message and react steps, answered 200 with no body; the facts block doesn't show which host it went to.

## What our machine does with it

Our engine never sends this tracking: nothing in `python/linkedinApi` posts these events, and openLinkedinApi's `track` (`/li/track`) isn't called by our engine. The only tracking-like call our engine makes is `TrackShareboxInteraction` through `server-request`, after a post's composer closes.

## What can go wrong

Only 200 with an empty answer is in our recording, so its other statuses aren't shown. Our engine doesn't send it, so nothing it could return reaches our runs.
