# flagshipWebMynetwork

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/flagship-web/mynetwork` |
| Sends | — |
| Reads | — |
| Called from | `runs/chrome/20261114T213510_<name:1>/script46.js:661 statement`, `runs/chrome/20261114T213510_<name:1>/script46.js:130 statement`, `runs/chrome/20261114T213510_<name:1>/script46.js:1137 statement`, `runs/chrome/20261114T213510_<name:1>/script46.js:1312 statement` |
| rea | `ev_37f5d4e0c076b1627fbddbfec22ea0a451fbd8ff421fe4820dcfba2ab5cf8ded` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| chrome | step 8: comment on a post, by hand | 1 | 200 | 671 ms | 9464 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/chrome/20261114T213510_<name:1>**, step 8: comment on a post, by hand: 200, 671 ms

Sent:

```json
null
```

Answered:

```json
"MzoiJFNyZWFjdC5mcmFnbWVudCIKNDoiNzFhZDk1MjY3YzYwNWEzNGZlZmUxMTU1YTYxZTZhZDMiCjU6IlNkdWlUcmFja2luZ1Byb3ZlbmFuY2VQcm92aWRlciIKNjpJWyIkNCIsW10sIiQ1Il0KNzoiZmQyYjE2ODEyOTUxNTE1YjRkODZhY2M1MjdkYmMxZjEiCjg6SVsiJDciLFtdLCJTY3JlZW4iXQpiOiIwMzBkNjAzNWNiM2E5OTdlZmIxY2ZmN2EwMDhkMmY4OSIKYzpJWyIkYiIsW10sImRlZmF1bHQiXQpkOiIyYWQzZWE3Mjc4Y2FmM2UzODhmZjM2ZTU0NTEzMmY2YyIKZToiRGVzdGluYXRpb25SZXBvcnRlciIKZjpJWyIkZCIs… (847016 chars)"
```

<!-- facts:end -->

## What it does

Loads the My Network screen as a server-component stream. In the by-hand recording it fires once during the comment step, about 9.5 s in, and takes 671 ms; the recording kept no request body and the answer is the encoded screen stream.

## What our machine does with it

`Network.open_network` in `python/linkedinApi/network.py` sends it as `MyNetwork` before `suggestions` and `connect`: it posts the recorded `myNetwork` template (a `NavigateToScreen` for the My Network screen, with the account's `sdui_ver` filled in), then sends the three follow-ups in `FOLLOW_UPS`, and reads the suggestion cards and their Connect requests out of the answer. `connect` only sends what one of those cards' own Connect button sends.

## What can go wrong

Only 200 is in our recording. For our send, `check` turns 429 or 999 into `rateLimited`, 401 or 403 into `sessionDead`, a deleted `li_at` into `sessionRevoked` and any other status from 300 up into `linkedinRefused`, and errors in the answer are `linkedinRefused` too. An answer with no Connect buttons is `templateStale`; a refused follow-up other than a rate limit or a dead session skips the rest of them and is reported as `followUpStopped`. Nothing is retried.
