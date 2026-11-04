# conversationsMark

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | messages |
| Kind | mutation |
| doc_id | — |
| Path | `/api/conversations.mark` |
| Sends | `------WebKitFormBoundarybHJFQKstFjL3zKUR
Content-Disposition: form-data; name`, `------WebKitFormBoundaryUjnm56eXZ5o8GHVD
Content-Disposition: form-data; name` |
| Reads | `ok` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script29.js:146 statement`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 statement`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script125.js:5 anonymous` |
| rea | `ev_b6ad05ea9c4f6bbe03389fcba1bcaaf1c6f6c7316b1abcd0ffd0305b4f722462` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 385 ms | 11022 ms | — |
| inspect | step 13: type e1075 | 1 | 200 | 360 ms | 14474 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 385 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689126.106",
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
    "------WebKitFormBoundarybHJFQKstFjL3zKUR\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundarybHJFQKstFjL3zKUR\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\nD0C8VAE7REU\r\n------WebKitFormBoundarybHJFQKstFjL3zKUR\r\nContent-Disposition: form-data; name=\"ts\"\r\n\r\n1793689118.238869\r\n------WebKitFormBoundarybHJFQKstFjL3zKUR\r\nContent-Disposition:… (787 chars)"
  }
}
```

Answered:

```json
{
  "ok": true
}
```

**runs/inspect/20261103T065639_mattSlack**, step 13: type e1075: 200, 360 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689367.767",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "b3O92r22OFk",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_foreground": "true",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryUjnm56eXZ5o8GHVD\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryUjnm56eXZ5o8GHVD\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\nD0C8VAE7REU\r\n------WebKitFormBoundaryUjnm56eXZ5o8GHVD\r\nContent-Disposition: form-data; name=\"ts\"\r\n\r\n1793689365.012729\r\n------WebKitFormBoundaryUjnm56eXZ5o8GHVD\r\nContent-Disposition:… (787 chars)"
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

Marks a conversation read up to a timestamp: it fired in step 6 (goto the DM, 385 ms, 11 s in) and step 13 (type e1075, 360 ms), both 200 with `ok: true`.

## What our machine does with it

The engine never calls it: `python/slackApi/engine.py` has no `conversations.mark`, and `log slack read` states it marks nothing read. The vendored `gabriel/client/unread.py` can call it, but the engine drives the core, not that client.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. If a future caller marked a chat read, Slack would stop showing it as unread to the real person; that is why the engine does not do it.
