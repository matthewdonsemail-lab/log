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
| rea | `ev_9f8088d32f87a3467804486ab3e1f9b34496bc83fd01e5c651b6e0978e588451` |

Seen 6 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 975 ms | 19172 ms | — |
| inspect | step 1: goto /marketplace/status | 1 | 200 | 887 ms | 15895 ms | — |
| host | step 4: pageText | 1 | 200 | 633 ms | 8959 ms | — |
| host | step 28: clickRole button "…" | 1 | 200 | 888 ms | 17939 ms | — |
| host | step 1: goto /marketplace/selling/ | 1 | 200 | 343 ms | 13579 ms | — |
| host | step 19: pageText | 1 | 200 | 569 ms | 1711 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, step 1: goto /marketplace/selling/: 200, 343 ms

Sent:

```json
{
  "data": "eyJldmVudCI6InNjYW5fcmVzdWx0IiwibG9jYWxfc3RvcmFnZSI6WyJzY3JlZW5fdGltZV9wZXJpb2RfbG9nZ2luZ19mYWNlYm9vayIsIlJTVERhdGEiLCJoYl90aW1lc3RhbXAiLCJiZHpfcGxheWJhY2tfc3RhdGUiLCJtd19lbmNyeXB0ZWRfYmFja3Vwc19yZXN0b3JlX3Vwc2VsbF9maXJzdF9pbXByZXNzaW9uX3RpbWVfa2V5IiwiYXJlc19sYXN0X3NpZ25hbF9mbHVzaCIsInNpZ25hbF9mbHVzaF90aW1lc3RhbXAiLCJTZXNzaW9uIiwiYmFuemFpOmxhc3Rfc3RvcmFnZV9mbHVzaCJdLCJyZXN1bHRzIjpbWyJzY3JpcHQiLCJo… (53612 chars)"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "Ad3_rISZraNMdMhtfbk3zL0",
  "payload": null,
  "lid": "7701039610664888116"
}
```

**runs/host/20261026T164654_61594285317994**, step 19: pageText: 200, 569 ms

Sent:

```json
{
  "data": "eyJldmVudCI6InNjYW5fcmVzdWx0IiwibG9jYWxfc3RvcmFnZSI6WyJzY3JlZW5fdGltZV9wZXJpb2RfbG9nZ2luZ19mYWNlYm9vayIsImhiX3RpbWVzdGFtcCIsImJhbnphaTpsYXN0X3N0b3JhZ2VfZmx1c2giLCJhcmVzX2xhc3Rfc2lnbmFsX2ZsdXNoIiwic2lnbmFsX2ZsdXNoX3RpbWVzdGFtcCIsImJkel9wbGF5YmFja19zdGF0ZSIsImxhc3RfaGVhZGxvYWRfdGltZSIsIm13X2VuY3J5cHRlZF9iYWNrdXBzX3Jlc3RvcmVfdXBzZWxsX2ZpcnN0X2ltcHJlc3Npb25fdGltZV9rZXkiLCJTZXNzaW9uIiwiUlNURGF0YSJdLCJy… (87160 chars)"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "An5YJA_rBIytqwB7Dk43ytk",
  "payload": null,
  "lid": "7701020144425935718"
}
```

<!-- facts:end -->

## What it does

Saves a small UI preference for the user (for example a dismissed tip).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
