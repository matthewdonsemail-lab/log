# ProfileCometTimelineListViewRootQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `28845972318370907` |
| Path | `/api/graphql/` |
| Sends | `previousProfileId`, `privacySelectorRenderLocation`, `referringStoryRenderLocation`, `renderLocation`, `scale`, `useDefaultActor`, `userID`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__GroupsCometGroupChatLazyLoadLastMessageSnippetrelayprovider`, `__relay_internal__pv__ProfileCometFeaturedHighlightsPortraitAspectRatioGKrelayprovider`, `__relay_internal__pv__WebPixelRatiorelayprovider` |
| Reads | `user.should_hide_visitor_content_on_timeline`, `user.should_hide_privacy_filters`, `user.if_viewer_has_professional_dashboard`, `user.profile_composer_info`, `user.highlight_units_section`, `user.delegate_page`, `user....ProfileCometTimelineAuxColumn_user`, `user....ProfileCometTimelineTabTopBanner_user`, `user....ProfileCometTimelineTabFeedBanner_user`, `user....ProfileCometTimelineTabTopOfMallBanner_user`, `viewer....ProfileCometTimelineAuxColumn_viewer`, `nux....ProfileCometTimelineAuxColumn_mentionsNux` |
| Called from | `ProfileCometTimelineListViewRoot.react` |
| rea | `ev_db17f8eb00d5efa8d2f2f5f6dda61c5c7143c66d74f9d62fc7e2f1d220d96f98` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | POST 200 /ajax/bulk-route-definitions/ (752 ms) | 1 | 200 | 647 ms | 5070 ms | — |
| host | step 9: saveState | 1 | 200 | 419 ms | 1539 ms | — |

<!-- facts:end -->

## What it does

Loads the frame of a profile's timeline: the side column, banners, the profile composer and whether the viewer has a professional dashboard (`user.if_viewer_has_professional_dashboard`). Fired with the header, in 0.4-0.6 s.

## What our machine does with it

Nothing directly: the profile machine works in the header. It is part of the own-profile load the page check accepts.

## What can go wrong

Nothing for our runs; an error leaves the timeline's frame empty, not the header.
