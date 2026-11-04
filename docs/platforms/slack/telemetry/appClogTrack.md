# appClogTrack

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | telemetry |
| Kind | endpoint |
| doc_id | — |
| Path | `app.slack.com/clog/track` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261103T065639_mattSlack/script192.js:11 children`, `runs/inspect/20261103T065639_mattSlack/script6.js:16 statement`, `runs/inspect/20261103T065639_mattSlack/script618.js:4 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:193 tlRz` |
| rea | `ev_3f950f5511e42ad6153036f13fd5395b0a2449e37d42dc8d71c817d7af0194b7` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: click e536 | 1 | 200 | 276 ms | 1102 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065218_mattSlack**, step 3: click e536: 200, 276 ms

Sent:

```json
{
  "query": {
    "logs": [
      {
        "tstamp": 1793688781812,
        "event": "WEBSITE_CLICK",
        "args": {
          "target_url": "https://slack.com/get-started?entry_point=nav_menu&_gl=1*1b9y6p7*_gcl_au*NzIyMDQwMjIxLjE3OTM2ODg3NTI.*_ga*ODA1NDEyOTg3LjE3OTM2ODg3NTQ.*_ga_QTJQME5M5D*czE3OTM2ODg3NTMkbzEkZzAkdDE3OTM2ODg3NTQkajU5JGwwJGgw",
          "contexts": {
            "ui_context": {
              "ui_element": "link_get_started",
              "ui_component": "inc_header_nav_deux",
              "ui_component_variant": null,
              "action": "click",
              "step": "page_home"
            },
            "metadata": {
              "origin": "<a href=\"https://slack.com/get-started?entry_point=nav_menu&amp;_gl=1*1b9y6p7*_gcl_au*NzIyMDQwMjIxLjE3OTM2ODg3NTI.*_ga*ODA1NDEyOTg3LjE3OTM2ODg3NTQ.*_ga_QTJQME5M5D*czE3OTM2ODg3NTMkbzEkZzAkdDE3OTM2ODg3NTQkajU5JGwwJGgw\" class=\"c-button v--primary v--left\" data-gtm-click=\"SignUp\" data-clog-click=\"\" data-clog-ui-element=\"link_get_started\" data-clog-ui-component=\"inc_header_nav_deux\" data-qa=\"cta_get_st… (411 chars)"
            }
          },
          "page_url": "https://app.slack.com/"
        },
        "i18n_locale": "en-US"
      }
    ],
    "o": "dotcom"
  },
  "body": null
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Slack's client reports a usage event to its logging collector on app.slack.com: no fields were readable in the recording, and it answered `null` with status 200 in 276 ms, once on step 3 click e536 (1.1 s after the step began).

## What our machine does with it

Nothing: no log-cli code calls it and no machine waits on it. It is Slack's own telemetry and has no effect on what our account does.

## What can go wrong

It returned 200 here, and a failed telemetry call changes nothing for a run. No answer of it is read by us.
