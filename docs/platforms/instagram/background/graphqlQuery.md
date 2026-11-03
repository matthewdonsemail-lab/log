# graphqlQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/graphql/query` |
| Sends | `after`, `before`, `data`, `first`, `last`, `variant`, `__relay_internal__pv__PolarisShortDramaEnabledrelayprovider`, `__relay_internal__pv__PolarisMultiCaptionCarouselEnabledrelayprovider`, `__relay_internal__pv__PolarisThreadsStyleCommentsEnabledrelayprovider`, `__relay_internal__pv__PolarisReelsRecoDebugOverlayEnabledrelayprovider`, `__relay_internal__pv__PolarisAdDebugToolEnabledrelayprovider`, `__relay_internal__pv__PolarisSuggestedUserFeedUnitCardsEnabledrelayprovider` |
| Reads | `data.xdt_api__v1__feed__timeline__connection`, `extensions.is_final`, `extensions.all_video_dash_prefetch_representations`, `extensions.server_metadata`, `status` |
| Called from | `runs/inspect/20261103T180010_mattinferencesaver/script121.js:343 e`, `runs/inspect/20261103T180010_mattinferencesaver/script121.js:371 anonymous`, `runs/inspect/20261103T180010_mattinferencesaver/script121.js:417 anonymous`, `runs/inspect/20261103T180010_mattinferencesaver/script250.js:19 anonymous` |
| rea | `ev_9526128ceabbf057d2d22a7013da9a214adbe53a32932238933540d4c03b7101` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 2372 ms | 18395 ms | — |
| inspect | step 3: goto /direct/inbox/ | 1 | 200 | 1281 ms | 2039 ms | — |
| inspect | step 5: goto /direct/t/<id>/ | 1 | 200 | 1909 ms | 1503 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T180010_mattinferencesaver**, step 2: snapshot: 200, 2372 ms

Sent:

```json
{
  "__d": "www",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "PolarisFeedTimelineRootV2Query",
  "server_timestamps": "true",
  "variables": {
    "after": null,
    "before": null,
    "data": {
      "device_id": "DF1D3D1D-255B-4F43-9DDA-041497A618B6",
      "is_async_ads_double_request": "0",
      "is_async_ads_in_headload_enabled": "0",
      "is_async_ads_rti": "0",
      "rti_delivery_backend": "0"
    },
    "first": 3,
    "last": null,
    "variant": "home",
    "__relay_internal__pv__PolarisShortDramaEnabledrelayprovider": true,
    "__relay_internal__pv__PolarisMultiCaptionCarouselEnabledrelayprovider": true,
    "__relay_internal__pv__PolarisThreadsStyleCommentsEnabledrelayprovider": false,
    "__relay_internal__pv__PolarisReelsRecoDebugOverlayEnabledrelayprovider": false,
    "__relay_internal__pv__PolarisAdDebugToolEnabledrelayprovider": false,
    "__relay_internal__pv__PolarisSuggestedUserFeedUnitCardsEnabledrelayprovider": true
  },
  "doc_id": "29767988809470977"
}
```

Answered:

```json
{
  "data": {
    "xdt_api__v1__feed__timeline__connection": {
      "pagination_source": null,
      "edges": [
        {
          "node": "(10 fields)",
          "cursor": null
        },
        {
          "node": "(10 fields)",
          "cursor": null
        },
        {
          "node": "(10 fields)",
          "cursor": null
        },
        {
          "node": "(10 fields)",
          "cursor": null
        }
      ],
      "page_info": {
        "has_next_page": true,
        "end_cursor": "KCEAcLaB9hCvwjfuO8y4M3rPN9LBxFrs5LA35gq7FauPhTcW2LGSqbRoMhYCgijRAwCAGSJcqzyxNwGvJ98dzMo3Am8i07G0szeCkCC131C2NwV_IfzR_c83_SEK7ukEdDeZuYwqs2GmNyB5hzyDkf82oEm2W4Di-DYjJjPFjHmwN6P3sHl_DNE3pf-hCJAe0DenZLislPLPNylkR8S_Dos3q2OT_2pA0Tcr2ETRxH7KN62_o4p5ss03rnEhgbvK0DcvlKPY2xexNzM5Or4bW6c3tpohGJhbtje3-kQU-yW6NzYsxQDBZtE3On0hqxntqze7qyLoXqHNNzutow3-D9A3PIEqajmNrjc-aKqVuW5XNz9GhLgKSKw3v_1EwD7J0DdB9cR0QzIfN8IQ… (696 chars)",
        "has_previous_page": false,
        "start_cursor": null
      }
    }
  },
  "extensions": {
    "is_final": true,
    "all_video_dash_prefetch_representations": [
      {
        "video_id": "4012958971773370834",
        "representations": [
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "… 3 more"
        ],
        "initial_representation_ids": []
      },
      {
        "video_id": "4000761808955312870",
        "representations": [
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "… 4 more"
        ],
        "initial_representation_ids": []
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1793728857111,
      "time_at_flush_ms": 1793728859268
    }
  },
  "status": "ok"
}
```

**runs/inspect/20261103T180010_mattinferencesaver**, step 3: goto /direct/inbox/: 200, 1281 ms

Sent:

```json
{
  "__d": "www",
  "qpl_active_flow_ids": "767108973",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "PolarisFeedTimelineRootV2Query",
  "server_timestamps": "true",
  "variables": {
    "after": null,
    "before": null,
    "data": {
      "device_id": "DF1D3D1D-255B-4F43-9DDA-041497A618B6",
      "is_async_ads_double_request": "0",
      "is_async_ads_in_headload_enabled": "0",
      "is_async_ads_rti": "0",
      "rti_delivery_backend": "0"
    },
    "first": 3,
    "last": null,
    "variant": "home",
    "__relay_internal__pv__PolarisShortDramaEnabledrelayprovider": true,
    "__relay_internal__pv__PolarisMultiCaptionCarouselEnabledrelayprovider": true,
    "__relay_internal__pv__PolarisThreadsStyleCommentsEnabledrelayprovider": false,
    "__relay_internal__pv__PolarisReelsRecoDebugOverlayEnabledrelayprovider": false,
    "__relay_internal__pv__PolarisAdDebugToolEnabledrelayprovider": false,
    "__relay_internal__pv__PolarisSuggestedUserFeedUnitCardsEnabledrelayprovider": true
  },
  "doc_id": "29767988809470977",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=767108973"
  ]
}
```

Answered:

```json
{
  "data": {
    "xdt_api__v1__feed__timeline__connection": {
      "pagination_source": null,
      "edges": [
        {
          "node": "(10 fields)",
          "cursor": null
        },
        {
          "node": "(10 fields)",
          "cursor": null
        },
        {
          "node": "(10 fields)",
          "cursor": null
        },
        {
          "node": "(10 fields)",
          "cursor": null
        }
      ],
      "page_info": {
        "has_next_page": true,
        "end_cursor": "KCEAn8iAjcb5zzcBryffHczKN8O9SOGscc837jvMuDN6zzcWqMmVqbRoMhYCgnbohdGuDQA=",
        "has_previous_page": false,
        "start_cursor": null
      }
    }
  },
  "extensions": {
    "is_final": true,
    "all_video_dash_prefetch_representations": [
      {
        "video_id": "4020250046051626753",
        "representations": [
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "… 3 more"
        ],
        "initial_representation_ids": []
      },
      {
        "video_id": "4021707623438010527",
        "representations": [
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "(10 fields)"
        ],
        "initial_representation_ids": []
      },
      {
        "video_id": "4021557979593096643",
        "representations": [
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "(10 fields)",
          "(10 fields)"
        ],
        "initial_representation_ids": []
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1793728884292,
      "time_at_flush_ms": 1793728885355
    }
  },
  "status": "ok"
}
```

**runs/inspect/20261103T180010_mattinferencesaver**, step 5: goto /direct/t/<id>/: 200, 1909 ms

Sent:

```json
{
  "__d": "www",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "PolarisFeedTimelineRootV2Query",
  "server_timestamps": "true",
  "variables": {
    "after": null,
    "before": null,
    "data": {
      "device_id": "DF1D3D1D-255B-4F43-9DDA-041497A618B6",
      "is_async_ads_double_request": "0",
      "is_async_ads_in_headload_enabled": "0",
      "is_async_ads_rti": "0",
      "rti_delivery_backend": "0"
    },
    "first": 3,
    "last": null,
    "variant": "home",
    "__relay_internal__pv__PolarisShortDramaEnabledrelayprovider": true,
    "__relay_internal__pv__PolarisMultiCaptionCarouselEnabledrelayprovider": true,
    "__relay_internal__pv__PolarisThreadsStyleCommentsEnabledrelayprovider": false,
    "__relay_internal__pv__PolarisReelsRecoDebugOverlayEnabledrelayprovider": false,
    "__relay_internal__pv__PolarisAdDebugToolEnabledrelayprovider": false,
    "__relay_internal__pv__PolarisSuggestedUserFeedUnitCardsEnabledrelayprovider": true
  },
  "doc_id": "29767988809470977"
}
```

Answered:

```json
{
  "data": {
    "xdt_api__v1__feed__timeline__connection": {
      "pagination_source": null,
      "edges": [
        {
          "node": {
            "media": "(94 fields)",
            "ad": null,
            "explore_story": null,
            "end_of_feed_demarcator": null,
            "stories_netego": null,
            "suggested_users": null,
            "bloks_netego": null,
            "abra_icebreakers_in_feed_unit": null,
            "ad4ad_in_webfeed": null,
            "__typename": "XDTFeedItem"
          },
          "cursor": null
        },
        {
          "node": {
            "media": null,
            "ad": null,
            "explore_story": "(5 fields)",
            "end_of_feed_demarcator": null,
            "stories_netego": null,
            "suggested_users": null,
            "bloks_netego": null,
            "abra_icebreakers_in_feed_unit": null,
            "ad4ad_in_webfeed": null,
            "__typename": "XDTFeedItem"
          },
          "cursor": null
        },
        {
          "node": {
            "media": null,
            "ad": "(16 fields)",
            "explore_story": null,
            "end_of_feed_demarcator": null,
            "stories_netego": null,
            "suggested_users": null,
            "bloks_netego": null,
            "abra_icebreakers_in_feed_unit": null,
            "ad4ad_in_webfeed": null,
            "__typename": "XDTFeedItem"
          },
          "cursor": null
        },
        {
          "node": {
            "media": null,
            "ad": null,
            "explore_story": "(5 fields)",
            "end_of_feed_demarcator": null,
            "stories_netego": null,
            "suggested_users": null,
            "bloks_netego": null,
            "abra_icebreakers_in_feed_unit": null,
            "ad4ad_in_webfeed": null,
            "__typename": "XDTFeedItem"
          },
          "cursor": null
        }
      ],
      "page_info": {
        "has_next_page": true,
        "end_cursor": "KCEA7zI_D1iWtjeeQoEEtYzQN9LBxFrs5LA37jvMuDN6zzcWpoqgqbRoMhYCgijpAwCAGSJcqzyxNwJvItOxtLM3gpAgtd9QtjcFfyH80f3PN_0hCu7pBHQ3h_dO9sevtTcJniC52Q--NwmjqwQAhGs3jTGkvyqFWTcO5yL2VHrSN4-UNqZdmpQ3EQcW9vSjyjeZuYwqs2GmNyAOMU1sE5M3IHmHPIOR_zYjJjPFjHmwN6X_oQiQHtA3p2S4rJTyzzerY5P_akDRNyviqv-0srU3K9hE0cR-yjetv6OKebLNNy-Uo9jbF7E3tpohGJhbtje3-kQU-yW6NzYsxQDBZtE3On0hqxntqze7qyLoXqHNNzutow3-D9A3vZHFYaLd0Dc-aKqVuW5XN8Fl… (728 chars)",
        "has_previous_page": false,
        "start_cursor": null
      }
    }
  },
  "extensions": {
    "is_final": true,
    "all_video_dash_prefetch_representations": [
      {
        "video_id": "4012958971773370834",
        "representations": [
          {
            "base_url": "https://instagram.fdad3-6.fna.fbcdn.net/o1/v/t2/f2/m367/AQN9qMbyFxTO2dQ32dzJtN_W3yUzqZgxzowSQvcgwtl3gx6V664mllGFcNGEjojhAkIMu1vuhpedMfqcezFB6qDbe6Hy6-DDE9Vy-_A.mp4 (853 chars)",
            "bandwidth": 212043,
            "width": 540,
            "height": 960,
            "mime_type": "video/mp4",
            "codecs": "vp09.00.30.08.00.01.01.01.00",
            "playback_resolution_mos": "0:100,360:40.6,480:39.3,720:40.8,1080:45.2",
            "playback_resolution_csvqm": "0:100,360:65.2,480:54.1,720:37.2,1080:22.6",
            "segments": "(3 items)",
            "representation_id": "3877160552439642v"
          },
          {
            "base_url": "https://instagram.fdad3-6.fna.fbcdn.net/o1/v/t2/f2/m367/AQPW3ZIqt7ZRejGVk_r18NAnD7m4Jd3ln5TugIkpoNGVy7s7Wm1-zCL50Y-elrKk7Nyb04-76f3nTwps8frgyCp06g4qZY1I6J-i3xA.mp4 (853 chars)",
            "bandwidth": 265648,
            "width": 540,
            "height": 960,
            "mime_type": "video/mp4",
            "codecs": "vp09.00.30.08.00.01.01.01.00",
            "playback_resolution_mos": "0:100,360:45,480:43.4,720:44.2,1080:48.6",
            "playback_resolution_csvqm": "0:100,360:71.9,480:61.2,720:44.8,1080:30",
            "segments": "(3 items)",
            "representation_id": "3877160559106308v"
          },
          {
            "base_url": "https://instagram.fdad3-6.fna.fbcdn.net/o1/v/t2/f2/m367/AQO5Dfw6aT-zLGrPaluLYZwBFQXcbiCmTGkEYxEwPcN1MfGXS_a97PHV_1DuO37J9RdWLIiLuOpZccMfrScMX1jX7T9wPGqqwHHoVrQ.mp4 (853 chars)",
            "bandwidth": 370100,
            "width": 540,
            "height": 960,
            "mime_type": "video/mp4",
            "codecs": "vp09.00.30.08.00.01.01.01.00",
            "playback_resolution_mos": "0:100,360:53.3,480:50.7,720:50.3,1080:53.3",
            "playback_resolution_csvqm": "0:100,360:80.3,480:70.9,720:55.6,1080:40.9",
            "segments": "(3 items)",
            "representation_id": "3877160545772976v"
          },
          {
            "base_url": "https://instagram.fdad3-6.fna.fbcdn.net/o1/v/t2/f2/m367/AQOprKwicY9ykeJC4oDd_hTUcT0dxGiIygZKv5gtYHo1BN52WPvzmU4HrvV4Zw_0bLrXSLo4TibNtqU8ofIdNQ5unAhElt-DP5CxchI.mp4 (853 chars)",
            "bandwidth": 565166,
            "width": 540,
            "height": 960,
            "mime_type": "video/mp4",
            "codecs": "vp09.00.30.08.00.01.01.01.00",
            "playback_resolution_mos": "0:100,360:62.5,480:59.3,720:57.6,1080:59.3",
            "playback_resolution_csvqm": "0:100,360:89.3,480:82,720:68.5,1080:54.3",
            "segments": "(3 items)",
            "representation_id": "3877160555772975v"
          },
          {
            "base_url": "https://instagram.fdad3-6.fna.fbcdn.net/o1/v/t2/f2/m367/AQOr3ZiCTw__wnF_A9haAULGwBFtAlMGTfD3mqjoS7t7__r3B66uyWcXkECRVr4PjbKlhOXUOJohIIGEXA_XBIV3V8LacAZgVKbaFwc.mp4 (853 chars)",
            "bandwidth": 760137,
            "width": 720,
            "height": 1280,
            "mime_type": "video/mp4",
            "codecs": "vp09.00.31.08.00.01.01.01.00",
            "playback_resolution_mos": "0:100,360:66.5,480:63.4,720:61.3,1080:62.1",
            "playback_resolution_csvqm": "0:100,360:93,480:87.3,720:75.7,1080:63.4",
            "segments": "(3 items)",
            "representation_id": "3877160542439643v"
          },
          {
            "base_url": "https://instagram.fdad3-6.fna.fbcdn.net/o1/v/t2/f2/m367/AQNTw0aMQcNEC5es1CgdQQJuHf59YmXZwgLgbWqGRbx2p86SlWQFDQ-CTJnJ6H1Zn14_CSOQYqHe9mm64_BAhS0lQlhZtc8RfsJMijM.mp4 (851 chars)",
            "bandwidth": 1057403,
            "width": 720,
            "height": 1280,
            "mime_type": "video/mp4",
            "codecs": "vp09.00.31.08.00.01.01.01.00",
            "playback_resolution_mos": "0:100,360:72.4,480:69.6,720:67.1,1080:67",
            "playback_resolution_csvqm": "0:100,360:97.3,480:93.3,720:84.2,1080:73.5",
            "segments": "(3 items)",
            "representation_id": "3877160562439641v"
          },
          "… 3 more"
        ],
        "initial_representation_ids": []
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1793728969863,
      "time_at_flush_ms": 1793728971431
    }
  },
  "status": "ok"
}
```

<!-- facts:end -->

## What it does

<!-- toWrite --> What this request is for on Facebook's side, from its definition and the step it fires in.

## What our machine does with it

<!-- toWrite --> Which state of `marketplace/connect` or `marketplace/publish` waits for it, reads it, or ignores it, and why.

## What can go wrong

<!-- toWrite --> The errors and statuses it can return, what each means for the run, and the end or retry our machine takes.
