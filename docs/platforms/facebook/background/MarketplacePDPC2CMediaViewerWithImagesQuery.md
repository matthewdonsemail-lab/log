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

Seen 13 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +127px in 4 wheel steps, 125 ms | 1 | 200 | 1332 ms | 2117 ms | — |
| warmup | scroll: -605px in 14 wheel steps, 687 ms | 1 | 200 | 377 ms | 1686 ms | — |
| warmup | step 10: openAny 2-4 x /marketplace/item/ | 2 | 200 | 1316–1393 ms | 248–2097 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 390 ms | 3299 ms | — |
| warmup | scroll: -756px in 16 wheel steps, 656 ms | 1 | 200 | 410 ms | 684 ms | — |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 524 ms | 2389 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 527 ms | 819 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 499 ms | 1231 ms | — |
| inspect | scroll: +161px in 5 wheel steps, 250 ms | 1 | 200 | 462 ms | 1884 ms | — |
| inspect | scroll: -161px in 5 wheel steps, 172 ms | 1 | 200 | 413 ms | 697 ms | — |
| warmup | scroll: -1034px in 22 wheel steps, 1032 ms | 1 | 200 | 448 ms | 797 ms | — |
| warmup | scroll: +981px in 24 wheel steps, 1672 ms | 1 | 200 | 392 ms | 2043 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/warmup/20261023T074930_61594063207669**, step 10: openAny 2-4 x /marketplace/item/: 200, 1316 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPC2CMediaViewerWithImagesQuery",
  "server_timestamps": "true",
  "variables": {
    "targetId": "1749699906261391"
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
        "__typename": "MarketplaceForSaleItemProductDetailsPage",
        "target": {
          "__typename": "GroupCommerceProductItem",
          "listing_photos": [
            {
              "__typename": "CatalogMarketplaceEnhancementTransformedImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 720,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.84726-6/768619641_1057517433421271_9174067096337490809_n.jpg"
              },
              "id": "1057517430087938"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 720,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/768715248_5496111047280974_7182241363307184005_n.jpg (414 chars)"
              },
              "id": "5496111043947641"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 720,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/770866969_28078030368499852_1934565581453334933_n.jpg"
              },
              "id": "28078030325166523"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 720,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/770619664_974414908946396_7242425030356117315_n.jpg"
              },
              "id": "974414902279730"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 720,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/770670350_1682206309550353_4572782277848664106_n.jpg (414 chars)"
              },
              "id": "1682206302883687"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 720,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/770612525_1075252588508856_8276743356773276114_n.jpg (414 chars)"
              },
              "id": "1075252585175523"
            },
            "… 4 more"
          ],
          "pre_recorded_videos": [],
          "is_hidden": false,
          "id": "1749699906261391"
        },
        "id": "66:1749699906261391:IN_MEMORY_MARKETPLACE_PRODUCT_DETAILS_PAGE:MarketplaceC2CProductDetailsPage"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/770619664_974414908946396_7242425030356117315_n.jpg",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/770670350_1682206309550353_4572782277848664106_n.jpg (414 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/770612525_1075252588508856_8276743356773276114_n.jpg (414 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/770777608_1367886091495159_5326362888680084766_n.jpg",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.84726-6/768619641_1057517433421271_9174067096337490809_n.jpg",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/768715248_5496111047280974_7182241363307184005_n.jpg (414 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      "… 4 more"
    ],
    "server_metadata": {
      "request_start_time_ms": 1792742062535,
      "time_at_flush_ms": 1792742062595
    },
    "is_final": true
  }
}
```

**runs/warmup/20261023T074930_61594063207669**, scroll: -1034px in 22 wheel steps, 1032 ms: 200, 448 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPC2CMediaViewerWithImagesQuery",
  "server_timestamps": "true",
  "variables": {
    "targetId": "1098292579663100"
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
        "__typename": "MarketplaceForSaleItemProductDetailsPage",
        "target": {
          "__typename": "GroupCommerceProductItem",
          "listing_photos": [
            {
              "__typename": "CatalogMarketplaceEnhancementTransformedImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 442,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.84726-6/863321065_1805641050757238_9191728837683688869_n.jpg (415 chars)"
              },
              "id": "1805641044090572"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 442,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/852199788_1818170166176511_6332940943688572560_n.jpg (414 chars)"
              },
              "id": "1818170156176512"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 442,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/858565145_2167458307200733_2205409977563994826_n.jpg (414 chars)"
              },
              "id": "2167458300534067"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 442,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/856779067_28865898363065039_8632367148021348374_n.jpg (415 chars)"
              },
              "id": "28865898319731710"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 442,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/856567148_1766478451715128_6054089362771249869_n.jpg (414 chars)"
              },
              "id": "1766478445048462"
            }
          ],
          "pre_recorded_videos": [],
          "is_hidden": false,
          "id": "1098292579663100"
        },
        "id": "66:1098292579663100:IN_MEMORY_MARKETPLACE_PRODUCT_DETAILS_PAGE:MarketplaceC2CProductDetailsPage"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/856567148_1766478451715128_6054089362771249869_n.jpg (414 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/852199788_1818170166176511_6332940943688572560_n.jpg (414 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.84726-6/863321065_1805641050757238_9191728837683688869_n.jpg (415 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/856779067_28865898363065039_8632367148021348374_n.jpg (415 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/858565145_2167458307200733_2205409977563994826_n.jpg (414 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792742073284,
      "time_at_flush_ms": 1792742073339
    },
    "is_final": true
  }
}
```

**runs/warmup/20261023T074930_61594063207669**, scroll: +981px in 24 wheel steps, 1672 ms: 200, 392 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPC2CMediaViewerWithImagesQuery",
  "server_timestamps": "true",
  "variables": {
    "targetId": "2064512760864293"
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
        "__typename": "MarketplaceForSaleItemProductDetailsPage",
        "target": {
          "__typename": "GroupCommerceProductItem",
          "listing_photos": [
            {
              "__typename": "CatalogMarketplaceEnhancementTransformedImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 442,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.84726-6/837537840_1093936243621753_7243842029990663344_n.jpg (415 chars)"
              },
              "id": "1093936236955087"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 442,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/838682278_1155897076871141_7443226950860978315_n.jpg (414 chars)"
              },
              "id": "1155897073537808"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 786,
                "width": 960,
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/838851478_3347913328734145_1126666561798692254_n.jpg (414 chars)"
              },
              "id": "3347913325400812"
            }
          ],
          "pre_recorded_videos": [],
          "is_hidden": false,
          "id": "2064512760864293"
        },
        "id": "66:2064512760864293:IN_MEMORY_MARKETPLACE_PRODUCT_DETAILS_PAGE:MarketplaceC2CProductDetailsPage"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/838682278_1155897076871141_7443226950860978315_n.jpg (414 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t45.5328-4/838851478_3347913328734145_1126666561798692254_n.jpg (414 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.84726-6/837537840_1093936243621753_7243842029990663344_n.jpg (415 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792742085780,
      "time_at_flush_ms": 1792742085828
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
