# useIncrementLinkSharingDisclosureImpressionCountMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `9370415306417248` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `xfb_increment_disclosure_impression_count.__typename` |
| Called from | `useIncrementLinkSharingDisclosureImpressionCountMutation` |
| rea | `ev_5051a4775980c6ca0e48847ae6cf62ba3d6cb0c4e9c56b16ec00decf93e6b345` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 20: clickRole button "…" | 1 | 200 | 972 ms | 3346 ms | — |

<!-- facts:end -->

## What it does

A mutation Facebook sends by itself when the share sheet shows its notice about shared links: it adds one to the count of times the account has seen it (`xfb_increment_disclosure_impression_count`), the count `CometLinkSharingInlineDisclosureCountQuery` reads. It changes only that counter, not anything other people see. In run 20261020T153648 step 20 it fired 3.3 s after the Share group click, 972 ms, 200.

## What our machine does with it

No machine sends it on purpose and none reads it. It fires by itself when the share sheet opens: in the flow [`groupHeaderMenus`](../flows/groupHeaderMenus.md) the Share group step opens the sheet and Escape closes it, nothing is shared. It is a write on Facebook's side, but it records only that the sheet was seen; the flow doesn't wait for it.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the notice could show again next time; nothing else changes.
