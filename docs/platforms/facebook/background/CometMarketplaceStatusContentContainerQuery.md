# CometMarketplaceStatusContentContainerQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `35298386203140047` |
| Path | `/api/graphql/` |
| Sends | `scale` |
| Reads | — |
| Called from | `CometMarketplaceStatusContentContainer.react` |
| rea | `ev_eecb50d6202597bec156a7136d3b27861031a02f173fdddc659c696e06a51c8d` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /marketplace/inbox | 1 | 200 | 384 ms | 22463 ms | — |
| inspect | step 3: goto /marketplace/inbox | 2 | 200 | 604–1522 ms | 294170–473985 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T064655_61593981307720**, step 3: goto /marketplace/inbox: 200, 1522 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceStatusContentContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1
  },
  "doc_id": "35298386203140047"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplaceViolationTransparencyViewModel": {
        "profile_name": "Hore Vai",
        "toast_title": null,
        "toast_body": null,
        "toast_icon_type": "WARNING_CAUTION",
        "toast_button_text": null,
        "toast_button_uri": null,
        "toast_action": null,
        "enforcement_instance_id": null,
        "access_state_title": "You have full access to Marketplace",
        "access_state_body": "You can sell items and message sellers on Marketplace.",
        "access_state_image": null,
        "is_marketplace_access_banned": false,
        "comet_listings_uri": "/marketplace/you/selling",
        "comet_policies_uri": "https://www.facebook.com/policies_center/commerce",
        "csat_survey": {
          "headline_text": "Tell us how we're doing",
          "body_text": "How satisfied or dissatisfied are you with the help you received for this issue?",
          "feedback_button_text": "Give feedback",
          "entity_id": "61593981307720",
          "csat_channel": "INTEGRITY_HUB_MARKETPLACE_STATUS",
          "audience_config": "FB_GENPOP",
          "should_show": true,
          "profile_status": "GOOD"
        }
      },
      "actor": {
        "__typename": "User",
        "id": "61593981307720"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792911173600,
      "time_at_flush_ms": 1792911173633
    },
    "is_final": true
  }
}
```

**runs/inspect/20261022T113536_61594063207669**, step 1: goto /marketplace/inbox: 200, 384 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "CometMarketplaceStatusContentContainerQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1
  },
  "doc_id": "35298386203140047"
}
```

Answered:

```json
{
  "data": {
    "viewer": {
      "marketplaceViolationTransparencyViewModel": {
        "profile_name": "Bethlehem Trash",
        "toast_title": null,
        "toast_body": null,
        "toast_icon_type": "WARNING_CAUTION",
        "toast_button_text": null,
        "toast_button_uri": null,
        "toast_action": null,
        "enforcement_instance_id": null,
        "access_state_title": "You have full access to Marketplace",
        "access_state_body": "You can sell items and message sellers on Marketplace.",
        "access_state_image": null,
        "is_marketplace_access_banned": false,
        "comet_listings_uri": "/marketplace/you/selling",
        "comet_policies_uri": "https://www.facebook.com/policies_center/commerce",
        "csat_survey": {
          "headline_text": "Tell us how we're doing",
          "body_text": "How satisfied or dissatisfied are you with the help you received for this issue?",
          "feedback_button_text": "Give feedback",
          "entity_id": "61594063207669",
          "csat_channel": "INTEGRITY_HUB_MARKETPLACE_STATUS",
          "audience_config": "FB_GENPOP",
          "should_show": true,
          "profile_status": "GOOD"
        }
      },
      "actor": {
        "__typename": "User",
        "id": "61594063207669"
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792668976992,
      "time_at_flush_ms": 1792668977048
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Marketplace status (`/marketplace/status`): whether the account may buy and sell (`marketplaceViolationTransparencyViewModel`: `access_state_title` "You have full access to Marketplace", `is_marketplace_access_banned`, `enforcement_instance_id`, `csat_survey.profile_status` GOOD). Sent when the page is reached from inside Marketplace (Bethlehem's inbox moved to it, step 1); opened directly, the same data comes preloaded in the page, with `marketplace_feature_access_status.sell_on_marketplace` beside it (step 6).

## What our machine does with it

It is the account-health part of the Marketplace check (`marketplaceAccessOf`; rule 69), read from this request or from the page: anything but full access (a ban, an enforcement, a profile not GOOD, selling not ELIGIBLE) is the account's `suspended` issue, which takes it out of the host's day.

## What can go wrong

None seen: one call, 200 in 384 ms. If neither this nor the page carries it, the check says "Marketplace status didn't load" and raises nothing; the next round reads it again.
