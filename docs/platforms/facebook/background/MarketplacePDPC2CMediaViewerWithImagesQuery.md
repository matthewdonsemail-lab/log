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
| rea | `ev_973273180452da6f44ade5a5f3f9f5998b8e65b8d0aa52faecab494a361da4d7` |

Seen 15 time(s) in 7 run(s).

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
| host | scroll: -553px in 12 wheel steps, 499 ms | 1 | 200 | 203 ms | 609 ms | — |
| host | scroll: +617px in 15 wheel steps, 789 ms | 1 | 200 | 206 ms | 837 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/host/20261026T180628_61594285317994**, scroll: -553px in 12 wheel steps, 499 ms: 200, 203 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPC2CMediaViewerWithImagesQuery",
  "server_timestamps": "true",
  "variables": {
    "targetId": "1818774979262678"
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
                "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.84726-6/855448898_1421077280172348_2873785854566912774_n.jpg (445 chars)"
              },
              "id": "1421077270172349"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 720,
                "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t45.5328-4/857046196_29377760378485960_3157780051967267521_n.jpg (445 chars)"
              },
              "id": "29377760315152633"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 720,
                "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t45.5328-4/851274169_1129910819474335_5860864701841281720_n.jpg (444 chars)"
              },
              "id": "1129910812807669"
            },
            {
              "__typename": "ProductImage",
              "accessibility_caption": "No photo description available.",
              "image": {
                "height": 960,
                "width": 720,
                "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t45.5328-4/856807717_1148625574267539_2258126879260274518_n.jpg (444 chars)"
              },
              "id": "1148625567600873"
            }
          ],
          "pre_recorded_videos": [],
          "is_hidden": false,
          "id": "1818774979262678"
        },
        "id": "66:1818774979262678:IN_MEMORY_MARKETPLACE_PRODUCT_DETAILS_PAGE:MarketplaceC2CProductDetailsPage"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t39.84726-6/855448898_1421077280172348_2873785854566912774_n.jpg (445 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t45.5328-4/851274169_1129910819474335_5860864701841281720_n.jpg (444 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t45.5328-4/856807717_1148625574267539_2258126879260274518_n.jpg (444 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://scontent.fyvr4-1.fna.fbcdn.net/v/t45.5328-4/857046196_29377760378485960_3157780051967267521_n.jpg (445 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1793038228900,
      "time_at_flush_ms": 1793038228957
    },
    "is_final": true
  }
}
```

**runs/host/20261026T180628_61594285317994**, scroll: +617px in 15 wheel steps, 789 ms: 200, 206 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPC2CMediaViewerWithImagesQuery",
  "server_timestamps": "true",
  "variables": {
    "targetId": "2249546198922840"
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
                "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t39.84726-6/859392018_962932573103703_1200915558473180130_n.jpg (444 chars)"
              },
              "id": "962932556437038"
            }
          ],
          "pre_recorded_videos": [],
          "is_hidden": false,
          "id": "2249546198922840"
        },
        "id": "66:2249546198922840:IN_MEMORY_MARKETPLACE_PRODUCT_DETAILS_PAGE:MarketplaceC2CProductDetailsPage"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://scontent.fyvr3-1.fna.fbcdn.net/v/t39.84726-6/859392018_962932573103703_1200915558473180130_n.jpg (444 chars)",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1793038239684,
      "time_at_flush_ms": 1793038239750
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
