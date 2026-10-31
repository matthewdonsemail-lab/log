# MarketplacePDPContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28624035420589679` |
| Path | `/api/graphql/` |
| Sends | `adId`, `enableJobEmployerActionBar`, `enableJobSeekerActionBar`, `feedLocation`, `feedbackSource`, `focusCommentID`, `imageContext`, `includePDPParityContent`, `referralCode`, `referralSurfaceString`, `scale`, `shouldFetchLoggedOutSimilarListings`, `targetId`, `useDefaultActor`, `__relay_internal__pv__MarketplacePDPShouldUseListingRevamprelayprovider`, `__relay_internal__pv__MarketplacePDPCometSimilarListingsrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowRelatedSearchesrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowLoggedOutSellerTrustrelayprovider`, `__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider`, `__relay_internal__pv__MarketplacePDPIsLoggedOutrelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowBSGRecommendationsrelayprovider`, `__relay_internal__pv__MarketplacePDPJobShouldShowSharedGroupsSectionrelayprovider`, `__relay_internal__pv__MarketplacePDPJobIsShareToGroupsEnabledOnCometrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowFAQrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowRelatedCategoriesrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowSupportFooterrelayprovider` |
| Reads | `viewer....MarketplaceCometFeatureAccessProvider_viewer`, `viewer.marketplace_product_details_page` |
| Called from | `MarketplacePDPContainer.react`, `MarketplacePDPParityContent.react` |
| rea | `ev_d46c0449b06376744e8d1c234ac3ed7b57f4b1083561934118027ae705d8043b` |

Seen 15 time(s) in 7 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +127px in 4 wheel steps, 125 ms | 1 | 200 | 2229 ms | 2119 ms | — |
| warmup | scroll: -605px in 14 wheel steps, 687 ms | 1 | 200 | 666 ms | 1694 ms | — |
| warmup | step 10: openAny 2-4 x /marketplace/item/ | 2 | 200 | 2072–2191 ms | 249–2098 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 874 ms | 3302 ms | — |
| warmup | scroll: -756px in 16 wheel steps, 656 ms | 1 | 200 | 975 ms | 687 ms | — |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 1028 ms | 2391 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 1078 ms | 821 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 969 ms | 1233 ms | — |
| inspect | scroll: +161px in 5 wheel steps, 250 ms | 1 | 200 | 741 ms | 1882 ms | — |
| inspect | scroll: -161px in 5 wheel steps, 172 ms | 1 | 200 | 652 ms | 700 ms | — |
| warmup | scroll: -1034px in 22 wheel steps, 1032 ms | 1 | 200 | 694 ms | 800 ms | — |
| warmup | scroll: +981px in 24 wheel steps, 1672 ms | 1 | 200 | 920 ms | 2045 ms | — |
| host | scroll: -553px in 12 wheel steps, 499 ms | 1 | 200 | 479 ms | 609 ms | — |
| host | scroll: +617px in 15 wheel steps, 789 ms | 1 | 200 | 361 ms | 838 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, scroll: -553px in 12 wheel steps, 499 ms: 200, 479 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "enableJobEmployerActionBar": false,
    "enableJobSeekerActionBar": false,
    "feedbackSource": 56,
    "feedLocation": "MARKETPLACE_MEGAMALL",
    "referralCode": "marketplace_top_picks",
    "referralSurfaceString": "browse_tab",
    "scale": 1,
    "shouldFetchLoggedOutSimilarListings": false,
    "targetId": "1818774979262678",
    "useDefaultActor": false,
    "__relay_internal__pv__MarketplacePDPShouldUseListingRevamprelayprovider": false,
    "__relay_internal__pv__MarketplacePDPCometSimilarListingsrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPShouldShowRelatedSearchesrelayprovider": true,
    "__relay_internal__pv__MarketplacePDPShouldShowLoggedOutSellerTrustrelayprovider": false,
    "__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPIsLoggedOutrelayprovider": false,
    "__relay_internal__pv__CometUFIShareActionMigrationrelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider": true,
    "__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider": true,
    "__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider": "AUTO_TRANSLATE",
    "__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider": false,
    "__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider": true,
    "__relay_internal__pv__IsWorkUserrelayprovider": false,
    "__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider": false,
    "__relay_internal__pv__CometUFISingleLineUFIrelayprovider": true,
    "__relay_internal__pv__MarketplacePDPShouldShowBSGRecommendationsrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPJobShouldShowSharedGroupsSectionrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPJobIsShareToGroupsEnabledOnCometrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPShouldShowFAQrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPShouldShowRelatedCategoriesrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPShouldShowSupportFooterrelayprovider": false
  },
  "doc_id": "28624035420589679"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_age_verification_banner": null,
      "marketplace_feature_access_status": {
        "checkout_on_marketplace": "ELIGIBLE",
        "comment_on_bsg_listing": "ELIGIBLE",
        "comment_on_marketplace_listing": "ELIGIBLE",
        "message_seller_on_marketplace": "ELIGIBLE",
        "react_on_bsg_listing": "ELIGIBLE",
        "react_on_marketplace_listing": "ELIGIBLE",
        "see_seller_surfaces": "ELIGIBLE",
        "sell_on_marketplace": "ELIGIBLE",
        "view_seller_on_marketplace": "ELIGIBLE"
      },
      "marketplace_product_details_page": {
        "__typename": "MarketplaceForSaleItemProductDetailsPage",
        "product_details_type": "FOR_SALE_ITEM",
        "__isMarketplaceProductDetailsPage": "MarketplaceForSaleItemProductDetailsPage",
        "marketplace_listing_renderable_target": "(13 fields)",
        "target": "(124 fields)",
        "ufi_renderer": null,
        "viewer": "(4 fields)",
        "__module_operation_MarketplacePDP_page": "(1 fields)",
        "__module_component_MarketplacePDP_page": "(1 fields)",
        "id": "66:1818774979262678:IN_MEMORY_MARKETPLACE_PRODUCT_DETAILS_PAGE:MarketplaceC2CProductDetailsPage"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038228920,
      "time_at_flush_ms": 1793038229137
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": "(2 fields)",
        "jsmods": "(3 fields)",
        "allResources": "(7 items)",
        "tieredResources": "(3 fields)"
      }
    }
  }
}
```

**runs/host/20261026T180628_61594285317994**, scroll: +617px in 15 wheel steps, 789 ms: 200, 361 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "enableJobEmployerActionBar": false,
    "enableJobSeekerActionBar": false,
    "feedbackSource": 56,
    "feedLocation": "MARKETPLACE_MEGAMALL",
    "referralCode": "marketplace_general",
    "referralSurfaceString": "browse_tab",
    "scale": 1,
    "shouldFetchLoggedOutSimilarListings": false,
    "targetId": "2249546198922840",
    "useDefaultActor": false,
    "__relay_internal__pv__MarketplacePDPShouldUseListingRevamprelayprovider": false,
    "__relay_internal__pv__MarketplacePDPCometSimilarListingsrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPShouldShowRelatedSearchesrelayprovider": true,
    "__relay_internal__pv__MarketplacePDPShouldShowLoggedOutSellerTrustrelayprovider": false,
    "__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPIsLoggedOutrelayprovider": false,
    "__relay_internal__pv__CometUFIShareActionMigrationrelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider": true,
    "__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider": true,
    "__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider": true,
    "__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider": "AUTO_TRANSLATE",
    "__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider": false,
    "__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider": true,
    "__relay_internal__pv__IsWorkUserrelayprovider": false,
    "__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider": false,
    "__relay_internal__pv__CometUFISingleLineUFIrelayprovider": true,
    "__relay_internal__pv__MarketplacePDPShouldShowBSGRecommendationsrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPJobShouldShowSharedGroupsSectionrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPJobIsShareToGroupsEnabledOnCometrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPShouldShowFAQrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPShouldShowRelatedCategoriesrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPShouldShowSupportFooterrelayprovider": false
  },
  "doc_id": "28624035420589679"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_age_verification_banner": null,
      "marketplace_feature_access_status": {
        "checkout_on_marketplace": "ELIGIBLE",
        "comment_on_bsg_listing": "ELIGIBLE",
        "comment_on_marketplace_listing": "ELIGIBLE",
        "message_seller_on_marketplace": "ELIGIBLE",
        "react_on_bsg_listing": "ELIGIBLE",
        "react_on_marketplace_listing": "ELIGIBLE",
        "see_seller_surfaces": "ELIGIBLE",
        "sell_on_marketplace": "ELIGIBLE",
        "view_seller_on_marketplace": "ELIGIBLE"
      },
      "marketplace_product_details_page": {
        "__typename": "MarketplaceForSaleItemProductDetailsPage",
        "product_details_type": "FOR_SALE_ITEM",
        "__isMarketplaceProductDetailsPage": "MarketplaceForSaleItemProductDetailsPage",
        "marketplace_listing_renderable_target": "(13 fields)",
        "target": "(124 fields)",
        "ufi_renderer": null,
        "viewer": "(4 fields)",
        "__module_operation_MarketplacePDP_page": "(1 fields)",
        "__module_component_MarketplacePDP_page": "(1 fields)",
        "id": "66:2249546198922840:IN_MEMORY_MARKETPLACE_PRODUCT_DETAILS_PAGE:MarketplaceC2CProductDetailsPage"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793038239703,
      "time_at_flush_ms": 1793038239903
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": "(1 fields)",
        "jsmods": "(1 fields)",
        "allResources": "(1 items)",
        "tieredResources": "(3 fields)"
      }
    }
  }
}
```

<!-- facts:end -->

## What it does

Loads a Marketplace listing's page (PDP): the listing itself (`viewer.marketplace_product_details_page`) and what the viewer may do on Marketplace (`MarketplaceCometFeatureAccessProvider_viewer`), from `targetId`. It fired 3 times in 2 runs, 0.8-2.0 s into the step that opened a listing.

## What our machine does with it

The feed warm-up's `openListings` (`openAny /marketplace/item/`) opens the listing that sends it; the step passes on the listing's URL, not on this response. It is the first request that says the listing page has content, so it is what a settle on the listing (instead of a fixed wait) would wait for.

## What can go wrong

None seen: all three answered 200 in 969-1078 ms. A slow answer only delays the listing's content; the step does not read it.
