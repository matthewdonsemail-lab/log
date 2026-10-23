# CometMessagingJewelDropdownEBUpsellContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `25961980840158091` |
| Path | `/api/graphql/` |
| Sends | `__relay_internal__pv__MWEBNewUserOnboardingShouldLoadUpsellsrelayprovider` |
| Reads | `...MWEncryptedBackupsJewelNuxWrapper_query` |
| Called from | `CometMessagingJewelDropdownEBUpsellContainer.react` |
| rea | `ev_9fdcb875b45d48b4564dd5235fa4f00d220e86c6696c908ee222067d4dddeb63` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 674 ms | 1346636 ms | — |

<!-- facts:end -->

## What it does

Messenger's encrypted-backups upsell for the chats dropdown in the top bar (`MWEncryptedBackupsJewelNuxWrapper`): whether to show the prompt to set up a backup PIN. It fires when the Messenger dropdown loads.

## What our machine does with it

Nothing reads it. The PIN screens themselves are page states the hook resolves (`messengerPinCreate`, `messengerPinEnter`, rule 67).

## What can go wrong

Seen only with 200. If it says to show the upsell, a PIN prompt can appear over Messenger; that prompt is handled as its page state, not from this answer.
