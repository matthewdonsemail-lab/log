# useCIXLogMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `24438951589125380` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `cix_log.__typename` |
| Called from | `useCIXLogMutation` |
| rea | `ev_861b046d2fca8f66f0fb54a8cbcb72051f984ac968338f63fa57bbc89194bb2d` |

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | rea read step 36_scroll1X400: exit 0, ev_878f93e2480d9215dd7481db9487a1ed4fb3874251015daaf | 1 | 200 | 503 ms | 3150 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 468 ms | 1992 ms | — |
| inspect | rea read step 24_scroll1X400: exit 0, ev_b216c28b15aac8907d6b5a345798a611d298acedb29f1a6ac | 1 | 200 | 486 ms | 1520 ms | — |

<!-- facts:end -->

## What it does

A logging call from Facebook's client: it sends `input` and reads only `cix_log.__typename`. It fired 3 times in 2 runs, 1.5-3.2 s into scrolls of the Marketplace browse feed, with `CometMarketplaceSetProductItemSeenStateMutation`.

## What our machine does with it

Nothing in our machines reads it; it comes with the feed warm-up's `scrollMarketplace`.

## What can go wrong

None seen: all three answered 200 in 468-503 ms. Nothing waits on it.
