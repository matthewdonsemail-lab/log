# piP

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `pi.reddit.com/p` |
| Sends | `screen_width`, `screen_height`, `app_name` |
| Reads | — |
| Called from | — |
| rea | `ev_f322b36dde9e0c8ddebceccd0a0499cc36b348e013d73890e4b742bdcb6f3863` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 0 | 1100 ms | 8927 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 0 | 360 ms | 9921 ms | — |
| inspect | step 5: goto /search/ | 1 | 0 | 405 ms | 3663 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 0 | 368 ms | 5453 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 0 | 395 ms | 5000 ms | — |
| inspect | step 11: goto /notifications | 1 | 0 | 398 ms | 5497 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 0 | 306 ms | 5943 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 0, 1100 ms

Sent:

```json
{
  "screen_width": 1920,
  "screen_height": 1080,
  "app_name": "web3x"
}
```

Answered:

```json
null
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 0, 360 ms

Sent:

```json
{
  "screen_width": 1920,
  "screen_height": 1080,
  "app_name": "web3x"
}
```

Answered:

```json
null
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 0, 405 ms

Sent:

```json
{
  "screen_width": 1920,
  "screen_height": 1080,
  "app_name": "web3x"
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

A POST to `pi.reddit.com/v4/p` with the screen size and `app_name: web3x`, sent once per page load, 3-9 seconds after the goto. Its code wasn't found in Reddit's bundles (no slice; the rea Evidence `ev_f322b36d…` is the shared one for requests with no slice), so what Reddit does with it isn't known from the code; by what it sends it is a page-view ping with the browser's screen size.

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. It matters only in that the screen size it reports comes from the AdsPower profile, so it has to agree with the profile's fingerprint.

## What can go wrong

Every call has status 0 (`net::ERR_ABORTED` in the recording): the browser ended it with no answer, in all seven steps. The page carries on as normal, so nothing in a run depends on it; whether Reddit got the body can't be told from the recording.
