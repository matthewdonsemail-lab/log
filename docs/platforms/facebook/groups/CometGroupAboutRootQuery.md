# CometGroupAboutRootQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `28729876439996579` |
| Path | `/api/graphql/` |
| Sends | `groupID`, `scale` |
| Reads | — |
| Called from | `CometGroupAboutRoot.react` |
| rea | `ev_16e1145e8959de2a75a976bb79741deaa96e08156aa808753dada9db545c7d72` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 10: clickRole tab "…" | 1 | 200 | 795 ms | 1334 ms | — |

<!-- facts:end -->

## What it does

The group's About tab (`CometGroupAboutRoot.react`, `/groups/<id>/about`): by `groupID` it loads the description, history, member summary, activity and the admins' rules. In run 20261020T153648 step 10 it fired 1.3 s after the tab click, 795 ms, 200, after `CometGroupRootQuery` (the header).

## What our machine does with it

No machine waits for it or reads it. The group read (`src/group/read`) stays on the Discussion tab and never opens this one. The flow [`groupTabs`](../flows/groupTabs.md) clicks the tab and waits for no request: a page-load query isn't a confirming request, only a mutation is (`confirmingRequest`).

## What can go wrong

Only a 200 has been seen, in one run. If it failed, the tab would show Facebook's own error panel instead of its content; the flow's click would still pass, and nothing on Facebook changes, since it only reads.
