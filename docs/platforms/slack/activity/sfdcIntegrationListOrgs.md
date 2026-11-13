# sfdcIntegrationListOrgs

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | activity |
| Kind | query |
| doc_id | — |
| Path | `/api/sfdc.integration.listOrgs` |
| Sends | `------WebKitFormBoundarySX6Aw979pIAVW0AF
Content-Disposition: form-data; name`, `------WebKitFormBoundaryBECOsbpvBOC2qwZh
Content-Disposition: form-data; name` |
| Reads | `ok`, `salesforce_orgs` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script29.js:146 statement`, `runs/inspect/20261103T065639_mattSlack/script3.js:2954 statement`, `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous` |
| rea | `ev_a798b7b6340b3e08f62a20eeac16b71596ede646cbfa5970cd07f123f44281ef` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 950 ms | 6624 ms | — |
| inspect | step 6: goto /client/<teamId:1>/<channelId:1> | 1 | 200 | 303 ms | 4515 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 950 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.431",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "<teamId:1>",
    "_x_version_ts": "1793684253",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundarySX6Aw979pIAVW0AF\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundarySX6Aw979pIAVW0AF\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch-orgs-and-sign-in-silently-v2\r\n------WebKitFormBoundarySX6Aw979pIAVW0AF\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundarySX6Aw979pIAVW0AF\r\nC… (604 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "salesforce_orgs": []
}
```

**runs/inspect/20261103T065639_mattSlack**, step 6: goto /client/<teamId:1>/<channelId:1>: 200, 303 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689119.600",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "_x_csid": "aVvVPXA0sak",
    "slack_route": "<teamId:1>",
    "_x_version_ts": "1793684253",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundaryBECOsbpvBOC2qwZh\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundaryBECOsbpvBOC2qwZh\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nfetch-orgs-and-sign-in-silently-v2\r\n------WebKitFormBoundaryBECOsbpvBOC2qwZh\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundaryBECOsbpvBOC2qwZh\r\nC… (604 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "salesforce_orgs": []
}
```

<!-- facts:end -->

## What it does

Asks which Salesforce orgs are connected to the workspace: it answered `ok: true`, `salesforce_orgs: []`, on step 4 goto /client (950 ms) and step 6 goto the DM (303 ms).

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`, actions ping, workspaces, chats, read, send, watch over `vendor/gabrielSlack`) never uses this endpoint; it is Slack's web client's own traffic, seen only because the `log inspect` AdsPower run on mattSlack loaded the page.

## What can go wrong

Both calls were 200. An `ok: false` would only hide Salesforce actions in the client; no run of ours waits on it.
