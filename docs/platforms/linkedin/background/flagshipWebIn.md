# flagshipWebIn

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/flagship-web/in` |
| Sends | `requestedArguments`, `isPrefetch`, `$type`, `screenId`, `pageKey`, `presentationStyle`, `presentation`, `title`, `url`, `inheritActor`, `colorScheme`, `disableScreenGutters`, `shouldHideMobileTopNavBar`, `shouldHideLoadingSpinner`, `replaceCurrentScreen`, `shouldHideMobileTopNavBarDivider`, `clearBackStack`, `preserveCurrentChildren`, `sharedElementTransitions`, `newHierarchy`, `screenTitle`, `sduiTrackingProvenance` |
| Reads | — |
| Called from | `runs/inspect/20261107T170649_<name:1>/script13.js:12 anonymous` |
| rea | `ev_2b7a18c271a4f80536532c2cac14a9478e5ead3403f7631fd1303b375af517a7` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 708 ms | 203473 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 679 ms | 2065 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/server-request (382 ms) | 1 | 0 | 692 ms | 20905 ms | — |
| inspect | step 5: goto /feed/ | 2 | 200, 0 | 670–705 ms | 1915–5643 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 734 ms | 1932 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 824 ms | 2219 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 708 ms

Sent:

```json
{
  "query": {
    "parentSpanId": "+wKwGJXEZYc="
  },
  "body": {
    "requestedArguments": {
      "payload": {
        "vanityName": "<username:1>",
        "isVanityNameResolved": true
      },
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
"MjoiJFNyZWFjdC5mcmFnbWVudCIKMzoiNzFhZDk1MjY3YzYwNWEzNGZlZmUxMTU1YTYxZTZhZDMiCjQ6IlNkdWlUcmFja2luZ1Byb3ZlbmFuY2VQcm92aWRlciIKNTpJWyIkMyIsW10sIiQ0Il0KNjoiMmFkM2VhNzI3OGNhZjNlMzg4ZmYzNmU1NDUxMzJmNmMiCjc6IkRlc3RpbmF0aW9uUmVwb3J0ZXIiCjg6SVsiJDYiLFtdLCIkNyJdCjk6Ijk1NzJiNDRjZjM5YWIyYjc5ZmI1OGUxNjI2Mjk3NTQzIgphOiJQYWdlTG9hZFRyYWNpbmdQcm92aWRlciIKYjpJWyIkOSIsW10sIiRhIl0KYzoiMDMwZDYwMzVjYjNhOTk3ZWZiMWNmZjdh… (855900 chars)"
```

**runs/inspect/20261107T161246_<name:1>**, step 4: goto /feed/: 200, 679 ms

Sent:

```json
{
  "query": {
    "parentSpanId": "myBeikwHnMU="
  },
  "body": {
    "requestedArguments": {
      "payload": {
        "vanityName": "<username:1>",
        "isVanityNameResolved": true
      },
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
"MjoiJFNyZWFjdC5mcmFnbWVudCIKMzoiNzFhZDk1MjY3YzYwNWEzNGZlZmUxMTU1YTYxZTZhZDMiCjQ6IlNkdWlUcmFja2luZ1Byb3ZlbmFuY2VQcm92aWRlciIKNTpJWyIkMyIsW10sIiQ0Il0KNjoiMmFkM2VhNzI3OGNhZjNlMzg4ZmYzNmU1NDUxMzJmNmMiCjc6IkRlc3RpbmF0aW9uUmVwb3J0ZXIiCjg6SVsiJDYiLFtdLCIkNyJdCjk6Ijk1NzJiNDRjZjM5YWIyYjc5ZmI1OGUxNjI2Mjk3NTQzIgphOiJQYWdlTG9hZFRyYWNpbmdQcm92aWRlciIKYjpJWyIkOSIsW10sIiRhIl0KYzoiMDMwZDYwMzVjYjNhOTk3ZWZiMWNmZjdh… (856096 chars)"
```

**runs/inspect/20261107T161246_<name:1>**, POST 0 /flagship-web/rsc-action/actions/server-request (382 ms): 0, 692 ms

Sent:

```json
{
  "$type": "proto.sdui.actions.core.NavigateToScreen",
  "screenId": "com.linkedin.sdui.flagshipnav.profile.Profile",
  "pageKey": "profile_view_base",
  "presentationStyle": "PresentationStyle_FULL_PAGE",
  "presentation": {
    "$case": "fullPage",
    "fullPage": {
      "$type": "proto.sdui.actions.core.presentation.FullPagePresentation"
    }
  },
  "title": "",
  "url": "/in/<profile>/",
  "inheritActor": false,
  "colorScheme": "ColorScheme_UNKNOWN",
  "disableScreenGutters": false,
  "shouldHideMobileTopNavBar": false,
  "shouldHideLoadingSpinner": false,
  "replaceCurrentScreen": false,
  "shouldHideMobileTopNavBarDivider": false,
  "clearBackStack": false,
  "preserveCurrentChildren": false,
  "sharedElementTransitions": [],
  "newHierarchy": {
    "$type": "proto.sdui.navigation.ScreenHierarchy",
    "screenHash": "com.linkedin.sdui.flagshipnav.home.Home#0",
    "screenId": "com.linkedin.sdui.flagshipnav.home.Home",
    "pageKey": "",
    "isAnchorPage": true,
    "url": "",
    "childHierarchy": {
      "$type": "proto.sdui.navigation.ScreenHierarchy",
      "screenHash": "com.linkedin.sdui.flagshipnav.profile.Profile#c938a5d1",
      "screenId": "com.linkedin.sdui.flagshipnav.profile.Profile",
      "pageKey": "",
      "isAnchorPage": true,
      "url": ""
    }
  },
  "screenTitle": [],
  "sduiTrackingProvenance": {
    "version": "0.2.4195"
  },
  "requestedArguments": {
    "payload": {
      "vanityName": "<username:2>",
      "isVanityNameResolved": true,
      "vieweeProfileId": "<memberId>"
    },
    "states": [],
    "requestMetadata": {
      "$type": "proto.sdui.common.RequestMetadata",
      "currentActor": {
        "$type": "proto.sdui.bindings.core.Bindable",
        "key": {
          "key": {
            "value": {
              "$case": "id",
              "id": "<id:1>"
            }
          }
        },
        "content": {
          "$case": "stringBinding",
          "stringBinding": {}
        }
      }
    },
    "screenId": "",
    "knownTemplateIds": []
  }
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

The server-driven screen for a profile under `/in/`. LinkedIn's web client posts the profile's vanity name as a prefetch (`isPrefetch: true`) while the feed or another page is open, and posts a full `NavigateToScreen` to the Profile screen when the account opens one; the answer is the screen's encoded server-component stream.

## What our machine does with it

log's LinkedIn direct-API engine never sends it: nothing in `python/linkedinApi` or `vendor/openLinkedinApi` names this path, so no run waits on it, reads it or replays it. The nearest screen call the engine does send is `/flagship-web/mynetwork` (`Network.open_network` in `network.py`), which loads the suggestions a connect is picked from.

## What can go wrong

200 carries the screen. Status 0 means our recording holds no answer: the browser cut the request off or had not finished it when the step's capture closed, usually because the page moved on. Seen during the feed's navigations, these only affect the browser's own page, never one of our direct-API runs.
