# svcShredditMoreComments

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | comments |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/more-comments` |
| Sends | `cursor` |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:33 anonymous`, `runs/inspect/20261025T124815_MaleficentTry8338/script57.js:291 anonymous`, `runs/inspect/20261025T124815_MaleficentTry8338/script57.js:224 A`, `runs/inspect/20261025T124815_MaleficentTry8338/script57.js:296 renderShredtopViewMoreCommentsButton` |
| rea | `ev_b93f1f9518971a3d3c21a643e5d4652e977b4059195bbb83c385e0bdf74eb746` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: -955px in 22 wheel steps, 1235 ms | 1 | 200 | 775 ms | 1992 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, scroll: -955px in 22 wheel steps, 1235 ms: 200, 775 ms

Sent:

```json
{
  "query": {
    "sort": "CONFIDENCE",
    "startingDepth": "4",
    "seeker-session": "true",
    "commentParentPositions": "0,0,0,0"
  },
  "body": {
    "cursor": "Y29tbWVudHRyZWU6Y2EzYTliNGUsOjo0OmQxOnQxX3BoaDNrY28="
  }
}
```

Answered:

```json
"<shreddit-comment created=\"2026-10-18T11:02:06.409000+0000\" author=\"ProfMcGonaGirl\" avatar=\"https://www.redditstatic.com/avatars/defaults/v2/avatar_default_5.png\" thingId=\"t1_phh4chj\" depth=\"4\" parentId=\"t1_phh3kco\" comment-position=\"0\" comment-parent-positions=\"[0,0,0,0]\" permalink=\"/r/AskReddit/comments/1x8sr8s/comment/phh4chj/\" parent-permalink=\"/r/AskReddit/comments/1x8sr8s/comment/phh3kco/\" r… (99730 chars)"
```

<!-- facts:end -->

## What it does

The next part of a comment thread, posted with the thread's `cursor` (body) and the sort, depth and parent positions (query: `sort=CONFIDENCE`, `startingDepth=4`, `commentParentPositions=0,0,0,0`); the answer is the replies as `shreddit-comment` HTML (about 100 KB here). It is loaded by a `faceplate-partial` on the post page; the slices (rea `ev_b93f1f95…`) show the code around it: `S()` rewrites every `faceplate-partial[src*="more-comments"]` for translation, a click on a `data-more-comments-partial-id` element spins its icon, and `renderShredtopViewMoreCommentsButton` draws "View more comments". rea read only names around it (`translated`, `tl`). It fired once, 2 seconds into a scroll on the thread page after step 6.

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, this is how a thread's deeper replies are read, and the cursor and positions it sends are what a reader has to keep to page through them.

## What can go wrong

Its one call was 200. A failure would leave the "more replies" spot unloaded with its icon spinning; the slices show no retry. A cursor that no longer matches would be the thing to watch for when replies are read, but it hasn't been seen.
