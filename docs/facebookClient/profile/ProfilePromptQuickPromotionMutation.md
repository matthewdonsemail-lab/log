# ProfilePromptQuickPromotionMutation

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | mutation |
| doc_id | `23874483825521845` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `profile_prompt_bump_counter.count_updated` |
| Called from | `ProfilePromptQuickPromotionMutation` |
| rea | `ev_14b0cd727e25dbe1ccb26c1e7fd99092c8962aad531cf5b54bb5ac47aef1ff39` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| flow | step 1: goto /me | 2 | 200 | 377–689 ms | 8431–13347 ms | — |
| inspect | step 1: goto /me | 1 | 200 | 469 ms | 13195 ms | — |

<!-- facts:end -->

## What it does

Logs that a profile prompt ("Update your profile") was shown when the profile opened.

## What our machine does with it

Nothing. It was the first mutation of the recorded page load, so the flow generator now ignores Prompt/QuickPromotion requests as confirmations.

## What can go wrong

Harmless; it only fires when Facebook has a prompt to show.
