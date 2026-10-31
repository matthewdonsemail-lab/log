# CometMarketplaceSellerListingTransactionReportingDialogQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `24404336269153901` |
| Path | `/api/graphql/` |
| Sends | `id`, `scale` |
| Reads | `viewer.marketplace_listing` |
| Called from | `CometMarketplaceSellerListingTransactionReportingDialog.react` |
| rea | `ev_df6e013bdb5eb591a052f7af7f775820904f9d874fcdadccf96f8470f37eed95` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 4: click e434 | 1 | 200 | 432 ms | 1748 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T173652_61594063207669**, step 4: click e434: 200, 432 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceSellerListingTransactionReportingDialogQuery",
  "server_timestamps": "true",
  "variables": {
    "id": "1425935622848350",
    "scale": 1
  },
  "doc_id": "24404336269153901"
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
        "id": "1425935622848350",
        "marketplace_listing_title": "Junk Removal & Cleanouts: Houses, Garages, Basements",
        "formatted_price": {
          "text": "$99"
        },
        "primary_listing_photo": {
          "__typename": "ProductImage",
          "image": {
            "uri": "https://scontent-ord5-1.xx.fbcdn.net/v/t45.5328-4/856660594_2379535212790769_660742871528716392_n.jpg (428 chars)"
          },
          "id": "2379535206124103"
        },
        "duplicate_hash": "f770b48411f2c3f8d5207912dc894c177586273bbc5be446c262c51b831cebf0",
        "__isMarketplaceListingWithVariants": "GroupCommerceProductItem",
        "base_marketplace_listing_title": "Junk Removal & Cleanouts: Houses, Garages, Basements",
        "is_multi_variant_listing": false,
        "category_id": "895487550471874",
        "potential_buyers": {
          "nodes": []
        },
        "__isMarketplaceListingWithEmailCommunication": "GroupCommerceProductItem",
        "is_email_communication_enabled": false
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792777145974,
      "time_at_flush_ms": 1792777146060
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Loads the listing for the delete dialog and the "Did you sell this item?" survey after it: sent `id`, answered with the listing's title, price, photo, `duplicate_hash` and category. Fires when Delete listing is chosen from the menu.

## What our machine does with it

`marketplaceListingDelete` step `s03_clickDeleteListing` fires it; the step is confirmed by the dialog ("Delete listing", "Are you sure that you want to delete this listing?") opening, and the delete itself is decided at the next step.

## What can go wrong

Seen with 200 only. It reads; nothing is changed until the Delete button's mutation.
