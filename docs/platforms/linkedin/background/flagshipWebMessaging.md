# flagshipWebMessaging

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/flagship-web/messaging` |
| Sends | `$type`, `screenId`, `pageKey`, `presentationStyle`, `presentation`, `title`, `url`, `inheritActor`, `colorScheme`, `disableScreenGutters`, `shouldHideMobileTopNavBar`, `shouldHideLoadingSpinner`, `replaceCurrentScreen`, `shouldHideMobileTopNavBarDivider`, `clearBackStack`, `preserveCurrentChildren`, `sharedElementTransitions`, `newHierarchy`, `screenTitle`, `sduiTrackingProvenance`, `requestedArguments` |
| Reads | — |
| Called from | `runs/chrome/20261114T213510_<name:1>/script1.js:741 statement`, `runs/inspect/20261107T161246_<name:1>/script56.js:430 statement`, `runs/chrome/20261114T213510_<name:1>/script1.js:1031 statement`, `runs/chrome/20261114T213510_<name:1>/script1.js:1083 statement` |
| rea | `ev_cf831086cc41b46b24c8cdc9890a0b7c48a66164bfffc07ab47ec5142571fdc5` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| chrome | step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open | 1 | 200 | 120 ms | 23644 ms | — |
| chrome | step 8: comment on a post, by hand | 1 | 200 | 121 ms | 7086 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/chrome/20261114T213510_<name:1>**, step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open: 200, 120 ms

Sent:

```json
{
  "$type": "proto.sdui.actions.core.NavigateToScreen",
  "screenId": "com.linkedin.sdui.flagshipnav.messaging.ConversationListScreenData",
  "pageKey": "messaging_conversation_list",
  "presentationStyle": "PresentationStyle_FULL_PAGE",
  "presentation": {
    "$case": "fullPage",
    "fullPage": {
      "$type": "proto.sdui.actions.core.presentation.FullPagePresentation"
    }
  },
  "title": "",
  "url": "/messaging/",
  "inheritActor": false,
  "colorScheme": "ColorScheme_UNKNOWN",
  "disableScreenGutters": false,
  "shouldHideMobileTopNavBar": true,
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
      "screenHash": "com.linkedin.sdui.flagshipnav.messaging.InboxScreenData#0",
      "screenId": "com.linkedin.sdui.flagshipnav.messaging.InboxScreenData",
      "pageKey": "",
      "isAnchorPage": true,
      "url": "",
      "childHierarchy": {
        "$type": "proto.sdui.navigation.ScreenHierarchy",
        "screenHash": "com.linkedin.sdui.flagshipnav.messaging.ConversationListScreenData#0",
        "screenId": "com.linkedin.sdui.flagshipnav.messaging.ConversationListScreenData",
        "pageKey": "",
        "isAnchorPage": true,
        "url": ""
      }
    }
  },
  "screenTitle": "",
  "sduiTrackingProvenance": {
    "version": "0.2.5308"
  },
  "requestedArguments": {
    "payload": {},
    "states": [],
    "requestMetadata": {
      "$type": "proto.sdui.common.RequestMetadata"
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

**runs/chrome/20261114T213510_<name:1>**, step 8: comment on a post, by hand: 200, 121 ms

Sent:

```json
{
  "$type": "proto.sdui.actions.core.NavigateToScreen",
  "screenId": "com.linkedin.sdui.flagshipnav.messaging.ConversationListScreenData",
  "pageKey": "messaging_conversation_list",
  "presentationStyle": "PresentationStyle_FULL_PAGE",
  "presentation": {
    "$case": "fullPage",
    "fullPage": {
      "$type": "proto.sdui.actions.core.presentation.FullPagePresentation"
    }
  },
  "title": "",
  "url": "/messaging/",
  "inheritActor": false,
  "colorScheme": "ColorScheme_UNKNOWN",
  "disableScreenGutters": false,
  "shouldHideMobileTopNavBar": true,
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
      "screenHash": "com.linkedin.sdui.flagshipnav.messaging.InboxScreenData#0",
      "screenId": "com.linkedin.sdui.flagshipnav.messaging.InboxScreenData",
      "pageKey": "",
      "isAnchorPage": true,
      "url": "",
      "childHierarchy": {
        "$type": "proto.sdui.navigation.ScreenHierarchy",
        "screenHash": "com.linkedin.sdui.flagshipnav.messaging.ConversationListScreenData#0",
        "screenId": "com.linkedin.sdui.flagshipnav.messaging.ConversationListScreenData",
        "pageKey": "",
        "isAnchorPage": true,
        "url": ""
      }
    }
  },
  "screenTitle": "",
  "sduiTrackingProvenance": {
    "version": "0.2.5308"
  },
  "requestedArguments": {
    "payload": {},
    "states": [],
    "requestMetadata": {
      "$type": "proto.sdui.common.RequestMetadata"
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

Moves the web client to the messaging screen: a `NavigateToScreen` with the conversation list's `screenId`, `pageKey`, `/messaging/` as its `url`, the screen hierarchy it sits in and its presentation flags. The by-hand Chrome recording sends it twice, when messaging opens from the feed (about 23.6 s in) and again during the comment step, each answered 200 in about 120 ms with the screen to draw.

## What our machine does with it

Our engine never sends it. `log linkedin inbox`, `messages` and `message` don't navigate to a screen: `python/linkedinApi/messaging.py` reads `/voyager/api/me` for the mailbox and lists conversations and threads straight from `voyagerMessagingGraphQL`, so this screen's answer is never read.

## What can go wrong

Only 200 is in our recording, so its other statuses aren't shown. Since our engine doesn't send it, nothing it could return reaches our runs.
