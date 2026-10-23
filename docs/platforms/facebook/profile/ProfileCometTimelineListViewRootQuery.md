# ProfileCometTimelineListViewRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | `29000545646228452` |
| Path | `/api/graphql/` |
| Sends | `previousProfileId`, `privacySelectorRenderLocation`, `referringStoryRenderLocation`, `renderLocation`, `scale`, `useDefaultActor`, `userID`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider`, `__relay_internal__pv__GroupsCometGroupChatLazyLoadLastMessageSnippetrelayprovider`, `__relay_internal__pv__ProfileCometFeaturedHighlightsPortraitAspectRatioGKrelayprovider`, `__relay_internal__pv__WebPixelRatiorelayprovider` |
| Reads | `user.should_hide_visitor_content_on_timeline`, `user.should_hide_privacy_filters`, `user.if_viewer_has_professional_dashboard`, `user.profile_composer_info`, `user.highlight_units_section`, `user.delegate_page`, `user....ProfileCometTimelineAuxColumn_user`, `user....ProfileCometTimelineTabTopBanner_user`, `user....ProfileCometTimelineTabFeedBanner_user`, `user....ProfileCometTimelineTabTopOfMallBanner_user`, `viewer....ProfileCometTimelineAuxColumn_viewer`, `nux....ProfileCometTimelineAuxColumn_mentionsNux` |
| Called from | `ProfileCometTimelineListViewRoot.react` |
| rea | `ev_c3e882535cc14405a113b62c48091b838c63c9f6b191710a18a6d1bc6f873bf6` |

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | POST 200 /ajax/bulk-route-definitions/ (752 ms) | 1 | 200 | 647 ms | 5070 ms | — |
| host | step 9: saveState | 1 | 200 | 419 ms | 1539 ms | — |
| inspect | step 7: goto / | 1 | 200 | 1073 ms | 118258 ms | — |

<!-- facts:end -->

## What it does

Loads the frame of a profile's timeline: the side column, banners, the profile composer and whether the viewer has a professional dashboard (`user.if_viewer_has_professional_dashboard`). Fired with the header, in 0.4-0.6 s.

## What our machine does with it

Nothing directly: the profile machine works in the header. It is part of the own-profile load the page check accepts.

## What can go wrong

Nothing for our runs; an error leaves the timeline's frame empty, not the header.
