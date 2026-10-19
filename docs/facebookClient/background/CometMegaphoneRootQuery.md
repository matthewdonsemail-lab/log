# CometMegaphoneRootQuery

<!-- facts:start · written by `log firefoxCapture --docs` from the run captures and rea. Not edited by hand. -->

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

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| publish | Opening /marketplace/create/item | 1 | 200 | 1044 ms | 11856 ms | — |

<!-- facts:end -->

## What it does

The banner slot at the top of the page (announcements, prompts).

## What our machine does with it

Nothing. It is part of the page around our flow; no state of `marketplace/connect` or `marketplace/publish` waits for it or reads it.

## What can go wrong

Nothing for our flow. Watch it only for change: if it disappears from a page where it always loads, or starts returning errors, the page did not load normally, and that is worth reading back (rule 25).
