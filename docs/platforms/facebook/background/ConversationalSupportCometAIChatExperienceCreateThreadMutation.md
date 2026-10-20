# ConversationalSupportCometAIChatExperienceCreateThreadMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `34071142532499112` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `xfb_comet_ai_chat_create_thread_with_token.token`, `xfb_comet_ai_chat_create_thread_with_token.thread_id`, `xfb_comet_ai_chat_create_thread_with_token.messaging_user_id`, `xfb_comet_ai_chat_create_thread_with_token.messaging_user_token` |
| Called from | `ConversationalSupportCometAIChatExperience.react` |
| rea | `ev_6965352394f48ab836cbc27405d967445bbc361b29c83c0dee4f9b706c2ff903` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: clickRole button "…" | 1 | 200 | 4183 ms | 957 ms | — |

<!-- facts:end -->

## What it does

Opens a support chat thread from a checkpoint page (`xfb_comet_ai_chat_create_thread_with_token`: a token and a `thread_id`). It fired on run 20261020T161400 after "Need help? Chat with us." on Reading's checkpoint (4183 ms); the "Support chat" dialog then showed its suggested questions and a message box.

## What our machine does with it

Nothing of ours uses it: the chat was opened once to record what the button does, and nothing was sent. It is recorded so the requests a checkpoint page can send are known.

## What can go wrong

None seen.
