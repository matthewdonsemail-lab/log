# CometMarketplaceYouFeedCardMoreMenuTargetQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28716475871275076` |
| Path | `/api/graphql/` |
| Sends | `id`, `__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider` |
| Reads | `node....CometMarketplaceYouFeedCardBoostOption_target`, `node....useCometMarketplaceBoostListingCTAButtonInfo_target`, `node....CometMarketplaceYouFeedCardDeleteOption_feedItem`, `node....CometMarketplaceYouFeedCardRenewOption_feedItem`, `node....CometUFIShareToFriendsFeedMenuItem_entity`, `node....CometMarketplaceCopyLinkOption_entity`, `node....CometMarketplaceYouFeedMarkAsSoldOption_target`, `node....useMarketplaceCanRelistAndDeleteListing_listing`, `node....CometMarketplaceCMListingNoticeMenuItem_listing` |
| Called from | `CometMarketplaceYouFeedCardMoreMenu.react` |
| rea | `ev_aa0bb75c6b347e930f623f1cffed84324ad9cc4ced229a420bf1b5c98c70ca53` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: click e356 | 1 | 200 | 549 ms | 938 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T173652_61594063207669**, step 3: click e356: 200, 549 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceYouFeedCardMoreMenuTargetQuery",
  "server_timestamps": "true",
  "variables": {
    "id": "1425935622848350",
    "__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider": false
  },
  "doc_id": "28716475871275076"
}
```

Answered:

```json
{
  "data": {
    "node": {
      "__typename": "GroupCommerceProductItem",
      "__isMarketplaceListingWithDeliveryOptions": "GroupCommerceProductItem",
      "is_view_order_enabled": false,
      "__isMarketplaceListingRenderable": "GroupCommerceProductItem",
      "product_item": {
        "for_sale_item": {
          "id": "1425935622848350"
        },
        "id": "28800458926283039",
        "boosted_marketplace_listing": null,
        "promoted_listing": {
          "button_text": "Promote now",
          "page_id": "1383267438207114",
          "product_item_override": {
            "id": "28800458926283039"
          },
          "coupon_offer_id": null
        },
        "product_catalog": {
          "id": "1116789430997720"
        }
      },
      "__isMarketplaceListingWithIntegrityStatus": "GroupCommerceProductItem",
      "listing_is_rejected": false,
      "can_share": true,
      "listing_price": {
        "currency": "USD"
      },
      "id": "1425935622848350",
      "is_pending": false,
      "is_hidden": false,
      "is_seller_business_onboarded": false,
      "is_sold": false,
      "is_draft": false,
      "is_viewer_seller": true,
      "reportable_ent_id": "28800458926283039",
      "marketplace_listing_seller": {
        "__typename": "User",
        "id": "61594063207669"
      },
      "story": {
        "id": "UzpfSTYxNTk0MDYzMjA3NjY5OlZLOjE0MjU5MzU2MjI4NDgzNTA="
      },
      "is_duplicate": false,
      "cross_post_info": {
        "is_posted_to_marketplace": true
      },
      "marketplace_bump_info": {
        "bump_count": 0,
        "days_until_next_bump": 6,
        "max_bump_count": 100000
      },
      "__isEntity": "GroupCommerceProductItem",
      "url": "https://www.facebook.com/marketplace/item/1425935622848350/",
      "__isGroupCommerceProductItemIsDeprecated": "GroupCommerceProductItem",
      "all_message_threads": {
        "is_empty": true
      },
      "should_show_txn_survey_on_mas": true,
      "__isMarketplaceListingWithCopyAndDelete": "GroupCommerceProductItem",
      "can_copy_and_delete": null
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792777112583,
      "time_at_flush_ms": 1792777112776
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Loads the listing behind a Selling card's More options (•••) menu when it opens: sent `id` (the listing), answered with `data.node`, the listing (`product_item.for_sale_item.id`, `url`, whether it is boosted, its catalog). The menu (Renew, Mark as pending, View, Share, Copy link, Edit, Delete listing, View messages) is built from it. Fires on the click, about half a second.

## What our machine does with it

`marketplaceListingDelete` step `s02_clickMoreOptions` waits for it, and its answer decides the step (rule 73): `data.node.product_item.for_sale_item.id` must be the `listingId` the run was given, so the menu that opened belongs to the listing we mean to delete before Delete is ever pressed.

## What can go wrong

Seen with 200 only. If it names another id, the card clicked by title was the wrong listing: the step fails with `answerNotAsExpected` and nothing is deleted. If it never answers, the step fails the same way (rule 73).
