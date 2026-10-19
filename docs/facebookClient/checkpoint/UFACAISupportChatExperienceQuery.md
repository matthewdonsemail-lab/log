# UFACAISupportChatExperienceQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | checkpoint |
| Kind | query |
| doc_id | `26465902889674584` |
| Path | `/api/graphql/` |
| Sends | `request` |
| Reads | — |
| Called from | — |
| rea | not read yet |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | mouse: 2 wander; 0 idle drift move(s) | 1 | 200 | 516 ms | 12 ms | — |
| warmup | POST 200 /ajax/qm/ (591 ms) | 1 | 200 | 377 ms | 423 ms | — |
| warmup | mouse: move failed (TimeoutError) | 1 | 200 | 364 ms | 605 ms | — |

<!-- facts:end -->

## What it does

On a locked-account page, asks whether Facebook's AI support chat is offered for this checkpoint (`init_conversational_support_attempt_for_ufac.is_cometai_chat_available`) and gets an attempt token. UFAC is Facebook's account-checkpoint framework.

## What our machine does with it

Nothing waits for it. It fires on the page with "Back to Previous Page, Account settings", which the connect machine ends on as `checkpoint` or `videoSelfie`: a person takes over (rule 23).

## What can go wrong

Its presence means the account is inside a checkpoint flow, not a normal page. If it shows up in a publish or scan run, the account has been checkpointed since its last connect.
