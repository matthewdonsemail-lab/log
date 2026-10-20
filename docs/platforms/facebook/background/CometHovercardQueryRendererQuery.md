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

Seen 14 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: clickRole button "…" | 2 | 200 | 666–979 ms | 4347–6784 ms | — |
| inspect | step 4: scrollIn heading "…" 2-3 x 300-500px | 1 | 200 | 643 ms | 421 ms | — |
| inspect | scroll: +353px in 8 wheel steps, 265 ms | 1 | 200 | 766 ms | 3678 ms | — |
| inspect | clickAny: 1 link /see owner profile$/ | 1 | 200 | 731 ms | 7607 ms | — |
| inspect | step 6: scrollIn heading "…" 2-3 x 300-500px | 1 | 200 | 980 ms | 599 ms | — |
| inspect | step 17: scrollIn heading "…" 2-3 x 300-500px | 2 | 200 | 781–879 ms | 383–857 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T052 | 1 | 200 | 738 ms | 247 ms | — |
| inspect | step 48: clickRole button "…" | 2 | 200 | 633–930 ms | 4116–6490 ms | — |
| inspect | step 49: scrollIn heading "…" 2-3 x 300-500px | 3 | 200 | 673–911 ms | 319–2152 ms | — |

<!-- facts:end -->

## What it does

Loads a hover card when the cursor rests on a person or page link.

## What our machine does with it

Nothing. It fired during the flow's cursor moves (humanize, rule 11).

## What can go wrong

Harmless.
