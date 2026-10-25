# svcEventsPreloadHead

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | telemetry |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/events/preload-head` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_f322b36dde9e0c8ddebceccd0a0499cc36b348e013d73890e4b742bdcb6f3863` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 304 ms | 1408 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 380 ms | 3740 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 307 ms | 657 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 326 ms | 640 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 521 ms | 843 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 304 ms | 1430 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 619 ms | 657 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 304 ms

Sent:

```json
{
  "query": {
    "renderId": "987b754c-efb2-4a7a-b7eb-492c6e0cd4d2",
    "pageType": "home"
  },
  "body": null
}
```

Answered:

```json
"OK"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 380 ms

Sent:

```json
{
  "query": {
    "renderId": "3afd6299-41aa-4701-8d69-9b23ff336b44",
    "pageType": "community"
  },
  "body": null
}
```

Answered:

```json
"OK"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 307 ms

Sent:

```json
{
  "query": {
    "renderId": "41803373-ea1f-4483-9188-5d43e90d73c5",
    "pageType": "search_results"
  },
  "body": null
}
```

Answered:

```json
"OK"
```

<!-- facts:end -->

## What it does

A small GET Reddit makes as each page opens, carrying the page's `renderId` and `pageType` (`home`, `community`, `search_results`…), answered with the plain text `OK`. Its code wasn't found in Reddit's bundles (no slices; rea's entry is `ev_f322b36dde9e0c8ddebceccd0a0499cc36b348e013d73890e4b742bdcb6f3863`, and the facts name no caller): it comes from the page's HTML head, and the recording shows it as a `no-cors` request, as a preload or beacon would be. Its `renderId` is the same id as the `page_request_id` of the page's screen-view event to `/svc/shreddit/events`, so it ties the page load to Reddit's analytics. It fired on every page we opened, 0.6 to 3.7 s after the goto.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84). This call carries Reddit's own analytics, and our runs leave it to the browser: nothing waits on it, inspect only records it and names it in each step's `exchanges.json`, and SubQ sees it with the rest of the step.

## What can go wrong

All seven answered 200, in 304 to 619 ms. Since no code of Reddit's reads its answer, a failure would only lose Reddit's record of the page load, and it means nothing for a run.
