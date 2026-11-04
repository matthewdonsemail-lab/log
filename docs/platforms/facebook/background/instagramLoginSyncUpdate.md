# instagramLoginSyncUpdate

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/instagram/login_sync/update/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | not read yet |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 339 ms | 23048 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T180010_mattinferencesaver**, step 2: snapshot: 200, 339 ms

Sent:

```json
{
  "encrypted_data": "AVnY-joxs81FQ6m4xNnfaLmx6g8ZR_fDZqzolrShktSxosf9uDfsURSGatESNSqM02pIxCOx2WOU98puHPRpMnai6sqhxIMOYSbnmQuAPhaZ-wFtilbjGisEf9qKqjQ",
  "session_key": "e123fc3b-d537-4236-8fa5-bbe5779fc66c"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AUPQW14_78bDhAKYKcLs5pB",
  "payload": {
    "success": "ok"
  },
  "lid": "7704006797055112010"
}
```

<!-- facts:end -->

## What it does

Updates the login-sync state between the signed-in Instagram session and the Facebook side: it posts an `encrypted_data` blob and a `session_key` and answered `payload.success: ok`. It fired once, during `step 2: snapshot` of run 20261103T180010, 23 s after the step started, taking 339 ms with status 200.

## What our machine does with it

Nothing: no log-cli machine calls or waits on it, and rea has not read it yet. It is the page's own background traffic seen while exploring Instagram with `log inspect`.

## What can go wrong

The one call answered 200 with `success: ok`. A failure would only mean the page's sync did not record; our runs do not decide on it.
