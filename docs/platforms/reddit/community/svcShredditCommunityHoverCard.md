# svcShredditCommunityHoverCard

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | community |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/community-hover-card` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script1.js:692 handleHovercardOpen` |
| rea | `ev_b154a5253c10c124cb2d146a76adbd0bb403544f711fe383672a9ea7d22578c6` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 1814 ms | 4436 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 2: snapshot: 200, 1814 ms

Sent:

```json
null
```

Answered:

```json
"<div class=\"max-w-[360px] w-[90vw] overflow-hidden p-0 -m-xs\">\n    <div class=\"flex flex-col\">\n      <div class=\"h-[80px] w-auto overflow-hidden relative rounded-t-4\">\n            <img src=\"https://styles.redditmedia.com/t5_gaxt3t/styles/bannerBackgroundImage_ua4qpfwr023h1.png?frame=1&amp;auto=webp&amp;s=bbfcc95ca22a681faae933ba00512baa93d840a4\" alt=\"A banner for the subreddit\" class=\"mb-0 w-full … (3604 chars)"
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 12: goto /r/popular/: 200, 368 ms

Sent:

```json
null
```

Answered:

```json
"<div class=\"max-w-[360px] w-[90vw] overflow-hidden p-0 -m-xs\">\n    <div class=\"flex flex-col\">\n      <div class=\"h-[80px] w-auto overflow-hidden relative rounded-t-4\">\n            <img src=\"https://styles.redditmedia.com/t5_2qh2b/styles/bannerBackgroundImage_489f4mh7otoh1.jpg?frame=1&amp;auto=webp&amp;format=pjpg&amp;s=b821e02f81a91c84d7c26af598b4bd32d72da0c1\" alt=\"A banner for the subreddit\" clas… (3174 chars)"
```

<!-- facts:end -->

## What it does

This is the community hover card, the small card with a community's banner, icon and details that shows when the pointer rests on a community link. `handleHovercardOpen(e)` checks the opened card's `data-id`, and for `community-hover-card` loads the card's content (`t.vc(this,_.G(this))`); the URL is `/svc/shreddit/community-hover-card/<community name>` and the answer is ready-made HTML, not JSON (in our run, the card for r/b2bemailing). rea found nothing more in the slice (rea `ev_a75dde83…`). It fired during step 2 (snapshot), most likely when our cursor's idle movement rested on a community link.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` in the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, this call is mostly a sign of what our cursor did: a hover card loading shows the pointer stayed on a community link long enough to open it.

## What can go wrong

The one recorded call answered 200 with about 3.6 KB of HTML in 1814 ms. The slice shows no error handling of its own: if the content fails to load, the card simply stays empty, and nothing else on the page depends on it, so it can't stop a run.
