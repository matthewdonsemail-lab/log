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
| Called from | `runs/inspect/20261103T185330_mattinferencesaver/script4.js:343 e`, `runs/inspect/20261103T185330_mattinferencesaver/script4.js:371 anonymous`, `runs/inspect/20261103T185330_mattinferencesaver/script4.js:417 anonymous`, `runs/inspect/20261103T185330_mattinferencesaver/script33.js:118 anonymous` |
| rea | `ev_9526128ceabbf057d2d22a7013da9a214adbe53a32932238933540d4c03b7101` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 2: snapshot | 1 | 200 | 2372 ms | 18395 ms | — |
| inspect | step 3: goto /direct/inbox/ | 1 | 200 | 1281 ms | 2039 ms | — |
| inspect | step 5: goto /direct/t/<id>/ | 1 | 200 | 1909 ms | 1503 ms | — |
| inspect | step 1: goto /direct/t/<id>/ | 1 | 200 | 2017 ms | 3182 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T185330_mattinferencesaver**, step 1: goto /direct/t/<id>/: 200, 2017 ms

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
        "end_cursor": "KCEAn8iAjcb5zzd5dD0F7oK-N9LBxFrs5LA37jvMuDN6zzcW8LuUrLRoMhYCgiiBBAACbyLTsbSzNw7nIvZUetI3KMOANxwU0Tcr2ETRxH7KNy-Uo9jbF7E3Mzk6vhtbpzc19QiRq5-HNzg0A31P50Y3OtG_CVlaXzc7raMN_g_QN0DqyQzaxsU3QfXEdEMyHzdFbkXm9MeHN0WDO5obe9A3Samp9HpaBDdL4k47pu3JN0_LI6WSi803UNujkfGLyjdVRZOd0_fRN1cPIp5BpLM3WD8gbgwD0DdfmSMCT-OwN2KEyFfvL9A3Ys85ubX9wDdmVKCwGhHQN2p6xY-xccA3c_zHMDhrgjd5dD0F7oK-N33boPhQotA3gBkiXKs8sTeCkCC131C2N4lJ… (760 chars)",
        "has_previous_page": false,
        "start_cursor": null
      }
    }
  },
  "extensions": {
    "is_final": true,
    "all_video_dash_prefetch_representations": [
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
      }
    ],
    "server_metadata": {
      "request_start_time_ms": 1793732020329,
      "time_at_flush_ms": 1793732022026
    }
  },
  "status": "ok"
}
```

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

<!-- facts:end -->

## What it does

Loads the home feed's timeline through the web client (`PolarisFeedTimelineRootV2Query`, `first: 3`, `variant: home`) and answers `data.xdt_api__v1__feed__timeline__connection` with its edges. It fired 4 times in 2 runs on `snapshot`, `goto /direct/inbox/` and `goto /direct/t/<id>/` steps, taking 1281-2372 ms with status 200.

## What our machine does with it

Nothing: no log-cli machine waits on it and the engine has no timeline read. It is the home feed the web page loads behind the Direct screens, seen only in inspect recordings.

## What can go wrong

All 4 calls answered 200 with no errors. A failure would leave the page's feed behind the inbox empty and would not touch DM reads or sends.
