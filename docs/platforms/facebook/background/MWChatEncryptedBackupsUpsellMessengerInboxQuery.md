# MWChatEncryptedBackupsUpsellMessengerInboxQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `25840958432234114` |
| Path | `/api/graphql/` |
| Sends | `doesUserHaveAnEB`, `shouldShowOnboardingInterstitial` |
| Reads | `...useEncryptedBackupsProcessStatePreLoaded_query`, `xfb_backup....useHasRestoreInterstitialSoftblockBeenDismissed_xfbBackup` |
| Called from | `MWChatEncryptedBackupsUpsellMessengerInbox.react` |
| rea | `ev_0427856e5e318d591f009ff82849b7d874599abd152a910cd4f4932c27587954` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 496 ms | 1354422 ms | — |

<!-- facts:end -->

## What it does

Whether Messenger's inbox should show the encrypted-backups onboarding or the restore soft-block (`doesUserHaveAnEB`, `shouldShowOnboardingInterstitial`): the screen behind "Create a PIN to access your chats on any device".

## What our machine does with it

Nothing reads it directly. The screen it decides is the page state `messengerPinCreate` (or `messengerPinEnter`), which the hook resolves with the recorded flow when the account's PIN is in Twenty (rule 67).

## What can go wrong

Seen only with 200. When it says to show the interstitial, the inbox stays behind the PIN screen until the flow runs; the check would then read no chats until it is cleared.
