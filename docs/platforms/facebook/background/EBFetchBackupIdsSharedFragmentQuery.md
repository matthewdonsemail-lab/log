# EBFetchBackupIdsSharedFragmentQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `25164225499885252` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `...EBFetchBackupIdsSharedFragment` |
| Called from | `EBFetchBackupIdsSharedFragment.graphql` |
| rea | `ev_e9b67921b83e1e4b1e1e87836c9b6acfe8abcfcc56deb5844bbdff1bb58749b7` |

Seen 6 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | pin: typed the account's Messenger PIN | 6 | 200 | 360–457 ms | 9081–11927 ms | — |

<!-- facts:end -->

## What it does

Messenger's encrypted-backup ids (`EB` is encrypted backups): once the PIN is registered, the page fetches the account's backup ids so the chat history can be stored behind it. It fired twice in the confirm `pin` step, 9-12 s in, after Finish.

## What our machine does with it

Nothing waits for it. It is the page settling after the PIN: the `messengerPinCreate` flow is done once Finish answered, and the inbox snapshot follows. It shows the backup now exists, the same backup the PIN dialog asked for.

## What can go wrong

None seen: both calls answered 200 in 360-457 ms. A failure would only delay the backup; the PIN is already set and the inbox stays open.
