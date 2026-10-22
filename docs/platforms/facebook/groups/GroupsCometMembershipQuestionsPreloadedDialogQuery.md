# GroupsCometMembershipQuestionsPreloadedDialogQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `28003273059323951` |
| Path | `/api/graphql/` |
| Sends | `group_id`, `scale` |
| Reads | `group.viewer_must_answer_membership_question_to_submit`, `group....GroupsCometMembershipQuestionsDialogContents_group` |
| Called from | `GroupsCometMembershipQuestionsPreloadedDialog.react` |
| rea | `ev_dd616c3f30730d9acd44f2f8fb04c41d5895a0739b85b96be369e95f587f31fd` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: clickRole button "…" | 2 | 200 | 409–412 ms | 1211–3027 ms | — |

<!-- facts:end -->

## What it does

Loads the membership questions dialog for a group (`group_id`): whether the viewer must answer to submit (`viewer_must_answer_membership_question_to_submit`) and the dialog's contents. It fired 744 ms after step 2 (click e220), the click that opened the questions.

## What our machine does with it

`readJoinOptions` (`src/group/join/helpers/joinOptions.ts`) reads it from the Join click's HAR: each question's id, type and options, `viewer_must_answer_membership_question_to_submit`, `is_rules_agreement_enabled`, the group rules, `has_email_verification_question` and the dialog's own words. `groupJoin`'s `checking` state infers from it whether posting asks for questions, a rules agreement or nothing (`inferJoinState`), and `log facebook join group --answer` and the answer machine (`planFill`) build the stepper and the fill from those questions.

## What can go wrong

None seen: one call, 200 in 556 ms. A response with no `data.group` (only a `for (;;);` line) is skipped, so the questions stay unread (`questionsQueried` false) and `inferJoinState` falls back to the dialog in the snapshot, else posting `unknown`. Facebook answers it twice (preloaded, then opened); the last full answer stands.
