# UFACAISupportChatExperienceQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 11 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: wait 60s | 2 | 200 | 1461–1690 ms | 33512–35020 ms | — |
| inspect | step 1: goto /marketplace/ | 2 | 200 | 500–503 ms | 10785–11418 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 471 ms | 12262 ms | — |
| inspect | page has 3 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T1052 | 2 | 200 | 650–776 ms | 1526–2930 ms | — |
| profile | Opening the profile (facebook.com/me). | 1 | 200 | 596 ms | 10415 ms | — |
| profile | Profile controls: picture not found; cover not found; 4 controls listed in profileFound.tx | 1 | -1 | -1 ms | 728 ms | — |
| connect | says: <name> / buttons: Back to Previous Page, Account settings | 2 | 200 | 466–759 ms | 3590–4386 ms | — |

<!-- facts:end -->

## What it does

On a locked-account page, asks whether Facebook's AI support chat is offered for this checkpoint (`init_conversational_support_attempt_for_ufac.is_cometai_chat_available`) and gets an attempt token. UFAC is Facebook's account-checkpoint framework.

## What our machine does with it

Nothing waits for it. It fires on the page with "Back to Previous Page, Account settings", which the connect machine ends on as `checkpoint` or `videoSelfie`: a person takes over (rule 23).

## What can go wrong

Its presence means the account is inside a checkpoint flow, not a normal page. If it shows up in a publish or scan run, the account has been checkpointed since its last connect.
