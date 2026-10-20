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

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | rea read step 11_clickroleButtonNextCard: exit 0, ev_189e7df832ac014018be21a4d2fe3eb4b862d | 1 | 200 | 944 ms | 989 ms | — |
| inspect | rea read step 20_clickroleButtonNextCard: exit 0, ev_b8ad981adedd3a055cbb6fd651deb9976e71e | 1 | 200 | 717 ms | 1154 ms | — |
| inspect | step 8: clickAny 1 x link /see owner profile$/ | 1 | 200 | 757 ms | 1915 ms | — |
| inspect | step 19: clickAny 1 x link /see owner profile$/ | 1 | 200 | 610 ms | 2108 ms | — |

<!-- facts:end -->

## What it does

Loads a profile's header: name, profile picture, cover photo and the edit buttons (`shouldUseFXIMProfilePicEditor` picks the Accounts Center picture editor). It fires as soon as `/me` resolves, 5 s after the route definitions, in 1.0-1.5 s.

## What our machine does with it

The `profileSetup` flow clicks the header's picture and cover controls, so this is the request that puts them on the page: a step that looks for them before it answers finds nothing. The page check (`pageCheck.ts`) accepts `/me` landing on `/profile.php` or a vanity path, which is what this header is loaded for.

## What can go wrong

No sighting after `/me` means the profile never rendered (signed out or a checkpoint: the page check reports `loginWall` or `checkpointed`). A 200 with an error leaves the header without its edit controls, so the profile steps fail `pageNotReached` instead of clicking blind.
