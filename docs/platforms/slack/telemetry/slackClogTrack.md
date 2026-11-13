# slackClogTrack

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | telemetry |
| Kind | endpoint |
| doc_id | — |
| Path | `slack.com/clog/track` |
| Sends | `------WebKitFormBoundaryfPhbmXXDZyMrHNTR
Content-Disposition: form-data; name`, `------WebKitFormBoundaryJLcFTxbDgbQ8a32v
Content-Disposition: form-data; name`, `_gl`, `------WebKitFormBoundaryFnfL35CR3Se9OCk5
Content-Disposition: form-data; name` |
| Reads | — |
| Called from | `runs/inspect/20261103T065639_mattSlack/script125.js:37 anonymous`, `runs/inspect/20261103T065639_mattSlack/script125.js:102 setLocalePreference`, `runs/inspect/20261103T065639_mattSlack/script3.js:2878 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:200 mHed` |
| rea | `ev_bdfab10512b46ded775d22e8102fdb497797c1e0af64f1c1366855e7e9a17cfd` |

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: +414px in 10 wheel steps, 375 ms | 1 | 200 | 285 ms | 2323 ms | — |
| inspect | step 3: click e536 | 1 | 200 | 355 ms | 7834 ms | — |
| inspect | step 4: saveState | 1 | 200 | 384 ms | 15995 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, scroll: +414px in 10 wheel steps, 375 ms: 200, 285 ms

Sent:

```json
{
  "------WebKitFormBoundaryfPhbmXXDZyMrHNTR\r\nContent-Disposition: form-data; name": "\"logs\"\r\n\r\n[{\"tstamp\":1793689009690,\"event\":300323,\"args\":{\"contexts\":{\"ui_context\":{\"ui_step\":\"get_started_creator_landing\",\"entry_point\":\"unknown\",\"ui_component_variant\":\"get_started_revamp_existing_users_v2_treatment\",\"step_variant\":\"confirmed_with_google_id_token\",\"ui_element\":1361,\"ui_properties\":{\"element_name\":\"workspaces_joined\",\"element_value\":\"7\"},\"action\":1}}},\"team_id\":\"<teamId:1>\",\"sess… (3995 chars)"
}
```

Answered:

```json
"R0lGODlhAQABAAAAACwAAAAAAQABAAACAkwBADs="
```

**runs/inspect/20261103T065218_mattSlack**, step 3: click e536: 200, 355 ms

Sent:

```json
{
  "------WebKitFormBoundaryJLcFTxbDgbQ8a32v\r\nContent-Disposition: form-data; name": "\"logs\"\r\n\r\n[{\"tstamp\":1793688784107,\"event\":800008,\"args\":{\"contexts\":{\"ui_context\":{\"ui_step\":\"sign_in_to_your_workspace\",\"entry_point\":\"nav_menu\",\"step_variant\":\"get_started_creator_signup\",\"ui_properties\":{\"element_name\":\"google_login_button\",\"element_type\":2},\"ui_component_name\":\"auth_route_email_first_create\",\"action\":1,\"ui_page\":\"https://slack.com/get-started?entry_point=nav_menu",
  "_gl": "1*1b9y6p7*_gcl_au*NzIyMDQwMjIxLjE3OTM2ODg3NTI.*_ga*ODA1NDEyOTg3LjE3OTM2ODg3NTQ.*_ga_QTJQME5M5D*czE3OTM2ODg3NTMkbzEkZzAkdDE3OTM2ODg3NTQkajU5JGwwJGgw#/createnew\"}},\"referring_event_id\":300323},\"team_id\":\"<teamId:1>\",\"session_id\":\"<token>\",\"i18n_locale\":\"en-US\",\"sub_app_name\":\"legacy\"}]\r\n------WebKitFormBoundaryJLcFTxbDgbQ8a32v\r\nContent-Disposition: form-data; name=\"o\"\r\n\r\n… (452 chars)"
}
```

Answered:

```json
null
```

**runs/inspect/20261103T065218_mattSlack**, step 4: saveState: 200, 384 ms

Sent:

```json
{
  "------WebKitFormBoundaryFnfL35CR3Se9OCk5\r\nContent-Disposition: form-data; name": "\"logs\"\r\n\r\n[{\"tstamp\":1793688813452,\"event\":300323,\"args\":{\"contexts\":{\"referring_ui_context\":{\"ui_step\":\"sign_in_to_your_workspace\",\"entry_point\":\"nav_menu\",\"step_variant\":\"get_started_creator_signup\",\"ui_properties\":{\"element_name\":\"google_login_button\",\"element_type\":2},\"ui_component_name\":\"auth_route_email_first_create\",\"is_primary_cta\":true,\"action\":36},\"ui_context\":{\"entry_point\":\"default_oau… (1539 chars)",
  "_gl": "1*1b9y6p7*_gcl_au*NzIyMDQwMjIxLjE3OTM2ODg3NTI.*_ga*ODA1NDEyOTg3LjE3OTM2ODg3NTQ.*_ga_QTJQME5M5D*czE3OTM2ODg3NTMkbzEkZzAkdDE3OTM2ODg3NTQkajU5JGwwJGgw#landing\"}},\"referring_event_id\":300323},\"team_id\":\"<teamId:1>\",\"session_id\":\"<token>\",\"i18n_locale\":\"en-US\",\"sub_app_name\":\"legacy\"},{\"tstamp\":1793688813458,\"event\":300323,\"args\":{\"contexts\":{\"referring_ui_context\":{\"ui_step… (2817 chars)"
}
```

Answered:

```json
"R0lGODlhAQABAAAAACwAAAAAAQABAAACAkwBADs="
```

<!-- facts:end -->

## What it does

Slack's client sends batched usage events to `slack.com/clog/track`: the body is a `logs` JSON list (for example event 800008 with a ui_context) plus a `_gl` analytics linker string, and it answered with a 1x1 GIF (`R0lGODlhAQAB...`) and status 200 (285-384 ms). Seen 3 times in 2 runs: during a scroll, on step 3 click e536 and on step 4 saveState.

## What our machine does with it

Nothing: no log-cli code calls it and no machine waits on it; the GIF is only an acknowledgement. Our engine sends no client telemetry.

## What can go wrong

It returned 200 each time. A failure here would not affect a run; it is only Slack's own metrics.
