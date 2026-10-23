# CometMarketplaceInboxSellerTabThreadViewContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28084990444460312` |
| Path | `/api/graphql/` |
| Sends | `availabilities`, `filterLabels`, `listingId`, `lookBackInDays`, `search`, `unreadOnly` |
| Reads | `viewer....CometMarketplaceInboxSellerTabThreadView_viewer` |
| Called from | `CometMarketplaceInboxSellerTabThreadViewContainer.react` |
| rea | `ev_fc63e98f46e063737ab32b1a0cc16802e92ec469b6ff41b72407ec3fa04b31f8` |

Seen 10 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /marketplace/inbox | 2 | 200 | 659–1209 ms | 6540–20812 ms | — |
| inspect | step 8: goto /marketplace/inbox | 1 | 200 | 753 ms | 4340 ms | — |
| inspect | step 11: goto /marketplace/inbox | 1 | 200 | 635 ms | 2167 ms | — |
| inspect | step 3: goto /marketplace/inbox | 3 | 200 | 531–833 ms | 3978–70619 ms | — |
| inspect | step 4: goto /marketplace/inbox | 1 | 200 | 2088 ms | 2644 ms | — |
| inspect | step 6: goto /marketplace/inbox | 2 | 200 | 693–1205 ms | 2233–1514806 ms | — |

<!-- facts:end -->

## What it does

The seller tab of Marketplace's inbox (`/marketplace/inbox?targetTab=SELLER`): the account's buyer chats about its listings (`marketplaceInboxSellerMessageThreads.edges`, with `page_info`). It sends the inbox's filters (`listingId`, `unreadOnly`, `lookBackInDays`, `search`, `filterLabels`, `availabilities`). On Bethlehem (inspect 20261022T113536) it fired as the inbox loaded and answered with no threads (`edges: []`).

## What our machine does with it

It is what the Marketplace check reads for chats (`sellerInboxOf`, `src/facebook/marketplace/check`; rule 69): every host round and `log facebook check`. With no threads it says so; with some it counts them and keeps them as sent in the run folder, because a thread's own fields aren't mapped until a recording holds a real one (rule 29). Mapping them is how chats will reach Twenty's conversations (rule 34).

## What can go wrong

None seen: three calls, 200 in 659-1209 ms. If it failed or didn't fire, the check says "the seller inbox didn't load" and moves Twenty nothing; the host's next round reads it again.
