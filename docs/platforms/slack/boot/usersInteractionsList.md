# usersInteractionsList

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/users.interactions.list` |
| Sends | `------WebKitFormBoundaryiKAYKp7OWFDO0ByP
Content-Disposition: form-data; name`, `------WebKitFormBoundary7qOEnVb30dhj3N4z
Content-Disposition: form-data; name`, `------WebKitFormBoundaryP57JLt5Btci3hYRp
Content-Disposition: form-data; name`, `------WebKitFormBoundaryjsiAvsxERZtwQtUi
Content-Disposition: form-data; name`, `------WebKitFormBoundaryRCLxJBL0auoMBAcx
Content-Disposition: form-data; name`, `------WebKitFormBoundaryEGlEZm7WT8eyKCvB
Content-Disposition: form-data; name`, `------WebKitFormBoundary4jANDOhqa41A8vSl
Content-Disposition: form-data; name`, `------WebKitFormBoundaryOynOaU8AvJNHfm5B
Content-Disposition: form-data; name`, `------WebKitFormBoundarymInATtTBCt7sf47X
Content-Disposition: form-data; name`, `------WebKitFormBoundaryZqNDddQFmllBnY4Z
Content-Disposition: form-data; name` |
| Reads | `ok`, `interactions` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:169 xCPD`, `runs/inspect/20261103T065639_mattSlack/script3.js:2977 xCPD` |
| rea | `ev_7a56e8c265c0a541a39c3e03b4b433d1e417707288187b78005958f4cb4dde5a` |

Seen 10 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 3 | 200 | 291–900 ms | 6672–8949 ms | — |
| inspect | step 5: saveState | 1 | 200 | 292 ms | 21591 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 4 | 200 | 289–360 ms | 4879–8593 ms | — |
| inspect | step 14: press Enter | 1 | 200 | 283 ms | 96222 ms | — |
| inspect | step 16: press Control+a | 1 | 200 | 461 ms | 86168 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 900 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.480",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "<teamId:1>",
    "_x_version_ts": "1793684253",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryiKAYKp7OWFDO0ByP\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryiKAYKp7OWFDO0ByP\r\nContent-Disposition: form-data; name=\"components\"\r\n\r\nSOCIAL_CHANNEL_FOREWORD_HUDDLE_CARD\r\n------WebKitFormBoundaryiKAYKp7OWFDO0ByP\r\nContent-Disposition: form-data; name=\"types\"\r\n\r\nCLICK\r\n------WebKitFormBoundaryiKAYKp7OWFDO0ByP\r\nCo… (834 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "interactions": []
}
```

**runs/inspect/20261103T065639_mattSlack**, step 5: saveState: 200, 292 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689111.315",
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
    "------WebKitFormBoundaryjsiAvsxERZtwQtUi\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryjsiAvsxERZtwQtUi\r\nContent-Disposition: form-data; name=\"components\"\r\n\r\nACTIVITY_INBOX_ONBOARDING_MODAL,ACTIVITY_ONE_DOT_OH\r\n------WebKitFormBoundaryjsiAvsxERZtwQtUi\r\nContent-Disposition: form-data; name=\"types\"\r\n\r\nDISMISS,IMPRESSION\r\n------WebKitFor… (864 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "interactions": []
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 360 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689119.961",
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
    "------WebKitFormBoundaryRCLxJBL0auoMBAcx\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryRCLxJBL0auoMBAcx\r\nContent-Disposition: form-data; name=\"components\"\r\n\r\nHUDDLES_TRIAL_PRO_BANNER\r\n------WebKitFormBoundaryRCLxJBL0auoMBAcx\r\nContent-Disposition: form-data; name=\"types\"\r\n\r\nIMPRESSION\r\n------WebKitFormBoundaryRCLxJBL0auoMBAcx\r\nContent-… (817 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "interactions": [
    {
      "component": "HUDDLES_TRIAL_PRO_BANNER",
      "type": "IMPRESSION",
      "step": "DEFAULT",
      "count": 5,
      "date_first_recorded": 1790784078,
      "date_last_recorded": 1792398692
    }
  ]
}
```

<!-- facts:end -->

## What it does

Lists the people the account interacts with most (`interactions`), used by the client to rank suggestions. It fired many times across the run: 3 in step 4 (`goto /client`), 1 in step 5 (`saveState`), 4 in step 6, and once each in step 14 (`press Enter`) and step 16 (`press Control+a`), 283-900 ms, all 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded. The engine names people only through `users.info` for the DM partners it lists (`names_for`).

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). All recorded answers were 200 with no error.
