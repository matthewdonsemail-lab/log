# edgeapiCacheChannelsMembership

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | conversations |
| Kind | endpoint |
| doc_id | — |
| Path | `edgeapi.slack.com/cache/channels/membership` |
| Sends | — |
| Reads | `channel`, `members`, `ok` |
| Called from | `runs/inspect/20261103T065639_mattSlack/script38.js:771 anonymous` |
| rea | `ev_c768a8dd3a32ade2e987e251d0627a66b7d798dc007c87a92e41828826c7a8e2` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /client | 1 | 200 | 392 ms | 9401 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T065639_mattSlack**, step 4: goto /client: 200, 392 ms

Sent:

```json
{
  "query": {
    "_x_app_name": "client",
    "fp": "6f",
    "_x_num_retries": "0"
  },
  "body": "{\"token\":\"xoxc-12165421006739-12156263517591-12492529441700-5bffe6e6a317b9bbab53d938a4526d20e882de6ab372cd46f9f90868bb0322a0\",\"channel\":\"C0C4L7RSTGX\",\"users\":[\"U0C4L7RF7HD\"],\"as_admin\":false}"
}
```

Answered:

```json
{
  "channel": "C0C4L7RSTGX",
  "members": [
    "U0C4L7RF7HD"
  ],
  "ok": true
}
```

<!-- facts:end -->

## What it does

Asks Slack's edge cache who the members of a channel are (`channel`, `members`): it fired once in step 4 (goto /client), 9.4 s in, 392 ms, 200.

## What our machine does with it

Nothing: no log-cli code calls it (not in python/slackApi, src/ or the engine's own paths), so no action waits on it or reads it; it was only seen in the inspect recording of Slack's own web client.

## What can go wrong

An `ok: false` or an empty `members` would only leave the web client's member list blank; the recording shows a 200 with no errors.
