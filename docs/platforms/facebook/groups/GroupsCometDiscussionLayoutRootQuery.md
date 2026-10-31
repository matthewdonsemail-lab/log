# GroupsCometDiscussionLayoutRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `28362840073412508` |
| Path | `/api/graphql/` |
| Sends | `groupID`, `scale`, `__relay_internal__pv__GroupsCometGroupChatLazyLoadLastMessageSnippetrelayprovider` |
| Reads | — |
| Called from | `GroupsCometDiscussionLayoutRoot.react` |
| rea | `ev_3c4bec6d1ee592a87eefb29b5e39e83c5b10fd1b7fed6b6222ff13bc48050b69` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 42: clickRole tab "…" | 1 | 200 | 2451 ms | 848 ms | — |

<!-- facts:end -->

## What it does

Loads the layout around a group's discussion tab (`GroupsCometDiscussionLayoutRoot.react`) by `groupID`. It fired 1888 ms after step 5 (click e2647) and 6105 ms after step 7 (click e2606), with the other group page requests.

## What our machine does with it

Nothing. `groupJoin` decides from the group page's HTML and its snapshot (`readJoinOptions`, `readGroupPage`), not from this request; it is only named in a domain test (`facebookClient.test.ts`).

## What can go wrong

None seen: both calls 200, in 645-716 ms. If the step fails anyway, `groupJoin` stops on the page, not on this request: a checkpoint or login page (`pageProblem`) or a failed step gives `groupPageNotOpened` or `groupJoinNotConfirmed`.
