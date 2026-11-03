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
| Called from | `runs/inspect/20261103T180010_mattinferencesaver/script11.js:28 anonymous`, `runs/inspect/20261103T180010_mattinferencesaver/script120.js:165 anonymous`, `runs/inspect/20261103T180010_mattinferencesaver/script121.js:866 anonymous`, `runs/inspect/20261103T180010_mattinferencesaver/script189.js:108 anonymous` |
| rea | `ev_68f5d753b5ee697e2b34f2d44b07d990d78a155f0aa9263cc7d2f529c931d638` |

Seen 18 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 7 | 200 | 202–273 ms | 1204–13691 ms | — |
| inspect | step 2: snapshot | 7 | 200 | 190–251 ms | 1155–40119 ms | — |
| inspect | step 4: saveState | 1 | 200 | 182 ms | 13583 ms | — |
| inspect | step 6: click e661 | 1 | 200 | 189 ms | 14488 ms | — |
| inspect | step 10: wait 40s | 1 | 200 | 191 ms | 4991 ms | — |
| inspect | upload: grievous.jpg handed to the file chooser | 1 | 200 | 178 ms | 7565 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T180010_mattinferencesaver**, step 1: goto /: 200, 202 ms

Sent:

```json
{
  "query": {
    "__d": "www",
    "ph": "C3"
  },
  "body": {
    "------WebKitFormBoundaryhx5lADbY1fBdIwIw\r\nContent-Disposition: form-data; name": "\"ts\"\r\n\r\n1793728825702\r\n------WebKitFormBoundaryhx5lADbY1fBdIwIw\r\nContent-Disposition: form-data; name=\"q\"\r\n\r\n[{\"app_id\":\"936619743392459\",\"posts\":[[\"falco:ig_web_page_view\",{\"e\":\"{\\\"module\\\":\\\"CAAIGLoginHomepage\\\",\\\"nav_chain\\\":\\\"CAAIGLoginHomepageRoot:CAAIGLoginHomepage:1:via_cold_start\\\",\\\"referrer\\\":\\\"\\\",\\\"url\\\":\\\"https://www.instagram.com/\\\",\\\"web_analytics_session_id\\\":\\\"c78ouj:c3tx3c:zgmoiu\\… (699 chars)"
  }
}
```

Answered:

```json
{
  "__ar": 1,
  "rid": "A-c31ZV38ap15654PxyR7Uz",
  "payload": null,
  "lid": "7704006642877187368"
}
```

**runs/inspect/20261103T180010_mattinferencesaver**, step 2: snapshot: 200, 208 ms

Sent:

```json
{
  "query": {
    "__d": "www",
    "ph": "C3",
    "qpl_active_flow_ids": "175125627"
  },
  "body": null
}
```

Answered:

```json
null
```

**runs/inspect/20261103T180010_mattinferencesaver**, step 4: saveState: 200, 182 ms

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
  "rid": "ARqZLDiPMtqU6j_6IC7rL_7",
  "payload": null,
  "lid": "7704007028426849329"
}
```

<!-- facts:end -->

## What it does

<!-- toWrite --> What this request is for on Facebook's side, from its definition and the step it fires in.

## What our machine does with it

<!-- toWrite --> Which state of `marketplace/connect` or `marketplace/publish` waits for it, reads it, or ignores it, and why.

## What can go wrong

<!-- toWrite --> The errors and statuses it can return, what each means for the run, and the end or retry our machine takes.
