# pushRegisterServiceWorker

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/push/register/service_worker/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_d1fcb88e51d03a7c28a5169c4fee36346191acbab46cb21be75ca34a0f6d20cb` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: goto /marketplace/ | 1 | 200 | 819 ms | 11476 ms | — |

<!-- facts:end -->

## What it does

The browser registering Facebook's service worker for Web Push notifications. It fired once, 11.5 s into a `goto /marketplace/` step, with no parameters of ours.

## What our machine does with it

Nothing in our machines sends or reads it. It matters because notifications reach the page through it: in Reading's checkpoint (run 20261020T105346, its `findings.md`), the `fb_ufac_enrollment_push_notification` arrived by push and the page went to `/checkpoint/` 1.6 s later with no action of ours. The agent hooks report that page when it lands (rules 54-55).

## What can go wrong

None seen: one answer, 200 in 819 ms. Nothing waits on it.
