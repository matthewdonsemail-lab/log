# draftsDelete

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | messages |
| Kind | mutation |
| doc_id | — |
| Path | `/api/drafts.delete` |
| Sends | `------WebKitFormBoundaryxqSde7FhvQFhRORI
Content-Disposition: form-data; name` |
| Reads | `ok` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script29.js:146 H5rY`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 H5rY`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_70a2c8c1076d1c4aa77ef1c0614ac5d9ed75e9a42a6a10dc7e67783412ef2ac0` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 17: press Backspace | 1 | 200 | 311 ms | 738 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 17: press Backspace: 200, 311 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689606.626",
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
    "------WebKitFormBoundaryxqSde7FhvQFhRORI\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryxqSde7FhvQFhRORI\r\nContent-Disposition: form-data; name=\"client_last_updated_ts\"\r\n\r\n1793689486064\r\n------WebKitFormBoundaryxqSde7FhvQFhRORI\r\nContent-Disposition: form-data; name=\"draft_id\"\r\n\r\nDr0CECLN037C\r\n------WebKitFormBoundaryxqSde7FhvQFhRORI\r\nCo… (932 chars)"
  }
}
```

Answered:

```json
{
  "ok": true
}
```

<!-- facts:end -->

## What it does

Deletes a saved draft: it fired once on step 17 (press Backspace), 0.7 s after the key, 311 ms, 200 with `ok: true`.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. Only the websocket `draft_delete` event is passed through by the watch.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal such as `draft_not_found` would mean the draft was already gone.
