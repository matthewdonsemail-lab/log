# helpIssuesTicketStats

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | activity |
| Kind | query |
| doc_id | — |
| Path | `/api/help.issues.ticketStats` |
| Sends | `------WebKitFormBoundarypIyvQFO4tVSV142t
Content-Disposition: form-data; name`, `------WebKitFormBoundaryHlIMlZ2A1xCjZcJy
Content-Disposition: form-data; name` |
| Reads | `ok`, `unread_count`, `open_count` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script3.js:2977 cFgC` |
| rea | `ev_eda8b0eeda36dea9dd5e62631a4c5eb57372e9a048a40b6aa5bb18ad64003d02` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 301 ms | 7648 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 294 ms | 5591 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 301 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689065.133",
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
    "------WebKitFormBoundarypIyvQFO4tVSV142t\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundarypIyvQFO4tVSV142t\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetchAndUpsertTicketStats\r\n------WebKitFormBoundarypIyvQFO4tVSV142t\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundarypIyvQFO4tVSV142t\r\nContent-Di… (595 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "unread_count": 0,
  "open_count": 0
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 294 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689120.478",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryHlIMlZ2A1xCjZcJy\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryHlIMlZ2A1xCjZcJy\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetchAndUpsertTicketStats\r\n------WebKitFormBoundaryHlIMlZ2A1xCjZcJy\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundaryHlIMlZ2A1xCjZcJy\r\nContent-Di… (595 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "unread_count": 0,
  "open_count": 0
}
```

<!-- facts:end -->

## What it does

Asks how many Slack help tickets the user has: it answered `ok: true`, `unread_count: 0`, `open_count: 0`, on step 4 goto /client (301 ms) and step 6 goto the DM (294 ms).

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`, actions ping, workspaces, chats, read, send, watch over `vendor/gabrielSlack`) never uses this endpoint; it is Slack's web client's own traffic, seen only because the `log inspect` AdsPower run on mattSlack loaded the page.

## What can go wrong

Both calls were 200. A non-zero `unread_count` would only show a badge in Slack's help menu; it never touches our chats.
