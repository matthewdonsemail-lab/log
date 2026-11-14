# flagshipWebNotifications

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/flagship-web/notifications` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261107T161246_<name:1>/script252.js:756 statement`, `runs/inspect/20261107T161246_<name:1>/script252.js:1019 statement`, `runs/inspect/20261107T161246_<name:1>/script252.js:1108 statement`, `runs/inspect/20261107T161246_<name:1>/script252.js:845 statement` |
| rea | `ev_e3519f6e87cd1298cdec3e4d833cff3edb8a91dd0b317c9708d194dc2eb38455` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /feed/ | 1 | 0 | 570 ms | 7232 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T161246_<name:1>**, step 4: goto /feed/: 0, 570 ms

Sent:

```json
{
  "query": {
    "skipRedirect": "true"
  },
  "body": null
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

The notifications screen, requested with `skipRedirect=true` and no body. The web client fired it once while the feed loaded, from its navigation code, to have the notifications page ready.

## What our machine does with it

log's LinkedIn direct-API engine never sends it: nothing in `python/linkedinApi` or `vendor/openLinkedinApi` names this path, so no run waits on it, reads it or replays it.

## What can go wrong

Its one recorded call has status 0. Status 0 means our recording holds no answer: the browser cut the request off or had not finished it when the step's capture closed, usually because the page moved on. It has no bearing on our runs.
