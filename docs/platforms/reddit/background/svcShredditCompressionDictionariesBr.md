# svcShredditCompressionDictionariesBr

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/compression-dictionaries/br` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_f322b36dde9e0c8ddebceccd0a0499cc36b348e013d73890e4b742bdcb6f3863` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 162 ms | 7339 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 162 ms

Sent:

```json
null
```

Answered:

```json
"JTJGcG9seWZpbGxzJTJGcmVnZW5lcmF0b3ItcnVudGltZS5lMmM5NTFlMmVhZTY0OGFhY2JjYWM1Mjk0MjgzNTVkYS5qcyU2MCkpJTJDJTYwZmV0Y2glNjBpbiUyMHdpbmRvdyU3QyU3Q3QucHVzaChlKCU2MGh0dHBzJTNBJTJGJTJGd3d3LnJlZGRpdHN0YXRpYy5jb20lMkZzaHJlZGRpdCUyRnBvbHlmaWxscyUyRmZldGNoLmZlYThjYTI0YjgzNDkwMjhkYTEyNjcyZGQ4ZWE5MzI5LmpzJTYwKSklMkMlNjBJbnRlcnNlY3Rpb25PYnNlcnZlciU2MGluJTIwd2luZG93JTI2JTI2JTYwSW50ZXJzZWN0aW9uT2JzZXJ2ZXJFbnRyeSU2… (272728 chars)"
```

<!-- facts:end -->

## What it does

A Brotli compression dictionary (`dict-<hash>.dat`, about 46 KB) that the browser fetches by itself: Reddit's home page sends a `Link: <…>; rel="compression-dictionary"` header, and this answer carries `use-as-dictionary: match="/*", match-dest=("document")`, so later pages can be sent compressed against it (they answer `vary: Available-Dictionary`). It isn't Reddit's JavaScript, so there is no code for it in the bundles (the rea Evidence `ev_f322b36d…` is the shared one for requests with no slice). It fired once, in step 1, and is cached for a year.

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. It has no bearing on any action; it only makes later page loads smaller.

## What can go wrong

It answered 200 once. If it fails, the browser asks for pages without the dictionary and gets them compressed the usual way, so nothing in a run is affected.
