# workflowsTriggersList

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | activity |
| Kind | query |
| doc_id | — |
| Path | `/api/workflows.triggers.list` |
| Sends | `------WebKitFormBoundaryjhm0LFy7TAWo7Jq3
Content-Disposition: form-data; name`, `------WebKitFormBoundarybpt7yjXHUVAhDIjd
Content-Disposition: form-data; name` |
| Reads | `ok`, `triggers`, `rejected_triggers`, `response_metadata.next_cursor` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script29.js:168 statement`, `runs/inspect/20261103T065639_mattSlack/script3.js:2976 statement`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_a8dbfb68db434860e0915a9b1b3369c622f026f6a4fe915525979649c5b4a2f0` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 472 ms | 7975 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 291 ms | 6553 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 472 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689065.479",
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
    "------WebKitFormBoundaryjhm0LFy7TAWo7Jq3\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryjhm0LFy7TAWo7Jq3\r\nContent-Disposition: form-data; name=\"app_ids\"\r\n\r\n\r\n------WebKitFormBoundaryjhm0LFy7TAWo7Jq3\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nautomations_gallery\r\n------WebKitFormBoundaryjhm0LFy7TAWo7Jq3\r\nContent-Disposition: f… (683 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "triggers": [],
  "rejected_triggers": [],
  "response_metadata": {
    "next_cursor": ""
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 291 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689120.516",
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
    "------WebKitFormBoundarybpt7yjXHUVAhDIjd\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundarybpt7yjXHUVAhDIjd\r\nContent-Disposition: form-data; name=\"app_ids\"\r\n\r\n\r\n------WebKitFormBoundarybpt7yjXHUVAhDIjd\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nautomations_gallery\r\n------WebKitFormBoundarybpt7yjXHUVAhDIjd\r\nContent-Disposition: f… (683 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "triggers": [],
  "rejected_triggers": [],
  "response_metadata": {
    "next_cursor": ""
  }
}
```

<!-- facts:end -->

## What it does

Lists Workflow Builder triggers for the workspace: it answered `ok: true`, `triggers: []`, `rejected_triggers: []` and an empty `next_cursor`, on step 4 goto /client (472 ms) and step 6 goto the DM (291 ms).

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`, actions ping, workspaces, chats, read, send, watch over `vendor/gabrielSlack`) never uses this endpoint; it is Slack's web client's own traffic, seen only because the `log inspect` AdsPower run on mattSlack loaded the page.

## What can go wrong

Both calls were 200. An `ok: false` would leave the client's workflow shortcuts empty; our actions never wait on it.
