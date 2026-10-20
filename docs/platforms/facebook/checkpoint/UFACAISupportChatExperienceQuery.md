# UFACAISupportChatExperienceQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | checkpoint |
| Kind | query |
| doc_id | `26465902889674584` |
| Path | `/api/graphql/` |
| Sends | `request` |
| Reads | `init_conversational_support_attempt_for_ufac.is_cometai_chat_available`, `init_conversational_support_attempt_for_ufac.attempt_token` |
| Called from | `UFACAISupportChatExperience.react` |
| rea | `ev_8ee95faa5bbd82f99ae9dcfe8cbd78add4e5241ff8073ebf16e7331f832cc1d5` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 38: goto /marketplace/ | 2 | 200 | 728–936 ms | 21112–22075 ms | — |

<!-- facts:end -->

## What it does

On a locked-account page, asks whether Facebook's AI support chat is offered for this checkpoint (`init_conversational_support_attempt_for_ufac.is_cometai_chat_available`) and gets an attempt token. UFAC is Facebook's account-checkpoint framework.

## What our machine does with it

Nothing waits for it. It fires on the page with "Back to Previous Page, Account settings", which the connect machine ends on as `checkpoint` or `videoSelfie`: a person takes over (rule 23).

## What can go wrong

Its presence means the account is inside a checkpoint flow, not a normal page. If it shows up in a publish or scan run, the account has been checkpointed since its last connect.
