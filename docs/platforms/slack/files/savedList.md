# savedList

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | files |
| Kind | query |
| doc_id | — |
| Path | `/api/saved.list` |
| Sends | `------WebKitFormBoundaryBF0FP56X97vpINhN
Content-Disposition: form-data; name` |
| Reads | `ok`, `saved_items`, `counts.uncompleted_count`, `counts.uncompleted_overdue_count`, `counts.archived_count`, `counts.completed_count`, `counts.total_count`, `response_metadata.next_cursor` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:169 Ywus`, `runs/inspect/20261103T065639_mattSlack/script3.js:2977 Ywus` |
| rea | `ev_62782e16f780de89eb58fb07151807e89dcf2a22c4a01e7a51a6e22fcfb2bc55` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 14: press Enter | 1 | 200 | 289 ms | 94858 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 14: press Enter: 200, 289 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689475.280",
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
    "------WebKitFormBoundaryBF0FP56X97vpINhN\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryBF0FP56X97vpINhN\r\nContent-Disposition: form-data; name=\"limit\"\r\n\r\n15\r\n------WebKitFormBoundaryBF0FP56X97vpINhN\r\nContent-Disposition: form-data; name=\"filter\"\r\n\r\nsaved_with_archived\r\n------WebKitFormBoundaryBF0FP56X97vpINhN\r\nContent-Disposition: form… (904 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "saved_items": [],
  "counts": {
    "uncompleted_count": 0,
    "uncompleted_overdue_count": 0,
    "archived_count": 0,
    "completed_count": 0,
    "total_count": 0
  },
  "response_metadata": {
    "next_cursor": ""
  }
}
```

<!-- facts:end -->

## What it does

Lists the viewer's saved-for-later items (`saved_items`, `counts.uncompleted_count`, `counts.total_count`, `response_metadata.next_cursor`): it fired once on step 14 (press Enter), 94.9 s in, 289 ms, 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. Saved items play no part in sending, reading or watching.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal would only empty the web client's Saved view.
