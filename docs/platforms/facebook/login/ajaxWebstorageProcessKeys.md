# ajaxWebstorageProcessKeys

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | login |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/webstorage/process_keys/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_12a643860c4d5ed958151ae63a164cda5b0f0dd046397ab65052d4ac7ae079c4` |

Seen 43 time(s) in 15 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 11: goto /marketplace/ | 1 | 200 | 1806 ms | 9634 ms | — |
| inspect | step 2: clickRole button "…" | 1 | 200 | 678 ms | 11786 ms | — |
| inspect | step 22: dwell 21.38s | 1 | 200 | 477 ms | 19087 ms | — |
| inspect | step 8: dwell 23.53s | 1 | 200 | 542 ms | 15207 ms | — |
| inspect | scroll: +1397px in 29 wheel steps, 1765 ms | 1 | 200 | 1963 ms | 15734 ms | — |
| inspect | step 6: dwell 51.57s | 1 | 200 | 339 ms | 16729 ms | — |
| inspect | step 17: dwell 29.77s | 1 | 200 | 308 ms | 17099 ms | — |
| inspect | step 36: dwell 15.58s | 1 | 200 | 329 ms | 12170 ms | — |
| inspect | step 72: clickRole button "…" | 1 | 200 | 321 ms | 15304 ms | — |
| inspect | step 44: dwell 18s | 1 | 200 | 345 ms | 12469 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 4 | 200 | 328–496 ms | 15782–425825 ms | — |
| inspect | step 71: dwell 1s | 1 | 200 | 387 ms | 4544 ms | — |
| inspect | step 96: clickRole button "…" | 2 | 200 | 348–351 ms | 39352–1289363 ms | — |
| inspect | step 2: setLocation Bethlehem, Pennsylvania | 1 | 200 | 889 ms | 13271 ms | — |
| inspect | step 3: click e | 1 | 200 | 629 ms | 13511 ms | — |
| inspect | step 26: wait 8s | 1 | 200 | 400 ms | 8699 ms | — |
| inspect | step 27: click e1541 | 1 | 200 | 457 ms | 8217 ms | — |
| inspect | step 5: wait 5s | 3 | 200 | 395–482 ms | 969–300966 ms | — |
| inspect | step 10: goto /marketplace/you/selling | 1 | 200 | 1026 ms | 16771 ms | — |
| inspect | step 2: goto /marketplace/you/selling | 3 | 200 | 449–619 ms | 18731–34720 ms | — |
| inspect | step 3: goto /marketplace/inbox | 6 | 200 | 503–1552 ms | 509982–1675374 ms | — |
| inspect | step 3: goto /marketplace/you/selling | 1 | 200 | 979 ms | 17064 ms | — |
| inspect | step 5: goto /marketplace/you/selling | 1 | 200 | 380 ms | 15668 ms | — |
| inspect | step 4: goto /marketplace/you/selling | 1 | 200 | 1026 ms | 21524 ms | — |
| warmup | step 3: goto /marketplace/you/selling | 1 | 200 | 697 ms | 16142 ms | — |
| warmup | step 17: dwell 2-4s | 2 | 200 | 370–458 ms | 638–50657 ms | — |
| inspect | step 3: dwell 24s | 1 | 200 | 629 ms | 16127 ms | — |
| inspect | step 10: dwell 21s | 1 | 200 | 371 ms | 15216 ms | — |
| inspect | step 18: dwell 19s | 1 | 200 | 1289 ms | 11038 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T080515_61594063207669**, step 3: goto /marketplace/you/selling: 200, 697 ms

Sent:

```json
{
  "query": "(1 fields)",
  "body": "(103 fields)"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AJadCUsA8-Z_m7Ojh23Y1uC",
  "payload": {
    "keys": []
  },
  "lid": "7699771676156232819"
}
```

**runs/warmup/20261023T074930_61594063207669**, step 17: dwell 2-4s: 200, 458 ms

Sent:

```json
{
  "query": "(1 fields)",
  "body": "(103 fields)"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AfnT1JphJydAbnHt8nr4Gck",
  "payload": {
    "keys": []
  },
  "lid": "7699770246374084873"
}
```

**runs/inspect/20261023T080801_61594063207669**, step 3: dwell 24s: 200, 629 ms

Sent:

```json
{
  "query": "(1 fields)",
  "body": "(101 fields)"
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AkUcySC8D1CyDZ7yJM9GzK6",
  "payload": {
    "keys": []
  },
  "lid": "7699772318974175663"
}
```

<!-- facts:end -->

## What it does

The page tells Facebook which of its keys it holds in browser storage. Seen only on checkpoint and captcha pages (one run).

## What our machine does with it

Nothing. Browser storage is saved back to Twenty after a run (only while it still holds a Facebook login).

## What can go wrong

Only seen inside checkpoints, so it may be part of how Facebook checks the browser during one. Not enough sightings yet to say more; read it again if a checkpoint repeats.
