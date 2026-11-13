# workspaceClogTrack

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | telemetry |
| Kind | endpoint |
| doc_id | — |
| Path | `<workspace:1>.slack.com/clog/track` |
| Sends | `------WebKitFormBoundary6rWiP8eAwObL1v1i
Content-Disposition: form-data; name`, `------WebKitFormBoundary3hehxgD9sM8cLUuz
Content-Disposition: form-data; name`, `------WebKitFormBoundaryT4njC1WjSVUo2uIA
Content-Disposition: form-data; name`, `------WebKitFormBoundaryjFRU5GGcC3NOmGTW
Content-Disposition: form-data; name`, `------WebKitFormBoundarycuHVkiveAsvbwLBy
Content-Disposition: form-data; name`, `------WebKitFormBoundaryJpEp2hxMaH9MBqVv
Content-Disposition: form-data; name`, `------WebKitFormBoundaryku5W6R5mcqcMnANL
Content-Disposition: form-data; name`, `------WebKitFormBoundarymXQP426cZd4yNZa9
Content-Disposition: form-data; name`, `------WebKitFormBoundaryY9gWR8EtSQiNCLWt
Content-Disposition: form-data; name`, `------WebKitFormBoundaryv9mhgBXh2v7pxo0o
Content-Disposition: form-data; name`, `------WebKitFormBoundaryplq0fWRqRjOsFcYU
Content-Disposition: form-data; name`, `------WebKitFormBoundaryqUOQ0SnNv6yZkWyi
Content-Disposition: form-data; name`, `------WebKitFormBoundaryBHM8npyTZuHkqwLq
Content-Disposition: form-data; name`, `------WebKitFormBoundarytcLqOWuMhfwlmL2p
Content-Disposition: form-data; name`, `------WebKitFormBoundary6mRWVkEgOVd1rCes
Content-Disposition: form-data; name` |
| Reads | — |
| Called from | — |
| rea | `ev_ffc95fd1733d84ad5e1d814282109c4a915794e3e7d4c911c430d7c30bbf1f40` |

Seen 15 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: saveState | 2 | 200 | 280–285 ms | 8110–8114 ms | — |
| inspect | step 7: pageText | 5 | 200 | 284–1344 ms | 8973–10324 ms | — |
| inspect | step 9: press Control+a | 2 | 200 | 463–471 ms | 18746–18747 ms | — |
| inspect | step 14: press Enter | 2 | 200 | 272–288 ms | 36564–36569 ms | — |
| inspect | step 16: press Control+a | 2 | 200 | 275–292 ms | 36230 ms | — |
| inspect | step 20: snapshot | 2 | 200 | 282–294 ms | 4319–4320 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 5: saveState: 200, 280 ms

Sent:

```json
{
  "------WebKitFormBoundary6rWiP8eAwObL1v1i\r\nContent-Disposition: form-data; name": "\"logs\"\r\n\r\n[{\"tstamp\":1793689064443,\"event\":6,\"args\":{\"experiment_name\":\"eventlog_drop_teams_left_shared_channel\",\"experiment_type\":\"user\",\"experiment_id\":\"12183228734982\",\"experiment_group\":\"off\",\"experiment_trigger\":\"hash_user\",\"exposure_id\":\"12156263517591\"},\"user_id\":\"<userId:1>\",\"team_id\":\"<teamId:1>\",\"session_id\":\"<token>\",\"i18n_locale\":\"en-US\",\"sub_app_name\":\"c… (5489 chars)"
}
```

Answered:

```json
"R0lGODlhAQABAAAAACwAAAAAAQABAAACAkwBADs="
```

**runs/inspect/20261103T065639_mattSlack**, step 7: pageText: 200, 293 ms

Sent:

```json
{
  "------WebKitFormBoundaryT4njC1WjSVUo2uIA\r\nContent-Disposition: form-data; name": "\"logs\"\r\n\r\n[{\"tstamp\":1793689119610,\"event\":6,\"args\":{\"experiment_name\":\"eventlog_drop_teams_left_shared_channel\",\"experiment_type\":\"user\",\"experiment_id\":\"12183228734982\",\"experiment_group\":\"off\",\"experiment_trigger\":\"hash_user\",\"exposure_id\":\"12156263517591\"},\"user_id\":\"<userId:1>\",\"team_id\":\"<teamId:1>\",\"client_session\":{\"uid\":\"aVvVPXA0sak\",\"timestamp_start\":1793689066,\"timestamp_refresh\":1793… (9987 chars)"
}
```

Answered:

```json
"R0lGODlhAQABAAAAACwAAAAAAQABAAACAkwBADs="
```

**runs/inspect/20261103T065639_mattSlack**, step 9: press Control+a: 200, 471 ms

Sent:

```json
{
  "------WebKitFormBoundarymXQP426cZd4yNZa9\r\nContent-Disposition: form-data; name": "\"logs\"\r\n\r\n[{\"tstamp\":1793689239917,\"event\":1500002,\"args\":{},\"user_id\":\"<userId:1>\",\"team_id\":\"<teamId:1>\",\"client_session\":{\"uid\":\"aVvVPXA0sak\",\"timestamp_start\":1793689066,\"timestamp_refresh\":1793689134,\"seconds_offline\":55,\"version\":0,\"definition_version\":1},\"ia_version\":\"ia4\",\"i18n_locale\":\"en-US\",\"sub_app_name\":\"client\"},{\"tstamp\":1793689250455,\"event\":700008,\"args\":{\"browser_session_id\":\"e… (891 chars)"
}
```

Answered:

```json
"R0lGODlhAQABAAAAACwAAAAAAQABAAACAkwBADs="
```

<!-- facts:end -->

## What it does

Slack's client sends the same batched usage events to the workspace host, `<workspace:1>.slack.com/clog/track`: each body is a `logs` JSON list (one shown carries an `experiment_name` event) and each answer is the 1x1 GIF with status 200. Seen 15 times in one run, on step 5 saveState, step 7 pageText, steps 9 and 16 press Control+a, step 14 press Enter and step 20 snapshot (272-1344 ms).

## What our machine does with it

Nothing: no log-cli code calls it, and rea found no script that sends it (its Called from is empty). It is Slack's client telemetry seen in the inspect run only.

## What can go wrong

All 15 calls were 200. A failure would not affect a run; no answer of it is read by us.
