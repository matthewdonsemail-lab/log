# CometMarketplaceInboxSetPreferredViewerRoleMutation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | mutation |
| doc_id | `8970537109713056` |
| Path | `/api/graphql/` |
| Sends | `input` |
| Reads | `marketplace_inbox_set_preferred_viewer_role.client_mutation_id` |
| Called from | `CometMarketplaceInboxSetPreferredViewerRoleMutation` |
| rea | `ev_c54b7db1ab4e2b315a213432b3ac2ebd88f742b422682e0372c6984632c486e1` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /marketplace/inbox | 2 | 200 | 450–556 ms | 17761–20788 ms | — |

<!-- facts:end -->

## What it does

Saves which inbox tab the account last used (`marketplace_inbox_set_preferred_viewer_role`): opening `?targetTab=SELLER` sets it to SELLER. It fired as the inbox loaded (step 1).

## What our machine does with it

A side effect of opening the seller tab, which the check does every round; nothing of ours reads it. It changes only which tab Facebook shows first.

## What can go wrong

None seen: two calls, 200 in 450-556 ms. A failure would only change the default tab.
