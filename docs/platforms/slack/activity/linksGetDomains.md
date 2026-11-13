# linksGetDomains

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | activity |
| Kind | query |
| doc_id | — |
| Path | `/api/links.getDomains` |
| Sends | `------WebKitFormBoundarydgUf1IW1MzpABYlv
Content-Disposition: form-data; name` |
| Reads | `ok`, `domains_ts`, `domains.useless-signin-prod.herokuapp.com`, `domains.open.workast.com`, `domains.open.workast.app`, `domains.loom.com`, `domains.www.loom.com`, `domains.lucid.app`, `domains.atlassian.net`, `domains.bitbucket.org`, `domains.trello.com`, `wildcard_domains.bitbucket.org` and 4 more |
| Called from | `runs/inspect/20261103T065639_mattSlack/script3.js:2908 statement`, `runs/inspect/20261103T065639_mattSlack/script35.js:275 anonymous` |
| rea | `ev_4a8886575dabfa8974994a6184592e0c330698626980cf00b54a7909f0d9eec9` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 941 ms | 6599 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 941 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.406",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "<teamId:1>",
    "_x_version_ts": "1793684253",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundarydgUf1IW1MzpABYlv\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\n<slackToken>\r\n------WebKitFormBoundarydgUf1IW1MzpABYlv\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\nsiws-get-domains\r\n------WebKitFormBoundarydgUf1IW1MzpABYlv\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundarydgUf1IW1MzpABYlv\r\nContent-Disposition… (586 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "domains_ts": 1793674652,
  "domains": {
    "useless-signin-prod.herokuapp.com": "A019231DHJ4",
    "open.workast.com": "A0HBTUUPK",
    "open.workast.app": "A0HBTUUPK",
    "loom.com": "A9G1TH4S2",
    "www.loom.com": "A9G1TH4S2",
    "lucid.app": "A01QUPTQRNX",
    "atlassian.net": "A01T126NSG7",
    "bitbucket.org": "A01T126NSG7",
    "trello.com": "A01T126NSG7"
  },
  "wildcard_domains": {
    "bitbucket.org": "A01T126NSG7",
    "atlassian.net": "A01T126NSG7",
    "loom.com": "A9G1TH4S2",
    "wac.stg.internal.atlassian.com": "A01T126NSG7",
    "jira-dev.com": "A01T126NSG7"
  }
}
```

<!-- facts:end -->

## What it does

Fetches Slack's list of domains it unfurls links for: it answered `ok: true` with a `domains_ts` and `domains.*` entries (loom.com, lucid.app, atlassian.net, trello.com and more) and `wildcard_domains.*`, once on step 4 goto /client, the slowest of these calls at 941 ms.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`, actions ping, workspaces, chats, read, send, watch over `vendor/gabrielSlack`) never uses this endpoint; it is Slack's web client's own traffic, seen only because the `log inspect` AdsPower run on mattSlack loaded the page. It only affects how links in messages are previewed.

## What can go wrong

The one recorded call was 200 with `ok: true`. If it failed, links would stop being unfurled in the client; messages our `send` posts through chat.postMessage are unaffected.
