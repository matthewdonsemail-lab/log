# useCometAISupportConversationLoggerMutation

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | checkpoint |
| Kind | query |
| doc_id | `26372148759079397` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | — |
| Called from | — |
| rea | not read yet |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | POST 200 /ajax/qm/ (591 ms) | 1 | 200 | 341 ms | 418 ms | — |
| warmup | mouse: move failed (TimeoutError) | 1 | 200 | 346 ms | 1125 ms | — |

<!-- facts:end -->

## What it does

Logs that the support chat on a checkpoint page was shown (`xfb_support_conversation_logging`). Fires with `UFACAISupportChatExperienceQuery`, about 4.4 s after the page opened.

## What our machine does with it

Nothing. It is logging on a checkpoint page; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Like the chat query, it only appears inside a checkpoint. Seeing it means the run already ended in a person's hands.
