# voyagerApiVoyagergrowthiwerestriction

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerGrowthIWERestriction` |
| Sends | — |
| Reads | `data.iweRestricted`, `data.entityUrn`, `data.$type`, `included` |
| Called from | — |
| rea | `ev_99f341f871ab6a7fd99a5029ee1e64c2ae5a59824eea1a83c8954a6041b5977d` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: click e2157 | 1 | 200 | 70 ms | 916 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/pagination (759 ms) | 1 | 200 | 118 ms | 325 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 6: click e2157: 200, 70 ms

Sent:

```json
null
```

Answered:

```json
{
  "data": {
    "iweRestricted": false,
    "entityUrn": "<userId:1>",
    "$type": "com.linkedin.voyager.growth.invitation.IWERestrictionResult"
  },
  "included": []
}
```

**runs/inspect/20261107T161246_<name:1>**, POST 0 /flagship-web/rsc-action/actions/pagination (759 ms): 200, 118 ms

Sent:

```json
null
```

Answered:

```json
{
  "data": {
    "iweRestricted": false,
    "entityUrn": "<userId:1>",
    "$type": "com.linkedin.voyager.growth.invitation.IWERestrictionResult"
  },
  "included": []
}
```

<!-- facts:end -->

## What it does

LinkedIn's web client asks whether the account is restricted from sending invitations (`iweRestricted`). In our runs it fired in the same click that sent a connection invitation (step 6), and alongside the My Network pagination action, and both answers said the account was not restricted.

## What our machine does with it

Background traffic: nothing in log's LinkedIn direct-API engine (`python/linkedinApi/`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) sends this call, waits on it or reads its answer. `log linkedin connect` (`Network.connect`, `python/linkedinApi/network.py`) decides on its own connect answer instead: the invitation counts as sent only when that answer sets it to Pending.

## What can go wrong

Both calls answered 200 with `iweRestricted: false`, in 70 to 120 ms. `true` would mean LinkedIn is blocking the account's invitations; no such answer has been recorded. The engine never reads this flag, so a block would reach it only through its own connect answer, as `connectRefused`, never retried.
