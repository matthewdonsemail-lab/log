# CometUFILiveTypingBroadcastMutation_StopMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `9972315006159780` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `feedback_stop_typing.feedback` |
| Called from | `CometUFILiveTypingBroadcastMutation` |
| rea | `ev_082400740ed9343024c268903092af48f8f81859d7e36d9223fbfb69bbc717c6` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 7: type e2129 | 1 | 200 | 479 ms | 11211 ms | — |
| inspect | step 8: clickRole button "…" | 1 | 200 | 701 ms | 11461 ms | — |

<!-- facts:end -->

## What it does

Tells Facebook the account stopped typing in the comment box (`feedback_stop_typing.feedback`). It fired on run 20261020T162343 around the comment's send, 11 s into the typing step.

## What our machine does with it

Nothing waits for it, as for the start broadcast; never a step's confirming request (`NOT_CONFIRMING`).

## What can go wrong

None seen; a failure would leave the typing indicator showing a little longer for viewers, nothing more.
