# CometHomeMegaMenuAllProductsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `26943575645248441` |
| Path | `/api/graphql/` |
| Sends | `scale`, `useNucleusIcon` |
| Reads | — |
| Called from | `CometHomeMegaMenuAllProducts.react` |
| rea | `ev_78a10afc58bb765d71fab141fd85b3c18aea439a22cd1af1ebfa86cb7d38ffd1` |

Seen 19 time(s) in 17 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 27: dwell 0.29s | 1 | 200 | 737 ms | 67 ms | — |
| inspect | post: "…", 103 words, 0 image(s), scrolled 70 px | 1 | 200 | 915 ms | 650 ms | — |
| inspect | step 12: dwell 0.14s | 1 | 200 | 586 ms | 811 ms | — |
| inspect | clickRole failed: RuntimeError: no visible button "…" | 1 | 200 | 434 ms | 15184 ms | — |
| inspect | step 24: clickRole button "…" | 1 | 200 | 477 ms | 745298 ms | — |
| inspect | step 67: dwell 1s | 1 | 200 | 874 ms | 52 ms | — |
| inspect | setLocation failed: TimeoutError: Locator.wait_for: Timeout 30000ms exceeded. | 1 | 200 | 1735 ms | 458 ms | — |
| inspect | step 16: type e232 | 1 | 200 | 618 ms | 9064 ms | — |
| inspect | step 5: wait 5s | 1 | 200 | 722 ms | 5574 ms | — |
| inspect | step 3: goto /marketplace/inbox | 3 | 200 | 552–743 ms | 10616–22216 ms | — |
| inspect | step 4: goto /marketplace/inbox | 1 | 200 | 1840 ms | 1630107 ms | — |
| inspect | step 6: wait 6s | 2 | 200 | 647–732 ms | 17703–36581 ms | — |
| host | expected ProfileCometProfilePictureSetMutation: sent | 1 | 200 | 526 ms | 1413758 ms | — |
| flow | step 1: goto /marketplace/ | 1 | 200 | 1643 ms | 12378 ms | — |
| host | setLocation: 'Mountain Top, Pennsylvania' is suggestion 2 of 9 | 1 | 200 | 707 ms | 690233 ms | — |
| flow | upload: photo2.jpg handed to the file chooser | 1 | 200 | 707 ms | 1371 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T064655_61593981307720**, step 3: goto /marketplace/inbox: 200, 552 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeMegaMenuAllProductsQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1,
    "useNucleusIcon": false
  },
  "doc_id": "26943575645248441"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "social": {
        "name": "Social",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)",
            "(9 fields)",
            "(9 fields)",
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "2974823256138234"
      },
      "entertainment": {
        "name": "Entertainment",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "487279742676481"
      },
      "shopping": {
        "name": "Shopping",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "1072767163222607"
      },
      "personal": {
        "name": "Personal",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "486958482316132"
      },
      "professional": {
        "name": "Professional",
        "bookmarks": {
          "nodes": [
            "(9 fields)"
          ]
        },
        "id": "436682174236063"
      },
      "communityResources": {
        "name": "Community Resources",
        "bookmarks": {
          "nodes": []
        },
        "id": "425122528575951"
      },
      "appsFromFacebook": {
        "name": "More from Meta",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)",
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "1759291240910861"
      },
      "actor": {
        "__typename": "User",
        "profile_plus_should_hoist_professional_section_comet_mega_menu": false,
        "should_block_mbs_redirect": false,
        "id": "61593981307720"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/y3/r/VTvvptemt72.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yJ/r/_E6CYXQ_FqC.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yz/r/wZBdW_qnLOB.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yT/r/JYr05Vf7xjV.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/y-/r/ITvoZIONvPL.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yv/r/G_HHYFVKqWp.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      "… 16 more"
    ],
    "server_metadata": {
      "request_start_time_ms": 1792910893810,
      "time_at_flush_ms": 1792910893981
    },
    "is_final": true
  }
}
```

**runs/inspect/20261023T045453_61594063207669**, step 6: wait 6s: 200, 732 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeMegaMenuAllProductsQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1,
    "useNucleusIcon": false
  },
  "doc_id": "26943575645248441"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "social": {
        "name": "Social",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)",
            "(9 fields)",
            "(9 fields)",
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "2974823256138234"
      },
      "entertainment": {
        "name": "Entertainment",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "487279742676481"
      },
      "shopping": {
        "name": "Shopping",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "1072767163222607"
      },
      "personal": {
        "name": "Personal",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "486958482316132"
      },
      "professional": {
        "name": "Professional",
        "bookmarks": {
          "nodes": [
            "(9 fields)"
          ]
        },
        "id": "436682174236063"
      },
      "communityResources": {
        "name": "Community resources",
        "bookmarks": {
          "nodes": []
        },
        "id": "425122528575951"
      },
      "appsFromFacebook": {
        "name": "More from Meta",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)",
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "1759291240910861"
      },
      "actor": {
        "__typename": "User",
        "profile_plus_should_hoist_professional_section_comet_mega_menu": false,
        "should_block_mbs_redirect": false,
        "id": "61594063207669"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yz/r/wZBdW_qnLOB.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yJ/r/_E6CYXQ_FqC.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/y3/r/VTvvptemt72.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yT/r/JYr05Vf7xjV.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/y_/r/R4eauTzM8dl.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/ya/r/k_2AcQbzeZL.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      "… 16 more"
    ],
    "server_metadata": {
      "request_start_time_ms": 1792731643360,
      "time_at_flush_ms": 1792731643530
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T130601_61594063207669**, step 4: goto /marketplace/inbox: 200, 1840 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometHomeMegaMenuAllProductsQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1,
    "useNucleusIcon": false
  },
  "doc_id": "26943575645248441"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "social": {
        "name": "Social",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)",
            "(9 fields)",
            "(9 fields)",
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "2974823256138234"
      },
      "entertainment": {
        "name": "Entertainment",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "487279742676481"
      },
      "shopping": {
        "name": "Shopping",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "1072767163222607"
      },
      "personal": {
        "name": "Personal",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "486958482316132"
      },
      "professional": {
        "name": "Professional",
        "bookmarks": {
          "nodes": [
            "(9 fields)"
          ]
        },
        "id": "436682174236063"
      },
      "communityResources": {
        "name": "Community resources",
        "bookmarks": {
          "nodes": []
        },
        "id": "425122528575951"
      },
      "appsFromFacebook": {
        "name": "More from Meta",
        "bookmarks": {
          "nodes": [
            "(9 fields)",
            "(9 fields)",
            "(9 fields)",
            "(9 fields)"
          ]
        },
        "id": "1759291240910861"
      },
      "actor": {
        "__typename": "User",
        "profile_plus_should_hoist_professional_section_comet_mega_menu": false,
        "should_block_mbs_redirect": false,
        "id": "61594063207669"
      }
    }
  },
  "extensions": {
    "prefetch_uris_v2": [
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yw/r/y1z3mT73M1Q.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yi/r/_-6DsSRXGcS.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yz/r/wZBdW_qnLOB.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yK/r/pt3boho8KBZ.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/y8/r/iaP8U-_yJOY.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yF/r/IOdWWyXde8k.webp",
        "label": null,
        "width": null,
        "height": null,
        "surface": null
      },
      "… 16 more"
    ],
    "server_metadata": {
      "request_start_time_ms": 1792676064680,
      "time_at_flush_ms": 1792676064854
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Loads the "Menu" panel's full product list (Marketplace, Groups, Reels…) when the cursor rests on or opens the Facebook menu button.

## What our machine does with it

Nothing. It fired while the human mouse (rule 32) rested on the "Facebook menu" button between steps: a hover on the button prefetches the menu.

## What can go wrong

Harmless. Worth knowing: a resting cursor makes the page fetch; our idle mouse causes the same requests a person's hand does.
