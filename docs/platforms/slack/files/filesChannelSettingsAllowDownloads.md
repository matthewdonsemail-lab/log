# filesChannelSettingsAllowDownloads

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | files |
| Kind | query |
| doc_id | — |
| Path | `/api/files.channelSettingsAllowDownloads` |
| Sends | `------WebKitFormBoundarysrJCASwVBTHQMGoI
Content-Disposition: form-data; name`, `------WebKitFormBoundaryFMxXWFxA3yAyd2Hd
Content-Disposition: form-data; name` |
| Reads | `ok`, `is_allowed`, `error` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script3.js:2895 statement`, `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_edb2eb822fc0e6f3b5ece5b0154145b1fb85ac6e241192c0f8691b7d79cb39b7` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 14: press Enter | 1 | 200 | 327 ms | 94854 ms | — |
| inspect | step 17: press Backspace | 1 | 200 | 343 ms | 17765 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 14: press Enter: 200, 327 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689475.277",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "qDE7gQoj5kY",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundarysrJCASwVBTHQMGoI\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundarysrJCASwVBTHQMGoI\r\nContent-Disposition: form-data; name=\"file_id\"\r\n\r\nF0CDBB09HT5\r\n------WebKitFormBoundarysrJCASwVBTHQMGoI\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfile-download-allowed-store.ConditionalFetchManager.fetch\r\n------WebKitFor… (732 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "is_allowed": true
}
```

**runs/inspect/20261103T065639_mattSlack**, step 17: press Backspace: 200, 343 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689623.643",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "Omg2iVUkYDE",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryFMxXWFxA3yAyd2Hd\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryFMxXWFxA3yAyd2Hd\r\nContent-Disposition: form-data; name=\"file_id\"\r\n\r\nF0817A32Y1E\r\n------WebKitFormBoundaryFMxXWFxA3yAyd2Hd\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfile-download-allowed-store.ConditionalFetchManager.fetch\r\n------WebKitFor… (732 chars)"
  }
}
```

Answered:

```json
{
  "ok": false,
  "error": "file_not_found"
}
```

<!-- facts:end -->

## What it does

Asks whether files in a channel may be downloaded (`is_allowed`): it fired on step 14 (press Enter, 327 ms) and step 17 (press Backspace, 343 ms), both HTTP 200, and the newest answer was `ok: false, error: file_not_found`.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. Our file fetch (`file_of`) goes straight to the file's `url_private_download` through `fetch_authenticated` and checks the response status, not this setting.

## What can go wrong

The recorded answer shows the shape: `ok: false` with `error: file_not_found` on a 200, meaning the file id it was asked about was gone or not visible to the account. It does not touch our runs; if `file_of` is refused it reports `Slack answered <status> to the file` for that attachment and carries on.
