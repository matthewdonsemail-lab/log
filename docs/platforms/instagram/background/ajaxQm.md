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

Seen 6 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 198 ms | 403 ms | — |
| inspect | step 2: snapshot | 2 | 200 | 206–274 ms | 1738–16200 ms | — |
| inspect | step 3: goto /direct/inbox/ | 1 | 200 | 199 ms | 354 ms | — |
| inspect | step 5: goto /direct/t/<id>/ | 1 | 200 | 239 ms | 407 ms | — |
| inspect | step 1: goto /direct/t/<id>/ | 1 | 200 | 195 ms | 643 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T185330_mattinferencesaver**, step 1: goto /direct/t/<id>/: 200, 195 ms

Sent:

```json
null
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AtmAGSUziSw942ssULUo__x",
  "payload": null,
  "lid": "7704020352427167998"
}
```

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

<!-- facts:end -->

## What it does

A small background ping the web client sends with no body, fired 6 times in 2 runs on `goto /`, `snapshot`, `goto /direct/inbox/` and `goto /direct/t/<id>/` steps, each 195-274 ms. It answers `__ar: 1`, an `rid`, `payload: null` and an `lid`, so it carries no data we read.

## What our machine does with it

Nothing: no machine waits on it, and the direct-API engine in `python/instagramApi/engine.py` never calls `/ajax/qm`. The facts list no calling script, so it is the page's own boot-time traffic seen only through `log inspect`.

## What can go wrong

All 6 calls answered 200 with no errors. A non-200 would at most mean the page's background bookkeeping failed; our inspect steps decide on the calls that carry the inbox and thread data, not this one.
