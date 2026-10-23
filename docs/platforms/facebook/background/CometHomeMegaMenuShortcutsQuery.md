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

Seen 12 time(s) in 11 run(s).

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
| inspect | step 3: goto /marketplace/inbox | 1 | 200 | 740 ms | 22256 ms | — |
| inspect | step 4: goto /marketplace/inbox | 1 | 200 | 1627 ms | 1630153 ms | — |
| inspect | step 6: wait 6s | 1 | 200 | 635 ms | 36624 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

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
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/645294606_10238351084488917_8182127059574139500_n.jpg?stp=c97.0.776.776a_cp6_dst-jpg_tt6&cstp=mx776x776&ctp=s50x50&_nc_cat=106&ccb=1-7&_nc_sid=1760b9&_nc_ohc=Ha3-UBUXX1cQ7kNvwGr8gWR&_nc_oc=AdrZlm4ot4kvLjN6rQ7q_DSPqEiCHzKKL8JyXthhkr0RDP0cZQdUqHBB7aJH20IwKnE&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=FrpAAkhAdJ9gBYo9bDLA2g&_nc_ss=792a8&oh=00_AQNdqc… (452 chars)",
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
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/275511929_10127159636577474_4037586103475890512_n.jpg?stp=c157.0.1127.1127a_cp0_dst-jpg_tt6&cstp=mx1127x1127&ctp=s50x50&_nc_cat=108&ccb=1-7&_nc_sid=1760b9&_nc_ohc=RHvUj21jl1QQ7kNvwEcpCMN&_nc_oc=Adp5msS-ewk3sIH6KnOQtZLcaH4vhN0x4K6ifiIgq8ak6-8_luyRtEEt537s4jVfbVE&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=FrpAAkhAdJ9gBYo9bDLA2g&_nc_ss=792a8&oh=00_A… (457 chars)",
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
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t1.6435-9/93806581_144287650470567_96044419450404864_n.png?stp=c257.0.315.315a_cp0_dst-png&cstp=mx315x315&ctp=s50x50&_nc_cat=110&ccb=1-7&_nc_sid=1760b9&_nc_ohc=sWuHqDfbgtIQ7kNvwE1ugzr&_nc_oc=AdqghXAOcGzuMlEvpe-GsnMt-25uqH4_LTICujPgHK5YfwIyeClIswNbQibiQFM4xvg&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=FrpAAkhAdJ9gBYo9bDLA2g&_nc_ss=792a8&oh=00_AQPNGLmyAiYIv80s… (442 chars)",
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

**runs/inspect/20261022T155857_61594063207669**, step 3: goto /marketplace/inbox: 200, 740 ms

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
                "uri": "https://scontent-lga3-3.xx.fbcdn.net/v/t39.30808-6/645294606_10238351084488917_8182127059574139500_n.jpg?stp=c97.0.776.776a_cp6_dst-jpg_tt6&cstp=mx776x776&ctp=s50x50&_nc_cat=106&ccb=1-7&_nc_sid=1760b9&_nc_ohc=Ha3-UBUXX1cQ7kNvwEZMpgw&_nc_oc=AdrGZTsf8Wmmxo2rMvH2iKJcFnmG32PhCMrmkNsypeFUecX8p2wd6eyQSXXi5cEQVdM&_nc_zt=23&_nc_ht=scontent-lga3-3.xx&_nc_gid=yYTpaINqr0qMhgo-HS5KVw&_nc_ss=792a8&oh=00_AQPMwv… (452 chars)",
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
                "uri": "https://scontent-lga3-3.xx.fbcdn.net/v/t39.30808-6/275511929_10127159636577474_4037586103475890512_n.jpg?stp=c157.0.1127.1127a_cp0_dst-jpg_tt6&cstp=mx1127x1127&ctp=s50x50&_nc_cat=108&ccb=1-7&_nc_sid=1760b9&_nc_ohc=_B0Q9a9J9IEQ7kNvwEt8vAx&_nc_oc=AdoHFwvlN5jgcckwTCOG0IQ4YIJ3A2iPPajKBOtnOECRZypUhFOm1URY3t5sxIQVZvE&_nc_zt=23&_nc_ht=scontent-lga3-3.xx&_nc_gid=yYTpaINqr0qMhgo-HS5KVw&_nc_ss=792a8&oh=00_A… (457 chars)",
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
                "uri": "https://scontent-lga3-1.xx.fbcdn.net/v/t1.6435-9/93806581_144287650470567_96044419450404864_n.png?stp=c257.0.315.315a_cp0_dst-png&cstp=mx315x315&ctp=s50x50&_nc_cat=110&ccb=1-7&_nc_sid=1760b9&_nc_ohc=sWuHqDfbgtIQ7kNvwH89nHZ&_nc_oc=AdoPyjEmSd4V6YuqrByOe9BNcUbkWIuJUPCNT_xuGIiL6GePJGx1dHerxRpHS9AF1a4&_nc_zt=23&_nc_ht=scontent-lga3-1.xx&_nc_gid=yYTpaINqr0qMhgo-HS5KVw&_nc_ss=792a8&oh=00_AQNBcaFB2OWDax_d… (442 chars)",
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
      "request_start_time_ms": 1792684880132,
      "time_at_flush_ms": 1792684880304
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
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/645294606_10238351084488917_8182127059574139500_n.jpg?stp=c97.0.776.776a_cp6_dst-jpg_tt6&cstp=mx776x776&ctp=s50x50&_nc_cat=106&ccb=1-7&_nc_sid=1760b9&_nc_ohc=Ha3-UBUXX1cQ7kNvwGr8gWR&_nc_oc=AdrZlm4ot4kvLjN6rQ7q_DSPqEiCHzKKL8JyXthhkr0RDP0cZQdUqHBB7aJH20IwKnE&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=IGkTOF8phjG8XEcVojcikw&_nc_ss=792a8&oh=00_AQP0OZ… (452 chars)",
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
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t39.30808-6/275511929_10127159636577474_4037586103475890512_n.jpg?stp=c157.0.1127.1127a_cp0_dst-jpg_tt6&cstp=mx1127x1127&ctp=s50x50&_nc_cat=108&ccb=1-7&_nc_sid=1760b9&_nc_ohc=_B0Q9a9J9IEQ7kNvwHql1Ov&_nc_oc=Adq276QewKMPHaSof7Royg_60vnoDCMcSJ9Vqw0qNOo7UtBENbKCZMqGVXsevkPrflg&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=IGkTOF8phjG8XEcVojcikw&_nc_ss=792a8&oh=00_A… (457 chars)",
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
                "uri": "https://scontent-phl2-1.xx.fbcdn.net/v/t1.6435-9/93806581_144287650470567_96044419450404864_n.png?stp=c257.0.315.315a_cp0_dst-png&cstp=mx315x315&ctp=s50x50&_nc_cat=110&ccb=1-7&_nc_sid=1760b9&_nc_ohc=sWuHqDfbgtIQ7kNvwE1ugzr&_nc_oc=AdqghXAOcGzuMlEvpe-GsnMt-25uqH4_LTICujPgHK5YfwIyeClIswNbQibiQFM4xvg&_nc_zt=23&_nc_ht=scontent-phl2-1.xx&_nc_gid=IGkTOF8phjG8XEcVojcikw&_nc_ss=792a8&oh=00_AQOiRAueL3a1SCOW… (442 chars)",
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
