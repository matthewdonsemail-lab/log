# ajaxBz

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/bz` |
| Sends | `------WebKitFormBoundaryhx5lADbY1fBdIwIw
Content-Disposition: form-data; name`, `------WebKitFormBoundarysgvHPqqp5TQe7MPT
Content-Disposition: form-data; name`, `------WebKitFormBoundary0wPjwuoJYmvT1P3D
Content-Disposition: form-data; name` |
| Reads | `__ar`, `rid`, `payload`, `lid` |
| Called from | `runs/inspect/20261103T185330_mattinferencesaver/script3.js:746 anonymous`, `runs/inspect/20261103T185330_mattinferencesaver/script4.js:1309 anonymous`, `runs/inspect/20261103T185330_mattinferencesaver/script4.js:866 anonymous`, `runs/inspect/20261103T185330_mattinferencesaver/script30.js:108 anonymous` |
| rea | `ev_68f5d753b5ee697e2b34f2d44b07d990d78a155f0aa9263cc7d2f529c931d638` |

Seen 20 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 7 | 200 | 202–273 ms | 1204–13691 ms | — |
| inspect | step 2: snapshot | 7 | 200 | 190–251 ms | 1155–40119 ms | — |
| inspect | step 4: saveState | 1 | 200 | 182 ms | 13583 ms | — |
| inspect | step 6: click e661 | 1 | 200 | 189 ms | 14488 ms | — |
| inspect | step 10: wait 40s | 1 | 200 | 191 ms | 4991 ms | — |
| inspect | upload: grievous.jpg handed to the file chooser | 1 | 200 | 178 ms | 7565 ms | — |
| inspect | upload: paulie.jpg handed to the file chooser | 1 | 200 | 178 ms | 322 ms | — |
| inspect | step 4: click e783 | 1 | 200 | 182 ms | 16665 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T185330_mattinferencesaver**, upload: paulie.jpg handed to the file chooser: 200, 178 ms

Sent:

```json
{
  "query": {
    "__d": "www",
    "ph": "C3",
    "qpl_active_flow_ids": "521485957"
  },
  "body": null
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AhzVH6gBp03M67VQRDHXuY3",
  "payload": null,
  "lid": "<id:1>"
}
```

**runs/inspect/20261103T185330_mattinferencesaver**, step 4: click e783: 200, 182 ms

Sent:

```json
{
  "query": {
    "__d": "www",
    "ph": "C3"
  },
  "body": null
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "AVHNigzxBexyRQJVtnEiHoC",
  "payload": null,
  "lid": "<id:2>"
}
```

**runs/inspect/20261103T180010_mattinferencesaver**, step 1: goto /: 200, 202 ms

Sent:

```json
{
  "query": {
    "__d": "www",
    "ph": "C3"
  },
  "body": {
    "------WebKitFormBoundaryhx5lADbY1fBdIwIw\r\nContent-Disposition: form-data; name": "\"ts\"\r\n\r\n1793728825702\r\n------WebKitFormBoundaryhx5lADbY1fBdIwIw\r\nContent-Disposition: form-data; name=\"q\"\r\n\r\n[{\"app_id\":\"<id:3>\",\"posts\":[[\"falco:ig_web_page_view\",{\"e\":\"{\\\"module\\\":\\\"CAAIGLoginHomepage\\\",\\\"nav_chain\\\":\\\"CAAIGLoginHomepageRoot:CAAIGLoginHomepage:1:via_cold_start\\\",\\\"referrer\\\":\\\"\\\",\\\"url\\\":\\\"https://www.instagram.com/\\\",\\\"web_analytics_session_id\\\":\\\"c78ouj:c3tx3c:zgmoiu\\… (699 chars)"
  }
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "A-c31ZV38ap15654PxyR7Uz",
  "payload": null,
  "lid": "<id:4>"
}
```

<!-- facts:end -->

## What it does

The web client's own telemetry beacon: it posts a small form (`__d: www`, `ph: C3`, a `qpl_active_flow_ids` value) and Instagram acknowledges with `payload: null`. It fired 20 times in 2 runs on nearly every step (`goto /`, `snapshot`, `saveState`, clicks, `wait 40s`, and both file-chooser uploads), each taking 178-273 ms with status 200.

## What our machine does with it

Nothing: no log-cli machine waits on it, reads it or sends it. `python/instagramApi/engine.py` does not use it, because the engine works through instagrapi's private API with no browser, and this beacon only exists inside the web page's own scripts (`script3.js`, `script4.js`, `script30.js`).

## What can go wrong

Every recorded call answered 200 with `payload: null` and no errors. A failure would only mean the page's own telemetry did not land; nothing in our runs decides on it, so it would not change a step.
