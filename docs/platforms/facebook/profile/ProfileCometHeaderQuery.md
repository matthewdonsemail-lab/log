# ProfileCometHeaderQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `28621615384199313` |
| Path | `/api/graphql/` |
| Sends | `scale`, `shouldUseFXIMProfilePicEditor`, `userID`, `selectedID`, `selectedSpaceType` |
| Reads | — |
| Called from | `ProfileCometHeader.react` |
| rea | `ev_4cedb55954fe0c35463d9aac371107df285f48cd40a1dfe186a84c7c4647ff7d` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | POST 200 /ajax/bulk-route-definitions/ (752 ms) | 1 | 200 | 965 ms | 5056 ms | — |
| host | step 9: saveState | 1 | 200 | 1540 ms | 1524 ms | — |

<!-- facts:end -->

## What it does

Loads a profile's header: name, profile picture, cover photo and the edit buttons (`shouldUseFXIMProfilePicEditor` picks the Accounts Center picture editor). It fires as soon as `/me` resolves, 5 s after the route definitions, in 1.0-1.5 s.

## What our machine does with it

The `profileSetup` flow clicks the header's picture and cover controls, so this is the request that puts them on the page: a step that looks for them before it answers finds nothing. The page check (`pageCheck.ts`) accepts `/me` landing on `/profile.php` or a vanity path, which is what this header is loaded for.

## What can go wrong

No sighting after `/me` means the profile never rendered (signed out or a checkpoint: the page check reports `loginWall` or `checkpointed`). A 200 with an error leaves the header without its edit controls, so the profile steps fail `pageNotReached` instead of clicking blind.
