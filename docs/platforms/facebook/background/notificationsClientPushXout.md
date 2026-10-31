# notificationsClientPushXout

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/notifications/client/push/xout/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | not read yet |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | step 34: press Escape | 1 | 200 | 423 ms | 2019 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261024T222706_61593981307720**, step 34: press Escape: 200, 423 ms

Sent:

```json
{}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "ASUYylMy1SdpAAQhTKGQ6e7",
  "payload": {
    "completed": true
  },
  "lid": "7700366098915907459"
}
```

<!-- facts:end -->

## What it does

A fire-and-forget beacon recording that a client push/notification prompt was dismissed.

## What our machine does with it

Background; log-cli ignores it.

## What can go wrong

Nothing; it is a telemetry beacon with no bearing on any flow.
