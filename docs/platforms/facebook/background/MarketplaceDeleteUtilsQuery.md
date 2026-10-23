# MarketplaceDeleteUtilsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27605324959069136` |
| Path | `/api/graphql/` |
| Sends | `id`, `shouldSkip` |
| Reads | — |
| Called from | `MarketplaceDeleteUtils` |
| rea | `ev_75e93fe4d2b889bd9688924dddf4badc31bafa4e41796fccaf9ed0e07501d6eb` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 2 | 200 | 548–581 ms | 503022–1366292 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 548 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplaceDeleteUtilsQuery",
  "server_timestamps": "true",
  "variables": {
    "id": "1425935622848350",
    "shouldSkip": false
  },
  "doc_id": "27605324959069136"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_listing": {
        "__typename": "GroupCommerceProductItem",
        "__isMarketplaceListingRenderable": "GroupCommerceProductItem",
        "should_show_txn_survey_on_delete": true,
        "__isMarketplaceListingWithCrossposting": "GroupCommerceProductItem",
        "cross_post_sync_metadata": null,
        "marketplace_listing_title": "Junk Removal & Cleanouts: Houses, Garages, Basements",
        "primary_listing_photo": {
          "__typename": "ProductImage",
          "image": {
            "uri": "https://scontent-lga3-1.xx.fbcdn.net/v/t45.5328-4/856660594_2379535212790769_660742871528716392_n.jpg?stp=c0.80.206.206a_dst-jpg_p206x206_tt6&_nc_cat=111&ccb=1-7&_nc_sid=247b10&_nc_ohc=azfCRYsIeUMQ7kNvwEjo79u&_nc_oc=AdozHNnxDlOGj-O-d6nMyUIv_5xQ_vPfVLHlwEGwDBliY61x7UM6iY-yTA2cUqxtM28&_nc_zt=23&_nc_ht=scontent-lga3-1.xx&_nc_gid=iC6qeERv59ofi7Q5WRqlZQ&_nc_ss=792a8&oh=00_AQP3MH1PePbS8njp5XhvVQDOj0exqA… (428 chars)"
          },
          "id": "2379535206124103"
        },
        "id": "1425935622848350"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792685360726,
      "time_at_flush_ms": 1792685360849
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Asks, for a listing (`id`), what deleting it would involve, so the listing's menu can offer Delete. It is a read (`shouldSkip` lets the page skip it); it fires when a listing's menu or dialog is opened, here twice while the inbox step was open.

## What our machine does with it

Nothing reads it, and nothing in log-cli deletes a listing (rule 8: nothing is deleted unless matt asks).

## What can go wrong

Seen only with 200. It changes nothing on its own; a delete would be a separate mutation, which log-cli never sends.
