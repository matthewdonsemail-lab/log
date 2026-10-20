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

Seen 39 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 12: nextPost | 1 | 200 | 895 ms | 107 ms | — |
| inspect | step 14: nextPost | 1 | 200 | 1101 ms | 147 ms | — |
| inspect | mouse: 1 flick, 1 wander, 1 scrollPosition; 1 idle drift move(s) | 1 | 200 | 1231 ms | 36 ms | — |
| inspect | post: "…", 70 words, 1 image(s), scrolled 876 px | 1 | 200 | 1016 ms | 274 ms | — |
| inspect | step 20: nextPost | 1 | 200 | 1786 ms | 880 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T105 | 1 | 200 | 958 ms | 35 ms | — |
| inspect | rea read step 09_dwell033s: exit 0, ev_66946c26067d2fb6dc287e1c0e0b43c73fe271994ff34f60250 | 1 | 200 | 879 ms | 118 ms | — |
| inspect | post: "…", 53 words, 1 image(s), scrolled 715 px | 1 | 200 | 675 ms | 385 ms | — |
| inspect | rea read step 14_dwell088s: exit 0, ev_0afb3cfea9e69c740a06eccbc8e4060b7fcab9fd634ef0253f1 | 1 | 200 | 891 ms | 406 ms | — |
| inspect | rea read step 16_nextpost: exit 0, ev_5e5814a0702fe89467bac4d85dd1551c63b8e34c12a503a7f2b0 | 1 | 200 | 666 ms | 116 ms | — |
| inspect | POST 200 /ajax/bulk-route-definitions/ (730 ms) | 1 | 200 | 553 ms | 0 ms | — |
| inspect | rea read step 20_nextpost: exit 0, ev_1cb48914c0e0ac7916797fc625a8afdef40fc3e958502d4ac406 | 1 | 200 | 700 ms | 538 ms | — |
| inspect | rea read step 21_nextpost: exit 0, ev_290a368a021d2c7d72802aad675f1757eb95e384e175fda02f25 | 1 | 200 | 695 ms | 701 ms | — |
| inspect | rea read step 22_likepostLike: exit 0, ev_540383c4fa642403a764fbc232e14ac51cafa5f313056b88 | 1 | 200 | 903 ms | 22141 ms | — |
| inspect | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T103 | 2 | 200 | 1059–1074 ms | 167–1381 ms | — |
| inspect | page has 41 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T103 | 1 | 200 | 555 ms | 4542 ms | — |
| inspect | step 29: clickRole button "…" | 1 | 200 | 956 ms | 1924 ms | — |
| inspect | step 31: clickRole button "…" | 1 | 200 | 1147 ms | 2958 ms | — |
| inspect | step 1: goto / | 1 | 200 | 777 ms | 13840 ms | — |
| inspect | step 7: nextPost | 2 | 200 | 688–721 ms | 763–876 ms | — |
| inspect | rea read step 06_dwell026s: exit 0, ev_54e990657a369f1a2e920d90ccc593c5ed8b3f69be5abf13b4b | 1 | 200 | 1144 ms | 1847 ms | — |
| inspect | rea read step 14_nextpost: exit 0, ev_6209fcf52acf0f7a90e081fed57af389f95de778645cfd8464dd | 2 | 200 | 546–1157 ms | 19840–52529 ms | — |
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
