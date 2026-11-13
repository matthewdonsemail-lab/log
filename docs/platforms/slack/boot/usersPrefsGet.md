# usersPrefsGet

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/users.prefs.get` |
| Sends | `------WebKitFormBoundary4NAmQGZmaP24YS9K
Content-Disposition: form-data; name`, `------WebKitFormBoundaryPEhxvUIlg6BkZmQY
Content-Disposition: form-data; name`, `------WebKitFormBoundaryqAnZdOK72DUoN91p
Content-Disposition: form-data; name`, `------WebKitFormBoundary74qs8DrFkiL5O97l
Content-Disposition: form-data; name` |
| Reads | `ok`, `prefs.emoji_use`, `prefs.frecency`, `prefs.user_expectations_survey_last_trigger_attempt` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:146 "3Y7p"`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 "3Y7p"` |
| rea | `ev_59a3e2f0c8361999276f19b41c8aaba6b4592bc614aa292fd175d0b50c70d59a` |

Seen 4 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 2 | 200 | 390–937 ms | 6607–7545 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 2 | 200 | 294–428 ms | 4503–5524 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 937 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.415",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "<teamId:1>",
    "_x_version_ts": "1793684253",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundary4NAmQGZmaP24YS9K\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundary4NAmQGZmaP24YS9K\r\nContent-Disposition: form-data; name=\"prefs\"\r\n\r\nemoji_use,frecency\r\n------WebKitFormBoundary4NAmQGZmaP24YS9K\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch-frecency-prefs\r\n------WebKitFormBoundary4NAmQGZmaP24YS9K\r\nConte… (700 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "prefs": {
    "emoji_use": "{\"slightly_smiling_face\":2,\"white_check_mark\":1,\"rolling_on_the_floor_laughing\":1,\"disappointed\":1,\"+1\":1}",
    "frecency": "{\"\":[{\"id\":\"<userId:1>\",\"count\":6,\"visits\":[1790671582740,1791089165791,1791360557262,1792916228995,1793070674580,1793070765100]},{\"id\":\"<channelId:2>\",\"count\":9,\"visits\":[1790673449906,1791360543780,1791542292987,1791818799344,1792219371603,1792224205526,1792388900408,1792389116914,1792397022742]},{\"id\":\"E1f642\",\"count\":1,\"visits\":[1792219392409]},{\"id\":\"E1f44d\",\"count\":1,\"visits\":[1792389124209]}… (1674 chars)"
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 294 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689119.585",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "<teamId:1>",
    "_x_version_ts": "1793684253",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryqAnZdOK72DUoN91p\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryqAnZdOK72DUoN91p\r\nContent-Disposition: form-data; name=\"prefs\"\r\n\r\nemoji_use,frecency\r\n------WebKitFormBoundaryqAnZdOK72DUoN91p\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch-frecency-prefs\r\n------WebKitFormBoundaryqAnZdOK72DUoN91p\r\nConte… (700 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "prefs": {
    "emoji_use": "{\"slightly_smiling_face\":2,\"white_check_mark\":1,\"rolling_on_the_floor_laughing\":1,\"disappointed\":1,\"+1\":1}",
    "frecency": "{\"\":[{\"id\":\"<userId:1>\",\"count\":6,\"visits\":[1790671582740,1791089165791,1791360557262,1792916228995,1793070674580,1793070765100]},{\"id\":\"<channelId:2>\",\"count\":9,\"visits\":[1790673449906,1791360543780,1791542292987,1791818799344,1792219371603,1792224205526,1792388900408,1792389116914,1792397022742]},{\"id\":\"E1f642\",\"count\":1,\"visits\":[1792219392409]},{\"id\":\"E1f44d\",\"count\":1,\"visits\":[1792389124209]}… (1674 chars)"
  }
}
```

<!-- facts:end -->

## What it does

Reads the account's saved preferences (`prefs.emoji_use`, `prefs.frecency`, and a survey trigger): fired twice in step 4 (`goto /client`, 390-937 ms) and twice in step 6 (294-428 ms), all 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). All recorded answers were 200 without error.
