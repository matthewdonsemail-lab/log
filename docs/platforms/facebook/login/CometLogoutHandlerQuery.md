# CometLogoutHandlerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | query |
| doc_id | `9812519355492122` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer.logout_hash`, `viewer.actor` |
| Called from | `CometLogoutHandler.react` |
| rea | `ev_93007121314a1431e49915cf3c087648f0520a262c82854fa989a18c7ba27e6d` |

Seen 9 time(s) in 9 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 3 | 200 | 409–797 ms | 3016–6734 ms | — |
| inspect | step 38: goto /marketplace/ | 1 | 200 | 541 ms | 12959 ms | — |
| inspect | scroll: +515px in 13 wheel steps, 656 ms | 1 | 200 | 379 ms | 496802 ms | — |
| inspect | step 8: wait 5s | 1 | 200 | 643 ms | 1650538 ms | — |
| host | step 1: goto /marketplace/selling/ | 1 | 200 | 809 ms | 2580 ms | — |
| host | step 27: pageText | 1 | 200 | 379 ms | 2319 ms | — |
| flow | step 1: goto /marketplace/ | 1 | 200 | 696 ms | 6542 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T164523_61593843527201**, step 8: wait 5s: 200, 643 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometLogoutHandlerQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "9812519355492122"
}
```

Answered:

```json
{
  "data": {
    "logout_whitelist": [
      "^CacheStorageVersion$",
      "^RSTData$",
      "^RTC_VIDEO_INPUT$",
      "^RTC_AUDIO_INPUT$",
      "^RTC_AUDIO_OUTPUT$",
      "^RTC_IS_AUDIO_ONLY$",
      "… 98 more"
    ],
    "viewer": {
      "logout_hash": "AfkmQBzbvkh9kfgylII",
      "actor": {
        "__typename": "User",
        "has_confirmed_contactpoints": true,
        "pending_contactpoints": [],
        "id": "61593843527201"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792862149605,
      "time_at_flush_ms": 1792862149663
    },
    "is_final": true
  }
}
```

**runs/inspect/20261024T060921_61594063207669**, scroll: +515px in 13 wheel steps, 656 ms: 200, 379 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometLogoutHandlerQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "9812519355492122"
}
```

Answered:

```json
{
  "data": {
    "logout_whitelist": [
      "^CacheStorageVersion$",
      "^RSTData$",
      "^RTC_VIDEO_INPUT$",
      "^RTC_AUDIO_INPUT$",
      "^RTC_AUDIO_OUTPUT$",
      "^RTC_IS_AUDIO_ONLY$",
      "… 98 more"
    ],
    "viewer": {
      "logout_hash": "Afn16gW7g4R9xF8oV5Y",
      "actor": {
        "__typename": "User",
        "has_confirmed_contactpoints": true,
        "pending_contactpoints": [],
        "id": "61594063207669"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792824693955,
      "time_at_flush_ms": 1792824694004
    },
    "is_final": true
  }
}
```

**runs/host/20261024T222706_61593981307720**, step 27: pageText: 200, 379 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometLogoutHandlerQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "9812519355492122"
}
```

Answered:

```json
{
  "data": {
    "logout_whitelist": [
      "^CacheStorageVersion$",
      "^RSTData$",
      "^RTC_VIDEO_INPUT$",
      "^RTC_AUDIO_INPUT$",
      "^RTC_AUDIO_OUTPUT$",
      "^RTC_IS_AUDIO_ONLY$",
      "… 98 more"
    ],
    "viewer": {
      "logout_hash": "AflCpFPubfHco7S2Wmc",
      "actor": {
        "__typename": "User",
        "has_confirmed_contactpoints": true,
        "pending_contactpoints": [],
        "id": "61593981307720"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792881101144,
      "time_at_flush_ms": 1792881101186
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Fetches the logout link's hash (`viewer.logout_hash`) so the menu's Log out works. Fires on page load, including on checkpoint pages.

## What our machine does with it

Nothing. We never log out from the page; `log logout` clears the saved session in Twenty instead.

## What can go wrong

Harmless. Seen on the email step and on checkpoint pages, so it tells us a page loaded with a session, not that the session is healthy.
