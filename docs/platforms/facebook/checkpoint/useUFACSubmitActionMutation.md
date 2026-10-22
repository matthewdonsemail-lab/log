# useUFACSubmitActionMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | checkpoint |
| Kind | mutation |
| doc_id | `28911931891824700` |
| Path | `/api/graphql/` |
| Sends | `designSystem`, `input`, `scale` |
| Reads | `ufac_client_submit_action.ufac_client` |
| Called from | `useUFACSubmitAction` |
| rea | `ev_e4f13bdff7b9aeebfd4f4bc936b4cade3eba5b723439cf5aa62ef31b4e9a43ef` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: click e53 | 1 | 200 | 2820 ms | 1209 ms | — |
| inspect | Text captcha: Continue is plain text here, clicking it. | 1 | 200 | 4558 ms | 1157 ms | — |
| inspect | step 41: click e69 | 1 | 200 | 2488 ms | 1196 ms | — |
| inspect | step 43: click e113 | 1 | 200 | 4046 ms | 1143 ms | — |

<!-- facts:end -->

## What it does

Sends an answer to a checkpoint step (`ufac_client_submit_action`): here, the solved text captcha. It took 2.3 s and fired 3.7 s after the captcha page opened.

## What our machine does with it

The connect machine's `captcha` page kind types the solver's answer and presses Enter, then waits for Continue (rule 10's solvers). This request is that submit reaching Facebook: if it is in the step HAR, the answer was sent.

## What can go wrong

A 200 only means Facebook received the answer, not that it was right: the next page says that (another captcha means wrong). If it is missing after a submit, the Enter never reached Facebook (the bug fixed this session).
