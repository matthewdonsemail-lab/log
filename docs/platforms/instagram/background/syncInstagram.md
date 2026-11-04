# syncInstagram

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/sync/instagram` |
| Sends | `encrypted_data`, `__d`, `qpl_active_flow_ids` |
| Reads | `__ar`, `rid`, `payload`, `lid` |
| Called from | `runs/inspect/20261103T180010_mattinferencesaver/script262.js:1 statement`, `runs/inspect/20261103T180010_mattinferencesaver/script262.js:1 statement`, `runs/inspect/20261103T180010_mattinferencesaver/script115.js:1 statement`, `runs/inspect/20261103T185330_mattinferencesaver/script31.js:28 statement` |
| rea | `ev_42cc6233fb35c7a12f5b1b6e444cbb8ea0320a699d0b1c88cfb3ecbe95bede95` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 194 ms | 23173 ms | — |
| inspect | step 3: goto /direct/inbox/ | 1 | 200 | 191 ms | 5961 ms | — |
| inspect | step 5: goto /direct/t/<id>/ | 1 | 200 | 199 ms | 5775 ms | — |
| inspect | step 1: goto /direct/t/<id>/ | 1 | 200 | 194 ms | 7052 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T185330_mattinferencesaver**, step 1: goto /direct/t/<id>/: 200, 194 ms

Sent:

```json
{
  "encrypted_data": "AVkCx23qHrA1wtXXaH7_92KvmYRWKSPiiiCQ44O9nkA3lJkd6AhyxeLjerv2y-d9SfUN",
  "__d": "www"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AZZp8jZxh0mBF7xWvkU9iR_",
  "payload": null,
  "lid": "7704020382008127603"
}
```

**runs/inspect/20261103T180010_mattinferencesaver**, step 2: snapshot: 200, 194 ms

Sent:

```json
{
  "encrypted_data": "AVkMDZ5HhMyS7NECMZSpywr6l7_D-u_j6kVRtA-9iZAztFYbGN7j4dIN1s6SfSCH_HX3",
  "__d": "www"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AcScNTtzGNxYQLjFnYFI5if",
  "payload": null,
  "lid": "7704006797227472939"
}
```

**runs/inspect/20261103T180010_mattinferencesaver**, step 3: goto /direct/inbox/: 200, 191 ms

Sent:

```json
{
  "encrypted_data": "AVnHxekJtz7485MUqrWiBM8OIIDKcnaLleI0T8ptBIjKMsxtGDr3RfBAfH06F0mYztv9",
  "__d": "www"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "A53xPGN4JZq8dDBDTr03yRD",
  "payload": null,
  "lid": "7704006912815245066"
}
```

<!-- facts:end -->

## What it does

A background sync the web client posts with an `encrypted_data` blob and `__d: www`, answered `payload: null`. It fired 4 times in 2 runs on `snapshot`, `goto /direct/inbox/` and `goto /direct/t/<id>/` steps, each 191-199 ms with status 200.

## What our machine does with it

Nothing: no machine waits on it, reads it or sends it; the blob is opaque to us and the engine's realtime watch does not use `/sync/instagram`.

## What can go wrong

All 4 calls answered 200 with `payload: null` and no errors. A failure would only mean the page's background sync did not complete, which no run of ours decides on.
