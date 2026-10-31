# CometUFILiveTypingBroadcastMutation_StartMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `9815271091886179` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `feedback_start_typing.feedback` |
| Called from | `CometUFILiveTypingBroadcastMutation` |
| rea | `ev_cd93da68f37862111cec7575333efdea8ed629c8438bfb6a069de0377c193052` |

Seen 4 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 7: type e2129 | 2 | 200 | 505–675 ms | 129–10135 ms | — |
| inspect | step 8: clickRole button "…" | 2 | 200 | 456–618 ms | 1456–11460 ms | — |

<!-- facts:end -->

## What it does

Tells Facebook the account started typing in a post's comment box (`feedback_start_typing.feedback`), so others viewing the post can see someone is typing. It fired twice on run 20261020T162343: while "Test comment" was typed (step 7) and again around the send (step 8).

## What our machine does with it

Nothing in our machines waits for it: it is a side effect of typing. The flow builder never picks it as a step's confirming request (`NOT_CONFIRMING`, `LiveTyping`), because the comment is created by `useCometUFICreateCommentMutation`.

## What can go wrong

None seen. A failure would only hide the typing indicator; the comment itself is unaffected.
