# ajaxNavigation

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/ajax/navigation/` |
| Sends | — |
| Reads | — |
| Called from | — |
| rea | `ev_1f2efc84d7328617553804a0b324fa57be90f6d575258bd012fdfe013be31ab0` |

Seen 49 time(s) in 14 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +127px in 4 wheel steps, 125 ms | 1 | 200 | 1326 ms | 2303 ms | — |
| warmup | scroll: -605px in 14 wheel steps, 687 ms | 1 | 200 | 382 ms | 1893 ms | — |
| warmup | step 10: openAny 2-4 x /marketplace/item/ | 2 | 200 | 1113–1358 ms | 473–2348 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 412 ms | 3499 ms | — |
| warmup | scroll: -756px in 16 wheel steps, 656 ms | 1 | 200 | 477 ms | 869 ms | — |
| inspect | step 3: clickRole tab "…" | 1 | 200 | 2729 ms | 1900 ms | — |
| inspect | step 4: clickRole tab "…" | 1 | 200 | 1531 ms | 1255 ms | — |
| inspect | step 6: clickRole tab "…" | 1 | 200 | 664 ms | 2248 ms | — |
| inspect | step 7: clickRole tab "…" | 1 | 200 | 618 ms | 1154 ms | — |
| inspect | step 8: clickRole tab "…" | 1 | 200 | 616 ms | 856 ms | — |
| inspect | step 9: clickRole tab "…" | 1 | 200 | 526 ms | 896 ms | — |
| inspect | step 10: clickRole tab "…" | 1 | 200 | 533 ms | 1508 ms | — |
| inspect | step 11: clickRole tab "…" | 1 | 200 | 612 ms | 2213 ms | — |
| inspect | step 32: clickRole link "…" | 1 | 200 | 1027 ms | 2308 ms | — |
| inspect | step 42: clickRole tab "…" | 1 | 200 | 2896 ms | 945 ms | — |
| inspect | scroll: +705px in 15 wheel steps, 656 ms | 1 | 200 | 1643 ms | 1231 ms | — |
| inspect | step 45: clickRole button "…" | 1 | 200 | 607 ms | 2357 ms | — |
| inspect | step 48: clickRole button "…" | 1 | 200 | 369 ms | 1324 ms | — |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 633 ms | 2586 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 713 ms | 989 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 535 ms | 1508 ms | — |
| inspect | step 12: clickAny 1 x link /see owner profile$/ | 1 | 200 | 661 ms | 2490 ms | — |
| inspect | step 21: clickAny 1 x link /see owner profile$/ | 1 | 200 | 508 ms | 1984 ms | — |
| inspect | step 8: clickAny 1 x link /see owner profile$/ | 1 | 200 | 544 ms | 2125 ms | — |
| inspect | step 19: clickAny 1 x link /see owner profile$/ | 1 | 200 | 533 ms | 2388 ms | — |
| inspect | step 4: click e191 | 1 | 200 | 606 ms | 2277 ms | — |
| inspect | step 10: click e1174 | 1 | 200 | 439 ms | 2558 ms | — |
| inspect | step 24: click e367 | 1 | 200 | 455 ms | 1472 ms | — |
| inspect | step 25: click e1241 | 1 | 200 | 605 ms | 8407 ms | — |
| inspect | step 4: setLocation Bethlehem, PA | 1 | 200 | 569 ms | 18835 ms | — |
| inspect | step 13: setLocation 18015 | 1 | 200 | 412 ms | 15969 ms | — |
| inspect | step 1: goto /marketplace/inbox | 2 | 200 | 365–878 ms | 20925–22722 ms | — |
| inspect | step 3: click e156 | 1 | 200 | 469 ms | 884 ms | — |
| inspect | step 3: goto /marketplace/inbox | 9 | 200 | 390–795 ms | 471777–1354663 ms | — |
| inspect | scroll: +161px in 5 wheel steps, 250 ms | 1 | 200 | 923 ms | 2074 ms | — |
| inspect | scroll: -161px in 5 wheel steps, 172 ms | 1 | 200 | 565 ms | 833 ms | — |
| warmup | scroll: -1034px in 22 wheel steps, 1032 ms | 1 | 200 | 450 ms | 971 ms | — |
| warmup | scroll: +981px in 24 wheel steps, 1672 ms | 1 | 200 | 465 ms | 2215 ms | — |
| inspect | step 6: clickAny 1 x link /see owner profile$/ | 1 | 200 | 813 ms | 2807 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_61594063207669**, step 10: openAny 2-4 x /marketplace/item/: 200, 1113 ms

Sent:

```json
{
  "client_previous_actor_id": "61594063207669",
  "route_url": "/marketplace/item/1749699906261391/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD",
  "routing_namespace": "fb_comet"
}
```

Answered:

```json
{
  "payload": {
    "payload": {
      "error": false,
      "result": {
        "type": "route_definition",
        "exports": {
          "actorID": "61594063207669",
          "rootView": {
            "allResources": [
              "(1 fields)",
              "(1 fields)"
            ],
            "resource": {
              "__jsr": "CometMarketplacePermalinkRoot.react"
            },
            "props": {
              "isCrawler": false,
              "location": "(4 fields)",
              "seoPagePath": "facebook.com/marketplace/item/1749699906261391/",
              "shouldFetchLoggedOutSimilarListings": false
            },
            "entryPoint": {
              "__dr": "MarketplacePermalinkRoot.entrypoint"
            }
          },
          "tracePolicy": "comet.marketplace.item",
          "meta": {
            "title": "Marketplace – 24x24 Two Story Amish Crafted Two Car Garage w/Loft Financing Available",
            "accessory": null,
            "favicon": null
          },
          "prefetchable": true,
          "canonicalRouteName": "comet.fbweb.CometMarketplacePermalinkRoute",
          "entityKeyConfig": {
            "entity_type": {
              "source": "constant",
              "value": "mp_listing"
            },
            "entity_id": {
              "source": "param",
              "value": "listing_id"
            }
          },
          "hostableView": {
            "allResources": [
              "(1 fields)",
              "(1 fields)"
            ],
            "resource": {
              "__jsr": "CometMarketplacePermalinkRoot.react"
            },
            "props": {
              "isCrawler": false,
              "location": "(4 fields)",
              "seoPagePath": "facebook.com/marketplace/item/1749699906261391/",
              "shouldFetchLoggedOutSimilarListings": false
            },
            "entryPoint": {
              "__dr": "MarketplacePermalinkRoot.entrypoint"
            }
          },
          "useCloseButton": true,
          "tabKey": "marketplace",
          "label": "Marketplace listing viewer",
          "hideNotificationToasts": true,
          "isNavigationEligibleForForcedRefresh": false,
          "canBePushView": true,
          "showMessengerJewel": true,
          "blockUnloadHooks": true,
          "enableFullPageAutoYOverflow": true,
          "concurrentSafe": true,
          "stripParams": [
            "token",
            "hoisted_story_ids",
            "hoisted_story_optimistic_data"
          ],
          "productAttributionId": "1606854132932955",
          "canonicalUrl": null
        },
        "route_match_infos": [
          {
            "instanceParams": {
              "availability": null,
              "npSellerType": null,
              "minPrice": null,
              "maxPrice": null,
              "catFriendly": null,
              "carfaxHistory": null,
              "daysSinceListed": null,
              "dealerBranch": null,
              "deliveryMethod": null,
              "dogFriendly": null,
              "isC2CListingOnly": null,
              "isFurnished": null,
              "headerOverride": null,
              "maxBathrooms": null,
              "maxBedrooms": null,
              "maxAreaSize": null,
              "maxMileage": null,
              "maxRooms": null,
              "maxYear": null,
              "minBathrooms": null,
              "minBedrooms": null,
              "minAreaSize": null,
              "minMileage": null,
              "minMPG": null,
              "minRooms": null,
              "minSafetyRating": null,
              "minSeatingCapacity": null,
              "minYear": null,
              "prefilledRating": null,
              "privateRoomBathroomType": null,
              "propertyType": null,
              "pivots": null,
              "sortBy": null,
              "make": null,
              "model": null,
              "carType": null,
              "topLevelVehicleType": null,
              "transmissionType": null,
              "rentalRoomType": null,
              "saleType": null,
              "sellerType": null,
              "itemCondition": null,
              "constructionStatus": null,
              "contextual": null,
              "vehicleExteriorColors": null,
              "vehicleInteriorColors": null,
              "query": null,
              "notif_id": null,
              "notif_t": null,
              "referral_code": "marketplace_top_picks",
              "referral_story_type": "top_picks",
              "merchantId": null,
              "ref": "browse_tab",
              "ad_id": null,
              "listing_id": "1749699906261391",
              "hoisted": false,
              "ref_id": null,
              "view_public_for": null,
              "tracking": null,
              "dynamicUrlInfo": null,
              "token": null,
              "is_background": false,
              "hoisted_story_ids": null,
              "hoisted_story_optimistic_data": null,
              "slug": null
            },
            "routeConflicts": null,
            "routeParams": {
              "availability": "(5 fields)",
              "npSellerType": "(5 fields)",
              "minPrice": "(5 fields)",
              "maxPrice": "(5 fields)",
              "catFriendly": "(5 fields)",
              "carfaxHistory": "(5 fields)",
              "daysSinceListed": "(5 fields)",
              "dealerBranch": "(5 fields)",
              "deliveryMethod": "(5 fields)",
              "dogFriendly": "(5 fields)",
              "isC2CListingOnly": "(5 fields)",
              "isFurnished": "(5 fields)",
              "headerOverride": "(5 fields)",
              "maxBathrooms": "(5 fields)",
              "maxBedrooms": "(5 fields)",
              "maxAreaSize": "(5 fields)",
              "maxMileage": "(5 fields)",
              "maxRooms": "(5 fields)",
              "maxYear": "(5 fields)",
              "minBathrooms": "(5 fields)",
              "minBedrooms": "(5 fields)",
              "minAreaSize": "(5 fields)",
              "minMileage": "(5 fields)",
              "minMPG": "(5 fields)",
              "minRooms": "(5 fields)",
              "minSafetyRating": "(5 fields)",
              "minSeatingCapacity": "(5 fields)",
              "minYear": "(5 fields)",
              "prefilledRating": "(5 fields)",
              "privateRoomBathroomType": "(5 fields)",
              "propertyType": "(5 fields)",
              "pivots": "(5 fields)",
              "sortBy": "(5 fields)",
              "make": "(5 fields)",
              "model": "(5 fields)",
              "carType": "(5 fields)",
              "topLevelVehicleType": "(5 fields)",
              "transmissionType": "(5 fields)",
              "rentalRoomType": "(5 fields)",
              "saleType": "(5 fields)",
              "sellerType": "(5 fields)",
              "itemCondition": "(5 fields)",
              "constructionStatus": "(5 fields)",
              "contextual": "(5 fields)",
              "vehicleExteriorColors": "(5 fields)",
              "vehicleInteriorColors": "(5 fields)",
              "query": "(5 fields)",
              "notif_id": "(5 fields)",
              "notif_t": "(5 fields)",
              "referral_code": "(5 fields)",
              "referral_story_type": "(6 fields)",
              "merchantId": "(5 fields)",
              "ref": "(6 fields)",
              "ad_id": "(5 fields)",
              "listing_id": "(5 fields)",
              "hoisted": "(5 fields)",
              "ref_id": "(5 fields)",
              "view_public_for": "(5 fields)",
              "tracking": "(5 fields)",
              "dynamicUrlInfo": "(5 fields)",
              "token": "(5 fields)",
              "is_background": "(5 fields)",
              "hoisted_story_ids": "(5 fields)",
              "hoisted_story_optimistic_data": "(5 fields)",
              "slug": "(5 fields)"
            },
            "routePath": "/marketplace/item/{?slug}/{listing_id}/"
          }
        ]
      }
    },
    "sr_payload": {
      "hsrp": {
        "hblp": {
          "consistency": {
            "rev": 1051444067
          },
          "rsrcMap": {
            "csr:_1g_0_/f": {
              "type": "csr",
              "src": ":1,2,216",
              "c": 1
            }
          },
          "indexUpgrades": {}
        }
      },
      "jsmods": {
        "require": [
          [
            "emptyFunction",
            "thatReturns",
            [
              "JSResourceReferenceImpl"
            ],
            [
              "(2 items)"
            ]
          ],
          [
            "MarketplacePermalinkRoot.entrypoint"
          ],
          [
            "emptyFunction",
            "thatReturns",
            [
              "RequireDeferredReference"
            ],
            [
              "(2 items)"
            ]
          ],
          [
            "RequireDeferredReference",
            "unblock",
            [],
            [
              "(1 items)",
              "sd"
            ]
          ],
          [
            "RequireDeferredReference",
            "unblock",
            [],
            [
              "(1 items)",
              "css"
            ]
          ]
        ]
      },
      "allResources": [
        "csr:_1g_0_/f"
      ],
      "tieredResources": {
        "r": [
          "csr:_1g_0_/f"
        ],
        "rdfds": [],
        "rds": []
      }
    },
    "log_roots": [
      "CometRouteMarketplacePermalinkJSRoot"
    ],
    "enable_bulk_route_fetch": true
  },
  "dtsgAsyncGetToken": null,
  "dtsgToken": null
}
```

**runs/warmup/20261023T074930_61594063207669**, scroll: -1034px in 22 wheel steps, 1032 ms: 200, 450 ms

Sent:

```json
{
  "client_previous_actor_id": "61594063207669",
  "route_url": "/marketplace/item/1098292579663100/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD",
  "routing_namespace": "fb_comet"
}
```

Answered:

```json
{
  "payload": {
    "payload": {
      "error": false,
      "result": {
        "type": "route_definition",
        "exports": {
          "actorID": "61594063207669",
          "rootView": {
            "allResources": [
              "(1 fields)",
              "(1 fields)"
            ],
            "resource": {
              "__jsr": "CometMarketplacePermalinkRoot.react"
            },
            "props": {
              "isCrawler": false,
              "location": "(4 fields)",
              "seoPagePath": "facebook.com/marketplace/item/1098292579663100/",
              "shouldFetchLoggedOutSimilarListings": false
            },
            "entryPoint": {
              "__dr": "MarketplacePermalinkRoot.entrypoint"
            }
          },
          "tracePolicy": "comet.marketplace.item",
          "meta": {
            "title": "Marketplace – Taylor 514CE Builders Edition -\nPlayed Twice",
            "accessory": null,
            "favicon": null
          },
          "prefetchable": true,
          "canonicalRouteName": "comet.fbweb.CometMarketplacePermalinkRoute",
          "entityKeyConfig": {
            "entity_type": {
              "source": "constant",
              "value": "mp_listing"
            },
            "entity_id": {
              "source": "param",
              "value": "listing_id"
            }
          },
          "hostableView": {
            "allResources": [
              "(1 fields)",
              "(1 fields)"
            ],
            "resource": {
              "__jsr": "CometMarketplacePermalinkRoot.react"
            },
            "props": {
              "isCrawler": false,
              "location": "(4 fields)",
              "seoPagePath": "facebook.com/marketplace/item/1098292579663100/",
              "shouldFetchLoggedOutSimilarListings": false
            },
            "entryPoint": {
              "__dr": "MarketplacePermalinkRoot.entrypoint"
            }
          },
          "useCloseButton": true,
          "tabKey": "marketplace",
          "label": "Marketplace listing viewer",
          "hideNotificationToasts": true,
          "isNavigationEligibleForForcedRefresh": false,
          "canBePushView": true,
          "showMessengerJewel": true,
          "blockUnloadHooks": true,
          "enableFullPageAutoYOverflow": true,
          "concurrentSafe": true,
          "stripParams": [
            "token",
            "hoisted_story_ids",
            "hoisted_story_optimistic_data"
          ],
          "productAttributionId": "1606854132932955",
          "canonicalUrl": null
        },
        "route_match_infos": [
          {
            "instanceParams": {
              "availability": null,
              "npSellerType": null,
              "minPrice": null,
              "maxPrice": null,
              "catFriendly": null,
              "carfaxHistory": null,
              "daysSinceListed": null,
              "dealerBranch": null,
              "deliveryMethod": null,
              "dogFriendly": null,
              "isC2CListingOnly": null,
              "isFurnished": null,
              "headerOverride": null,
              "maxBathrooms": null,
              "maxBedrooms": null,
              "maxAreaSize": null,
              "maxMileage": null,
              "maxRooms": null,
              "maxYear": null,
              "minBathrooms": null,
              "minBedrooms": null,
              "minAreaSize": null,
              "minMileage": null,
              "minMPG": null,
              "minRooms": null,
              "minSafetyRating": null,
              "minSeatingCapacity": null,
              "minYear": null,
              "prefilledRating": null,
              "privateRoomBathroomType": null,
              "propertyType": null,
              "pivots": null,
              "sortBy": null,
              "make": null,
              "model": null,
              "carType": null,
              "topLevelVehicleType": null,
              "transmissionType": null,
              "rentalRoomType": null,
              "saleType": null,
              "sellerType": null,
              "itemCondition": null,
              "constructionStatus": null,
              "contextual": null,
              "vehicleExteriorColors": null,
              "vehicleInteriorColors": null,
              "query": null,
              "notif_id": null,
              "notif_t": null,
              "referral_code": "marketplace_top_picks",
              "referral_story_type": "top_picks",
              "merchantId": null,
              "ref": "browse_tab",
              "ad_id": null,
              "listing_id": "1098292579663100",
              "hoisted": false,
              "ref_id": null,
              "view_public_for": null,
              "tracking": null,
              "dynamicUrlInfo": null,
              "token": null,
              "is_background": false,
              "hoisted_story_ids": null,
              "hoisted_story_optimistic_data": null,
              "slug": null
            },
            "routeConflicts": null,
            "routeParams": {
              "availability": "(5 fields)",
              "npSellerType": "(5 fields)",
              "minPrice": "(5 fields)",
              "maxPrice": "(5 fields)",
              "catFriendly": "(5 fields)",
              "carfaxHistory": "(5 fields)",
              "daysSinceListed": "(5 fields)",
              "dealerBranch": "(5 fields)",
              "deliveryMethod": "(5 fields)",
              "dogFriendly": "(5 fields)",
              "isC2CListingOnly": "(5 fields)",
              "isFurnished": "(5 fields)",
              "headerOverride": "(5 fields)",
              "maxBathrooms": "(5 fields)",
              "maxBedrooms": "(5 fields)",
              "maxAreaSize": "(5 fields)",
              "maxMileage": "(5 fields)",
              "maxRooms": "(5 fields)",
              "maxYear": "(5 fields)",
              "minBathrooms": "(5 fields)",
              "minBedrooms": "(5 fields)",
              "minAreaSize": "(5 fields)",
              "minMileage": "(5 fields)",
              "minMPG": "(5 fields)",
              "minRooms": "(5 fields)",
              "minSafetyRating": "(5 fields)",
              "minSeatingCapacity": "(5 fields)",
              "minYear": "(5 fields)",
              "prefilledRating": "(5 fields)",
              "privateRoomBathroomType": "(5 fields)",
              "propertyType": "(5 fields)",
              "pivots": "(5 fields)",
              "sortBy": "(5 fields)",
              "make": "(5 fields)",
              "model": "(5 fields)",
              "carType": "(5 fields)",
              "topLevelVehicleType": "(5 fields)",
              "transmissionType": "(5 fields)",
              "rentalRoomType": "(5 fields)",
              "saleType": "(5 fields)",
              "sellerType": "(5 fields)",
              "itemCondition": "(5 fields)",
              "constructionStatus": "(5 fields)",
              "contextual": "(5 fields)",
              "vehicleExteriorColors": "(5 fields)",
              "vehicleInteriorColors": "(5 fields)",
              "query": "(5 fields)",
              "notif_id": "(5 fields)",
              "notif_t": "(5 fields)",
              "referral_code": "(5 fields)",
              "referral_story_type": "(6 fields)",
              "merchantId": "(5 fields)",
              "ref": "(6 fields)",
              "ad_id": "(5 fields)",
              "listing_id": "(5 fields)",
              "hoisted": "(5 fields)",
              "ref_id": "(5 fields)",
              "view_public_for": "(5 fields)",
              "tracking": "(5 fields)",
              "dynamicUrlInfo": "(5 fields)",
              "token": "(5 fields)",
              "is_background": "(5 fields)",
              "hoisted_story_ids": "(5 fields)",
              "hoisted_story_optimistic_data": "(5 fields)",
              "slug": "(5 fields)"
            },
            "routePath": "/marketplace/item/{?slug}/{listing_id}/"
          }
        ]
      }
    },
    "sr_payload": {
      "hsrp": {
        "hblp": {
          "consistency": {
            "rev": 1051444067
          },
          "rsrcMap": {
            "csr:_1q_0_jT": {
              "type": "csr",
              "src": ":1,2,216",
              "c": 1
            }
          },
          "indexUpgrades": {}
        }
      },
      "jsmods": {
        "require": [
          [
            "emptyFunction",
            "thatReturns",
            [
              "JSResourceReferenceImpl"
            ],
            [
              "(2 items)"
            ]
          ],
          [
            "MarketplacePermalinkRoot.entrypoint"
          ],
          [
            "emptyFunction",
            "thatReturns",
            [
              "RequireDeferredReference"
            ],
            [
              "(2 items)"
            ]
          ],
          [
            "RequireDeferredReference",
            "unblock",
            [],
            [
              "(1 items)",
              "sd"
            ]
          ],
          [
            "RequireDeferredReference",
            "unblock",
            [],
            [
              "(1 items)",
              "css"
            ]
          ]
        ]
      },
      "allResources": [
        "csr:_1q_0_jT"
      ],
      "tieredResources": {
        "r": [
          "csr:_1q_0_jT"
        ],
        "rdfds": [],
        "rds": []
      }
    },
    "log_roots": [
      "CometRouteMarketplacePermalinkJSRoot"
    ],
    "enable_bulk_route_fetch": true
  },
  "dtsgAsyncGetToken": null,
  "dtsgToken": null
}
```

**runs/warmup/20261023T074930_61594063207669**, scroll: +981px in 24 wheel steps, 1672 ms: 200, 465 ms

Sent:

```json
{
  "client_previous_actor_id": "61594063207669",
  "route_url": "/marketplace/item/2064512760864293/?ref=browse_tab&referral_code=marketplace_top_picks&referral_story_type=top_picks&__tn__=!%3AD",
  "routing_namespace": "fb_comet"
}
```

Answered:

```json
{
  "payload": {
    "payload": {
      "error": false,
      "result": {
        "type": "route_definition",
        "exports": {
          "actorID": "61594063207669",
          "rootView": {
            "allResources": [
              "(1 fields)",
              "(1 fields)"
            ],
            "resource": {
              "__jsr": "CometMarketplacePermalinkRoot.react"
            },
            "props": {
              "isCrawler": false,
              "location": "(4 fields)",
              "seoPagePath": "facebook.com/marketplace/item/2064512760864293/",
              "shouldFetchLoggedOutSimilarListings": false
            },
            "entryPoint": {
              "__dr": "MarketplacePermalinkRoot.entrypoint"
            }
          },
          "tracePolicy": "comet.marketplace.item",
          "meta": {
            "title": "Marketplace – Large Indoor Catio Pet Enclosure",
            "accessory": null,
            "favicon": null
          },
          "prefetchable": true,
          "canonicalRouteName": "comet.fbweb.CometMarketplacePermalinkRoute",
          "entityKeyConfig": {
            "entity_type": {
              "source": "constant",
              "value": "mp_listing"
            },
            "entity_id": {
              "source": "param",
              "value": "listing_id"
            }
          },
          "hostableView": {
            "allResources": [
              "(1 fields)",
              "(1 fields)"
            ],
            "resource": {
              "__jsr": "CometMarketplacePermalinkRoot.react"
            },
            "props": {
              "isCrawler": false,
              "location": "(4 fields)",
              "seoPagePath": "facebook.com/marketplace/item/2064512760864293/",
              "shouldFetchLoggedOutSimilarListings": false
            },
            "entryPoint": {
              "__dr": "MarketplacePermalinkRoot.entrypoint"
            }
          },
          "useCloseButton": true,
          "tabKey": "marketplace",
          "label": "Marketplace listing viewer",
          "hideNotificationToasts": true,
          "isNavigationEligibleForForcedRefresh": false,
          "canBePushView": true,
          "showMessengerJewel": true,
          "blockUnloadHooks": true,
          "enableFullPageAutoYOverflow": true,
          "concurrentSafe": true,
          "stripParams": [
            "token",
            "hoisted_story_ids",
            "hoisted_story_optimistic_data"
          ],
          "productAttributionId": "1606854132932955",
          "canonicalUrl": null
        },
        "route_match_infos": [
          {
            "instanceParams": {
              "availability": null,
              "npSellerType": null,
              "minPrice": null,
              "maxPrice": null,
              "catFriendly": null,
              "carfaxHistory": null,
              "daysSinceListed": null,
              "dealerBranch": null,
              "deliveryMethod": null,
              "dogFriendly": null,
              "isC2CListingOnly": null,
              "isFurnished": null,
              "headerOverride": null,
              "maxBathrooms": null,
              "maxBedrooms": null,
              "maxAreaSize": null,
              "maxMileage": null,
              "maxRooms": null,
              "maxYear": null,
              "minBathrooms": null,
              "minBedrooms": null,
              "minAreaSize": null,
              "minMileage": null,
              "minMPG": null,
              "minRooms": null,
              "minSafetyRating": null,
              "minSeatingCapacity": null,
              "minYear": null,
              "prefilledRating": null,
              "privateRoomBathroomType": null,
              "propertyType": null,
              "pivots": null,
              "sortBy": null,
              "make": null,
              "model": null,
              "carType": null,
              "topLevelVehicleType": null,
              "transmissionType": null,
              "rentalRoomType": null,
              "saleType": null,
              "sellerType": null,
              "itemCondition": null,
              "constructionStatus": null,
              "contextual": null,
              "vehicleExteriorColors": null,
              "vehicleInteriorColors": null,
              "query": null,
              "notif_id": null,
              "notif_t": null,
              "referral_code": "marketplace_top_picks",
              "referral_story_type": "top_picks",
              "merchantId": null,
              "ref": "browse_tab",
              "ad_id": null,
              "listing_id": "2064512760864293",
              "hoisted": false,
              "ref_id": null,
              "view_public_for": null,
              "tracking": null,
              "dynamicUrlInfo": null,
              "token": null,
              "is_background": false,
              "hoisted_story_ids": null,
              "hoisted_story_optimistic_data": null,
              "slug": null
            },
            "routeConflicts": null,
            "routeParams": {
              "availability": "(5 fields)",
              "npSellerType": "(5 fields)",
              "minPrice": "(5 fields)",
              "maxPrice": "(5 fields)",
              "catFriendly": "(5 fields)",
              "carfaxHistory": "(5 fields)",
              "daysSinceListed": "(5 fields)",
              "dealerBranch": "(5 fields)",
              "deliveryMethod": "(5 fields)",
              "dogFriendly": "(5 fields)",
              "isC2CListingOnly": "(5 fields)",
              "isFurnished": "(5 fields)",
              "headerOverride": "(5 fields)",
              "maxBathrooms": "(5 fields)",
              "maxBedrooms": "(5 fields)",
              "maxAreaSize": "(5 fields)",
              "maxMileage": "(5 fields)",
              "maxRooms": "(5 fields)",
              "maxYear": "(5 fields)",
              "minBathrooms": "(5 fields)",
              "minBedrooms": "(5 fields)",
              "minAreaSize": "(5 fields)",
              "minMileage": "(5 fields)",
              "minMPG": "(5 fields)",
              "minRooms": "(5 fields)",
              "minSafetyRating": "(5 fields)",
              "minSeatingCapacity": "(5 fields)",
              "minYear": "(5 fields)",
              "prefilledRating": "(5 fields)",
              "privateRoomBathroomType": "(5 fields)",
              "propertyType": "(5 fields)",
              "pivots": "(5 fields)",
              "sortBy": "(5 fields)",
              "make": "(5 fields)",
              "model": "(5 fields)",
              "carType": "(5 fields)",
              "topLevelVehicleType": "(5 fields)",
              "transmissionType": "(5 fields)",
              "rentalRoomType": "(5 fields)",
              "saleType": "(5 fields)",
              "sellerType": "(5 fields)",
              "itemCondition": "(5 fields)",
              "constructionStatus": "(5 fields)",
              "contextual": "(5 fields)",
              "vehicleExteriorColors": "(5 fields)",
              "vehicleInteriorColors": "(5 fields)",
              "query": "(5 fields)",
              "notif_id": "(5 fields)",
              "notif_t": "(5 fields)",
              "referral_code": "(5 fields)",
              "referral_story_type": "(6 fields)",
              "merchantId": "(5 fields)",
              "ref": "(6 fields)",
              "ad_id": "(5 fields)",
              "listing_id": "(5 fields)",
              "hoisted": "(5 fields)",
              "ref_id": "(5 fields)",
              "view_public_for": "(5 fields)",
              "tracking": "(5 fields)",
              "dynamicUrlInfo": "(5 fields)",
              "token": "(5 fields)",
              "is_background": "(5 fields)",
              "hoisted_story_ids": "(5 fields)",
              "hoisted_story_optimistic_data": "(5 fields)",
              "slug": "(5 fields)"
            },
            "routePath": "/marketplace/item/{?slug}/{listing_id}/"
          }
        ]
      }
    },
    "sr_payload": {
      "hsrp": {
        "hblp": {
          "consistency": {
            "rev": 1051444067
          },
          "rsrcMap": {
            "csr:_20_0_EG": {
              "type": "csr",
              "src": ":1,2,216",
              "c": 1
            }
          },
          "indexUpgrades": {}
        }
      },
      "jsmods": {
        "require": [
          [
            "emptyFunction",
            "thatReturns",
            [
              "JSResourceReferenceImpl"
            ],
            [
              "(2 items)"
            ]
          ],
          [
            "MarketplacePermalinkRoot.entrypoint"
          ],
          [
            "emptyFunction",
            "thatReturns",
            [
              "RequireDeferredReference"
            ],
            [
              "(2 items)"
            ]
          ],
          [
            "RequireDeferredReference",
            "unblock",
            [],
            [
              "(1 items)",
              "sd"
            ]
          ],
          [
            "RequireDeferredReference",
            "unblock",
            [],
            [
              "(1 items)",
              "css"
            ]
          ]
        ]
      },
      "allResources": [
        "csr:_20_0_EG"
      ],
      "tieredResources": {
        "r": [
          "csr:_20_0_EG"
        ],
        "rdfds": [],
        "rds": []
      }
    },
    "log_roots": [
      "CometRouteMarketplacePermalinkJSRoot"
    ],
    "enable_bulk_route_fetch": true
  },
  "dtsgAsyncGetToken": null,
  "dtsgToken": null
}
```

<!-- facts:end -->

## What it does

Logs an in-app navigation.

## What our machine does with it

Nothing.

## What can go wrong

Harmless.
