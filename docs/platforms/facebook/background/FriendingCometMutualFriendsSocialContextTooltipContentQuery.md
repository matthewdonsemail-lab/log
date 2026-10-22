# FriendingCometMutualFriendsSocialContextTooltipContentQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `23890617217238423` |
| Path | `/api/graphql/` |
| Sends | `count`, `ordering`, `userIDs` |
| Reads | `nodes` |
| Called from | `FriendingCometMutualFriendsSocialContextTooltipContent.react` |
| rea | `ev_d13924766ed06c4b36d0ad0ff5252538707118b04812f64831980744ac740c56` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\host\20261019T163027 | 1 | 200 | 539 ms | 25706 ms | — |

<!-- facts:end -->

## What it does

Fills the mutual-friends tooltip when the pointer rests on a person's name (`userIDs` in, `nodes` out). It fired once while the host's account check looked at the page, from the human mouse's idle loop passing over a name.

## What our machine does with it

Nothing: it is a side effect of the cursor's loose loops around what is looked at (rule 32), not of a click. It is evidence that hovering is seen by Facebook, as a person's would be.

## What can go wrong

Nothing for our runs. An error only leaves the tooltip empty.
