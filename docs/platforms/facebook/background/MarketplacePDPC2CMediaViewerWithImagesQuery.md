# MarketplacePDPC2CMediaViewerWithImagesQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `10059604367394414` |
| Path | `/api/graphql/` |
| Sends | `imageContext`, `targetId` |
| Reads | `viewer.marketplace_product_details_page` |
| Called from | `MarketplacePDPC2CMediaViewerWithImagesQuery.react` |
| rea | `ev_d19547c947d1ed9edc723be26989de28ee93ca5425cd34a5443cfad49621a338` |

Seen 10 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +127px in 4 wheel steps, 125 ms | 1 | 200 | 1332 ms | 2117 ms | — |
| warmup | scroll: -605px in 14 wheel steps, 687 ms | 1 | 200 | 377 ms | 1686 ms | — |
| warmup | step 10: openAny 2-4 x /marketplace/item/ | 1 | 200 | 1393 ms | 2097 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 390 ms | 3299 ms | — |
| warmup | scroll: -756px in 16 wheel steps, 656 ms | 1 | 200 | 410 ms | 684 ms | — |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 524 ms | 2389 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 527 ms | 819 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 499 ms | 1231 ms | — |
| inspect | scroll: +161px in 5 wheel steps, 250 ms | 1 | 200 | 462 ms | 1884 ms | — |
| inspect | scroll: -161px in 5 wheel steps, 172 ms | 1 | 200 | 413 ms | 697 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, scroll: +161px in 5 wheel steps, 250 ms: 200, 462 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPC2CMediaViewerWithImagesQuery",
  "server_timestamps": "true",
  "variables": {
    "targetId": "39887208997530861"
  },
  "doc_id": "10059604367394414"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_product_details_page": {
        "__typename": "MarketplacePartnerListingProductDetailsPage",
        "target": {
          "__typename": "ProductItem",
          "listing_photos": [
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 525,
                "width": 700,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/843168163_955225920528454_544402708882524304_n.jpg"
              },
              "id": "955225913861788"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 700,
                "width": 525,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/849773945_1561524472398342_480377676264537500_n.jpg?stp=dst-jpg_tt6&cstp=mx525x700&ctp=s525x700&_nc_cat=102&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=vkCsUOCBHqAQ7kNvwHqKsrx&_nc_oc=Adog4N03T78PnWhu8EZNVvE73IS9KzAxDjaXUDevjjMX_uADGgTwlKsd2EFFcBLgGD0&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=X8J-XMvNEtE_4U2hiXd2AA&_nc_ss=792a8&oh=00_AQMTKGevCSyI0QCi4jXA4v_nmD… (432 chars)"
              },
              "id": "1561524469065009"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 700,
                "width": 525,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/852474438_2221673188759236_3754807028036586056_n.jpg?stp=dst-jpg_tt6&cstp=mx525x700&ctp=s525x700&_nc_cat=104&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=-omG1LRd49UQ7kNvwFOldE0&_nc_oc=AdordRO9F3qkFgI9FTnJW-S446vh2LrpDRVgscaRqjWc1sThFEL1y4b3eay1ExfFf-4&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=X8J-XMvNEtE_4U2hiXd2AA&_nc_ss=792a8&oh=00_AQNpKQ3UUgwE3xBX6aPAwftkO… (433 chars)"
              },
              "id": "2221673182092570"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 700,
                "width": 525,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/852587243_2361555421284726_636032823838361942_n.jpg?stp=dst-jpg_tt6&cstp=mx525x700&ctp=s525x700&_nc_cat=106&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=Nkfepy20yb0Q7kNvwFRC8nJ&_nc_oc=Adr3nozA2K1FszVkdJnDY7d_OuDaPOi_rknoMbKuv014lNcn_dNpr_r_Mum0OlTw-9w&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=X8J-XMvNEtE_4U2hiXd2AA&_nc_ss=792a8&oh=00_AQMiZbBlWJ_KB8Z68GJsH9mRJS… (432 chars)"
              },
              "id": "2361555417951393"
            }
          ],
          "pre_recorded_videos": [],
          "is_hidden": false,
          "id": "39887208997530861"
        },
        "id": "66:39887208997530861:IN_MEMORY_MARKETPLACE_PRODUCT_DETAILS_PAGE:MarketplacePartnerListingProductDetailsPage"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/843168163_955225920528454_544402708882524304_n.jpg",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/849773945_1561524472398342_480377676264537500_n.jpg?stp=dst-jpg_tt6&cstp=mx525x700&ctp=s525x700&_nc_cat=102&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=vkCsUOCBHqAQ7kNvwHqKsrx&_nc_oc=Adog4N03T78PnWhu8EZNVvE73IS9KzAxDjaXUDevjjMX_uADGgTwlKsd2EFFcBLgGD0&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=X8J-XMvNEtE_4U2hiXd2AA&_nc_ss=792a8&oh=00_AQMTKGevCSyI0QCi4jXA4v_nmD… (432 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/852587243_2361555421284726_636032823838361942_n.jpg?stp=dst-jpg_tt6&cstp=mx525x700&ctp=s525x700&_nc_cat=106&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=Nkfepy20yb0Q7kNvwFRC8nJ&_nc_oc=Adr3nozA2K1FszVkdJnDY7d_OuDaPOi_rknoMbKuv014lNcn_dNpr_r_Mum0OlTw-9w&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=X8J-XMvNEtE_4U2hiXd2AA&_nc_ss=792a8&oh=00_AQMiZbBlWJ_KB8Z68GJsH9mRJS… (432 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/852474438_2221673188759236_3754807028036586056_n.jpg?stp=dst-jpg_tt6&cstp=mx525x700&ctp=s525x700&_nc_cat=104&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=-omG1LRd49UQ7kNvwFOldE0&_nc_oc=AdordRO9F3qkFgI9FTnJW-S446vh2LrpDRVgscaRqjWc1sThFEL1y4b3eay1ExfFf-4&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=X8J-XMvNEtE_4U2hiXd2AA&_nc_ss=792a8&oh=00_AQNpKQ3UUgwE3xBX6aPAwftkO… (433 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792731488882,
      "time_at_flush_ms": 1792731488943
    },
    "is_final": true
  }
}
```

**runs/inspect/20261023T045453_61594063207669**, scroll: -161px in 5 wheel steps, 172 ms: 200, 413 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPC2CMediaViewerWithImagesQuery",
  "server_timestamps": "true",
  "variables": {
    "targetId": "28549509658039213"
  },
  "doc_id": "10059604367394414"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_product_details_page": {
        "__typename": "MarketplacePartnerListingProductDetailsPage",
        "target": {
          "__typename": "ProductItem",
          "listing_photos": [
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 720,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/834201758_1603756294575203_6047108662905277254_n.jpg?stp=dst-jpg_tt6&cstp=mx1440x1920&ctp=s960x960&_nc_cat=110&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=zJuehqFPnB8Q7kNvwFl02Yx&_nc_oc=Adovv-JgVb5rndvt00lnTTJaDIGiLBJYUTzqM9cpkxxJJF6USBtDsHLHEtfBol7TBCo&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=PvDrLxiFKYHpbKmCH0if8g&_nc_ss=792a8&oh=00_AQNvMA7zDuDRmggx1kdivuH… (435 chars)"
              },
              "id": "1603756291241870"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 443,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/835749562_977986911257097_94335808642525784_n.jpg?stp=dst-jpg_tt6&cstp=mx886x1920&ctp=s960x960&_nc_cat=101&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=6qlBKFH6yMkQ7kNvwEfpHwX&_nc_oc=Adp3kruFbQYYm7pr7LTjxDX0wa7rtmtZ-h9MXWM6pRAcfrjZQmC3USc2x0aYnV-cRLI&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=PvDrLxiFKYHpbKmCH0if8g&_nc_ss=792a8&oh=00_AQN7lkALLTvolZTtCOhvSr6-4kj… (431 chars)"
              },
              "id": "977986907923764"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 443,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/831118711_4415270942054828_2540166832637963525_n.jpg?stp=dst-jpg_tt6&cstp=mx886x1920&ctp=s960x960&_nc_cat=111&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=wcMFmwIcFHgQ7kNvwG_hMk2&_nc_oc=AdomPKMRw52xDvlvZ65hNrbidfsd9gWZpVnW_BB0nLpqbFKEPzpoLI8oBV1dj0juBBc&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=PvDrLxiFKYHpbKmCH0if8g&_nc_ss=792a8&oh=00_AQPdnxBx5BjYrZUuv6f_svJ-… (434 chars)"
              },
              "id": "4415270935388162"
            }
          ],
          "pre_recorded_videos": [],
          "is_hidden": false,
          "id": "28549509658039213"
        },
        "id": "66:28549509658039213:IN_MEMORY_MARKETPLACE_PRODUCT_DETAILS_PAGE:MarketplacePartnerListingProductDetailsPage"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/834201758_1603756294575203_6047108662905277254_n.jpg?stp=dst-jpg_tt6&cstp=mx1440x1920&ctp=s960x960&_nc_cat=110&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=zJuehqFPnB8Q7kNvwFl02Yx&_nc_oc=Adovv-JgVb5rndvt00lnTTJaDIGiLBJYUTzqM9cpkxxJJF6USBtDsHLHEtfBol7TBCo&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=PvDrLxiFKYHpbKmCH0if8g&_nc_ss=792a8&oh=00_AQNvMA7zDuDRmggx1kdivuH… (435 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/831118711_4415270942054828_2540166832637963525_n.jpg?stp=dst-jpg_tt6&cstp=mx886x1920&ctp=s960x960&_nc_cat=111&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=wcMFmwIcFHgQ7kNvwG_hMk2&_nc_oc=AdomPKMRw52xDvlvZ65hNrbidfsd9gWZpVnW_BB0nLpqbFKEPzpoLI8oBV1dj0juBBc&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=PvDrLxiFKYHpbKmCH0if8g&_nc_ss=792a8&oh=00_AQPdnxBx5BjYrZUuv6f_svJ-… (434 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/835749562_977986911257097_94335808642525784_n.jpg?stp=dst-jpg_tt6&cstp=mx886x1920&ctp=s960x960&_nc_cat=101&ccb=1-7&_nc_sid=7ea8df&_nc_ohc=6qlBKFH6yMkQ7kNvwEfpHwX&_nc_oc=Adp3kruFbQYYm7pr7LTjxDX0wa7rtmtZ-h9MXWM6pRAcfrjZQmC3USc2x0aYnV-cRLI&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=PvDrLxiFKYHpbKmCH0if8g&_nc_ss=792a8&oh=00_AQN7lkALLTvolZTtCOhvSr6-4kj… (431 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792731498621,
      "time_at_flush_ms": 1792731498695
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Loads a Marketplace listing's photos for its media viewer (`viewer.marketplace_product_details_page`, from `targetId`): the gallery with the photo Next control. It fired 3 times in 2 runs, 0.8-2.0 s into the step that opened a listing (`openAny 1-3 x /marketplace/item/`).

## What our machine does with it

The feed warm-up's `openListings` step opens the listing that sends it. The machine does not wait for it. It is the request the planned photo-by-photo look at a listing (open, Next through the photos, close) would wait on, once that page is recorded with `log inspect` (rule 29).

## What can go wrong

None seen: all three answered 200 in 499-527 ms. If it failed, the listing would show no photos; `openAny` still passes on the listing's URL.
