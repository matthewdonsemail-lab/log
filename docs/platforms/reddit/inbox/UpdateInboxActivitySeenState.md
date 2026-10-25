# UpdateInboxActivitySeenState

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | inbox |
| Kind | mutation |
| doc_id | — |
| Path | `/svc/shreddit/graphql` |
| Sends | `input` |
| Reads | `data.updateInboxActivitySeenState`, `errors`, `operation`, `extensions.traceID` |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script103.js:49 firstUpdated` |
| rea | `ev_eb0bc10d733085edc2ae653118264942b37131707715a18ca6b93fa95c578d4b` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 11: goto /notifications | 1 | 200 | 636 ms | 2140 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 11: goto /notifications: 200, 636 ms

Sent:

```json
{
  "operation": "UpdateInboxActivitySeenState",
  "variables": {
    "input": {
      "lastSentAt": "2026-10-25T09:03:38.422000+0000"
    }
  }
}
```

Answered:

```json
{
  "data": {
    "updateInboxActivitySeenState": {
      "ok": true,
      "errors": null
    }
  },
  "errors": [],
  "operation": "UpdateInboxActivitySeenState",
  "extensions": {
    "traceID": "862c8af8a9a62abf161804737c71f787"
  }
}
```

<!-- facts:end -->

## What it does

Marks the account's inbox activity as seen up to a time. The slice rea read (`ev_eb0bc10d733085edc2ae653118264942b37131707715a18ca6b93fa95c578d4b`) is the notifications inbox's `firstUpdated()`: it fires `inbox_count_changed` with the initial message count, sets or clears the app badge, then sends the GraphQL mutation with `lastSentAt` (the newest notification's time, or now when there is none). In our run it fired 2.1 s into step 11 (goto /notifications), sent `lastSentAt: 2026-10-25T09:03:38.422000+0000`, and Reddit answered `ok: true`.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. Worth knowing: simply opening /notifications in inspect sends this mutation, so the account's notifications are marked seen on Reddit's side even though we clicked nothing. If log-cli reads notifications, this is what moves the unread marker.

## What can go wrong

It answered 200 in 636 ms with `ok: true` and no errors, the only time it was seen. The answer can carry `errors` and `ok: false`, but `firstUpdated()` awaits the call without checking either, so a failure would only leave the notifications unread on Reddit's side; nothing in our runs reads the answer.
