# CometFacebookIXTNextMutation

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | checkpoint |
| Kind | mutation |
| doc_id | `28619117247755963` |
| Path | `/api/graphql/` |
| Sends | `input`, `scale` |
| Reads | `ixt_screen_next.view_model`, `ixt_screen_next.display_type` |
| Called from | `CometFacebookIXTNextMutation` |
| rea | `ev_c90448ccb16d35b97c9f530592a58d364834f48b6e66f26b6e10f6094085c412` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: click e1331 | 1 | 200 | 2819 ms | 874 ms | — |

<!-- facts:end -->

## What it does

Opens Facebook's "What happened / See why" explanation of an enforcement on the account: the restriction, its reason, and whether a review can still be asked for (`appeal_state`, `enforcement_instance_id`).

## What our machine does with it

Our machines don't call it; it fired when Pittsburgh's "See why" was opened in an inspect session on 2026-10-19. Its answer is the clearest statement of an account restriction we have seen ("Everything you manage, including all of your profiles, Pages and groups, is restricted", appeal_state 6: no longer appealable), and its wording is why `classifySignal` knows `restrictedPolicy` (rule 34's two-account test).

## What can go wrong

It means the account is restricted: connect and publish stop on the same wording before this is ever opened. An account that shows it is RESTRICTED in Twenty and is not used.
