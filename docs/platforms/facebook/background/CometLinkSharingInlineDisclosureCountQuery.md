# CometLinkSharingInlineDisclosureCountQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29216341604678886` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `...CometLinkSharingInlineDisclosure_count` |
| Called from | `CometLinkSharingInlineDisclosure_count.graphql` |
| rea | `ev_db3f7c13254625d0eb7a8aaf17207069b251b804918c0ff9b38a0d9ff9f7ac0b` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 20: clickRole button "…" | 1 | 200 | 562 ms | 3271 ms | — |

<!-- facts:end -->

## What it does

Part of the share sheet (`CometLinkSharingInlineDisclosure_count.graphql`): it asks, with no variables, how many times the account has been shown Facebook's inline notice about shared links, so the sheet knows whether to show it again. In run 20261020T153648 step 20 (Share group) it fired 3.3 s after the click, 562 ms, 200.

## What our machine does with it

No machine sends it on purpose and none reads it. It fires by itself when the share sheet opens: in the flow [`groupHeaderMenus`](../flows/groupHeaderMenus.md) the Share group step opens the sheet and Escape closes it, nothing is shared.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, only the link notice in the sheet would be affected; the sheet still opens.
