# MWQuickPromotionThreadlistBannerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27805253425807021` |
| Path | `/api/graphql/` |
| Sends | — |
| Reads | `viewer.eligible_promotions` |
| Called from | `MWQuickPromotionThreadlistBanner.react` |
| rea | `ev_53d322ba1b4a1e349ff941bf53186d5d9121e16f87cd8d7e1191528918759b00` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | step 25: goto /messages/ | 2 | 200 | 361–379 ms | 3052–4257 ms | — |

<!-- facts:end -->

## What it does

Messenger's banner above the chat list (`MWQuickPromotionThreadlistBanner.react`): it asks which promotions the account may be shown there (`viewer.eligible_promotions`). Both times it fired 3-4 s after the warm-up's step 25 opened /messages/, alongside the inbox's other requests, while the "Create a PIN to access your chats on any device" dialog was up.

## What our machine does with it

Nothing waits for it or reads it. It is part of Messenger loading: the warm-up's `messagesVisit` goto (`warmupMessagesVisit`, step s05) only waits for the page to land on /messages/. What stops the inbox is the PIN dialog, a page state of its own (`messengerPinCreate`, `src/browser/flow/helpers/pageState.ts`), not this banner.

## What can go wrong

None seen: both calls answered 200 in 361-379 ms. If it failed, only the banner would be missing; the chat list and the PIN dialog don't depend on it.
