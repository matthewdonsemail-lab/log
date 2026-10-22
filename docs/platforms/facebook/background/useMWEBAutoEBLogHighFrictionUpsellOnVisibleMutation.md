# useMWEBAutoEBLogHighFrictionUpsellOnVisibleMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `25406806015621469` |
| Path | `/api/graphql/` |
| Sends | `is_new_user_soft_block`, `is_new_user_upsell` |
| Reads | `xfb_mw_eb_log_auto_eb_high_friction_upsell_impression.did_log_impression`, `xfb_mw_eb_log_auto_eb_high_friction_upsell_impression.next_evergreen_pin_upsell_display_timestamp` |
| Called from | `useMWEBAutoEBLogHighFrictionUpsellOnVisibleMutation` |
| rea | `ev_698131f96ef00c75e52d40f021e3ab9fac9385e20bd3b94a6386aa30c6efd891` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 25: goto /messages/ | 2 | 200 | 390–498 ms | 2688–3681 ms | — |

<!-- facts:end -->

## What it does

Logs that Messenger showed its PIN prompt for the encrypted chats (the "high friction upsell": the "Create a PIN to access your chats on any device" dialog). It sends whether the account is a new user being soft-blocked or upsold (`is_new_user_soft_block`, `is_new_user_upsell`), and reads back whether the impression was logged and when the PIN prompt may show again (`next_evergreen_pin_upsell_display_timestamp`). Both times it fired 2.7-3.7 s after step 25 opened /messages/, as the dialog became visible.

## What our machine does with it

It is the request that confirms the PIN dialog is on the page: it marks the `messengerPinCreate` state from the network side, as the snapshot's heading does from the page side. Today nothing waits for it: the state is read from the snapshot, and only matt's PIN clears it (`log facebook messenger pin`, then `log inspect do pin --live`). The PIN flow recorded from the Create PIN screens is to use it as its first step's confirming request.

## What can go wrong

None seen: both calls answered 200 in 390-498 ms. A failure would only lose Facebook's count of the prompt; the dialog itself still blocks the inbox until a PIN is set.
