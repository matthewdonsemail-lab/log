# svcShredditPostDetailModules

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | comments |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/post-detail-modules` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script0.js:44 statement` |
| rea | `ev_4a5dcfad32bab6b5f1ed63024ec8eed50aaaeab794ca2a0212b513cf3f6afb8e` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 409 ms | 983 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th: 200, 409 ms

Sent:

```json
{
  "query": {
    "render-mode": "partial",
    "seeker-session": "true",
    "pdpCanonicalUrl": "https://www.reddit.com/r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_that/"
  },
  "body": null
}
```

Answered:

```json
"<div id=\"mosaic-pdp-feed\" class=\"\">\n    \n  </div>"
```

<!-- facts:end -->

## What it does

A GET of the post page's extra modules (`render-mode=partial`, the post's canonical URL), made by a `faceplate-partial` in the post page's HTML. The slice (`script0.js`, rea `ev_4a5dcfad…`) is the code that watches it: `/svc/shreddit/post-detail-modules` and `/svc/shreddit/comments` are the partials whose loads time when the comments paint and become usable (`navigation_to_post_detail`, `comments_paint`, `comments_interactive`). It fired once, on step 6 (the thread page), and answered an empty `mosaic-pdp-feed` block.

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. It has no bearing on reading a post's comments, which come from the page and `more-comments`.

## What can go wrong

Its one call was 200, with an empty module block, so there was nothing to add to the page. A failure would only leave that block empty; no failure has been recorded.
