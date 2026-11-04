# draftsUpdate

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | messages |
| Kind | mutation |
| doc_id | — |
| Path | `/api/drafts.update` |
| Sends | `------WebKitFormBoundaryQf7lBY8wRQGaEPAG
Content-Disposition: form-data; name` |
| Reads | `ok`, `draft.id`, `draft.date_created`, `draft.user_id`, `draft.team_id`, `draft.last_updated_ts`, `draft.last_updated_client`, `draft.blocks`, `draft.file_ids`, `draft.is_from_composer`, `draft.is_deleted`, `draft.is_sent` and 5 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script3.js:2895 statement`, `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_393c379ebcd2d612034a5b6a17f377c66133e9187f6250b2610105c57300caa5` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | POST 0 /beacon/error (383 ms) | 1 | 200 | 312 ms | 8478 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, POST 0 /beacon/error (383 ms): 200, 312 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689496.075",
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
    "------WebKitFormBoundaryQf7lBY8wRQGaEPAG\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryQf7lBY8wRQGaEPAG\r\nContent-Disposition: form-data; name=\"blocks\"\r\n\r\n[{\"type\":\"rich_text\",\"elements\":[{\"type\":\"rich_text_section\",\"elements\":[{\"type\":\"text\",\"text\":\"just need it for food till thennah been travelling for 3 years lad\"}]}]}]\r\n------WebKi… (1517 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "draft": {
    "id": "Dr0CECLN037C",
    "date_created": 1793689406,
    "user_id": "U0C4L7RF7HD",
    "team_id": "T0C4VCD06MR",
    "last_updated_ts": "1793689496.046363",
    "last_updated_client": "Chrome",
    "blocks": [
      {
        "type": "rich_text",
        "block_id": "1OxWG",
        "elements": [
          {
            "type": "rich_text_section",
            "elements": [
              {
                "type": "text",
                "text": "just need it for food till thennah been travelling for 3 years lad"
              }
            ]
          }
        ]
      }
    ],
    "file_ids": [],
    "is_from_composer": false,
    "is_deleted": false,
    "is_sent": false,
    "client_msg_id": "818e0d3e-a284-48a5-b90f-9c4f9b8d8eb3",
    "date_scheduled": 0,
    "destinations": [
      {
        "channel_id": "D0C8VAE7REU",
        "user_ids": [
          "U0A9JFXK21L"
        ]
      }
    ],
    "client_last_updated_ts": "1793689486064.000000"
  },
  "files": []
}
```

<!-- facts:end -->

## What it does

Updates an existing draft as the text changes (`draft.id`, `draft.blocks`, `draft.last_updated_ts`...): it fired once, beside a `/beacon/error` POST, 312 ms, 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. The engine posts finished messages only.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal such as `draft_not_found` would mean the draft was deleted before the update.
