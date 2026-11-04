# clientAppCommands

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | boot |
| Kind | query |
| doc_id | — |
| Path | `/api/client.appCommands` |
| Sends | `------WebKitFormBoundarygAaa46CR1GAAYxae
Content-Disposition: form-data; name` |
| Reads | `ok`, `app_actions`, `commands`, `cache_ts` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script31.js:2988 anonymous`, `runs/inspect/20261103T065639_mattSlack/script29.js:153 RLb6`, `runs/inspect/20261103T065639_mattSlack/script3.js:2961 RLb6` |
| rea | `ev_55a6fa408c20ebeabe44fdae92e9bcfd39e913ab4e6198dab07a384ec2b614d7` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 948 ms | 6610 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 948 ms

Sent:

```json
{
  "query": {
    "_x_id": "2c6eaecf-1793689064.419",
    "_x_gantry": "true",
    "_x_desktop_ia": "4",
    "slack_route": "T0C4VCD06MR",
    "_x_version_ts": "1793684253",
    "_x_frontend_build_type": "current",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": {
    "------WebKitFormBoundarygAaa46CR1GAAYxae\r\nContent-Disposition: form-data; name": "\"token\"\r\n\r\nxoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\r\n------WebKitFormBoundarygAaa46CR1GAAYxae\r\nContent-Disposition: form-data; name=\"_x_reason\"\r\n\r\ndispatch-client-extras\r\n------WebKitFormBoundarygAaa46CR1GAAYxae\r\nContent-Disposition: form-data; name=\"_x_mode\"\r\n\r\nonline\r\n------WebKitFormBoundarygAaa46CR1GAAYxae\r\nContent-Dispo… (592 chars)"
  }
}
```

Answered:

```json
{
  "ok": true,
  "app_actions": [],
  "commands": [
    {
      "canonical_name": "/shrug",
      "desc": "Appends ¯\\_(ツ)_/¯ to your message",
      "usage": "your text",
      "name_normalized": "/shrug",
      "name": "/shrug",
      "type": "core",
      "is_workspace_agnostic": true,
      "teams": [
        "T0C4VCD06MR"
      ]
    },
    {
      "canonical_name": "/me",
      "usage": "your message",
      "desc": "Displays action text",
      "name_normalized": "/me",
      "name": "/me",
      "type": "core",
      "is_workspace_agnostic": true,
      "teams": [
        "T0C4VCD06MR"
      ]
    },
    {
      "canonical_name": "/topic",
      "usage": "new topic",
      "desc": "Set the channel topic",
      "name_normalized": "/topic",
      "name": "/topic",
      "type": "core",
      "is_workspace_agnostic": true,
      "teams": [
        "T0C4VCD06MR"
      ]
    },
    {
      "canonical_name": "/away",
      "usage": "",
      "desc": "Toggle your \"away\" status",
      "name_normalized": "/away",
      "name": "/away",
      "type": "core",
      "is_workspace_agnostic": true,
      "teams": [
        "T0C4VCD06MR"
      ]
    },
    {
      "canonical_name": "/msg",
      "usage": "@user [your message]",
      "desc": "Send a DM message to another user",
      "name_normalized": "/msg",
      "name": "/msg",
      "type": "core",
      "is_workspace_agnostic": true,
      "teams": [
        "T0C4VCD06MR"
      ]
    },
    {
      "canonical_name": "/open",
      "usage": "[channel]",
      "desc": "Open a channel",
      "name_normalized": "/open",
      "name": "/open",
      "type": "core",
      "is_workspace_agnostic": true,
      "teams": [
        "T0C4VCD06MR"
      ]
    },
    "… 18 more"
  ],
  "cache_ts": "1582676714.000000"
}
```

<!-- facts:end -->

## What it does

Lists the slash commands and app actions the workspace has (`commands`, `app_actions`, `cache_ts`) so the client can show them in the composer: it fired 6.6 s into step 4 (`goto /client`), took 948 ms, status 200.

## What our machine does with it

Nothing: no log-cli code calls it. The engine (`python/slackApi/engine.py`) works through `GabrielCore` on curl_cffi, which signs in with the `d` cookie and calls only the web API methods it needs, so this is Slack's own web client boot traffic that `log inspect` recorded. log-cli sends plain `chat.postMessage` text and never lists slash commands.

## What can go wrong

Like every Slack web API answer it carries `ok`; with `ok: false` the `error` field says why (for example `not_authed`, `invalid_auth`, `ratelimited`). It answered 200 once with no error, so nothing here affected the run.
