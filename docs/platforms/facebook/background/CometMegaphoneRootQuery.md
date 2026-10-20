# CometMegaphoneRootQuery

<!-- facts:start · written by `log capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28541893478753857` |
| Path | `/api/graphql/` |
| Sends | `first`, `scale` |
| Reads | `viewer.megaphonePromotions` |
| Called from | `CometMegaphoneRoot.react` |
| rea | `ev_a2e1e82b09a10f9f97361e424dc787adb4a3a8c0a7bb15f7feb91de015e7d2fa` |

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | rea read step 24_clickroleButtonNextCard: exit 0, ev_08bd0b0aa3e491db75fd341d53b6ccf63883a | 1 | 200 | 739 ms | 1250244 ms | — |
| inspect | step 3: clickRole button "…" | 1 | 200 | 613 ms | 5493 ms | — |
| inspect | page has 46 interactive element(s); snapshot: C:\Users\0\.logCli\runs\inspect\20261020T052 | 1 | 200 | 518 ms | 2578 ms | — |

<!-- facts:end -->

## What it does

The banner slot at the top of the page (announcements, prompts).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
