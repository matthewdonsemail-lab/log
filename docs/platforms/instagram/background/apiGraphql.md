# apiGraphql

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/api/graphql` |
| Sends | `device_id_for_iris_subscription`, `folder`, `__relay_internal__pv__IGDMetaAIThreadingEnabledGKrelayprovider`, `__relay_internal__pv__IGDIsProfessionalAccountGKrelayprovider`, `__relay_internal__pv__IGDPinnedThreadsRenderEnabledGKrelayprovider`, `__relay_internal__pv__IGDMaxUnreadMessagesCountrelayprovider`, `__relay_internal__pv__IGDThreadListActionsEnabledGKrelayprovider`, `newer_than_timestamp_ms`, `min_uq_seq_id`, `thread_fbid`, `__relay_internal__pv__IGDEnableOffMsysChatThemesQErelayprovider`, `__relay_internal__pv__IGDInitialMessagePageCountrelayprovider`, `data`, `scale`, `surface_nux_ids`, `trigger_context`, `_request_data`, `payload`, `metadata`, `attachment_fbid`, `thread_id`, `offline_threading_id`, `reply_to_message_id`, `forwarded_from_thread_id`, `is_forwarded_from_own_message`, `input`, `render_succeeded`, `encrypted_context`, `failure_reason`, `device_id`, `captcha_response`, `ig_thread_igid`, `recipient_igids`, `replied_to_client_context`, `replied_to_item_id`, `sampled`, `text`, `mentions`, `mentioned_user_ids`, `commands`, `send_attribution` |
| Reads | `data.xdt_get_igd_automatic_previews_disabled`, `extensions.server_metadata`, `extensions.is_final`, `data.polling_intervals__`, `data.xfb_ix_ig_account_status_web`, `data.xfb_feature_limits`, `extensions.live_query`, `data.get_slide_mailbox_for_iris_subscription`, `data.xdt_api__v1__get__presence__disabled`, `data.xfb_viewer`, `data.viewer`, `data.get_slide_thread_nullable` and 17 more |
| Called from | `runs/inspect/20261103T185330_mattinferencesaver/script2.js:87 anonymous`, `runs/inspect/20261103T185330_mattinferencesaver/script4.js:1309 anonymous`, `runs/inspect/20261103T185330_mattinferencesaver/script4.js:371 m` |
| rea | `ev_27eceaba6115086f4af94c2fc0c0d7947c1495c9588392e6a8d948ff7f80c47b` |

Seen 113 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 2663 ms | 12638 ms | — |
| inspect | step 2: snapshot | 13 | 200 | 220–3780 ms | 2137–35184 ms | — |
| inspect | step 3: goto /direct/inbox/ | 25 | 200 | 184–849 ms | 878–5606 ms | — |
| inspect | step 5: goto /direct/t/<id>/ | 27 | 200 | 183–581 ms | 938–5562 ms | — |
| inspect | step 8: click e777 | 3 | 200 | 182–786 ms | 2003–2032 ms | — |
| inspect | step 10: wait 40s | 5 | 200 | 187–572 ms | 5740–63454 ms | — |
| inspect | step 13: click e948 | 5 | 200 | 181–746 ms | 1201–63098 ms | — |
| inspect | step 16: click e1036 | 3 | 200 | 249–485 ms | 1955–1991 ms | — |
| inspect | step 1: goto /direct/t/<id>/ | 27 | 200 | 185–716 ms | 976–6844 ms | — |
| inspect | upload: paulie.jpg handed to the file chooser | 1 | 200 | 284 ms | 6116 ms | — |
| inspect | step 4: click e783 | 3 | 200 | 184–857 ms | 1249–1283 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261103T185330_mattinferencesaver**, step 1: goto /direct/t/<id>/: 200, 199 ms

Sent:

```json
{
  "__d": "www",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "PolarisAutomaticPreviewsDisabledContextProviderQuery",
  "server_timestamps": "true",
  "variables": {},
  "doc_id": "36445470711719123"
}
```

Answered:

```json
{
  "data": {
    "xdt_get_igd_automatic_previews_disabled": {
      "disabled": 0
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793732018125,
      "time_at_flush_ms": 1793732018144
    },
    "is_final": true
  }
}
```

**runs/inspect/20261103T185330_mattinferencesaver**, upload: paulie.jpg handed to the file chooser: 200, 284 ms

Sent:

```json
{
  "__d": "www",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "IGDInboxInfoOffMsysQuery",
  "server_timestamps": "true",
  "variables": {
    "thread_fbid": "1659203035864604",
    "__relay_internal__pv__IGDEnableOffMsysChatThemesQErelayprovider": false
  },
  "doc_id": "28792367400422466"
}
```

Answered:

```json
{
  "data": {
    "get_slide_thread_nullable": {
      "as_ig_direct_thread": {
        "event_chat_info": null,
        "id": "1659203035864604",
        "isGroup": false,
        "viewer_id": "23597386648",
        "users": [
          {
            "id": "65125809236",
            "fbid_v2": "17841465077090726",
            "interop_messaging_user_fbid": "17844200922169237",
            "friendship_status": {
              "blocking": false
            },
            "username": "abelqx",
            "profile_pic_url": "https://instagram.fdad3-6.fna.fbcdn.net/v/t51.82787-19/818172062_17969040024169237_3154656155475460693_n.jpg (577 chars)",
            "ai_agent_type": null,
            "fullName": "abel",
            "profilePicUrl": "https://instagram.fdad3-6.fna.fbcdn.net/v/t51.82787-19/818172062_17969040024169237_3154656155475460693_n.jpg (577 chars)"
          }
        ],
        "thread_subtype": "IG_BUSINESS_ACCOUNT_ONE_TO_ONE",
        "ig_thread_capabilities": {
          "capabilities_0": "2265317209872843830",
          "capabilities_1": "84936834"
        },
        "thread_fbid": "1659203035864604",
        "is_muted": false,
        "is_group": false,
        "mute_until": null,
        "thread_id": "340282366841710301244259834220612951580",
        "instamadillo_cutover": null,
        "adminUserIds": [],
        "viewer": {
          "id": "23597386648",
          "interop_messaging_user_fbid": "18117619519786649",
          "fullName": "Matthew Don",
          "username": "matthew164962",
          "fbid_v2": "17841423599449673",
          "profilePicUrl": "https://instagram.fdad3-6.fna.fbcdn.net/v/t51.82787-19/818743097_18117619684786649_8701037773198366673_n.jpg (579 chars)",
          "ai_agent_type": null,
          "friendship_status": null
        },
        "nicknames": []
      },
      "id": "1659203035864604"
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793732056431,
      "time_at_flush_ms": 1793732056541
    },
    "is_final": true
  }
}
```

**runs/inspect/20261103T185330_mattinferencesaver**, step 4: click e783: 200, 184 ms

Sent:

```json
{
  "__d": "www",
  "qpl_active_flow_ids": "354954279",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "useIGDMarkThreadAsReadMutation",
  "server_timestamps": "true",
  "variables": {
    "metadata": {
      "ig_thread_igid": "340282366841710301244259834220612951580"
    },
    "data": {
      "item_id": "",
      "message_id": "mid.$7523457575324722502"
    }
  },
  "doc_id": "27399783383056109",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=354954279"
  ]
}
```

Answered:

```json
{
  "data": {
    "xig_direct_item_seen_mutation_with_slide_messaging_response": {
      "__typename": "XFBSlideReadReceipt",
      "participant_eimu_id": "18117619519786649",
      "watermark_timestamp_ms": "1793732065239"
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1793732065222,
      "time_at_flush_ms": 1793732065240
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Instagram's web GraphQL endpoint, called 113 times in 2 runs with Relay query names and `doc_id`s, mostly while the Direct inbox and a thread were open (`goto /direct/inbox/` 25 times, `goto /direct/t/<id>/` 27 and 27). It sends things like `thread_fbid`, `folder`, `min_uq_seq_id` and `newer_than_timestamp_ms` and answers `data.get_slide_thread_nullable`, `data.get_slide_mailbox_for_iris_subscription`, `data.viewer` and `data.polling_intervals__`; one example is `PolarisAutomaticPreviewsDisabledContextProviderQuery`, which answered `disabled: 0`.

## What our machine does with it

Nothing waits on it in log-cli. The Instagram engine (`python/instagramApi/engine.py`, rule 128) reads and sends DMs through instagrapi's private API and its realtime MQTT watch, never through this web GraphQL path, and no inspect-flow step is decided on it. The recording is what shows how the web client loads the same inbox, for reference.

## What can go wrong

Every recorded call answered 200 in 181-3780 ms with no errors. A failing or empty answer here would only mean the web inbox did not load in an inspect run; it cannot affect an engine send or watch.
