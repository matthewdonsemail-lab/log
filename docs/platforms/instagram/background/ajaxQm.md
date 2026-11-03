# ajaxQm

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/qm` |
| Sends | — |
| Reads | `__ar`, `rid`, `payload`, `lid` |
| Called from | — |
| rea | `ev_70b4b0680bbe7f18eabb519a67ad336bc1bf11b0743cea7d6234042706e41c2e` |

Seen 5 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 198 ms | 403 ms | — |
| inspect | step 2: snapshot | 2 | 200 | 206–274 ms | 1738–16200 ms | — |
| inspect | step 3: goto /direct/inbox/ | 1 | 200 | 199 ms | 354 ms | — |
| inspect | step 5: goto /direct/t/<id>/ | 1 | 200 | 239 ms | 407 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T180010_mattinferencesaver**, step 1: goto /: 200, 198 ms

Sent:

```json
null
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AVBpQO6GgdOUbGL_9HFzdlb",
  "payload": null,
  "lid": "7704006638390988194"
}
```

**runs/inspect/20261103T180010_mattinferencesaver**, step 2: snapshot: 200, 274 ms

Sent:

```json
null
```

Answered:

```json
{
  "__ar": 1,
  "rid": "ATgThBn_P4u7tWAU3aIPKww",
  "payload": null,
  "lid": "7704006707839413158"
}
```

**runs/inspect/20261103T180010_mattinferencesaver**, step 3: goto /direct/inbox/: 200, 199 ms

Sent:

```json
null
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AvVp_LQ55WD4XcvA8Ri_mr8",
  "payload": null,
  "lid": "7704006887814741567"
}
```

<!-- facts:end -->

## What it does

<!-- toWrite --> What this request is for on Facebook's side, from its definition and the step it fires in.

## What our machine does with it

<!-- toWrite --> Which state of `marketplace/connect` or `marketplace/publish` waits for it, reads it, or ignores it, and why.

## What can go wrong

<!-- toWrite --> The errors and statuses it can return, what each means for the run, and the end or retry our machine takes.
