# flagshipWebRscActionActionsServerRequest

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/flagship-web/rsc-action/actions/server-request` |
| Sends | `requestId`, `serverRequest`, `states`, `requestedArguments` |
| Reads | — |
| Called from | `runs/inspect/20261107T170649_<name:3>/script60.js:1742 showErrorToast`, `runs/inspect/20261107T170649_<name:3>/script60.js:1742 showSuccessToast`, `runs/inspect/20261107T170649_<name:3>/script50.js:1155 anonymous`, `runs/inspect/20261107T170649_<name:3>/script50.js:1229 anonymous` |
| rea | `ev_beea3ff6a23754247201f9854f98467e0eb184892094bdc5ae1088a7bdf55062` |

Seen 99 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 3 | 200, 0 | 95–123 ms | 1139–1152 ms | — |
| inspect | step 6: click e2157 | 3 | 200 | 104–336 ms | 1032–1755 ms | — |
| inspect | step 2: snapshot | 2 | 200 | 293–297 ms | 201026–203477 ms | — |
| inspect | step 3: snapshot | 3 | 200, 0 | 100–256 ms | 2212–3154 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/app-config (501 ms) | 7 | 200, 0 | 192–437 ms | 7813–25819 ms | — |
| inspect | step 4: goto /feed/ | 4 | 200 | 104–152 ms | 207–10005 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/server-request (382 ms) | 1 | 0 | 250 ms | 19675 ms | — |
| inspect | step 5: goto /feed/ | 8 | 200 | 92–247 ms | 166–6455 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/pagination (759 ms) | 3 | 200 | 90–330 ms | 428–1180 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 119 ms | 1937 ms | — |
| inspect | step 7: click e277 | 2 | 200 | 101–310 ms | 292–293 ms | — |
| inspect | step 11: click e1733 | 1 | 200 | 157 ms | 187094 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 122 ms | 2224 ms | — |
| inspect | step 13: click e387 | 5 | 200 | 122–421 ms | 471–1148 ms | — |
| inspect | step 17: click e783 | 4 | 200, 0 | 130–875 ms | 1048–1077 ms | — |
| inspect | step 18: wait 90s | 1 | 200 | 212 ms | 100503 ms | — |
| inspect | scroll: container +2552px in 61 steps | 4 | 200, 0 | 121–382 ms | 681–697 ms | — |
| inspect | step 24: click e640 | 1 | 0 | 885 ms | 1136 ms | — |
| inspect | scroll: container -4071px in 82 steps | 5 | 200, 0 | 147–604 ms | 275–871 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/server-request (273 ms) | 1 | 200 | 200 ms | 112793 ms | — |
| inspect | step 25: goto /in/<profile>/ | 3 | 200 | 98–124 ms | 1243–1256 ms | — |
| inspect | step 31: press Escape | 2 | 200 | 114–1004 ms | 144–1941 ms | — |
| chrome | step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open | 1 | 200 | 111 ms | 21020 ms | — |
| chrome | step 3: react to a post, by hand | 14 | 200 | 128–563 ms | 194–12278 ms | — |
| chrome | step 4: repost a post, by hand | 2 | 200 | 182–193 ms | 300–2203 ms | — |
| chrome | step 5: comment on a post, by hand | 6 | 200 | 100–387 ms | 8–6423 ms | — |
| chrome | step 7: connect with a member, by hand | 5 | 200 | 180–732 ms | 300–11475 ms | — |
| chrome | step 8: comment on a post, by hand | 4 | 200 | 169–370 ms | 51–5196 ms | — |
| chrome | step 9: open My Network's invitations, by hand | 2 | 200 | 633–700 ms | 107–300 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:3>**, step 1: goto /in/<profile>/: 200, 95 ms

Sent:

```json
{
  "query": {
    "sduiid": "com.linkedin.sdui.requests.profile.profilePolicyNotice",
    "parentSpanId": "p0Sf8gks2Vo="
  },
  "body": {
    "requestId": "com.linkedin.sdui.requests.profile.profilePolicyNotice",
    "serverRequest": {
      "requestId": "com.linkedin.sdui.requests.profile.profilePolicyNotice",
      "requestedArguments": {
        "$type": "proto.sdui.actions.requests.RequestedArguments",
        "requestedStateKeys": [],
        "payload": {
          "policyType": "PolicyType_CONTROL_PROFILE_VISIBILITY"
        },
        "requestMetadata": {
          "$type": "proto.sdui.common.RequestMetadata"
        }
      },
      "isApfcEnabled": false,
      "isStreaming": false,
      "rumPageKey": ""
    },
    "states": [],
    "requestedArguments": {
      "$type": "proto.sdui.actions.requests.RequestedArguments",
      "requestedStateKeys": [],
      "payload": {
        "policyType": "PolicyType_CONTROL_PROFILE_VISIBILITY"
      },
      "requestMetadata": {
        "$type": "proto.sdui.common.RequestMetadata"
      },
      "states": [],
      "screenId": "com.linkedin.sdui.flagshipnav.home.Home",
      "knownTemplateIds": []
    }
  }
}
```

Answered:

```json
"MToiZjU0YTRkOWY5NDkwNGViMjI3YTZjMTMwNzEyNGVkZDYiCjI6SVsiJDEiLFtdLCJDbGllbnRDb21wb25lbnQiXQozOiJiNTViNjExMDE4MjZiY2RmOGE3MzQzNzBmNzQ4MGU0ZSIKNDoiVmlzaWJsZUl0ZW1zUHJvdmlkZXIiCjU6SVsiJDMiLFtdLCIkNCJdCjc6IiRTcmVhY3QuZnJhZ21lbnQiCjg6ImJjMTJiNTViMTdhOTMwN2QwNDUzYjJjNzQyYzJlY2E0Igo5OklbIiQ4IixbXSwiZGVmYXVsdCJdCmE6ImM1NzUxZmVmOGY5ZDExNGZlMzY2YjBlMzBhZmRmZDM1IgpiOklbIiRhIixbXSwiZGVmYXVsdCJdCmU6Ijc1MTI1NGI3… (10132 chars)"
```

**runs/inspect/20261107T170649_<name:3>**, step 6: click e2157: 200, 104 ms

Sent:

```json
{
  "query": {
    "sduiid": "com.linkedin.sdui.requests.mynetwork.handlePostInteropConnection",
    "parentSpanId": "4ahiANRaIlU="
  },
  "body": {
    "requestId": "com.linkedin.sdui.requests.mynetwork.handlePostInteropConnection",
    "serverRequest": {
      "requestId": "com.linkedin.sdui.requests.mynetwork.handlePostInteropConnection",
      "requestedArguments": {
        "$type": "proto.sdui.actions.requests.RequestedArguments",
        "payload": {
          "profileId": "<userId:1>",
          "vanityName": "<username:1>",
          "firstName": "<name:1>",
          "lastName": "<name:2>",
          "success": true,
          "errorType": "",
          "showVerificationPostConnectNBA": true
        },
        "requestedStateKeys": []
      },
      "isStreaming": false,
      "isApfcEnabled": false,
      "rumPageKey": ""
    },
    "states": [],
    "requestedArguments": {
      "$type": "proto.sdui.actions.requests.RequestedArguments",
      "payload": {
        "profileId": "<userId:1>",
        "vanityName": "<username:1>",
        "firstName": "<name:1>",
        "lastName": "<name:2>",
        "success": true,
        "errorType": "",
        "showVerificationPostConnectNBA": true
      },
      "requestedStateKeys": [],
      "states": [],
      "screenId": "",
      "knownTemplateIds": []
    }
  }
}
```

Answered:

```json
"MTpbXQowOnsic3RhdGVzIjpbXSwicmVzcG9uc2UiOnsiJHR5cGUiOiJwcm90by5zZHVpLnJlc3BvbnNlcy5TZXJ2ZXJSZXF1ZXN0UmVzcG9uc2UiLCJlcnJvcnMiOltdLCJpc1JldHJ5YWJsZSI6ZmFsc2UsImNvbXBsZXRpb25BY3Rpb24iOnsiYWN0aW9ucyI6W3siJHR5cGUiOiJwcm90by5zZHVpLmFjdGlvbnMuY29yZS5SZXBsYWNlQ29tcG9uZW50IiwidmFsdWUiOnsiY29tcG9uZW50S2V5IjoiY29tLmxpbmtlZGluLnNkdWkucHJvZmlsZS5jYXJkLnJlZkFDb0FBRHFPLWdrQnlMUF9VZlRDNmVXRW1DcDR1T2otN3ZOX0ZDb1Rv… (3032 chars)"
```

**runs/inspect/20261107T170649_<name:3>**, step 1: goto /in/<profile>/: 200, 95 ms

Sent:

```json
{
  "query": {
    "sduiid": "com.linkedin.sdui.requests.profile.profilePolicyNotice",
    "parentSpanId": "p0Sf8gks2Vo="
  },
  "body": {
    "requestId": "com.linkedin.sdui.requests.profile.profilePolicyNotice",
    "serverRequest": {
      "requestId": "com.linkedin.sdui.requests.profile.profilePolicyNotice",
      "requestedArguments": {
        "$type": "proto.sdui.actions.requests.RequestedArguments",
        "requestedStateKeys": [],
        "payload": {
          "policyType": "PolicyType_CONTROL_PROFILE_VISIBILITY"
        },
        "requestMetadata": {
          "$type": "proto.sdui.common.RequestMetadata"
        }
      },
      "isApfcEnabled": false,
      "isStreaming": false,
      "rumPageKey": ""
    },
    "states": [],
    "requestedArguments": {
      "$type": "proto.sdui.actions.requests.RequestedArguments",
      "requestedStateKeys": [],
      "payload": {
        "policyType": "PolicyType_CONTROL_PROFILE_VISIBILITY"
      },
      "requestMetadata": {
        "$type": "proto.sdui.common.RequestMetadata"
      },
      "states": [],
      "screenId": "com.linkedin.sdui.flagshipnav.home.Home",
      "knownTemplateIds": []
    }
  }
}
```

Answered:

```json
"MToiZjU0YTRkOWY5NDkwNGViMjI3YTZjMTMwNzEyNGVkZDYiCjI6SVsiJDEiLFtdLCJDbGllbnRDb21wb25lbnQiXQozOiJiNTViNjExMDE4MjZiY2RmOGE3MzQzNzBmNzQ4MGU0ZSIKNDoiVmlzaWJsZUl0ZW1zUHJvdmlkZXIiCjU6SVsiJDMiLFtdLCIkNCJdCjc6IiRTcmVhY3QuZnJhZ21lbnQiCjg6ImJjMTJiNTViMTdhOTMwN2QwNDUzYjJjNzQyYzJlY2E0Igo5OklbIiQ4IixbXSwiZGVmYXVsdCJdCmE6ImM1NzUxZmVmOGY5ZDExNGZlMzY2YjBlMzBhZmRmZDM1IgpiOklbIiRhIixbXSwiZGVmYXVsdCJdCmU6Ijc1MTI1NGI3… (10132 chars)"
```

<!-- facts:end -->

## What it does

Runs one named server request (`requestId`, repeated inside `serverRequest` with its `requestedArguments` and `states`). The web client sends it for almost every action and many page loads, such as a profile's policy notice, a connection follow-up after a click, toasts and metrics; the answer is a server-component stream whose actions (state commits, toasts, navigations) the page then applies.

## What our machine does with it

This is the call log's LinkedIn engine writes through. `Composer.server_request` in `share.py` posts a recorded template (`python/linkedinApi/templates`) to `server-request?sduiid=<requestId>`, the way the browser does, through one curl_cffi session as Chrome and the account's governor: `CreatePost`, the image upload steps, mentions and `deletePost` in `share.py`, `addaAddConnection` and My Network's follow-ups in `network.py`, and `reactions.create` in `reactions.py`. Each answer is read: `check` decides on the status and `action` refuses any answer that carries errors.

## What can go wrong

200 is what every browser call that finished got; status 0 means our recording holds no answer because the page moved on. For our own sends, `check` turns 429 or 999 into `rateLimited`, 401 or 403 into `sessionDead`, a deleted `li_at` cookie into `sessionRevoked`, any other status from 300 up into `linkedinRefused`, and errors in a 200 answer into `linkedinRefused` too; none is retried. A connect whose answer shows a toast or never sets the invitation to Pending is `connectRefused`, a like the answer doesn't commit is `likeUnconfirmed`, and a post with no activity id back is `postUnconfirmed`.
