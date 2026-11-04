# activityViews

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | activity |
| Kind | query |
| doc_id | — |
| Path | `/api/activity.views` |
| Sends | `------WebKitFormBoundarytsZAa4pFGbXvC5dG
Content-Disposition: form-data; name`, `------WebKitFormBoundaryNRxjwdxPHSbI0T3q
Content-Disposition: form-data; name`, `------WebKitFormBoundaryBmODzJL36nxO1lnK
Content-Disposition: form-data; name`, `------WebKitFormBoundarySZmyiYKqgcs7lKPl
Content-Disposition: form-data; name` |
| Reads | `ok`, `views`, `prefs` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_0837ce7ca7507bc888b1eadd8362b902a8bdd19760a1bbf7318f7230fb011fad` |

Seen 4 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 358 ms | 7583 ms | — |
| inspect | step 5: saveState | 1 | 200 | 299 ms | 21605 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 412 ms | 5524 ms | — |
| inspect | step 16: press Control+a | 1 | 200 | 416 ms | 86193 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 358 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.906",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundarytsZAa4pFGbXvC5dG\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundarytsZAa4pFGbXvC5dG\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch-deferred-messaging-client-data\r\n------WebKitFormBoundarytsZAa4pFGbXvC5dG\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundarytsZAa4pFGbXvC5dG\r… (606 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "views": [
    {
      "id": "Av01",
      "name": "All",
      "emoji": null,
      "view_type": "all",
      "position": "1000000000",
      "sort": "newest"
    },
    {
      "id": "Av02",
      "name": "DMs",
      "emoji": null,
      "view_type": "dms",
      "position": "2000000000",
      "sort": "newest",
      "filters": {
        "entry_types": [
          "dm"
        ]
      }
    },
    {
      "id": "Av03",
      "name": "Mentions",
      "emoji": null,
      "view_type": "mentions",
      "position": "3000000000",
      "sort": "newest",
      "filters": {
        "entry_types": [
          "at_user",
          "at_user_group",
          "at_channel",
          "at_everyone",
          "keyword",
          "list_record_assigned",
          "… 3 more"
        ]
      }
    },
    {
      "id": "Av04",
      "name": "Threads",
      "emoji": null,
      "view_type": "threads",
      "position": "4000000000",
      "sort": "newest",
      "filters": {
        "entry_types": [
          "thread_v2"
        ]
      }
    }
  ],
  "prefs": {}
}
```

**runs/inspect/20261103T065639_mattSlack**, step 5: saveState: 200, 299 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689111.329",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryNRxjwdxPHSbI0T3q\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryNRxjwdxPHSbI0T3q\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundaryNRxjwdxPHSbI0T3q\r\nContent-Disposition: form-data; name=\"_x_app_name\"\r\n\r\nclient\r\n------WebKitFormBoundaryNRxjwdxPHSbI0T3q\r\nContent-Disposition: form-d… (474 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "views": [
    {
      "id": "Av01",
      "name": "All",
      "emoji": null,
      "view_type": "all",
      "position": "1000000000",
      "sort": "newest"
    },
    {
      "id": "Av02",
      "name": "DMs",
      "emoji": null,
      "view_type": "dms",
      "position": "2000000000",
      "sort": "newest",
      "filters": {
        "entry_types": [
          "dm"
        ]
      }
    },
    {
      "id": "Av03",
      "name": "Mentions",
      "emoji": null,
      "view_type": "mentions",
      "position": "3000000000",
      "sort": "newest",
      "filters": {
        "entry_types": [
          "at_user",
          "at_user_group",
          "at_channel",
          "at_everyone",
          "keyword",
          "list_record_assigned",
          "… 3 more"
        ]
      }
    },
    {
      "id": "Av04",
      "name": "Threads",
      "emoji": null,
      "view_type": "threads",
      "position": "4000000000",
      "sort": "newest",
      "filters": {
        "entry_types": [
          "thread_v2"
        ]
      }
    }
  ],
  "prefs": {}
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 412 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689120.126",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryBmODzJL36nxO1lnK\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryBmODzJL36nxO1lnK\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch-deferred-messaging-client-data\r\n------WebKitFormBoundaryBmODzJL36nxO1lnK\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundaryBmODzJL36nxO1lnK\r… (606 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "views": [
    {
      "id": "Av01",
      "name": "All",
      "emoji": null,
      "view_type": "all",
      "position": "1000000000",
      "sort": "newest"
    },
    {
      "id": "Av02",
      "name": "DMs",
      "emoji": null,
      "view_type": "dms",
      "position": "2000000000",
      "sort": "newest",
      "filters": {
        "entry_types": [
          "dm"
        ]
      }
    },
    {
      "id": "Av03",
      "name": "Mentions",
      "emoji": null,
      "view_type": "mentions",
      "position": "3000000000",
      "sort": "newest",
      "filters": {
        "entry_types": [
          "at_user",
          "at_user_group",
          "at_channel",
          "at_everyone",
          "keyword",
          "list_record_assigned",
          "… 3 more"
        ]
      }
    },
    {
      "id": "Av04",
      "name": "Threads",
      "emoji": null,
      "view_type": "threads",
      "position": "4000000000",
      "sort": "newest",
      "filters": {
        "entry_types": [
          "thread_v2"
        ]
      }
    }
  ],
  "prefs": {}
}
```

<!-- facts:end -->

## What it does

Asks which Activity tab views the user has: it answered `ok: true` with four views, `All` (Av01), `DMs` (Av02), `Mentions` (Av03) and `Threads` (Av04), each with a `view_type`, a `sort` of `newest` and `filters.entry_types`, plus an empty `prefs`. It fired four times: step 4 goto /client (358 ms), step 5 saveState, step 6 goto the DM and step 16 press Control+a, with `_x_reason` `fetch-deferred-messaging-client-data` on the page loads.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`, actions ping, workspaces, chats, read, send, watch over `vendor/gabrielSlack`) never uses this endpoint; it is Slack's web client's own traffic, seen only because the `log inspect` AdsPower run on mattSlack loaded the page. The views are only labels for the Activity UI.

## What can go wrong

All four calls were 200. An `ok: false` with an `error` would only leave the Activity tab without its filters in Slack's client; no run of ours waits on it.
