# conversationsGenericInfo

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | conversations |
| Kind | query |
| doc_id | — |
| Path | `/api/conversations.genericInfo` |
| Sends | `------WebKitFormBoundary3pN8vABeEaoHn8n3
Content-Disposition: form-data; name`, `------WebKitFormBoundarypsFjOmkX5tI287jp
Content-Disposition: form-data; name` |
| Reads | `ok`, `channels`, `unchanged_channel_ids` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script29.js:146 statement`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 statement`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script125.js:37 anonymous` |
| rea | `ev_b0b9b469d7f4ea706fbef57e76f36fd79776b009477d63e3da46553eee76d18c` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 2 | 200 | 310–337 ms | 8180–9360 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 310 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689065.989",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "<teamId:1>",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundary3pN8vABeEaoHn8n3\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundary3pN8vABeEaoHn8n3\r\nContent-Disposition: form-data; name=\"updated_channels\"\r\n\r\n{\"<channelId:1>\":1790614723826}\r\n------WebKitFormBoundary3pN8vABeEaoHn8n3\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfallback:fetchAndUpsertChannelsById\r\n------WebK… (737 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "channels": [],
  "unchanged_channel_ids": [
    "<channelId:1>"
  ]
}
```

<!-- facts:end -->

## What it does

Fetches the generic info (name, flags, members summary) for a batch of channel ids, with `unchanged_channel_ids` for ones the client already holds: it fired twice in step 4 (goto /client), 8.2 to 9.4 s in, 310 to 337 ms, 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. Where the engine needs a conversation's details it only reads what `conversations.list` already returned, and vendored gabrielSlack's hydrator uses `conversations.info`, not this.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal such as `channel_not_found` for one id would only blank that channel in the web client.
