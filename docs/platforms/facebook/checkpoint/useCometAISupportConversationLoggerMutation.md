# useCometAISupportConversationLoggerMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | checkpoint |
| Kind | mutation |
| doc_id | `26372148759079397` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `xfb_support_conversation_logging.viewer` |
| Called from | `useCometAISupportConversationLogger.react` |
| rea | `ev_9b8131e20d25cf5f2615540fd47b41670ee2c3b239082dde00fe6367de015a5b` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | POST 200 fetchMWChatVideoAutoplaySettingQuery (574 ms) | 1 | 200 | 512 ms | 3999 ms | — |

<!-- facts:end -->

## What it does

Logs that the support chat on a checkpoint page was shown (`xfb_support_conversation_logging`). Fires with `UFACAISupportChatExperienceQuery`, about 4.4 s after the page opened.

## What our machine does with it

Nothing. It is logging on a checkpoint page; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Like the chat query, it only appears inside a checkpoint. Seeing it means the run already ended in a person's hands.
