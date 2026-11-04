# draftsListActive

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | messages |
| Kind | query |
| doc_id | — |
| Path | `/api/drafts.listActive` |
| Sends | `------WebKitFormBoundarycTk1xl55FH1mIkKa
Content-Disposition: form-data; name` |
| Reads | `ok`, `active_draft_ids`, `has_more` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_9f45ef2fef0bed99d00f70d43072cc308f3ce7a605544e48fba9626d281a1385` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 302 ms | 5021 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 302 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689120.104",
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
    "------WebKitFormBoundarycTk1xl55FH1mIkKa\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundarycTk1xl55FH1mIkKa\r\nContent-Disposition: form-data; name=\"limit\"\r\n\r\n1000\r\n------WebKitFormBoundarycTk1xl55FH1mIkKa\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nclient-v2-boot-team\r\n------WebKitFormBoundarycTk1xl55FH1mIkKa\r\nContent-Disposition:… (685 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "active_draft_ids": [
    "Dr0C5V2U1N4C",
    "Dr0C53HBBN8H"
  ],
  "has_more": false
}
```

<!-- facts:end -->

## What it does

Lists the ids of drafts currently being edited (`active_draft_ids`, `has_more`): it fired once, 5.0 s into step 6 (goto the DM), 302 ms, 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client.

## What can go wrong

Slack answers `{ok: false, error: ...}` (usually still HTTP 200) when it refuses; the recording shows only `200` with no errors here. A refusal would only leave the web client unaware of drafts open on another device.
