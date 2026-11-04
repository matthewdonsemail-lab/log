# draftsCreate

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | messages |
| Kind | mutation |
| doc_id | — |
| Path | `/api/drafts.create` |
| Sends | `------WebKitFormBoundary30EK4iBOD7Bfti9G
Content-Disposition: form-data; name`, `------WebKitFormBoundaryxmY14VnyNayc0ije
Content-Disposition: form-data; name`, `------WebKitFormBoundaryzLndsa02haxLICiB
Content-Disposition: form-data; name`, `------WebKitFormBoundary5wlU77uI2b5oCVMa
Content-Disposition: form-data; name` |
| Reads | `ok`, `draft.id`, `draft.date_created`, `draft.user_id`, `draft.team_id`, `draft.last_updated_ts`, `draft.last_updated_client`, `draft.blocks`, `draft.file_ids`, `draft.is_from_composer`, `draft.is_deleted`, `draft.is_sent` and 4 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script3.js:2878 statement`, `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_ab1a20f58a433cdc1c7a9f9eff1309fec620995c3114f9dad3b6e5a543687711` |

Seen 4 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 11: type e1075 | 1 | 200 | 323 ms | 19127 ms | — |
| inspect | step 13: type e1075 | 1 | 200 | 315 ms | 14619 ms | — |
| inspect | POST 0 /beacon/error (335 ms) | 1 | 200 | 373 ms | 8539 ms | — |
| inspect | step 21: type e1437 | 1 | 200 | 389 ms | 17923 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 11: type e1075: 200, 323 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689329.486",
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
    "------WebKitFormBoundary30EK4iBOD7Bfti9G\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundary30EK4iBOD7Bfti9G\r\nContent-Disposition: form-data; name=\"blocks\"\r\n\r\n[{\"type\":\"rich_text\",\"elements\":[{\"type\":\"rich_text_section\",\"elements\":[{\"type\":\"text\",\"text\":\"affiliate marketing lad, i send out links for stuff and it pays out friday\"}]}]}]\r\n---… (1432 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "draft": {
    "id": "Dr0CECL96ZMY",
    "date_created": 1793689329,
    "user_id": "U0C4L7RF7HD",
    "team_id": "T0C4VCD06MR",
    "last_updated_ts": "1793689329.473815",
    "last_updated_client": "Chrome",
    "blocks": [
      {
        "type": "rich_text",
        "block_id": "ulqsz",
        "elements": [
          {
            "type": "rich_text_section",
            "elements": [
              {
                "type": "text",
                "text": "affiliate marketing lad, i send out links for stuff and it pays out friday"
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
    "client_msg_id": "f9170bf3-42da-43ed-a8ad-bec15cfdf579",
    "date_scheduled": 0,
    "destinations": [
      {
        "channel_id": "D0C8VAE7REU",
        "user_ids": [
          "U0A9JFXK21L"
        ]
      }
    ]
  },
  "files": []
}
```

**runs/inspect/20261103T065639_mattSlack**, step 13: type e1075: 200, 315 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689367.912",
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
    "------WebKitFormBoundaryxmY14VnyNayc0ije\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryxmY14VnyNayc0ije\r\nContent-Disposition: form-data; name=\"blocks\"\r\n\r\n[{\"type\":\"rich_text\",\"elements\":[{\"type\":\"rich_text_section\",\"elements\":[{\"type\":\"text\",\"text\":\"just need it for food till then\"}]}]}]\r\n------WebKitFormBoundaryxmY14VnyNayc0ije\r\nCont… (1389 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "draft": {
    "id": "Dr0CDXER4MFZ",
    "date_created": 1793689367,
    "user_id": "U0C4L7RF7HD",
    "team_id": "T0C4VCD06MR",
    "last_updated_ts": "1793689367.887142",
    "last_updated_client": "Chrome",
    "blocks": [
      {
        "type": "rich_text",
        "block_id": "WzzKw",
        "elements": [
          {
            "type": "rich_text_section",
            "elements": [
              {
                "type": "text",
                "text": "just need it for food till then"
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
    "client_msg_id": "4b9ce7e7-f524-4f71-b685-6a89a8b24266",
    "date_scheduled": 0,
    "destinations": [
      {
        "channel_id": "D0C8VAE7REU",
        "user_ids": [
          "U0A9JFXK21L"
        ]
      }
    ]
  },
  "files": []
}
```

**runs/inspect/20261103T065639_mattSlack**, POST 0 /beacon/error (335 ms): 200, 373 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689644.905",
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
    "------WebKitFormBoundaryzLndsa02haxLICiB\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryzLndsa02haxLICiB\r\nContent-Disposition: form-data; name=\"blocks\"\r\n\r\n[{\"type\":\"rich_text\",\"elements\":[{\"type\":\"rich_text_section\",\"elements\":[{\"type\":\"text\",\"text\":\"nah they went into inferencesaver, the ai gateway\"}]}]}]\r\n------WebKitFormBoundaryzLnd… (1407 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "draft": {
    "id": "Dr0CE6L4CUUT",
    "date_created": 1793689644,
    "user_id": "U0C4L7RF7HD",
    "team_id": "T0C4VCD06MR",
    "last_updated_ts": "1793689644.928441",
    "last_updated_client": "Chrome",
    "blocks": [
      {
        "type": "rich_text",
        "block_id": "g6cwL",
        "elements": [
          {
            "type": "rich_text_section",
            "elements": [
              {
                "type": "text",
                "text": "nah they went into inferencesaver, the ai gateway"
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
    "client_msg_id": "450f0f6c-1ed6-4dc3-85d3-7e101f7cf03e",
    "date_scheduled": 0,
    "destinations": [
      {
        "channel_id": "D0C8VAE7REU",
        "user_ids": [
          "U0A9JFXK21L"
        ]
      }
    ]
  },
  "files": []
}
```

<!-- facts:end -->

## What it does

Saves the text being typed in the composer as a draft (`draft.id`, `draft.blocks`, `draft.is_from_composer`, `draft.is_sent`...): the web client fired it four times, on steps 11, 13 and 21 (each a type action) and once beside a `/beacon/error` POST, 315 to 389 ms, all 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client. The engine's `send` posts the finished text with `chat.postMessage` and never uses drafts. The websocket's `draft_create`, `draft_send` and `draft_delete` events are in the watch's `WATCHED` list, so drafts show up only as events.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal would only mean the web client could not save the draft; the typed text is not sent either way.
