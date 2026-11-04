# workspaceCanvasLoadDataEditor

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | files |
| Kind | endpoint |
| doc_id | — |
| Path | `workspace.slack.com/canvas/-/load-data/editor` |
| Sends | `request_binary` |
| Reads | — |
| Called from | — |
| rea | `ev_8e526ea44d509b2345523a2b8fbad8f3132d9bb96337397d521928ad1b65e5a9` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 14: press Enter | 1 | 200 | 397 ms | 96319 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 14: press Enter: 200, 397 ms

Sent:

```json
{
  "query": {
    "_x_version_ts": "1793684253",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "request_binary": "CgtZWlI5QUFMMVBnVhoPCAESC1laUjlBQUwxUGdWKgZlZGl0b3IwAQ=="
  }
}
```

Answered:

```json
"EuYDCAESwgMa9wEKC1laUjlBQUwxUGdWELamigI6C0NXWjlFQWNlaXh1UgtZWlI5QkF5NDZsMVkAAAAAAAAAAHAAqgEgGImRl4G+4ZcDIIuRl4G+4ZcDKgxXRVN3QW40MUNQNDiwAQGwAQKwAQOwAQSwAQWwAQawAQewAQmwAQuwAQywAQ2wAQ64AQG4AQK4AQO4AQS4AQW4AQa4AQe4AQm4AQu4AQy4AQ24AQ7gAQCYAgCoApOwlYG+4ZcDwALXppyBvuGXA+gCAOgDleGQgb7hlwPoBQO5BtX8Jl+hkKRqwQYEzksXWpvDlsgGAdgGBbgHAcIHC0NXWjlFQWNlaXh1MqwBCgtZWlI5QkF5NDZsMRC3pHcyC1laUjlBQUwxUGdWQIf6mYG+4ZcD… (656 chars)"
```

<!-- facts:end -->

## What it does

Loads the editor data for a canvas from `workspace.slack.com/canvas/-/load-data/editor`: it sent a binary request body and returned an encoded binary blob, fired once on step 14 (press Enter), 96.3 s in, 397 ms, 200. The facts list no source file that sends it.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. Canvases are not read or written by log-cli.

## What can go wrong

This is a binary body, not Slack's `ok`/`error` JSON, so the usual `ok: false` shape does not apply; the recording shows 200 with no errors. A failure would only stop a canvas opening in the web client.
