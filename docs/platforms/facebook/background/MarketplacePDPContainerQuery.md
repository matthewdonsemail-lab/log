# MarketplacePDPContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `28939900068975315` |
| Path | `/api/graphql/` |
| Sends | `adId`, `enableJobEmployerActionBar`, `enableJobSeekerActionBar`, `feedLocation`, `feedbackSource`, `focusCommentID`, `imageContext`, `includePDPParityContent`, `referralCode`, `referralSurfaceString`, `scale`, `shouldFetchLoggedOutSimilarListings`, `targetId`, `useDefaultActor`, `__relay_internal__pv__MarketplacePDPShouldUseListingRevamprelayprovider`, `__relay_internal__pv__MarketplacePDPCometSimilarListingsrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowRelatedSearchesrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowLoggedOutSellerTrustrelayprovider`, `__relay_internal__pv__ShouldUpdateMarketplaceBoostListingBoostedStatusrelayprovider`, `__relay_internal__pv__MarketplacePDPIsLoggedOutrelayprovider`, `__relay_internal__pv__CometUFIShareActionMigrationrelayprovider`, `__relay_internal__pv__GHLShouldChangeSponsoredDataFieldNamerelayprovider`, `__relay_internal__pv__GHLShouldChangeAdIdFieldNamerelayprovider`, `__relay_internal__pv__CometUFI_dedicated_comment_routable_dialog_gkrelayprovider`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider`, `__relay_internal__pv__CometUFIReactionsEnableShortNamerelayprovider`, `__relay_internal__pv__CometUFISingleLineUFIrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowBSGRecommendationsrelayprovider`, `__relay_internal__pv__MarketplacePDPJobShouldShowSharedGroupsSectionrelayprovider`, `__relay_internal__pv__MarketplacePDPJobIsShareToGroupsEnabledOnCometrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowFAQrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowRelatedCategoriesrelayprovider`, `__relay_internal__pv__MarketplacePDPShouldShowSupportFooterrelayprovider` |
| Reads | `viewer....MarketplaceCometFeatureAccessProvider_viewer`, `viewer.marketplace_product_details_page` |
| Called from | `MarketplacePDPContainer.react` |
| rea | `ev_e0f3f569280c4ef4d202f378e4d477cf2cbc213bcf95eb510861821e9e1b57ee` |

Seen 10 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +127px in 4 wheel steps, 125 ms | 1 | 200 | 2229 ms | 2119 ms | — |
| warmup | scroll: -605px in 14 wheel steps, 687 ms | 1 | 200 | 666 ms | 1694 ms | — |
| warmup | step 10: openAny 2-4 x /marketplace/item/ | 1 | 200 | 2072 ms | 2098 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 874 ms | 3302 ms | — |
| warmup | scroll: -756px in 16 wheel steps, 656 ms | 1 | 200 | 975 ms | 687 ms | — |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 1028 ms | 2391 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 1078 ms | 821 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 969 ms | 1233 ms | — |
| inspect | scroll: +161px in 5 wheel steps, 250 ms | 1 | 200 | 741 ms | 1882 ms | — |
| inspect | scroll: -161px in 5 wheel steps, 172 ms | 1 | 200 | 652 ms | 700 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, scroll: +161px in 5 wheel steps, 250 ms: 200, 741 ms

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
    "targetId": "39887208997530861",
    "useDefaultActor": false,
    "__relay_internal__pv__MarketplacePDPShouldUseListingRevamprelayprovider": false,
    "__relay_internal__pv__MarketplacePDPCometSimilarListingsrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPShouldShowRelatedSearchesrelayprovider": false,
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
  "doc_id": "28939900068975315"
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
        "__typename": "MarketplacePartnerListingProductDetailsPage",
        "product_details_type": "PARTNER_LISTING",
        "__isMarketplaceProductDetailsPage": "MarketplacePartnerListingProductDetailsPage",
        "marketplace_listing_renderable_target": {
          "__typename": "ProductItem",
          "id": "39887208997530861",
          "marketplace_listing_title": "Nintendo - nintendo switch - Nintendo switch - Consola de videojuegos + juegos - Sin la caja original",
          "__isMarketplaceListingRenderable": "ProductItem"
        },
        "target": {
          "__typename": "ProductItem",
          "__isMarketplaceListingRenderable": "ProductItem",
          "marketplace_listing_title": "Nintendo - nintendo switch - Nintendo switch - Consola de videojuegos + juegos - Sin la caja original",
          "__isMarketplacePartnershipListing": "ProductItem",
          "primary_trust_signal_upsell": null,
          "partner_logo_url": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/492831975_122130561776785943_7058135208485371260_n.jpg?stp=dst-jpg_tt6&cstp=mx679x679&ctp=s679x679&_nc_cat=104&ccb=1-7&_nc_sid=e362bc&_nc_ohc=aJb21IvGej4Q7kNvwGzFZuu&_nc_oc=AdpbyHm1hZb4OCsIGmGhD1f_DaN2EQmAh4z9x-3xZN-36EPKG_aiDJVidgl8S4KJYr4&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=8wcijNgUf698dDv8UXfbKw&_nc_ss=792a8&oh=00_AQNkLBCHlDcAXJZpkEpkit… (436 chars)",
          "disclaimer": null,
          "shipping_cost_info": {
            "shipping_cost_text": "Delivered for €15",
            "has_shipping_cost": true
          },
          "listing_price": {
            "formatted_amount_zeros_stripped": "€95"
          },
          "strikethrough_price": null,
          "partner_listing_type": "AUCTION",
          "formatted_partner_auction_bid_close_time": "Fri, 30 Oct, 15:01",
          "partner_auction_bid_count_label": "Current bid",
          "is_partner_listing": true,
          "is_property_rental_listing": false,
          "id": "39887208997530861",
          "legal_reporting_cta_type": null,
          "legal_reporting_uri": null,
          "is_viewer_seller": false,
          "story": null,
          "viewer_saved_state": "NOT_SAVED",
          "__isMarketplaceListingWithIntegrityStatus": "ProductItem",
          "can_share": true,
          "share_uri": "https://www.facebook.com/marketplace/item/39887208997530861/",
          "reportable_ent_id": "39887208997530861",
          "primary_mp_ent": {
            "__typename": "ProductItem",
            "id": "39887208997530861"
          },
          "is_hidden": false,
          "reportable_seller_type": "User",
          "marketplace_listing_seller": {
            "__typename": "Page",
            "id": "448566028651615"
          },
          "marketplace_listing_category_id": "686977074745292",
          "__isMarketplaceMessageable": "ProductItem",
          "seller_message_thread": null,
          "pdp_upsell_banner": {
            "delight_ranges": "(0 items)",
            "image_ranges": "(0 items)",
            "inline_style_ranges": "(0 items)",
            "aggregated_ranges": "(0 items)",
            "ranges": "(1 items)",
            "color_ranges": "(0 items)",
            "text": "Shop Catawiki listings on Marketplace. Learn more"
          },
          "checkout_data": {
            "uri": "https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.catawiki.com%2Fes%2Fc%2F365%3Fanchor_lot_id%3D107682647%26utm_content%3DMetamarketplace%26utm_source%3Dcoop%26utm_medium%3Daffiliate%26utm_campaign%3Dmmp-es%26metaclickid%3D117bb834-4d08-454f-a5d7-fcd1363f9514&h=AUBMyhe40Zbc-BgswdfllETKtdGQqhhP7xR4kn5t1pY4_eyqzDsVNMFCCkAZ2BPx6VcR5ojVitPNQDOKHjH6E4Qax9kpsgCfC4vYcmpffD1942E3MAQgrJZE8S1KXQmL-uAxOuMcW8_… (757 chars)",
            "cta_text": "Place bid on Catawiki"
          },
          "description_header": "More info from Catawiki",
          "redacted_description": {
            "text": "Bellísima consola en excelentes condiciones, funcionando con un juego de Pokémon."
          },
          "description_uri": null,
          "description_meta": null,
          "product_details_page_uri": "https://l.facebook.com/l.php?u=https%3A%2F%2Fwww.catawiki.com%2Fes%2Fc%2F365%3Fanchor_lot_id%3D107682647%26utm_content%3DMetamarketplace%26utm_source%3Dcoop%26utm_medium%3Daffiliate%26utm_campaign%3Dmmp-es%26metaclickid%3Def274183-f956-4abe-92e7-f1db0cc69a0f&h=AUAkiHJSjlhHaR2sIoCa4-Nn9LuXB2s3X7Gls1Rg8LGKAcv_GhjSRS3I99rQXWPB23JHPMY4xhmGsjnPpTA9Gy2Dj5ESYs54xDjzSWSTaGyPypED7Fq8lh256MmnbkJkMhL02yAMDPD… (757 chars)",
          "partner_type": "TEST_PARTNER",
          "urgency_signals": [],
          "partner_item_attribute_data": [
            "(2 fields)",
            "(2 fields)"
          ],
          "partner_pdp_text": "See item on Catawiki",
          "is_local_listing": false,
          "should_show_view_more_cta": false,
          "is_shipped_listing": true,
          "is_property_sale_listing": false,
          "is_vehicle_listing": false,
          "shipping_cost_text": "Delivered for €15.00",
          "delivery_window_text": "Arrival estimate available on Catawiki",
          "partner_listing_location": "Italy",
          "product_return_data": null,
          "partner_brand_name": "Catawiki",
          "partner_seller_info": {
            "headline": "Catawiki seller information",
            "seller_info": "(9 fields)",
            "feedback_text": null,
            "meta": null
          },
          "trust_signals_header": null,
          "trust_signals": [],
          "local_listing_location": null
        },
        "__module_operation_MarketplacePDP_page": {
          "__dr": "MarketplacePDPPartnerListingComponent_page$normalization.graphql"
        },
        "__module_component_MarketplacePDP_page": {
          "__dr": "MarketplacePDPPartnerListingComponent.react"
        },
        "id": "66:39887208997530861:IN_MEMORY_MARKETPLACE_PRODUCT_DETAILS_PAGE:MarketplacePartnerListingProductDetailsPage"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792731488903,
      "time_at_flush_ms": 1792731489072
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": {
            "clpData": "(22 fields)",
            "gkxData": "(30 fields)",
            "ixData": "(74 fields)",
            "metaconfigData": "(1 fields)",
            "qexData": "(23 fields)"
          },
          "hblp": {
            "consistency": "(1 fields)",
            "rsrcMap": "(28 fields)",
            "compMap": "(5 fields)",
            "indexUpgrades": "(2 fields)"
          }
        },
        "jsmods": {
          "define": [
            "(4 items)",
            "(4 items)",
            "(4 items)",
            "(4 items)",
            "(4 items)",
            "(4 items)",
            "… 102 more"
          ],
          "require": [
            "(1 items)",
            "(1 items)",
            "(4 items)",
            "(1 items)",
            "(1 items)",
            "(1 items)",
            "… 16 more"
          ],
          "phd2_indexes": ":5540,5539,2501,2178,210,1409,1408,1410,960"
        },
        "allResources": [
          "O4/rPzV",
          "EYZXp6D",
          "r0rTJic",
          "csr:_1b_0_ou",
          "csr:_1b_1_SD"
        ],
        "tieredResources": {
          "r": [
            "O4/rPzV",
            "EYZXp6D",
            "r0rTJic",
            "csr:_1b_0_ou"
          ],
          "rdfds": [],
          "rds": [
            "csr:_1b_1_SD"
          ]
        }
      }
    }
  }
}
```

**runs/inspect/20261023T045453_61594063207669**, scroll: -161px in 5 wheel steps, 172 ms: 200, 652 ms

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
    "targetId": "28549509658039213",
    "useDefaultActor": false,
    "__relay_internal__pv__MarketplacePDPShouldUseListingRevamprelayprovider": false,
    "__relay_internal__pv__MarketplacePDPCometSimilarListingsrelayprovider": false,
    "__relay_internal__pv__MarketplacePDPShouldShowRelatedSearchesrelayprovider": false,
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
  "doc_id": "28939900068975315"
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
        "__typename": "MarketplacePartnerListingProductDetailsPage",
        "product_details_type": "PARTNER_LISTING",
        "__isMarketplaceProductDetailsPage": "MarketplacePartnerListingProductDetailsPage",
        "marketplace_listing_renderable_target": {
          "__typename": "ProductItem",
          "id": "28549509658039213",
          "marketplace_listing_title": "Vaison Hard Shell Bike Travel Case",
          "__isMarketplaceListingRenderable": "ProductItem"
        },
        "target": {
          "__typename": "ProductItem",
          "__isMarketplaceListingRenderable": "ProductItem",
          "marketplace_listing_title": "Vaison Hard Shell Bike Travel Case",
          "__isMarketplacePartnershipListing": "ProductItem",
          "primary_trust_signal_upsell": null,
          "partner_logo_url": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-1/316533383_505688224948226_1676972430895592491_n.jpg?stp=dst-jpg_tt6&cstp=mx200x200&ctp=s200x200&_nc_cat=110&ccb=1-7&_nc_sid=f907e8&_nc_ohc=Vi-EKg5BmpgQ7kNvwHJGK6U&_nc_oc=Adopi4ZEnGs7yomvGyzHsrNzOTDHE2M7g5MvBS1JaVcsSLCiXa8au1Mftb5HQVGbfZU&_nc_zt=24&_nc_ht=scontent-phl2-1.xx&_nc_gid=Qx6wqZ5GxsUuHAUoh5sFQQ&_nc_ss=792a8&oh=00_AQMmLKhXtPWxqVyCb7qkzYtlx… (433 chars)",
          "disclaimer": null,
          "shipping_cost_info": "(2 fields)",
          "listing_price": "(1 fields)",
          "strikethrough_price": "(2 fields)",
          "partner_listing_type": "FIXED_PRICE",
          "formatted_partner_auction_bid_close_time": null,
          "partner_auction_bid_count_label": "Current bid",
          "is_partner_listing": true,
          "is_property_rental_listing": false,
          "id": "28549509658039213",
          "legal_reporting_cta_type": null,
          "legal_reporting_uri": null,
          "is_viewer_seller": false,
          "story": null,
          "viewer_saved_state": "NOT_SAVED",
          "__isMarketplaceListingWithIntegrityStatus": "ProductItem",
          "can_share": true,
          "share_uri": "https://www.facebook.com/marketplace/item/28549509658039213/",
          "reportable_ent_id": "28549509658039213",
          "primary_mp_ent": "(2 fields)",
          "is_hidden": false,
          "reportable_seller_type": "User",
          "marketplace_listing_seller": "(2 fields)",
          "marketplace_listing_category_id": "1583634935226685",
          "__isMarketplaceMessageable": "ProductItem",
          "seller_message_thread": null,
          "pdp_upsell_banner": "(7 fields)",
          "checkout_data": "(2 fields)",
          "description_header": "More info from buycycle-es",
          "redacted_description": "(1 fields)",
          "description_uri": "https://l.facebook.com/l.php?u=https%3A%2F%2Fbuycycle.com%2Fes-es%2Fproduct%2Fbike-cases-elite-vaison-hard-shell-bike-travel-case%3Futm_source%3Dfacebook_marketplace%26metaclickid%3Db4f5a5c5-b02c-4403-a6e2-b56bab32cedb&h=AUB0IIPYHg-fDq-eqmiGS9aHhIgJGLOCIqKhUywi01_8QXRR3aJFh6eekq-lbrHIy8fX1ikewBJbmg5TsQIGr3uFeFJE0BJl9HIxHAzAZgEH7wKsfpvn7rmcZWRiXKONrFGNQabranzJ8XUm_sWuEUKruHtnEiyIiXF-Yg5o9R4oHCGdB8a… (689 chars)",
          "description_meta": null,
          "product_details_page_uri": "https://l.facebook.com/l.php?u=https%3A%2F%2Fbuycycle.com%2Fes-es%2Fproduct%2Fbike-cases-elite-vaison-hard-shell-bike-travel-case%3Futm_source%3Dfacebook_marketplace%26metaclickid%3D02fe5cac-e9fa-4244-b276-1cc70345d304&h=AUARwAEurH8EvUSj0Kk-ekf6KnZ9WVGiJ0dMVPd54Z0N3yBwoAUHloQAyeI_aHRILsKhaZ3A8pgni8rD99nb3F8U7kGhvnGN9QA22s6luDipsaq_Ss0NBDXh1yqdlqZPLP1oKfnBOaYtVHSjv1nh6_XlZLTyae5AyD9wrGXKRy_tl4U0nce… (684 chars)",
          "partner_type": "TEST_PARTNER",
          "urgency_signals": "(0 items)",
          "partner_item_attribute_data": "(2 items)",
          "partner_pdp_text": "See item on buycycle-es",
          "is_local_listing": false,
          "should_show_view_more_cta": false,
          "is_shipped_listing": true,
          "is_property_sale_listing": false,
          "is_vehicle_listing": false,
          "shipping_cost_text": "Delivery cost available on buycycle-es",
          "delivery_window_text": "Arrival estimate available on buycycle-es",
          "partner_listing_location": "Barcelona, ES",
          "product_return_data": null,
          "partner_brand_name": "buycycle-es",
          "partner_seller_info": "(4 fields)",
          "trust_signals_header": null,
          "trust_signals": "(0 items)",
          "local_listing_location": null
        },
        "__module_operation_MarketplacePDP_page": {
          "__dr": "MarketplacePDPPartnerListingComponent_page$normalization.graphql"
        },
        "__module_component_MarketplacePDP_page": {
          "__dr": "MarketplacePDPPartnerListingComponent.react"
        },
        "id": "66:28549509658039213:IN_MEMORY_MARKETPLACE_PRODUCT_DETAILS_PAGE:MarketplacePartnerListingProductDetailsPage"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792731498837,
      "time_at_flush_ms": 1792731498919
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hblp": "(3 fields)"
        },
        "jsmods": {
          "require": "(5 items)"
        },
        "allResources": [
          "csr:_1h_0_6F"
        ],
        "tieredResources": {
          "r": "(1 items)",
          "rdfds": "(0 items)",
          "rds": "(0 items)"
        }
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
