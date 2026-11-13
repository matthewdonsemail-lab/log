# dndTeamInfo

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | people |
| Kind | query |
| doc_id | — |
| Path | `/api/dnd.teamInfo` |
| Sends | `------WebKitFormBoundaryNNr9b3CmCshVSp3q
Content-Disposition: form-data; name`, `------WebKitFormBoundaryUP5h90z1pj92UkUA
Content-Disposition: form-data; name` |
| Reads | `ok`, `error` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script125.js:37 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:146 "2bB/"`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 "2bB/"` |
| rea | `ev_e155976e730445a1e2ee00e54f9fbcbc57f4556e541ad2d601de0b94c62a2f4e` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 367 ms | 8974 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 1 | 200 | 304 ms | 6851 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 367 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689066.722",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "<teamId:1>",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "_x_b3_traceid": "d8263bb2c34b856c56c034933fd30eb9",
    "_x_b3_spanid": "4f7b943ce5551970",
    "_x_b3_sampled": "1",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryNNr9b3CmCshVSp3q\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryNNr9b3CmCshVSp3q\r\nContent-Disposition: form-data; name=\"users\"\r\n\r\n<userId:1>\r\n------WebKitFormBoundaryNNr9b3CmCshVSp3q\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetchAndUpsertDndForUsers-getDndTimesFor:others\r\n------WebKitFormBoundaryNNr… (720 chars)"
  }
}
```

Answered:

```json
{
  "ok": false,
  "error": "user_not_found"
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 304 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689121.936",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "<teamId:1>",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryUP5h90z1pj92UkUA\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryUP5h90z1pj92UkUA\r\nContent-Disposition: form-data; name=\"users\"\r\n\r\n<userId:1>\r\n------WebKitFormBoundaryUP5h90z1pj92UkUA\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetchAndUpsertDndForUsers-getDndTimesFor:others\r\n------WebKitFormBoundaryUP5… (720 chars)"
  }
}
```

Answered:

```json
{
  "ok": false,
  "error": "user_not_found"
}
```

<!-- facts:end -->

## What it does

Asks for other people's do-not-disturb state: it answered `ok: false, error: user_not_found` both times, fired 9.0 s into step 4 (`goto /client`, 367 ms) and 6.9 s into step 6 (304 ms), status 200.

## What our machine does with it

Nothing in log-cli calls it. Gabriel has a `dnd.teamInfo` lookup (`fetch_dnd` in `vendor/gabrielSlack/gabriel/client/hydrator.py`, used by its presence tracker) but the engine drives `GabrielCore` only and never starts that client.

## What can go wrong

Here it did go wrong in the recorded runs: Slack's own answer is `user_not_found` with HTTP 200, so a caller that checks only the status would miss it. The `ok` flag is what decides, and the web client carried on regardless.
