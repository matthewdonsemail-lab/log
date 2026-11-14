# flagshipWebRscActionActionsAppConfig

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/flagship-web/rsc-action/actions/app-config` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261107T170649_<name:1>/script50.js:4236 statement`, `runs/inspect/20261107T170649_<name:1>/script37.js:1810 statement`, `runs/inspect/20261107T170649_<name:1>/script60.js:2375 statement`, `runs/inspect/20261107T170649_<name:1>/script49.js:949 statement` |
| rea | `ev_38cfc5b696a5280645647ef049d0c12bf870721c67c775bfc0267773183762b5` |

Seen 7 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 0 | 580 ms | 1089 ms | — |
| inspect | step 2: snapshot | 1 | 0 | 501 ms | 203342 ms | — |
| inspect | step 4: goto /feed/ | 1 | 0 | 627 ms | 1906 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 535 ms | 1805 ms | — |
| inspect | step 6: goto /feed/ | 1 | 0 | 577 ms | 1793 ms | — |
| inspect | step 12: goto /feed/ | 1 | 0 | 529 ms | 2040 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 0 | 583 ms | 1144 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 0, 580 ms

Sent:

```json
{}
```

Answered:

```json
null
```

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 0, 580 ms

Sent:

```json
{}
```

Answered:

```json
null
```

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 0, 501 ms

Sent:

```json
{}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

The web client's app configuration call, posted with an empty body each time a page boots (a profile, the feed, a snapshot). Other background calls (the For you prefetch, `server-request`, `component`, `pagination`) follow it, so it is the start of each page's server-driven loading.

## What our machine does with it

log's LinkedIn direct-API engine never sends it: nothing in `python/linkedinApi` or `vendor/openLinkedinApi` names this path, so no run waits on it, reads it or replays it. The engine gets the one setting it needs, the app version, from the feed page's `x-li-application-version` header instead (`version_from_feed` in `share.py`).

## What can go wrong

One call answered 200; the other six have status 0. Status 0 means our recording holds no answer: the browser cut the request off or had not finished it when the step's capture closed, usually because the page moved on. Neither affects our runs.
