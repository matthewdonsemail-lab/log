# useCometAISupportConversationLoggerMutation

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 6 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: wait 60s | 1 | 200 | 6131 ms | 36736 ms | — |
| inspect | step 1: goto /marketplace/ | 1 | 200 | 403 ms | 11946 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 370 ms | 12972 ms | — |
| inspect | page has 3 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1052 | 1 | 200 | 494 ms | 3541 ms | — |
| profile | Profile controls: picture not found; cover not found; 4 controls listed in profileFound.tx | 1 | -1 | -1 ms | 713 ms | — |
| connect | says: <name> / buttons: Back to Previous Page, Account settings | 1 | 200 | 345 ms | 4382 ms | — |

<!-- facts:end -->

## What it does

Logs that the support chat on a checkpoint page was shown (`xfb_support_conversation_logging`). Fires with `UFACAISupportChatExperienceQuery`, about 4.4 s after the page opened.

## What our machine does with it

Nothing. It is logging on a checkpoint page; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Like the chat query, it only appears inside a checkpoint. Seeing it means the run already ended in a person's hands.
