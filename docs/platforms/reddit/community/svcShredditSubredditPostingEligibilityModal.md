# svcShredditSubredditPostingEligibilityModal

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | community |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/subreddit-posting-eligibility-modal` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:100 anonymous`, `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:9 anonymous` |
| rea | `ev_9238b7d25c82cf90e4ef5d35f5be371c3a36c3a0f7571e7f0fabd623318a3661` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 647 ms | 4605 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 420 ms | 1026 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 647 ms

Sent:

```json
null
```

Answered:

```json
null
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th: 200, 420 ms

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

This partial is the community's posting eligibility dialog, which says whether this account may post in that community. The URL is `/svc/shreddit/subreddit-posting-eligibility-modal/<community>/`, loaded as page HTML; the slices show the `create-post-entry-point-wrapper` element, whose `onAction` first checks for human verification and shows that dialog if needed, else opens `#subreddit-posting-eligibility-modal` with its `#post-eligibility-content` (and a hidden `#similar-subreddits-content` part) instead of going to the post form (rea `ev_9238b7d2…`; one of its two slices didn't parse). It fired on r/AskReddit (step 3) and one of its posts (step 6).

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` in the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. If log-cli ever posts on Reddit, this is the call that says whether the account may post in a subreddit, so a posting flow would have to read it before pressing Create.

## What can go wrong

Both recorded calls answered 200 with an empty body, most likely because r/AskReddit had nothing to hold this account back with, so the create button goes straight on. In the code, the dialog opens only when it is on the page; when it isn't, the click carries on as normal. An empty answer tells a run only that there was no dialog, not why.
