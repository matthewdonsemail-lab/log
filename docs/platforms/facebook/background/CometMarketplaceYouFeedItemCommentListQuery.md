# CometMarketplaceYouFeedItemCommentListQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `39199556659689737` |
| Path | `/api/graphql/` |
| Sends | `feedLocation`, `feedbackSource`, `focusCommentID`, `listingId`, `scale`, `shouldIncludeProductFeedback`, `useDefaultActor`, `__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider`, `__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider`, `__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider`, `__relay_internal__pv__IsWorkUserrelayprovider` |
| Reads | `viewer....useMarketplaceCanCrossPostListing_viewer`, `viewer.listing` |
| Called from | `CometMarketplaceYouFeedItemCommentList.react`, `MarketplaceYourListingInteractions.react` |
| rea | `ev_130bb68b7f167375394ecb9729978eb7b6ccdeb2f9eb9cdca06838a2fc84c556` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 1857 ms | 1369471 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 1857 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceYouFeedItemCommentListQuery",
  "server_timestamps": "true",
  "variables": {
    "feedbackSource": 62,
    "feedLocation": "MARKETPLACE_YOU_FEED",
    "listingId": "1425935622848350",
    "scale": 1,
    "shouldIncludeProductFeedback": false,
    "useDefaultActor": false,
    "__relay_internal__pv__CometUFICommentAutoTranslationTyperelayprovider": "AUTO_TRANSLATE",
    "__relay_internal__pv__CometUFICommentAvatarStickerAnimatedImagerelayprovider": false,
    "__relay_internal__pv__CometUFICommentActionLinksRewriteEnabledrelayprovider": true,
    "__relay_internal__pv__IsWorkUserrelayprovider": false
  },
  "doc_id": "39199556659689737"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplace_suggested_crosspost_targets": {
        "edges": []
      },
      "listing": {
        "__typename": "GroupCommerceProductItem",
        "__isMarketplaceListingRenderable": "GroupCommerceProductItem",
        "is_sold": false,
        "is_pending": false,
        "listing_price": {
          "currency": "USD"
        },
        "__isMarketplaceListingWithCrossposting": "GroupCommerceProductItem",
        "cross_post_info": {
          "all_listings": [
            "(8 fields)"
          ]
        },
        "id": "1425935622848350"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792686227863,
      "time_at_flush_ms": 1792686228005
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hsdp": {
            "clpData": "(16 fields)",
            "gkxData": "(37 fields)",
            "ixData": "(65 fields)",
            "metaconfigData": "(2 fields)",
            "qexData": "(4 fields)",
            "qplData": "(31 fields)",
            "justknobxData": "(3 fields)"
          },
          "hblp": {
            "consistency": "(1 fields)",
            "rsrcMap": "(55 fields)",
            "compMap": "(13 fields)",
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
            "… 148 more"
          ],
          "require": [
            "(1 items)",
            "(1 items)",
            "(1 items)",
            "(1 items)",
            "(1 items)",
            "(1 items)",
            "… 66 more"
          ],
          "phd2_indexes": ":1078,85,86,1038,1037,8455,8514,1079,104,103,87,88,75,78,73,74,89,90,83,84,81,82,80,67,66,63,76,65,77,79,72,70,69,68,62,61,99,100,71,64,279,572,1208,1207,960,940,834,758,939,937,938,276,216,271,562,274,264,366,807,232,273,275,272,258,261,546,565,643,642,1206,1187,942,818,898,936,843,499,842,837,763,836,451,507,472,470,471,888,889,887,752,768,491,501,500,844,820,821,845,771,812,819,823,822"
        },
        "allResources": [
          "fsAYKJm",
          "c5lI/rY",
          "4sjfzBM",
          "nrb1m0h",
          "9N3/eww",
          "V+hDMPK",
          "… 4 more"
        ],
        "tieredResources": {
          "r": [
            "fsAYKJm",
            "c5lI/rY",
            "4sjfzBM",
            "nrb1m0h",
            "9N3/eww",
            "V+hDMPK",
            "… 2 more"
          ],
          "rdfds": [],
          "rds": [
            "hdCPzl6",
            "csr:_1x_1_nF"
          ]
        }
      }
    }
  }
}
```

<!-- facts:end -->

## What it does

The comments and buyer interactions on one of the seller's listings (`listingId`, `focusCommentID`, `feedbackSource`), shown inside the listing's dialog on Selling (`MarketplaceYourListingInteractions`). It fired when Bethlehem's listing was opened in the browser, 23 minutes into the open inbox step.

## What our machine does with it

Nothing reads it yet. If buyers ask on the listing itself rather than in chats, this is where those questions would be read from; mapping it needs a recording with a real comment (rule 29).

## What can go wrong

Seen only with 200, on a listing with no comments. Failing, it only empties the dialog's interactions.
