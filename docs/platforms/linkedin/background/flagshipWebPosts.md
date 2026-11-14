# flagshipWebPosts

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/flagship-web/posts` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261107T170649_<name:1>/script13.js:12 anonymous` |
| rea | `ev_2b7a18c271a4f80536532c2cac14a9478e5ead3403f7631fd1303b375af517a7` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /feed/ | 1 | 0 | 340 ms | 10019 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T161246_<name:1>**, step 4: goto /feed/: 0, 340 ms

Sent:

```json
null
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

A request to the posts screen with no body, fired once while the feed loaded. The recording shows nothing it sent or read beyond the path, so all that is known is that the web client fetched or preloaded that screen in the background.

## What our machine does with it

log's LinkedIn direct-API engine never sends it: nothing in `python/linkedinApi` or `vendor/openLinkedinApi` names this path, so no run waits on it, reads it or replays it.

## What can go wrong

Its one recorded call has status 0. Status 0 means our recording holds no answer: the browser cut the request off or had not finished it when the step's capture closed, usually because the page moved on. It has no bearing on our runs.
