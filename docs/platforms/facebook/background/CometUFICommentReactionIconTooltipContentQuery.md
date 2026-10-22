# CometUFICommentReactionIconTooltipContentQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `9413041418817659` |
| Path | `/api/graphql/` |
| Sends | `feedbackTargetID` |
| Reads | `feedback....CometUFIClassicCommentReactionIconTooltipContent_feedback` |
| Called from | `CometUFICommentReactionIconTooltipContent.react` |
| rea | `ev_765c165617edadc7f395b2c04f85c2c257687b7ab3ce9eae75c98f27c210808b` |

Seen 11 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: +800px in 18 wheel steps, 781 ms | 11 | 200 | 361–1544 ms | 180277–1714421 ms | — |

<!-- facts:end -->

## What it does

Loads the tooltip for a comment's reaction icons (who reacted, and how) when the cursor rests on them. It sends the comment's `feedbackTargetID`.

## What our machine does with it

Nothing. It fired 11 times while the group read scrolled a post's comment dialog (`scrollingComments`, run 20261022T054544), as the cursor passed over the comments' reaction icons (rule 32). The comments come from the comment queries, not from this.

## What can go wrong

Harmless: every time it answered 200. A failure would only lose a tooltip.
