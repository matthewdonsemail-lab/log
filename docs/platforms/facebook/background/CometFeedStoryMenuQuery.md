# CometFeedStoryMenuQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `39102912022688640` |
| Path | `/api/graphql/` |
| Sends | `crosspostCallerName`, `crosspostCustomPartnerParams`, `crosspostServiceNames`, `feed_location`, `feed_menu_icon_variant`, `id`, `renderLocation`, `scale`, `serialized_frtp_identifiers`, `serialized_unconnected_waist_ranking_info`, `shouldFetchCrosspostMetadata`, `story_debug_info`, `__relay_internal__pv__CometFeedStoryCopyLinkMenuItem_isLinkSharingEnabledrelayprovider` |
| Reads | `...useFBToIGCrosspostingMetadata`, `feed_unit` |
| Called from | `CometFeedStoryMenu.react` |
| rea | `ev_298937cf9b49d4eb800a25c50304322c7691c275e325a816f8810c9f78728da4` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 14: clickRole button "…" | 1 | 200 | 2405 ms | 1936 ms | — |
| inspect | step 22: clickRole button "…" | 1 | 200 | 792 ms | 841 ms | — |

<!-- facts:end -->

## What it does

The post's own menu, the "Actions for this post by ..." button (`CometFeedStoryMenu.react`). It loads, for the story `id` and where it is shown (`feed_location`, `renderLocation`), the items the menu offers: notifications for the post, report to the group's admins, hide, report, and the cross-posting metadata. In run 20261020T153648 step 22 it fired 0.8 s after the click, 792 ms, 200.

## What our machine does with it

No machine waits for it or reads it. The menu was opened and closed with Escape (step 23); no item was picked, so nothing was saved, hidden or reported (rule 8). The post's author is in the button's name, so no flow is built from it.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the menu would open with fewer items or not at all; nothing changes on Facebook until an item is picked, which no flow does.
