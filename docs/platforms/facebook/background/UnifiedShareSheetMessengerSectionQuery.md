# UnifiedShareSheetMessengerSectionQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `23993111606963614` |
| Path | `/api/graphql/` |
| Sends | `__relay_internal__pv__isAttachmentsQueryOptimizationEnabledrelayprovider`, `__relay_internal__pv__isWaAddressableFieldsEnabledrelayprovider` |
| Reads | `...UnifiedShareSheetMessengerHscroll_messenger` |
| Called from | `UnifiedShareSheetMessengerSection.react` |
| rea | `ev_4e9844fcc357413d99295417750833b29f6f0dc5dbf4020e81d9cb65904242c5` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 20: clickRole button "…" | 1 | 200 | 1619 ms | 1289 ms | — |

<!-- facts:end -->

## What it does

Loads the Messenger section of Facebook's share dialog (`UnifiedShareSheetMessengerHscroll_messenger`). It fired in the same `log inspect` snapshot steps as `CometUnifiedShareSheetDialogQuery`, within a few ms of it, so it is part of that dialog loading.

## What our machine does with it

Nothing. None of our machines opens a share dialog (`reelOrderer.ts`: no save, follow or share), and no code refers to this request. No state waits for it or reads it.

## What can go wrong

None seen: three calls, all 200 in 400-465 ms. Nothing of ours depends on it.
