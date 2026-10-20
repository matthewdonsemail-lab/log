# CometUFIConversationGuideContainerQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `25316047617978702` |
| Path | `/api/graphql/` |
| Sends | `feedLocation`, `feedbackID`, `scale` |
| Reads | `feedback.comet_conversation_guide_renderer` |
| Called from | `CometUFIConversationGuideContainer.react` |
| rea | `ev_935e23bdd0f1bbad483c8864ac3a297d9f2626846cf37db734cdfc47e418538f` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: clickRole button "…" | 1 | 200 | 2823 ms | 2527 ms | — |
| inspect | scroll: +1731px in 35 wheel steps, 2093 ms | 1 | 200 | 837 ms | 3243 ms | — |

<!-- facts:end -->

## What it does

Loads the conversation guide under a post's comment box (`feedback.comet_conversation_guide_renderer`, from `feedbackID`): suggested prompts to start a comment. It fired once, 3.2 s into a 1731 px scroll inside an opened post.

## What our machine does with it

Nothing in our machines reads it. It comes with the comment box of a post opened by the feed warm-up's `openComments`; comments are read, never written (rule 8).

## What can go wrong

None seen: one answer, 200 in 837 ms. Nothing waits on it.
