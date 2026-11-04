# draftsList

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | messages |
| Kind | query |
| doc_id | — |
| Path | `/api/drafts.list` |
| Sends | `------WebKitFormBoundary31y9gA1DvBQFGYLy
Content-Disposition: form-data; name`, `------WebKitFormBoundaryRTvHKDk637HPNb9p
Content-Disposition: form-data; name` |
| Reads | `ok`, `drafts`, `files`, `has_more` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script3.js:2895 statement`, `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_f3479f7f5b9daa9dceef7b15a9ad2713400dad3dbb01d17a2c8d0e74f2742b2c` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 540 ms | 7081 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 295 ms | 5016 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 540 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.889",
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
    "------WebKitFormBoundary31y9gA1DvBQFGYLy\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundary31y9gA1DvBQFGYLy\r\nContent-Disposition: form-data; name=\"is_active\"\r\n\r\ntrue\r\n------WebKitFormBoundary31y9gA1DvBQFGYLy\r\nContent-Disposition: form-data; name=\"limit\"\r\n\r\n25\r\n------WebKitFormBoundary31y9gA1DvBQFGYLy\r\nContent-Disposition: form-data; name=… (783 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "drafts": [
    {
      "id": "Dr0C5V2U1N4C",
      "date_created": 1790789875,
      "user_id": "U0C4L7RF7HD",
      "team_id": "T0C4VCD06MR",
      "last_updated_ts": "1790859840.809052",
      "last_updated_client": "Chrome",
      "blocks": [
        {
          "type": "rich_text",
          "elements": [
            {
              "type": "rich_text_section",
              "elements": [
                {
                  "type": "text",
                  "text": "htto"
                }
              ]
            }
          ],
          "block_id": "YlQ4Y"
        }
      ],
      "file_ids": [],
      "is_from_composer": false,
      "is_deleted": false,
      "is_sent": false,
      "client_msg_id": "6c0fe315-91a9-4d8f-916c-8978a0f2b19a",
      "date_scheduled": 0,
      "destinations": [
        {
          "channel_id": "C0CCTFK2D5G",
          "thread_ts": "1790784079.100239",
          "broadcast": false
        }
      ]
    },
    {
      "id": "Dr0C53HBBN8H",
      "date_created": 1790614701,
      "user_id": "U0C4L7RF7HD",
      "team_id": "T0C4VCD06MR",
      "last_updated_ts": "1790614739.813228",
      "last_updated_client": "Chrome",
      "blocks": [
        {
          "type": "rich_text",
          "elements": [
            {
              "type": "rich_text_section",
              "elements": [
                {
                  "type": "text",
                  "text": "Well @"
                }
              ]
            }
          ],
          "block_id": "ODzIb"
        }
      ],
      "file_ids": [],
      "is_from_composer": false,
      "is_deleted": false,
      "is_sent": false,
      "client_msg_id": "160fbe19-deaa-4a30-a778-2f335523b614",
      "date_scheduled": 0,
      "destinations": [
        {
          "channel_id": "C0C559K0JA0"
        }
      ]
    }
  ],
  "files": [],
  "has_more": false
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 295 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689120.099",
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
    "------WebKitFormBoundaryRTvHKDk637HPNb9p\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryRTvHKDk637HPNb9p\r\nContent-Disposition: form-data; name=\"is_active\"\r\n\r\ntrue\r\n------WebKitFormBoundaryRTvHKDk637HPNb9p\r\nContent-Disposition: form-data; name=\"limit\"\r\n\r\n25\r\n------WebKitFormBoundaryRTvHKDk637HPNb9p\r\nContent-Disposition: form-data; name=… (783 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "drafts": [
    {
      "id": "Dr0C5V2U1N4C",
      "date_created": 1790789875,
      "user_id": "U0C4L7RF7HD",
      "team_id": "T0C4VCD06MR",
      "last_updated_ts": "1790859840.809052",
      "last_updated_client": "Chrome",
      "blocks": [
        {
          "type": "rich_text",
          "elements": [
            {
              "type": "rich_text_section",
              "elements": [
                {
                  "type": "text",
                  "text": "htto"
                }
              ]
            }
          ],
          "block_id": "YlQ4Y"
        }
      ],
      "file_ids": [],
      "is_from_composer": false,
      "is_deleted": false,
      "is_sent": false,
      "client_msg_id": "6c0fe315-91a9-4d8f-916c-8978a0f2b19a",
      "date_scheduled": 0,
      "destinations": [
        {
          "channel_id": "C0CCTFK2D5G",
          "thread_ts": "1790784079.100239",
          "broadcast": false
        }
      ]
    },
    {
      "id": "Dr0C53HBBN8H",
      "date_created": 1790614701,
      "user_id": "U0C4L7RF7HD",
      "team_id": "T0C4VCD06MR",
      "last_updated_ts": "1790614739.813228",
      "last_updated_client": "Chrome",
      "blocks": [
        {
          "type": "rich_text",
          "elements": [
            {
              "type": "rich_text_section",
              "elements": [
                {
                  "type": "text",
                  "text": "Well @"
                }
              ]
            }
          ],
          "block_id": "ODzIb"
        }
      ],
      "file_ids": [],
      "is_from_composer": false,
      "is_deleted": false,
      "is_sent": false,
      "client_msg_id": "160fbe19-deaa-4a30-a778-2f335523b614",
      "date_scheduled": 0,
      "destinations": [
        {
          "channel_id": "C0C559K0JA0"
        }
      ]
    }
  ],
  "files": [],
  "has_more": false
}
```

<!-- facts:end -->

## What it does

Lists the viewer's saved drafts (`drafts`, `files`, `has_more`): it fired in step 4 (540 ms) and step 6 (295 ms), both 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal would only hide old drafts in the web client.
