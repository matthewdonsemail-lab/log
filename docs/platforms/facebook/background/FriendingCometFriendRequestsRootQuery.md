# FriendingCometFriendRequestsRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28020143907666118` |
| Path | `/api/graphql/` |
| Sends | `scale` |
| Reads | `viewer.friend_requests`, `viewer.should_show_proactive_friending_alert`, `viewer.max_friend_limit`, `viewer....FriendingCometFriendRequestsSectionPanel_viewerConnection`, `viewer.should_show_osa_explainer` |
| Called from | `FriendingCometFriendRequestsRoot.react` |
| rea | `ev_60448a387862bd9641e318b90c7c21ac41a46bae07de13b195f7c7773aeab539` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 7: goto / | 1 | 200 | 467 ms | 118255 ms | — |

<!-- facts:end -->

## What it does

The friend requests panel on the home page: the account's pending friend requests, whether to show a friending alert, and its friend limit (`viewer.friend_requests`, `viewer.max_friend_limit`). It loaded about two minutes into step 7, the home feed.

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
