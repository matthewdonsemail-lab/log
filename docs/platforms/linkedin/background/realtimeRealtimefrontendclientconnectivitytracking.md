# realtimeRealtimefrontendclientconnectivitytracking

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/realtime/realtimeFrontendClientConnectivityTracking` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261107T170649_<name:1>/script10.js:16 anonymous`, `runs/inspect/20261107T170649_<name:1>/script31.js:9763 anonymous`, `runs/inspect/20261107T170649_<name:1>/script31.js:2179 statement`, `runs/inspect/20261107T170649_<name:1>/script31.js:4448 statement` |
| rea | `ev_8f5b17e622af162b3bea6ae47295b22bd0fd5770008aa3a5e612cb3e8b90d3f6` |

Seen 91 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 2 | 200 | 73–78 ms | 3275–3516 ms | — |
| inspect | step 4: click e2111 | 1 | 200 | 65 ms | 1547 ms | — |
| inspect | step 6: click e2157 | 30 | 200 | 54–99 ms | 20024–1760023 ms | — |
| inspect | step 2: snapshot | 2 | 200 | 57–64 ms | 205708–205929 ms | — |
| inspect | step 4: goto /feed/ | 2 | 200 | 65–71 ms | 3628–3857 ms | — |
| inspect | step 5: goto /feed/ | 2 | 200 | 65–70 ms | 3173–3404 ms | — |
| inspect | step 6: goto /feed/ | 2 | 200 | 66–179 ms | 3115–3329 ms | — |
| inspect | step 8: snapshot | 1 | 200 | 59 ms | 6159 ms | — |
| inspect | step 9: wait 8s | 1 | 200 | 78 ms | 31579 ms | — |
| inspect | step 11: click e1733 | 21 | 200 | 58–118 ms | 8430–1208419 ms | — |
| inspect | step 12: goto /feed/ | 2 | 200 | 69–73 ms | 3653–3865 ms | — |
| inspect | step 14: wait 90s | 3 | 200 | 59–92 ms | 1–119996 ms | — |
| inspect | step 17: click e783 | 1 | 200 | 61 ms | 13157 ms | — |
| inspect | step 18: wait 90s | 2 | 200 | 60–62 ms | 42130–102120 ms | — |
| inspect | click failed: TimeoutError: Locator.bounding_box: Timeout 30000ms exceeded. | 1 | 200 | 127 ms | 23891 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/server-request (382 ms) | 1 | 200 | 63 ms | 3899 ms | — |
| inspect | step 22: wait 90s | 1 | 200 | 59 ms | 41876 ms | — |
| inspect | step 24: click e640 | 1 | 200 | 61 ms | 3119 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/server-request (273 ms) | 10 | 200 | 55–90 ms | 54186–594193 ms | — |
| inspect | step 25: goto /in/<profile>/ | 2 | 200 | 60–62 ms | 2445–2757 ms | — |
| inspect | step 27: click e1346 | 1 | 200 | 65 ms | 20516 ms | — |
| inspect | step 29: snapshot | 1 | 200 | 68 ms | 26827 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/component (782 ms) | 1 | 200 | 60 ms | 13361 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 73 ms

Sent:

```json
{
  "query": {
    "action": "sendHeartbeat"
  },
  "body": "{\"isFirstHeartbeat\":true,\"isLastHeartbeat\":false,\"realtimeSessionId\":\"953068bd-572e-43cd-8f90-3cb14a62881f\",\"mpName\":\"voyager-web\",\"mpVersion\":\"1.13.47908\",\"clientId\":\"voyager-web\"}"
}
```

Answered:

```json
null
```

**runs/inspect/20261107T170649_<name:1>**, step 4: click e2111: 200, 65 ms

Sent:

```json
{
  "query": {
    "action": "sendHeartbeat"
  },
  "body": "{\"isFirstHeartbeat\":false,\"isLastHeartbeat\":false,\"realtimeSessionId\":\"953068bd-572e-43cd-8f90-3cb14a62881f\",\"mpName\":\"voyager-web\",\"mpVersion\":\"1.13.47908\",\"clientId\":\"voyager-web\",\"actorUrn\":\"urn:li:fsd_profile:<memberId>\",\"contextUrns\":[\"urn:li:fsd_profile:<memberId>\"]}"
}
```

Answered:

```json
null
```

**runs/inspect/20261107T170649_<name:1>**, step 6: click e2157: 200, 60 ms

Sent:

```json
{
  "query": {
    "action": "sendHeartbeat"
  },
  "body": "{\"isFirstHeartbeat\":false,\"isLastHeartbeat\":false,\"realtimeSessionId\":\"953068bd-572e-43cd-8f90-3cb14a62881f\",\"mpName\":\"voyager-web\",\"mpVersion\":\"1.13.47908\",\"clientId\":\"voyager-web\",\"actorUrn\":\"urn:li:fsd_profile:<memberId>\",\"contextUrns\":[\"urn:li:fsd_profile:<memberId>\"]}"
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

The realtime client's heartbeat (`action=sendHeartbeat`): a POST whose body says whether it is the first or last heartbeat, the realtime session id, the client's name and version, and after the first one the account's profile urn and its context urns. It goes out about once a minute while a page stays open (30 times over about 29 minutes in one step), 54 to 179 ms each.

## What our machine does with it

Nothing: log's LinkedIn direct-API engine (`python/linkedinApi`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) never sends it and sends no heartbeat, since it opens no realtime connection. It is background browser traffic.

## What can go wrong

Every answer in our runs is 200. A failed heartbeat only affects the browser page's realtime connection; it never reaches a direct-API run.
