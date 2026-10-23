# MarketplacePDPRightColumnAdsQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `27876163185349836` |
| Path | `/api/graphql/` |
| Sends | `adsRelatedTo`, `browseContext`, `count`, `cursor`, `scale`, `__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider` |
| Reads | `viewer.marketplace_feed_stories` |
| Called from | `MarketplacePDPRightColumnAds.react` |
| rea | `ev_60c1ff17945c01c64f962c11cd4de230589c6861a2a0e6b369989fa6b189d159` |

Seen 10 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| warmup | scroll: +127px in 4 wheel steps, 125 ms | 1 | 200 | 3017 ms | 2121 ms | — |
| warmup | scroll: -605px in 14 wheel steps, 687 ms | 1 | 200 | 1685 ms | 1694 ms | — |
| warmup | step 10: openAny 2-4 x /marketplace/item/ | 1 | 200 | 3827 ms | 2099 ms | — |
| warmup | openAny: read /marketplace/item/<id>/ | 1 | 200 | 1492 ms | 3303 ms | — |
| warmup | scroll: -756px in 16 wheel steps, 656 ms | 1 | 200 | 2050 ms | 689 ms | — |
| inspect | scroll: -577px in 13 wheel steps, 859 ms | 1 | 200 | 2056 ms | 2392 ms | — |
| inspect | scroll: +978px in 22 wheel steps, 1531 ms | 1 | 200 | 1783 ms | 823 ms | — |
| inspect | step 25: openAny 1-3 x /marketplace/item/ | 1 | 200 | 1762 ms | 1236 ms | — |
| inspect | scroll: +161px in 5 wheel steps, 250 ms | 1 | 200 | 1918 ms | 1885 ms | — |
| inspect | scroll: -161px in 5 wheel steps, 172 ms | 1 | 200 | 1987 ms | 702 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261023T045453_61594063207669**, scroll: +161px in 5 wheel steps, 250 ms: 200, 1918 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPRightColumnAdsQuery",
  "server_timestamps": "true",
  "variables": {
    "adsRelatedTo": "39887208997530861",
    "browseContext": "PDP_RELATED_ADS_FEED",
    "count": 1,
    "cursor": "",
    "scale": 1,
    "__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider": true
  },
  "doc_id": "27876163185349836"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "viewer": {
        "marketplace_feed_stories": {
          "edges": [
            {
              "node": "(10 fields)"
            }
          ]
        }
      }
    },
    "extensions": {
      "all_video_dash_prefetch_representations": [
        {
          "initial_representation_ids": [],
          "representations": [
            {
              "representation_id": "2043589006388151v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.04M.08.0.110",
              "base_url": "https://video-phl2-1.xx.fbcdn.net/o1/v/t2/f2/m366/AQPDPw-GshBYrVq65l-4RYwUW6-3OgxO52JDXDReClJjo4q7QEoFG3jYMsKVMkc7p3R9iNAgPYAQ2-OIKPmZ8kXn7bot6J5qHd1tt2s.mp4?_nc_cat=111&_nc_sid=9ca052&_nc_ht=video-phl2-1.xx.fbcdn.net&_nc_ohc=gEbbYUS-CuAQ7kNvwFQnyFm&efg=eyJ2ZW5jb2RlX3RhZyI6ImRhc2hfcjJhdjEtcjFnZW4ydnA5X3EyMCIsInZpZGVvX2lkIjoxNzg2NDMxNDcyMTkyMDAwLCJvaWxfdXJsZ2VuX2FwcF9pZCI6MCwiY2xpZW50X25hbWUiOiJ1bm… (710 chars)",
              "bandwidth": 131390,
              "height": 540,
              "width": 960,
              "playback_resolution_mos": "0:100,360:72.1,480:70.8,720:69.7,1080:70.2",
              "playback_resolution_csvqm": "0:100,360:87.1,480:83.4,720:76.5,1080:68.8",
              "segments": "(3 items)"
            },
            {
              "representation_id": "645399055174596v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.05M.08.0.110",
              "base_url": "https://video-phl2-1.xx.fbcdn.net/o1/v/t2/f2/m366/AQOIPqAlz2424w27pkx-8poAGP2gx8n1K7chUbJtGNyKMxSlJnHY8crcBZmU0Ul5-Pl_Tm4E4sX2L9zobF3AVdD-K2eek0H4HwNAeKY.mp4?_nc_cat=107&_nc_sid=9ca052&_nc_ht=video-phl2-1.xx.fbcdn.net&_nc_ohc=O_4MJcfDyX4Q7kNvwHjJtx4&efg=eyJ2ZW5jb2RlX3RhZyI6ImRhc2hfcjJhdjEtcjFnZW4ydnA5X3EzMCIsInZpZGVvX2lkIjoxNzg2NDMxNDcyMTkyMDAwLCJvaWxfdXJsZ2VuX2FwcF9pZCI6MCwiY2xpZW50X25hbWUiOiJ1bm… (710 chars)",
              "bandwidth": 175404,
              "height": 720,
              "width": 1280,
              "playback_resolution_mos": "0:100,360:75.4,480:74.2,720:73.4,1080:73.4",
              "playback_resolution_csvqm": "0:100,360:90.3,480:87.5,720:82.7,1080:76.3",
              "segments": "(3 items)"
            },
            {
              "representation_id": "1246845603875704v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.05M.08.0.110",
              "base_url": "https://video-phl2-1.xx.fbcdn.net/o1/v/t2/f2/m366/AQMTXMnNgrCcGoqKWqpanqhOMGVfwLeUTa1OAWxy52vutcKDho4hW3CKmrfkFMSvOQ76uM4PVqDpIjmaGtwTrXinfLPtk9CP5bcbuQA.mp4?_nc_cat=102&_nc_sid=9ca052&_nc_ht=video-phl2-1.xx.fbcdn.net&_nc_ohc=Gdx3B8fpyYIQ7kNvwFU2fNG&efg=eyJ2ZW5jb2RlX3RhZyI6ImRhc2hfcjJhdjEtcjFnZW4ydnA5X3E0MCIsInZpZGVvX2lkIjoxNzg2NDMxNDcyMTkyMDAwLCJvaWxfdXJsZ2VuX2FwcF9pZCI6MCwiY2xpZW50X25hbWUiOiJ1bm… (710 chars)",
              "bandwidth": 231098,
              "height": 720,
              "width": 1280,
              "playback_resolution_mos": "0:100,360:78.5,480:77,720:76,1080:75.5",
              "playback_resolution_csvqm": "0:100,360:92.6,480:90.7,720:86.3,1080:80.6",
              "segments": "(3 items)"
            },
            {
              "representation_id": "933093111999960v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.05M.08.0.111",
              "base_url": "https://video-phl2-1.xx.fbcdn.net/o1/v/t2/f2/m86/AQMxXHUufcDxw9-xoxFjCcRTiqb69T-Q_YG9pslOhgWvDvvaFFkpwPTk04HfpGKvT__62_CIUva6RcgWD0Fc-LU.mp4?_nc_cat=100&_nc_sid=9ca052&_nc_ht=video-phl2-1.xx.fbcdn.net&_nc_ohc=zIUQUuLr8l8Q7kNvwHxsavR&efg=eyJ2ZW5jb2RlX3RhZyI6ImRhc2hfcjJhdjEtcjFnZW4ydnA5X3E1MCIsInZpZGVvX2lkIjoxNzg2NDMxNDcyMTkyMDAwLCJvaWxfdXJsZ2VuX2FwcF9pZCI6MCwiY2xpZW50X25hbWUiOiJ1bmtub3duIiwieHB2X2F… (695 chars)",
              "bandwidth": 66058,
              "height": 720,
              "width": 1280,
              "playback_resolution_mos": "0:100,360:60.3,480:60.4,720:62.4,1080:65.6",
              "playback_resolution_csvqm": "0:100,360:76.8,480:71.9,720:65,1080:58.1",
              "segments": "(3 items)"
            },
            {
              "representation_id": "530001576500827v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.05M.08.0.111",
              "base_url": "https://video-phl2-1.xx.fbcdn.net/o1/v/t2/f2/m86/AQPAwkjG6omfw_rtAtk6tiSp4EWE2hMVtAlRJCZ0xJ2fxNVP_1NZbWapjriqjPRPV92AhB89isUieYk6y2VO2QU.mp4?_nc_cat=101&_nc_sid=9ca052&_nc_ht=video-phl2-1.xx.fbcdn.net&_nc_ohc=tcZVfglLrGQQ7kNvwGIgqxH&efg=eyJ2ZW5jb2RlX3RhZyI6ImRhc2hfcjJhdjEtcjFnZW4ydnA5X3E2MCIsInZpZGVvX2lkIjoxNzg2NDMxNDcyMTkyMDAwLCJvaWxfdXJsZ2VuX2FwcF9pZCI6MCwiY2xpZW50X25hbWUiOiJ1bmtub3duIiwieHB2X2F… (693 chars)",
              "bandwidth": 200167,
              "height": 720,
              "width": 1280,
              "playback_resolution_mos": "0:100,360:79.3,480:78.3,720:78.3,1080:79.1",
              "playback_resolution_csvqm": "0:100,360:92.9,480:90.9,720:87.1,1080:81.8",
              "segments": "(3 items)"
            },
            {
              "representation_id": "1526972657933623v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.05M.08.0.111",
              "base_url": "https://video-phl2-1.xx.fbcdn.net/o1/v/t2/f2/m86/AQMpBSX_gtEPhubaGuAdM-_8bDNu-Rs6eHN-DKaeWOv92qV_ttTmmY2SGhoXOkSO-SXwhEaVe1PaUKkCsOx6n8BH.mp4?_nc_cat=109&_nc_sid=9ca052&_nc_ht=video-phl2-1.xx.fbcdn.net&_nc_ohc=T-C6rXuUrJAQ7kNvwEFsTev&efg=eyJ2ZW5jb2RlX3RhZyI6ImRhc2hfcjJhdjEtcjFnZW4ydnA5X3E3MCIsInZpZGVvX2lkIjoxNzg2NDMxNDcyMTkyMDAwLCJvaWxfdXJsZ2VuX2FwcF9pZCI6MCwiY2xpZW50X25hbWUiOiJ1bmtub3duIiwieHB2X2… (694 chars)",
              "bandwidth": 344266,
              "height": 720,
              "width": 1280,
              "playback_resolution_mos": "0:100,360:86.3,480:85.3,720:84.7,1080:84.4",
              "playback_resolution_csvqm": "0:100,360:95.4,480:94.6,720:92.2,1080:88.5",
              "segments": "(3 items)"
            },
            "… 3 more"
          ],
          "video_id": "1786431472192000",
          "nextgendash": true
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792731489079,
        "time_at_flush_ms": 1792731490360
      },
      "is_final": false,
      "sr_payload": {
        "ddd": {
          "hsrp": {
            "hblp": {
              "consistency": "(1 fields)",
              "rsrcMap": "(1 fields)",
              "indexUpgrades": "(0 fields)"
            }
          },
          "jsmods": {
            "require": [
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "… 5 more"
            ]
          },
          "allResources": [
            "csr:_1c_0_eo"
          ],
          "tieredResources": {
            "r": [
              "csr:_1c_0_eo"
            ],
            "rdfds": [],
            "rds": []
          }
        }
      }
    }
  },
  "followingParts": 1,
  "parts": [
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": [
        "viewer",
        "marketplace_feed_stories",
        "edges",
        0,
        "node",
        "story",
        "… 3 more"
      ],
      "data": {
        "id": "1786431472192000",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 22
        },
        "instream_video_ad_breaks_comet": null
      },
      "extensions": {
        "all_video_dash_prefetch_representations": [
          {
            "initial_representation_ids": [],
            "representations": [
              "(10 fields)",
              "(10 fields)",
              "(10 fields)",
              "(10 fields)",
              "(10 fields)",
              "(10 fields)",
              "… 3 more"
            ],
            "video_id": "1786431472192000",
            "nextgendash": true
          }
        ],
        "is_final": true
      }
    }
  ]
}
```

**runs/inspect/20261023T045453_61594063207669**, scroll: -161px in 5 wheel steps, 172 ms: 200, 1987 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "MarketplacePDPRightColumnAdsQuery",
  "server_timestamps": "true",
  "variables": {
    "adsRelatedTo": "28549509658039213",
    "browseContext": "PDP_RELATED_ADS_FEED",
    "count": 1,
    "cursor": "",
    "scale": 1,
    "__relay_internal__pv__GHLShouldChangeMarketplaceSponsoredDataFieldNamerelayprovider": true
  },
  "doc_id": "27876163185349836"
}
```

Answered:

```json
{
  "first": {
    "data": {
      "viewer": {
        "marketplace_feed_stories": {
          "edges": [
            {
              "node": "(10 fields)"
            }
          ]
        }
      }
    },
    "extensions": {
      "all_video_dash_prefetch_representations": [
        {
          "initial_representation_ids": [],
          "representations": [
            {
              "representation_id": "2043589006388151v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.04M.08.0.110",
              "base_url": "https://video-phl2-1.xx.fbcdn.net/o1/v/t2/f2/m366/AQPDPw-GshBYrVq65l-4RYwUW6-3OgxO52JDXDReClJjo4q7QEoFG3jYMsKVMkc7p3R9iNAgPYAQ2-OIKPmZ8kXn7bot6J5qHd1tt2s.mp4?_nc_cat=111&_nc_sid=9ca052&_nc_ht=video-phl2-1.xx.fbcdn.net&_nc_ohc=gEbbYUS-CuAQ7kNvwFQnyFm&efg=eyJ2ZW5jb2RlX3RhZyI6ImRhc2hfcjJhdjEtcjFnZW4ydnA5X3EyMCIsInZpZGVvX2lkIjoxNzg2NDMxNDcyMTkyMDAwLCJvaWxfdXJsZ2VuX2FwcF9pZCI6MCwiY2xpZW50X25hbWUiOiJ1bm… (710 chars)",
              "bandwidth": 131390,
              "height": 540,
              "width": 960,
              "playback_resolution_mos": "0:100,360:72.1,480:70.8,720:69.7,1080:70.2",
              "playback_resolution_csvqm": "0:100,360:87.1,480:83.4,720:76.5,1080:68.8",
              "segments": "(3 items)"
            },
            {
              "representation_id": "645399055174596v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.05M.08.0.110",
              "base_url": "https://video-phl2-1.xx.fbcdn.net/o1/v/t2/f2/m366/AQOIPqAlz2424w27pkx-8poAGP2gx8n1K7chUbJtGNyKMxSlJnHY8crcBZmU0Ul5-Pl_Tm4E4sX2L9zobF3AVdD-K2eek0H4HwNAeKY.mp4?_nc_cat=107&_nc_sid=9ca052&_nc_ht=video-phl2-1.xx.fbcdn.net&_nc_ohc=O_4MJcfDyX4Q7kNvwHjJtx4&efg=eyJ2ZW5jb2RlX3RhZyI6ImRhc2hfcjJhdjEtcjFnZW4ydnA5X3EzMCIsInZpZGVvX2lkIjoxNzg2NDMxNDcyMTkyMDAwLCJvaWxfdXJsZ2VuX2FwcF9pZCI6MCwiY2xpZW50X25hbWUiOiJ1bm… (710 chars)",
              "bandwidth": 175404,
              "height": 720,
              "width": 1280,
              "playback_resolution_mos": "0:100,360:75.4,480:74.2,720:73.4,1080:73.4",
              "playback_resolution_csvqm": "0:100,360:90.3,480:87.5,720:82.7,1080:76.3",
              "segments": "(3 items)"
            },
            {
              "representation_id": "1246845603875704v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.05M.08.0.110",
              "base_url": "https://video-phl2-1.xx.fbcdn.net/o1/v/t2/f2/m366/AQMTXMnNgrCcGoqKWqpanqhOMGVfwLeUTa1OAWxy52vutcKDho4hW3CKmrfkFMSvOQ76uM4PVqDpIjmaGtwTrXinfLPtk9CP5bcbuQA.mp4?_nc_cat=102&_nc_sid=9ca052&_nc_ht=video-phl2-1.xx.fbcdn.net&_nc_ohc=Gdx3B8fpyYIQ7kNvwFU2fNG&efg=eyJ2ZW5jb2RlX3RhZyI6ImRhc2hfcjJhdjEtcjFnZW4ydnA5X3E0MCIsInZpZGVvX2lkIjoxNzg2NDMxNDcyMTkyMDAwLCJvaWxfdXJsZ2VuX2FwcF9pZCI6MCwiY2xpZW50X25hbWUiOiJ1bm… (710 chars)",
              "bandwidth": 231098,
              "height": 720,
              "width": 1280,
              "playback_resolution_mos": "0:100,360:78.5,480:77,720:76,1080:75.5",
              "playback_resolution_csvqm": "0:100,360:92.6,480:90.7,720:86.3,1080:80.6",
              "segments": "(3 items)"
            },
            {
              "representation_id": "933093111999960v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.05M.08.0.111",
              "base_url": "https://video-phl2-1.xx.fbcdn.net/o1/v/t2/f2/m86/AQMxXHUufcDxw9-xoxFjCcRTiqb69T-Q_YG9pslOhgWvDvvaFFkpwPTk04HfpGKvT__62_CIUva6RcgWD0Fc-LU.mp4?_nc_cat=100&_nc_sid=9ca052&_nc_ht=video-phl2-1.xx.fbcdn.net&_nc_ohc=zIUQUuLr8l8Q7kNvwHxsavR&efg=eyJ2ZW5jb2RlX3RhZyI6ImRhc2hfcjJhdjEtcjFnZW4ydnA5X3E1MCIsInZpZGVvX2lkIjoxNzg2NDMxNDcyMTkyMDAwLCJvaWxfdXJsZ2VuX2FwcF9pZCI6MCwiY2xpZW50X25hbWUiOiJ1bmtub3duIiwieHB2X2F… (695 chars)",
              "bandwidth": 66058,
              "height": 720,
              "width": 1280,
              "playback_resolution_mos": "0:100,360:60.3,480:60.4,720:62.4,1080:65.6",
              "playback_resolution_csvqm": "0:100,360:76.8,480:71.9,720:65,1080:58.1",
              "segments": "(3 items)"
            },
            {
              "representation_id": "530001576500827v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.05M.08.0.111",
              "base_url": "https://video-phl2-1.xx.fbcdn.net/o1/v/t2/f2/m86/AQPAwkjG6omfw_rtAtk6tiSp4EWE2hMVtAlRJCZ0xJ2fxNVP_1NZbWapjriqjPRPV92AhB89isUieYk6y2VO2QU.mp4?_nc_cat=101&_nc_sid=9ca052&_nc_ht=video-phl2-1.xx.fbcdn.net&_nc_ohc=tcZVfglLrGQQ7kNvwGIgqxH&efg=eyJ2ZW5jb2RlX3RhZyI6ImRhc2hfcjJhdjEtcjFnZW4ydnA5X3E2MCIsInZpZGVvX2lkIjoxNzg2NDMxNDcyMTkyMDAwLCJvaWxfdXJsZ2VuX2FwcF9pZCI6MCwiY2xpZW50X25hbWUiOiJ1bmtub3duIiwieHB2X2F… (693 chars)",
              "bandwidth": 200167,
              "height": 720,
              "width": 1280,
              "playback_resolution_mos": "0:100,360:79.3,480:78.3,720:78.3,1080:79.1",
              "playback_resolution_csvqm": "0:100,360:92.9,480:90.9,720:87.1,1080:81.8",
              "segments": "(3 items)"
            },
            {
              "representation_id": "1526972657933623v",
              "mime_type": "video/mp4",
              "codecs": "av01.0.05M.08.0.111",
              "base_url": "https://video-phl2-1.xx.fbcdn.net/o1/v/t2/f2/m86/AQMpBSX_gtEPhubaGuAdM-_8bDNu-Rs6eHN-DKaeWOv92qV_ttTmmY2SGhoXOkSO-SXwhEaVe1PaUKkCsOx6n8BH.mp4?_nc_cat=109&_nc_sid=9ca052&_nc_ht=video-phl2-1.xx.fbcdn.net&_nc_ohc=T-C6rXuUrJAQ7kNvwEFsTev&efg=eyJ2ZW5jb2RlX3RhZyI6ImRhc2hfcjJhdjEtcjFnZW4ydnA5X3E3MCIsInZpZGVvX2lkIjoxNzg2NDMxNDcyMTkyMDAwLCJvaWxfdXJsZ2VuX2FwcF9pZCI6MCwiY2xpZW50X25hbWUiOiJ1bmtub3duIiwieHB2X2… (694 chars)",
              "bandwidth": 344266,
              "height": 720,
              "width": 1280,
              "playback_resolution_mos": "0:100,360:86.3,480:85.3,720:84.7,1080:84.4",
              "playback_resolution_csvqm": "0:100,360:95.4,480:94.6,720:92.2,1080:88.5",
              "segments": "(3 items)"
            },
            "… 3 more"
          ],
          "video_id": "1786431472192000",
          "nextgendash": true
        }
      ],
      "server_metadata": {
        "request_start_time_ms": 1792731498839,
        "time_at_flush_ms": 1792731499844
      },
      "is_final": false,
      "sr_payload": {
        "ddd": {
          "hsrp": {
            "hblp": {
              "consistency": "(1 fields)",
              "rsrcMap": "(1 fields)",
              "indexUpgrades": "(0 fields)"
            }
          },
          "jsmods": {
            "require": [
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "(1 items)",
              "… 5 more"
            ]
          },
          "allResources": [
            "csr:_1i_0_bW"
          ],
          "tieredResources": {
            "r": [
              "csr:_1i_0_bW"
            ],
            "rdfds": [],
            "rds": []
          }
        }
      }
    }
  },
  "followingParts": 1,
  "parts": [
    {
      "label": "VideoPlayerRelay_video$defer$InstreamVideoAdBreaksPlayer_video",
      "path": [
        "viewer",
        "marketplace_feed_stories",
        "edges",
        0,
        "node",
        "story",
        "… 3 more"
      ],
      "data": {
        "id": "1786431472192000",
        "instream_extra_config": {
          "instream_halo_delay_time_seconds": 22
        },
        "instream_video_ad_breaks_comet": null
      },
      "extensions": {
        "all_video_dash_prefetch_representations": [
          {
            "initial_representation_ids": [],
            "representations": [
              "(10 fields)",
              "(10 fields)",
              "(10 fields)",
              "(10 fields)",
              "(10 fields)",
              "(10 fields)",
              "… 3 more"
            ],
            "video_id": "1786431472192000",
            "nextgendash": true
          }
        ],
        "is_final": true
      }
    }
  ]
}
```

<!-- facts:end -->

## What it does

Loads the sponsored listings in a Marketplace listing page's right column (`viewer.marketplace_feed_stories`, `adsRelatedTo` the listing open). It fired 3 times in 2 runs, 0.8-2.0 s into the step that opened a listing, with the listing's own requests.

## What our machine does with it

Nothing in our machines reads it; it comes with every listing `openListings` opens.

## What can go wrong

None seen: all three answered 200, the slowest of a listing's requests at 1762-2056 ms. Nothing waits on it.
