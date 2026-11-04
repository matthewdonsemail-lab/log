# sharedInvitesCanGetLink

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | activity |
| Kind | mutation |
| doc_id | — |
| Path | `/api/sharedInvites.canGetLink` |
| Sends | `------WebKitFormBoundaryvWif171cs16fn9fD
Content-Disposition: form-data; name`, `------WebKitFormBoundaryKVEHomBzWCV4cyPi
Content-Disposition: form-data; name` |
| Reads | `ok`, `is_eligible` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous`, `runs/inspect/20261103T065639_mattSlack/script3.js:2878 statement` |
| rea | `ev_2906b68ca898d9b503bd70e2e03c98ea207957870def4d3f71556b63a336e441` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 300 ms | 8940 ms | — |
| inspect | step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU | 1 | 200 | 293 ms | 7200 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 300 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689066.270",
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
    "------WebKitFormBoundaryvWif171cs16fn9fD\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryvWif171cs16fn9fD\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nsidebar-mount\r\n------WebKitFormBoundaryvWif171cs16fn9fD\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundaryvWif171cs16fn9fD\r\nContent-Disposition: f… (583 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "is_eligible": true
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/T0C4VCD06MR/D0C8VAE7REU: 200, 293 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689122.282",
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
    "------WebKitFormBoundaryKVEHomBzWCV4cyPi\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundaryKVEHomBzWCV4cyPi\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nsidebar-mount\r\n------WebKitFormBoundaryKVEHomBzWCV4cyPi\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundaryKVEHomBzWCV4cyPi\r\nContent-Disposition: f… (583 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "is_eligible": true
}
```

<!-- facts:end -->

## What it does

Asks whether the user may create a shared invite link, although it is typed a mutation here: it answered `ok: true`, `is_eligible: true`, on step 4 goto /client (300 ms) and step 6 goto the DM (293 ms). It only checks eligibility.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`, actions ping, workspaces, chats, read, send, watch over `vendor/gabrielSlack`) never uses this endpoint; it is Slack's web client's own traffic, seen only because the `log inspect` AdsPower run on mattSlack loaded the page.

## What can go wrong

Both calls were 200. An `ok: false` or `is_eligible: false` would only hide the invite-people prompt in the client; nothing of ours acts on it.
