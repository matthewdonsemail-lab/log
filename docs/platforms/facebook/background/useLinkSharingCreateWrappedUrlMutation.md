# useLinkSharingCreateWrappedUrlMutation

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `30568280579452205` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `xfb_create_share_url_wrapper.share_url_wrapper` |
| Called from | `useLinkSharingCreateWrappedUrlMutation` |
| rea | `ev_3d9b0076c1f609117780d9b9ff63b31f8236198456a20a5d52820a4fbb0aa3dc` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 20: clickRole button "…" | 1 | 200 | 894 ms | 3280 ms | — |

<!-- facts:end -->

## What it does

A mutation the share sheet sends by itself as it opens: it asks Facebook for a wrapped share link of what is being shared (`xfb_create_share_url_wrapper.share_url_wrapper`), the link "Copy link" would copy. Nothing is shared or posted by it. In run 20261020T153648 step 20 it fired 3.3 s after the Share group click, 894 ms, 200.

## What our machine does with it

The flow [`groupHeaderMenus`](../flows/groupHeaderMenus.md) takes it as the Share group step's confirming request (the first mutation the step sent): it is how the run knows the sheet really opened. The next step closes the sheet with Escape; nothing is shared (rule 8).

## What can go wrong

Only a 200 has been seen, in one run. If it doesn't come within the flow's wait, the step is marked "confirming request not seen": the sheet probably didn't open, and the step's recording shows why.
