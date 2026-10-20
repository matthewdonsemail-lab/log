# useGroupsCometMembershipQuestionnaireOpenedLoggingMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | mutation |
| doc_id | `27763910873236528` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `group_membership_questionnaire_opened.group` |
| Called from | `useGroupsCometMembershipQuestionnaireOpenedLogging` |
| rea | `ev_6cba7a3149ffc7c1d717be177e13af018749aa65bb4b760c16faad865eaa5259` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: clickRole button "…" | 1 | 200 | 349 ms | 3529 ms | — |

<!-- facts:end -->

## What it does

Tells Facebook the membership questionnaire was opened (`group_membership_questionnaire_opened`); it reads back the `group`. It fired 1391 ms after step 2 (click e220), after `GroupsCometMembershipQuestionsPreloadedDialogQuery` (744 ms) had loaded the questions.

## What our machine does with it

Nothing. The answer machine reads the dialog from its snapshot (`reading`, `planFill`) and the questions from `GroupsCometMembershipQuestionsPreloadedDialogQuery`; no code refers to this request.

## What can go wrong

None seen: one call, 200 in 484 ms. If the dialog did not open, the answer machine stops with `groupQuestionsNotReopened`, from the page, not from this request.
