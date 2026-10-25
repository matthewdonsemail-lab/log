# svcShredditPartialBannedUserBanner

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | account |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/partial/banned-user-banner` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_f322b36dde9e0c8ddebceccd0a0499cc36b348e013d73890e4b742bdcb6f3863` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 1015 ms | 2769 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 646 ms | 4604 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 412 ms | 1255 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 426 ms | 1025 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 665 ms | 1235 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 367 ms | 1578 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 524 ms | 788 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 1015 ms

Sent:

```json
null
```

Answered:

```json
null
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 646 ms

Sent:

```json
{
  "query": {
    "params": "prefix=r&subredditName=AskReddit",
    "sig": "v1.C_0yPQcLvzPgRJooCM6tg2T3omPijYP70j489_gNy1c"
  },
  "body": null
}
```

Answered:

```json
null
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 412 ms

Sent:

```json
{
  "query": {
    "query": {
      "q": "junk removal"
    }
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

A GET of the `banned-user-banner` partial (`/svc/shreddit/partial/<id>/banned-user-banner`), made by the page's HTML on every page: with the community (`prefix=r&subredditName=AskReddit`) on community and post pages, with the search on `/search/`. Its code wasn't found in Reddit's bundles (no call site; the rea Evidence here, `ev_f322b36d…`, is the shared one for requests with no slice). By its name it is where a banner is served when the account is banned from the site or that community; in every step of our run it answered an empty body.

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, this is a cheap check on every page: an empty answer means there is no ban banner for the account in that place, and anything else would be the first sign of one.

## What can go wrong

All seven calls were 200 with an empty body. The recording has no failed call and no non-empty answer, so what a banned account gets back hasn't been seen yet; when it is, it should be named as a page state (rule 76).
