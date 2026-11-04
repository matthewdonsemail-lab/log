# quipLookupThreadIds

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | files |
| Kind | query |
| doc_id | — |
| Path | `/api/quip.lookupThreadIds` |
| Sends | `------WebKitFormBoundaryETN5zi8blIBcrSNK
Content-Disposition: form-data; name` |
| Reads | `ok`, `lookup.F0CDBB09HT5` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:169 Gx6E`, `runs/inspect/20261103T065639_mattSlack/script3.js:2977 Gx6E` |
| rea | `ev_ded8f36da996e21cd24d54a17b9c52bd574b65bfa6a382b17d43adf174e8944f` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 14: press Enter | 1 | 200 | 315 ms | 90824 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 14: press Enter: 200, 315 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689471.246",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryETN5zi8blIBcrSNK\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryETN5zi8blIBcrSNK\r\nContent-Disposition: form-data; name=\"file_ids\"\r\n\r\nF0CDBB09HT5\r\n------WebKitFormBoundaryETN5zi8blIBcrSNK\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch-quip-ids\r\n------WebKitFormBoundaryETN5zi8blIBcrSNK\r\nContent-Disposi… (690 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "lookup": {
    "F0CDBB09HT5": "YZR9AAL1PgV"
  }
}
```

<!-- facts:end -->

## What it does

Maps a Slack file id to its Quip thread id (`lookup.F0CDBB09HT5`): it fired once on step 14 (press Enter), 90.8 s in, 315 ms, 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. Canvases are not read or written by log-cli.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A missing id in `lookup` would mean the file has no canvas thread; only the web client cares.
