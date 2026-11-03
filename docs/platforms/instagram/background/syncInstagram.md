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
| Called from | `runs/inspect/20261103T180010_mattinferencesaver/script262.js:1 statement`, `runs/inspect/20261103T180010_mattinferencesaver/script262.js:1 statement`, `runs/inspect/20261103T180010_mattinferencesaver/script115.js:1 statement`, `runs/inspect/20261103T180010_mattinferencesaver/script171.js:28 statement` |
| rea | `ev_42cc6233fb35c7a12f5b1b6e444cbb8ea0320a699d0b1c88cfb3ecbe95bede95` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 194 ms | 23173 ms | — |
| inspect | step 3: goto /direct/inbox/ | 1 | 200 | 191 ms | 5961 ms | — |
| inspect | step 5: goto /direct/t/<id>/ | 1 | 200 | 199 ms | 5775 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

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

**runs/inspect/20261103T180010_mattinferencesaver**, step 5: goto /direct/t/<id>/: 200, 199 ms

Sent:

```json
{
  "encrypted_data": "AVn_wpHziGq4YRwg5fAt3RnV26LMOuLKiTQyrPc0eozCNS9n5dYuhZwn2mc8GN2wuzev",
  "__d": "www",
  "qpl_active_flow_ids": "25305590"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "Ah6XQx4K7EBT6T2wPcu3P_v",
  "payload": null,
  "lid": "7704007281662164961"
}
```

<!-- facts:end -->

## What it does

<!-- toWrite --> What this request is for on Facebook's side, from its definition and the step it fires in.

## What our machine does with it

<!-- toWrite --> Which state of `marketplace/connect` or `marketplace/publish` waits for it, reads it, or ignores it, and why.

## What can go wrong

<!-- toWrite --> The errors and statuses it can return, what each means for the run, and the end or retry our machine takes.
