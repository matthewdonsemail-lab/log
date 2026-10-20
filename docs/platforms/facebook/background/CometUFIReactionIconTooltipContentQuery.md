# CometUFIReactionIconTooltipContentQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26417294487963485` |
| Path | `/api/graphql/` |
| Sends | `feedbackTargetID`, `reactionID` |
| Reads | `feedback.important_reactors`, `feedback.reactors`, `feedback.total_reaction_count`, `feedback.reaction_display_config`, `feedback.cross_universe_feedback_info` |
| Called from | `CometUFIReactionIconTooltipContent.react` |
| rea | `ev_074f0c2d9bacc62a4925d73b3c217fb945fd4f92c19a03b579d133cf29e48fc7` |

Seen 22 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | post: "…", 48 words, 1 image(s), scrolled 753 px | 1 | 200 | 781 ms | 3523 ms | — |
| inspect | step 6: likePost Like | 4 | 200 | 662–1826 ms | 3–15944 ms | — |
| inspect | likePost failed: RuntimeError: the element kept moving under the cursor: the point is on D | 1 | 200 | 816 ms | 9386 ms | — |
| inspect | step 5: dwell 0.67s | 2 | 200 | 895–1109 ms | 121–1205 ms | — |
| inspect | post: "…", 42 words, 1 image(s), scrolled 735 px | 1 | 200 | 763 ms | 649 ms | — |
| inspect | step 11: dwell 0.52s | 1 | 200 | 1022 ms | 1098 ms | — |
| inspect | step 31: clickRole button "…" | 10 | 200 | 976–1170 ms | 7673–258327 ms | — |
| inspect | nextPost failed: TimeoutError: Locator.evaluate: Timeout 30000ms exceeded. | 2 | 200 | 980–1123 ms | 26238–42120 ms | — |

<!-- facts:end -->

## What it does

Loads the tooltip over a post's reaction icons: who reacted (`important_reactors`, `reactors`) and the total (`total_reaction_count`), from `feedbackTargetID` and `reactionID`. It fires when the cursor rests over a reaction count. It fired 22 times in 4 runs, around likes, dwells and snapshots on the feed.

## What our machine does with it

Our cursor sends it, not a step: `humanMouse.py`'s loose loops around what is looked at (rule 32) pass over the reaction count beside each post's Like. The machine never reads it; it shows the cursor moves over the page as a reader's does.

## What can go wrong

None seen: all 22 answered 200 in 662-1826 ms. Nothing waits on it.
