# CometProfileVerificationBadgePopoverQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9684350218300346` |
| Path | `/api/graphql/` |
| Sends | `profileID` |
| Reads | `node.id`, `node.__typename` |
| Called from | `CometProfileVerificationBadgePopover.react` |
| rea | `ev_30cb73a9fa4178a0bd1e40df058036b7959d3c2ac3c9f1ce44965dc85a402bb8` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 340 ms | 222326 ms | — |
| inspect | step 21: clickRole button "…" | 1 | 200 | 459 ms | 3352 ms | — |
| inspect | step 78: dwell 1s | 2 | 200 | 347 ms | 3630–4167 ms | — |

<!-- facts:end -->

## What it does

Loads the popover for a profile's verification badge, by `profileID`; it reads back only `node.id` and `node.__typename`. In our Reels recordings it fired after step 21 (a clickRole button step) and twice when the page settled on /reel/<id>, with no step of ours clicking a badge (`src/warmup/facebook/helpers/reel.ts` has none).

## What our machine does with it

Nothing. The Reels warm-up (`src/warmup/facebook`) checks each step against the page's URL and snapshot (`checkStep`), never against this response, and no code refers to it.

## What can go wrong

None seen: three calls, all 200 in 347-459 ms. If it failed, only the popover's data would be missing. If the step fails anyway, `checkStep` reports it as an issue: `log warmup facebook reel record` goes on and outlines it, a `run` stops there, and a checkpoint or login page ends it as `blocked`.
