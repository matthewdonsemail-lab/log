# CometHomeMegaMenuShortcutsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26833428399625311` |
| Path | `/api/graphql/` |
| Sends | `scale`, `useNucleusIcon` |
| Reads | `viewer.actor`, `viewer.shortcut_bookmarks` |
| Called from | `CometHomeMegaMenuShortcuts.react` |
| rea | `ev_387da7dffb2d726280e5df4abfd25b5a3f00569b707462e4a6fe946ba8004ba8` |

Seen 17 time(s) in 16 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 27: dwell 0.29s | 1 | 200 | 620 ms | 106 ms | — |
| inspect | post: "…", 103 words, 0 image(s), scrolled 70 px | 1 | 200 | 569 ms | 1035 ms | — |
| inspect | step 12: dwell 0.14s | 1 | 200 | 537 ms | 852 ms | — |
| inspect | clickRole failed: RuntimeError: no visible button "…" | 1 | 200 | 417 ms | 15232 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 468 ms | 745368 ms | — |
| inspect | step 67: dwell 1s | 1 | 200 | 947 ms | 85 ms | — |
| inspect | setLocation failed: TimeoutError: Locator.wait_for: Timeout 30000ms exceeded. | 1 | 200 | 1619 ms | 512 ms | — |
| inspect | step 16: type e232 | 1 | 200 | 569 ms | 9101 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 699 ms | 5617 ms | — |
| inspect | step 3: goto /marketplace/inbox | 2 | 200 | 425–740 ms | 15536–22256 ms | — |
| inspect | step 4: goto /marketplace/inbox | 1 | 200 | 1627 ms | 1630153 ms | — |
| inspect | step 6: wait 6s | 1 | 200 | 635 ms | 36624 ms | — |
| host | expected ProfileCometProfilePictureSetMutation: sent | 1 | 200 | 496 ms | 1413800 ms | — |
| flow | step 1: goto /marketplace/ | 1 | 200 | 1523 ms | 12416 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 698 ms | 690298 ms | — |
| flow | upload: photo2.jpg handed to the file chooser | 1 | 200 | 698 ms | 1435 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T064655_61593981307720**, step 3: goto /marketplace/inbox: 200, 425 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeMegaMenuShortcutsQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1,
    "useNucleusIcon": false
  },
  "doc_id": "26833428399625311"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "should_block_mbs_redirect": false,
        "id": "61593981307720"
      },
      "shortcut_bookmarks": {
        "shortcut_bookmark": {
          "nodes": []
        },
        "id": "1592249071005526"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792910893862,
      "time_at_flush_ms": 1792910893907
    },
    "is_final": true
  }
}
```

**runs/inspect/20261023T045453_61594063207669**, step 6: wait 6s: 200, 635 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeMegaMenuShortcutsQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1,
    "useNucleusIcon": false
  },
  "doc_id": "26833428399625311"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "should_block_mbs_redirect": false,
        "id": "61594063207669"
      },
      "shortcut_bookmarks": {
        "shortcut_bookmark": {
          "nodes": [
            {
              "id": "Ym9va21hcms6NjE1OTQwNjMyMDc2Njk6MTU5MjI0OTA3MTAwNTUyNjo0MTkxMDE4NjEwOTM3MjQzOjo6OnVua25vd24=",
              "name": "Recommendations of Bethlehem, PA and Greater Lehigh Valley Region",
              "url": "https://www.facebook.com/groups/4191018610937243/",
              "tracking": "{\"bmid\":4191018610937243,\"bookmark_type\":\"type_group\",\"content_type\":\"shortcut_entity\",\"cc_id\":\"cc_id_shortcut_default\",\"eligibility_reason\":\"eligible_shortcut\",\"content_ids\":[4191018610937243],\"linked_product_id\":2361831622,\"position\":0}",
              "bookmark_icon_image": {
                "uri": "https://static.xx.fbcdn.net/rsrc.php/y8/r/iaP8U-_yJOY.webp"
              },
              "image": {
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/645294606_10238351084488917_8182127059574139500_n.jpg (452 chars)",
                "is_silhouette": false
              },
              "section": "GROUP",
              "bookmark_icon_sprite": {
                "sprited": 0,
                "sprite_map_css_class": null,
                "sprite_css_class": null,
                "preloading_spi": null,
                "w": null,
                "h": null,
                "p": null,
                "sz": null,
                "spi": null,
                "uri": "https://static.xx.fbcdn.net/rsrc.php/yC/r/SUhRjnBDPdg.webp",
                "width": 36,
                "height": 36,
                "logging_id": ""
              }
            },
            {
              "id": "Ym9va21hcms6NjE1OTQwNjMyMDc2Njk6MTU5MjI0OTA3MTAwNTUyNjo2OTA1ODg4MTQ0MDc0NjQ6Ojo6dW5rbm93bg==",
              "name": "Friends of Bethlehem PA",
              "url": "https://www.facebook.com/groups/690588814407464/",
              "tracking": "{\"bmid\":690588814407464,\"bookmark_type\":\"type_group\",\"content_type\":\"shortcut_entity\",\"cc_id\":\"cc_id_shortcut_default\",\"eligibility_reason\":\"eligible_shortcut\",\"content_ids\":[690588814407464],\"linked_product_id\":2361831622,\"position\":1}",
              "bookmark_icon_image": {
                "uri": "https://static.xx.fbcdn.net/rsrc.php/y8/r/iaP8U-_yJOY.webp"
              },
              "image": {
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/275511929_10127159636577474_4037586103475890512_n.jpg (457 chars)",
                "is_silhouette": false
              },
              "section": "GROUP",
              "bookmark_icon_sprite": {
                "sprited": 0,
                "sprite_map_css_class": null,
                "sprite_css_class": null,
                "preloading_spi": null,
                "w": null,
                "h": null,
                "p": null,
                "sz": null,
                "spi": null,
                "uri": "https://static.xx.fbcdn.net/rsrc.php/yC/r/SUhRjnBDPdg.webp",
                "width": 36,
                "height": 36,
                "logging_id": ""
              }
            },
            {
              "id": "Ym9va21hcms6NjE1OTQwNjMyMDc2Njk6MTU5MjI0OTA3MTAwNTUyNjoyNDc4MzMyMDE1ODEwMzkzOjo6OnVua25vd24=",
              "name": "Bethlehem, PA Neighborhood",
              "url": "https://www.facebook.com/groups/2478332015810393/",
              "tracking": "{\"bmid\":2478332015810393,\"bookmark_type\":\"type_group\",\"content_type\":\"shortcut_entity\",\"cc_id\":\"cc_id_shortcut_default\",\"eligibility_reason\":\"eligible_shortcut\",\"content_ids\":[2478332015810393],\"linked_product_id\":2361831622,\"position\":2}",
              "bookmark_icon_image": {
                "uri": "https://static.xx.fbcdn.net/rsrc.php/y8/r/iaP8U-_yJOY.webp"
              },
              "image": {
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t1.6435-9/93806581_144287650470567_96044419450404864_n.png (442 chars)",
                "is_silhouette": false
              },
              "section": "GROUP",
              "bookmark_icon_sprite": {
                "sprited": 0,
                "sprite_map_css_class": null,
                "sprite_css_class": null,
                "preloading_spi": null,
                "w": null,
                "h": null,
                "p": null,
                "sz": null,
                "spi": null,
                "uri": "https://static.xx.fbcdn.net/rsrc.php/yC/r/SUhRjnBDPdg.webp",
                "width": 36,
                "height": 36,
                "logging_id": ""
              }
            }
          ]
        },
        "id": "1592249071005526"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/y8/r/iaP8U-_yJOY.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792731662363,
      "time_at_flush_ms": 1792731662431
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T130601_61594063207669**, step 4: goto /marketplace/inbox: 200, 1627 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeMegaMenuShortcutsQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1,
    "useNucleusIcon": false
  },
  "doc_id": "26833428399625311"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "actor": {
        "__typename": "User",
        "should_block_mbs_redirect": false,
        "id": "61594063207669"
      },
      "shortcut_bookmarks": {
        "shortcut_bookmark": {
          "nodes": [
            {
              "id": "Ym9va21hcms6NjE1OTQwNjMyMDc2Njk6MTU5MjI0OTA3MTAwNTUyNjo0MTkxMDE4NjEwOTM3MjQzOjo6OnVua25vd24=",
              "name": "Recommendations of Bethlehem, PA and Greater Lehigh Valley Region",
              "url": "https://www.facebook.com/groups/4191018610937243/",
              "tracking": "{\"bmid\":4191018610937243,\"bookmark_type\":\"type_group\",\"content_type\":\"shortcut_entity\",\"cc_id\":\"cc_id_shortcut_default\",\"eligibility_reason\":\"eligible_shortcut\",\"content_ids\":[4191018610937243],\"linked_product_id\":2361831622,\"position\":0}",
              "bookmark_icon_image": {
                "uri": "https://static.xx.fbcdn.net/rsrc.php/y8/r/iaP8U-_yJOY.webp"
              },
              "image": {
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/645294606_10238351084488917_8182127059574139500_n.jpg (452 chars)",
                "is_silhouette": false
              },
              "section": "GROUP",
              "bookmark_icon_sprite": {
                "sprited": 0,
                "sprite_map_css_class": null,
                "sprite_css_class": null,
                "preloading_spi": null,
                "w": null,
                "h": null,
                "p": null,
                "sz": null,
                "spi": null,
                "uri": "https://static.xx.fbcdn.net/rsrc.php/yC/r/SUhRjnBDPdg.webp",
                "width": 36,
                "height": 36,
                "logging_id": ""
              }
            },
            {
              "id": "Ym9va21hcms6NjE1OTQwNjMyMDc2Njk6MTU5MjI0OTA3MTAwNTUyNjo2OTA1ODg4MTQ0MDc0NjQ6Ojo6dW5rbm93bg==",
              "name": "Friends of Bethlehem PA",
              "url": "https://www.facebook.com/groups/690588814407464/",
              "tracking": "{\"bmid\":690588814407464,\"bookmark_type\":\"type_group\",\"content_type\":\"shortcut_entity\",\"cc_id\":\"cc_id_shortcut_default\",\"eligibility_reason\":\"eligible_shortcut\",\"content_ids\":[690588814407464],\"linked_product_id\":2361831622,\"position\":1}",
              "bookmark_icon_image": {
                "uri": "https://static.xx.fbcdn.net/rsrc.php/y8/r/iaP8U-_yJOY.webp"
              },
              "image": {
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/275511929_10127159636577474_4037586103475890512_n.jpg (457 chars)",
                "is_silhouette": false
              },
              "section": "GROUP",
              "bookmark_icon_sprite": {
                "sprited": 0,
                "sprite_map_css_class": null,
                "sprite_css_class": null,
                "preloading_spi": null,
                "w": null,
                "h": null,
                "p": null,
                "sz": null,
                "spi": null,
                "uri": "https://static.xx.fbcdn.net/rsrc.php/yC/r/SUhRjnBDPdg.webp",
                "width": 36,
                "height": 36,
                "logging_id": ""
              }
            },
            {
              "id": "Ym9va21hcms6NjE1OTQwNjMyMDc2Njk6MTU5MjI0OTA3MTAwNTUyNjoyNDc4MzMyMDE1ODEwMzkzOjo6OnVua25vd24=",
              "name": "Bethlehem, PA Neighborhood",
              "url": "https://www.facebook.com/groups/2478332015810393/",
              "tracking": "{\"bmid\":2478332015810393,\"bookmark_type\":\"type_group\",\"content_type\":\"shortcut_entity\",\"cc_id\":\"cc_id_shortcut_default\",\"eligibility_reason\":\"eligible_shortcut\",\"content_ids\":[2478332015810393],\"linked_product_id\":2361831622,\"position\":2}",
              "bookmark_icon_image": {
                "uri": "https://static.xx.fbcdn.net/rsrc.php/y8/r/iaP8U-_yJOY.webp"
              },
              "image": {
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t1.6435-9/93806581_144287650470567_96044419450404864_n.png (442 chars)",
                "is_silhouette": false
              },
              "section": "GROUP",
              "bookmark_icon_sprite": {
                "sprited": 0,
                "sprite_map_css_class": null,
                "sprite_css_class": null,
                "preloading_spi": null,
                "w": null,
                "h": null,
                "p": null,
                "sz": null,
                "spi": null,
                "uri": "https://static.xx.fbcdn.net/rsrc.php/yC/r/SUhRjnBDPdg.webp",
                "width": 36,
                "height": 36,
                "logging_id": ""
              }
            }
          ]
        },
        "id": "1592249071005526"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/y8/r/iaP8U-_yJOY.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1792676064437,
      "time_at_flush_ms": 1792676064626
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The "Menu" panel's shortcuts (the user's own frequent destinations).

## What our machine does with it

Nothing; fetched alongside CometHomeMegaMenuAllProductsQuery when the cursor rests on the menu button.

## What can go wrong

Harmless.
