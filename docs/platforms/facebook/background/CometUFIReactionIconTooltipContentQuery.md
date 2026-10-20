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
| inspect | POST 200 /ajax/bnzai (493 ms) | 1 | 200 | 781 ms | 1638 ms | — |
| inspect | step 6: likePost Like | 1 | 200 | 1442 ms | 3 ms | — |
| inspect | POST 200 CometUFIFeedbackReactMutation (1719 ms) | 1 | 200 | 729 ms | 1162 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T105 | 2 | 200 | 662–1826 ms | 2672–8108 ms | — |
| inspect | rea read step 22_likepostLike: exit 0, ev_540383c4fa642403a764fbc232e14ac51cafa5f313056b88 | 1 | 200 | 816 ms | 2983 ms | — |
| inspect | step 5: dwell 0.67s | 1 | 200 | 1109 ms | 121 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T103 | 10 | 200 | 763–1160 ms | 118–247832 ms | — |
| inspect | rea read step 10_nextpost: exit 0, ev_7ff544567b0da5effece64331b722d7bf61996303ee2c1367083 | 1 | 200 | 1022 ms | 71 ms | — |
| inspect | POST 200 CometHovercardQueryRendererQuery (1147 ms) | 2 | 200 | 1113–1170 ms | 789–885 ms | — |
| inspect | rea read step 14_nextpost: exit 0, ev_6209fcf52acf0f7a90e081fed57af389f95de778645cfd8464dd | 2 | 200 | 980–1123 ms | 21418–37300 ms | — |

<!-- facts:end -->

## What it does

Loads the tooltip over a post's reaction icons: who reacted (`important_reactors`, `reactors`) and the total (`total_reaction_count`), from `feedbackTargetID` and `reactionID`. It fires when the cursor rests over a reaction count. It fired 22 times in 4 runs, around likes, dwells and snapshots on the feed.

## What our machine does with it

Our cursor sends it, not a step: `humanMouse.py`'s loose loops around what is looked at (rule 32) pass over the reaction count beside each post's Like. The machine never reads it; it shows the cursor moves over the page as a reader's does.

## What can go wrong

None seen: all 22 answered 200 in 662-1826 ms. Nothing waits on it.
