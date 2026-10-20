# CometHovercardQueryRendererQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `29231152373168310` |
| Path | `/api/graphql/` |
| Sends | `actionBarRenderLocation`, `context`, `entityID`, `groupID`, `scale`, `__relay_internal__pv__WorkCometIsEmployeeGKProviderrelayprovider` |
| Reads | `node....CometHovercard_entity` |
| Called from | `CometHovercardQueryRenderer.react` |
| rea | `ev_95529720f6ba751fe065571b8fd81d09f67f7e4539594c0761343470652ec320` |

Seen 6 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e2647 | 1 | 200 | 402 ms | 93 ms | — |
| inspect | POST 200 /ajax/bulk-route-definitions/ (319 ms) | 2 | 200 | 1033–1125 ms | 2205–2922 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261019T212 | 1 | 200 | 340 ms | 24077 ms | — |
| inspect | step 6: back | 2 | 200 | 361–367 ms | 396–1247 ms | — |

<!-- facts:end -->

## What it does

Loads a hover card when the cursor rests on a person or page link.

## What our machine does with it

Nothing. It fired during the flow's cursor moves (humanize, rule 11).

## What can go wrong

Harmless.
