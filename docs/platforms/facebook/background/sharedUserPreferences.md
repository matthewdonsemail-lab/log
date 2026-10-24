# sharedUserPreferences

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/shared/user_preferences/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_36a106d5c6a349aaffd95d75400fb9370c5a8d58bad30e5c86f25c40aa5bf643` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 975 ms | 19172 ms | — |
| inspect | step 1: goto /marketplace/status | 1 | 200 | 887 ms | 15895 ms | — |
| host | step 4: pageText | 1 | 200 | 633 ms | 8959 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T000744_61594063207669**, step 1: goto /marketplace/status: 200, 887 ms

Sent:

```json
{
  "data": "eyJldmVudCI6InNjYW5fcmVzdWx0IiwibG9jYWxfc3RvcmFnZSI6WyJwczoxMDAwOTUyNDM0OTQ5ODE6MDU3NDgzMWEtY2VkYy00MjA2LTk4OTQtYjU3ZmYxYmU1MDBmIiwicHM6MTAwMDk1MzYxODUxNzQ0OjA1NzQ4MzFhLWNlZGMtNDIwNi05ODk0LWI1N2ZmMWJlNTAwZiIsInBzOjEwMDA5NTI0MDI3MjYwMzo1NWU0YzI1Ni1jNzVjLTRkZjItYWQ0ZC0xMDM5ODNlM2Y1NTIiLCJwczoxMDAwOTUzMDIzMDk1NTI6NTU0MWM5NWEtODM3Yy00ODZhLWI2MTktMGUzZDhiOTk1OGM4IiwicHM6MTAwMDk1MDc4ODMyMTA1OjA1NzQ4MzFh… (41104 chars)"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "Ae7OC83RspaUO2p68eZxGjc",
  "payload": null,
  "lid": "7699648432146207398"
}
```

**runs/host/20261024T211541_61593939852820**, step 4: pageText: 200, 633 ms

Sent:

```json
{
  "data": "eyJldmVudCI6InNjYW5fcmVzdWx0IiwibG9jYWxfc3RvcmFnZSI6WyJzY3JlZW5fdGltZV9wZXJpb2RfbG9nZ2luZ19mYWNlYm9vayIsIlJTVERhdGEiLCJoYl90aW1lc3RhbXAiLCJiZHpfcGxheWJhY2tfc3RhdGUiLCJtd19lbmNyeXB0ZWRfYmFja3Vwc19yZXN0b3JlX3Vwc2VsbF9maXJzdF9pbXByZXNzaW9uX3RpbWVfa2V5IiwiYXJlc19sYXN0X3NpZ25hbF9mbHVzaCIsInNpZ25hbF9mbHVzaF90aW1lc3RhbXAiLCJTZXNzaW9uIiwiYmFuemFpOmxhc3Rfc3RvcmFnZV9mbHVzaCJdLCJyZXN1bHRzIjpbWyJzY3JpcHQiLCJo… (47196 chars)"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AzmP5Be8ObYvOp8ZFBijbXV",
  "payload": null,
  "lid": "7700346337754849669"
}
```

<!-- facts:end -->

## What it does

Saves a small UI preference for the user (for example a dismissed tip).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
