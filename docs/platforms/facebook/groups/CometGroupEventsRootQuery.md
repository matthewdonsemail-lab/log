# CometGroupEventsRootQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `38976640968648949` |
| Path | `/api/graphql/` |
| Sends | `count`, `groupID`, `scale` |
| Reads | `group.if_viewer_can_create_event`, `group.if_viewer_can_post`, `group.feature_intervention`, `group....GroupsCometEventUpcomingSection_group`, `group....GroupsCometEventUpcomingSection_upcomingEvents`, `group....GroupsCometEventPastSection_group`, `group....GroupsCometEventPastSection_pastEvents`, `group.all_past_events` |
| Called from | `CometGroupEventsRoot.react` |
| rea | `ev_0d164f4db166a85cdf84b1de739f0bb9b5f84ea7bd497b14fa99b169cc2950c3` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 7: clickRole tab "…" | 1 | 200 | 1164 ms | 972 ms | — |

<!-- facts:end -->

## What it does

The Events tab (`CometGroupEventsRoot.react`, `/groups/<id>/events`): by `groupID` and a `count` it loads the upcoming and past events and whether the account can create one or post. In run 20261020T153648 step 7 it fired 1.0 s after the tab click, 1164 ms, 200.

## What our machine does with it

No machine waits for it or reads it. The group read (`src/group/read`) stays on the Discussion tab and never opens this one. The flow [`groupTabs`](../flows/groupTabs.md) clicks the tab and waits for no request: a page-load query isn't a confirming request, only a mutation is (`confirmingRequest`). The tab's Interested, Going, Invite and Share buttons are writes and were not pressed.

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the tab would show Facebook's own error panel instead of its content; the flow's click would still pass, and nothing on Facebook changes, since it only reads.
