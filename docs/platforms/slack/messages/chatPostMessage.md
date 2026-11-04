# chatPostMessage

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | messages |
| Kind | mutation |
| doc_id | — |
| Path | `/api/chat.postMessage` |
| Sends | `------WebKitFormBoundaryAFYPAffRqVheHs2c
Content-Disposition: form-data; name`, `------WebKitFormBoundary2aHFFTeGg2XxtBgh
Content-Disposition: form-data; name`, `------WebKitFormBoundary0UzdLCHlC98280tS
Content-Disposition: form-data; name`, `------WebKitFormBoundaryAAm0hYcsru7Az3bE
Content-Disposition: form-data; name` |
| Reads | `ok`, `channel`, `ts`, `message.user`, `message.type`, `message.ts`, `message.client_msg_id`, `message.text`, `message.team`, `message.blocks` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script38.js:1041 anonymous`, `runs/inspect/20261103T065639_mattSlack/script38.js:780 anonymous`, `runs/inspect/20261103T065639_mattSlack/script3.js:2986 statement`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_2cfc7f21f22baeccaef22dc290b92d3d636210c9ef80112f14aa7228c9c28c23` |

Seen 4 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 12: press Enter | 1 | 200 | 367 ms | 55 ms | — |
| inspect | step 14: press Enter | 1 | 200 | 364 ms | 59 ms | — |
| inspect | step 19: press Enter | 1 | 200 | 390 ms | 95 ms | — |
| inspect | step 22: press Enter | 1 | 200 | 362 ms | 26 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 12: press Enter: 200, 367 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689336.812",
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
    "------WebKitFormBoundaryAFYPAffRqVheHs2c\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryAFYPAffRqVheHs2c\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\nD0C8VAE7REU\r\n------WebKitFormBoundaryAFYPAffRqVheHs2c\r\nContent-Disposition: form-data; name=\"ts\"\r\n\r\n1793689336.xxxxx2\r\n------WebKitFormBoundaryAFYPAffRqVheHs2c\r\nContent-Disposition:… (1862 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "channel": "D0C8VAE7REU",
  "ts": "1793689336.797009",
  "message": {
    "user": "U0C4L7RF7HD",
    "type": "message",
    "ts": "1793689336.797009",
    "client_msg_id": "3047a24f-ec00-4c82-bbbf-95a167eed0c8",
    "text": "affiliate marketing lad, i send out links for stuff and it pays out friday",
    "team": "T0C4VCD06MR",
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
    ]
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 14: press Enter: 200, 364 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689380.482",
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
    "------WebKitFormBoundary2aHFFTeGg2XxtBgh\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundary2aHFFTeGg2XxtBgh\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\nD0C8VAE7REU\r\n------WebKitFormBoundary2aHFFTeGg2XxtBgh\r\nContent-Disposition: form-data; name=\"ts\"\r\n\r\n1793689380.xxxxx3\r\n------WebKitFormBoundary2aHFFTeGg2XxtBgh\r\nContent-Disposition:… (1819 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "channel": "D0C8VAE7REU",
  "ts": "1793689380.462369",
  "message": {
    "user": "U0C4L7RF7HD",
    "type": "message",
    "ts": "1793689380.462369",
    "client_msg_id": "c4851e4a-8d88-40f8-a569-79a5f9a0a65a",
    "text": "just need it for food till then",
    "team": "T0C4VCD06MR",
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
    ]
  }
}
```

**runs/inspect/20261103T065639_mattSlack**, step 19: press Enter: 200, 390 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689660.143",
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
    "------WebKitFormBoundary0UzdLCHlC98280tS\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundary0UzdLCHlC98280tS\r\nContent-Disposition: form-data; name=\"channel\"\r\n\r\nD0C8VAE7REU\r\n------WebKitFormBoundary0UzdLCHlC98280tS\r\nContent-Disposition: form-data; name=\"ts\"\r\n\r\n1793689660.xxxxx4\r\n------WebKitFormBoundary0UzdLCHlC98280tS\r\nContent-Disposition:… (1837 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "channel": "D0C8VAE7REU",
  "ts": "1793689660.133079",
  "message": {
    "user": "U0C4L7RF7HD",
    "type": "message",
    "ts": "1793689660.133079",
    "client_msg_id": "5a9a5b08-0820-47ea-98fd-5c9a653cb0fc",
    "text": "nah they went into inferencesaver, the ai gateway",
    "team": "T0C4VCD06MR",
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
    ]
  }
}
```

<!-- facts:end -->

## What it does

Posts one message into a conversation: the web client sent it four times (steps 12, 14, 19 and 22, each press Enter, 362 to 390 ms, 26 to 95 ms after the key press) to DM D0C8VAE7REU, and Slack answered 200 with `ok: true`, the `channel`, the new `ts` (for example `1793689336.797009`) and the `message` with its `text`, `client_msg_id`, `team` and `blocks`.

## What our machine does with it

This is the engine's `send` action: `send` in `python/slackApi/engine.py` calls `core.call_web_api("chat.postMessage", {channel, text})` once per line (rule 90), checks `answer.ok` and the returned `ts` before the next line, and records the `ts` in `sent`. It is the `slackSend` surface (`send --live`, `src/directApi/engine/client.ts`); a dry run never calls it.

## What can go wrong

If `ok` is false, the engine returns `slackRefused` with `chat.postMessage answered <error>` (for example `ratelimited`, `channel_not_found`, `not_in_channel`, `is_archived`, `msg_too_long`), keeps what was already sent, and stops: it is never retried through (rule 94), and the rest of the lines are held. A dead session shows as `not_authed` or `invalid_auth`.
