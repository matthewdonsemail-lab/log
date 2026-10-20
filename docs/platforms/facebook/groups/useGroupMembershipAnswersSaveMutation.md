# useGroupMembershipAnswersSaveMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | mutation |
| doc_id | `39151605081152815` |
| Path | `/api/graphql/` |
| Sends | `groupID`, `input`, `inviteShortLinkKey`, `isChainingRecommendationUnit`, `profileID`, `scale`, `__relay_internal__pv__GroupsCometGYSJUnifiedUnitCardImageHeightrelayprovider` |
| Reads | `group_membership_questions_answers_save.email_verification_response`, `group_membership_questions_answers_save.group` |
| Called from | `useGroupMembershipAnswersSaveMutation` |
| rea | `ev_effd4389296cb9725fb634bdf39a75d775a9e976b4314399e7afaa810c4ac9cc` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 8: click e1225 | 1 | 200 | 1289 ms | 1058 ms | — |

<!-- facts:end -->

## What it does

Saves the account's answers to a group's membership questions when Submit is pressed; it reads back `email_verification_response` and the `group`. It fired 1058 ms after step 8 (click e1225), the Submit click.

## What our machine does with it

The answer machine's `submitting` state clicks Submit, and `readJoinOptions` reads this response from that step's HAR: `viewer_membership_questions_answer_state` and `viewer_join_state`. In `answered`, `QUESTIONNAIRE_COMPLETED` means submitted (Facebook's own answer first); without it, the dialog closing in the `checking` snapshot also counts as submitted.

## What can go wrong

None seen: one call, 200 in 1289 ms. If it shows no `QUESTIONNAIRE_COMPLETED` and the dialog stays open, the machine stops with `groupSubmitNotConfirmed` and does not press Submit again. A failed click or a checkpoint or login page after it stops the run the same way.
