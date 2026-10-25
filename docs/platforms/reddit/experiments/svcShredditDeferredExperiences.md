# svcShredditDeferredExperiences

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | experiments |
| Kind | endpoint |
| doc_id | — |
| Path | `/svc/shreddit/deferred-experiences` |
| Sends | `experienceNames`, `clientContext`, `xpromoClientContext`, `groupNames`, `includePostInfo`, `includeProfileInfo`, `includeSubredditInfo`, `experimentContext`, `includeTaxonomyClassifiers`, `subredditName`, `postId`, `profileName` |
| Reads | — |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script0.js:101 loadBatch` |
| rea | `ev_603dd49d172731420c2cafdefbaaebef224a86e2d6d576cd5f1df20f3469e219` |

Seen 8 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 1173 ms | 5953 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 349 ms | 7944 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 342 ms | 4256 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 2 | 200 | 366–370 ms | 2120–4006 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 350 ms | 4236 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 386 ms | 4592 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 330 ms | 3961 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 1173 ms

Sent:

```json
{
  "variables": {
    "experienceNames": [
      "REDDIT_PRO_PROFILE_CARD",
      "REDDIT_PRO_PROMO",
      "PUBLISHER_PROMO",
      "REDDIT_PRO_SHARE_BUTTON_COACHMARK",
      "REDDIT_PRO_PROFILE_PIN_POST_COACHMARK",
      "ADS_CTA_TOP_NAV_HIGHLIGHTED",
      "… 3 more"
    ],
    "clientContext": {
      "pageName": "HOME",
      "cookieConsent": "NOT_REQUIRED",
      "queryParams": [
        {
          "key": "reonboarding",
          "value": "true"
        }
      ]
    },
    "xpromoClientContext": {
      "deviceType": "DESKTOP",
      "relatedAppStatus": "NOT_READY",
      "referrerType": "DIRECT",
      "externalReferrerType": "DIRECT",
      "sessionScreenViewCount": 0
    },
    "groupNames": [
      "conversion",
      "paid_ua",
      "landingx",
      "onboarding",
      "nsfw_blocking",
      "nsfw_bypassable"
    ],
    "includePostInfo": false,
    "includeProfileInfo": false,
    "includeSubredditInfo": false,
    "experimentContext": [
      {
        "name": "mwebshreddit_nsfw_xpromo_taxonomy",
        "variant": "dvx_communities_taxonomy"
      },
      {
        "name": "mwebshreddit_unrated_xpromo_taxonomy",
        "variant": "unrated_taxonomy"
      }
    ],
    "includeTaxonomyClassifiers": false
  },
  "triggerId": "ba9f9568-8694-11f1-81a6-a6882ae5032c"
}
```

Answered:

```json
null
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 349 ms

Sent:

```json
{
  "variables": {
    "experienceNames": [
      "REDDIT_PRO_PROFILE_CARD",
      "REDDIT_PRO_PROMO",
      "PUBLISHER_PROMO",
      "REDDIT_PRO_SHARE_BUTTON_COACHMARK",
      "REDDIT_PRO_PROFILE_PIN_POST_COACHMARK",
      "ADS_CTA_TOP_NAV_HIGHLIGHTED",
      "… 3 more"
    ],
    "clientContext": {
      "subredditName": "AskReddit",
      "pageName": "COMMUNITY",
      "cookieConsent": "NOT_REQUIRED",
      "queryParams": [
        {
          "key": "reonboarding",
          "value": "true"
        }
      ]
    },
    "xpromoClientContext": {
      "deviceType": "DESKTOP",
      "relatedAppStatus": "NOT_READY",
      "referrerType": "DIRECT",
      "externalReferrerType": "DIRECT",
      "sessionScreenViewCount": 0
    },
    "groupNames": [
      "conversion",
      "paid_ua",
      "landingx",
      "onboarding",
      "nsfw_blocking",
      "nsfw_bypassable"
    ],
    "subredditName": "AskReddit",
    "includePostInfo": false,
    "includeProfileInfo": false,
    "includeSubredditInfo": true,
    "experimentContext": [
      {
        "name": "mwebshreddit_nsfw_xpromo_taxonomy",
        "variant": "dvx_communities_taxonomy"
      },
      {
        "name": "mwebshreddit_unrated_xpromo_taxonomy",
        "variant": "unrated_taxonomy"
      }
    ],
    "includeTaxonomyClassifiers": true
  },
  "triggerId": "ba9f9568-8694-11f1-81a6-a6882ae5032c"
}
```

Answered:

```json
null
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 342 ms

Sent:

```json
{
  "variables": {
    "experienceNames": [
      "REDDIT_PRO_PROFILE_CARD",
      "REDDIT_PRO_PROMO",
      "PUBLISHER_PROMO",
      "REDDIT_PRO_SHARE_BUTTON_COACHMARK",
      "REDDIT_PRO_PROFILE_PIN_POST_COACHMARK",
      "ADS_CTA_TOP_NAV_HIGHLIGHTED",
      "… 3 more"
    ],
    "clientContext": {
      "pageName": "SEARCH_RESULTS",
      "cookieConsent": "NOT_REQUIRED",
      "queryParams": [
        {
          "key": "q",
          "value": "junk removal"
        },
        {
          "key": "reonboarding",
          "value": "true"
        }
      ]
    },
    "xpromoClientContext": {
      "deviceType": "DESKTOP",
      "relatedAppStatus": "NOT_READY",
      "referrerType": "DIRECT",
      "externalReferrerType": "DIRECT",
      "sessionScreenViewCount": 0
    },
    "groupNames": [
      "conversion",
      "paid_ua",
      "landingx",
      "onboarding",
      "nsfw_blocking",
      "nsfw_bypassable"
    ],
    "includePostInfo": false,
    "includeProfileInfo": false,
    "includeSubredditInfo": false,
    "experimentContext": [
      {
        "name": "mwebshreddit_nsfw_xpromo_taxonomy",
        "variant": "dvx_communities_taxonomy"
      },
      {
        "name": "mwebshreddit_unrated_xpromo_taxonomy",
        "variant": "unrated_taxonomy"
      }
    ],
    "includeTaxonomyClassifiers": false
  },
  "triggerId": "ba9f9568-8694-11f1-81a6-a6882ae5032c"
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

`loadBatch(e)` loads the page's deferred experiences, the optional promos and tips (Reddit Pro cards, the publisher promo, coachmarks, a highlighted ads button and a few more) decided after the page is up. It clones the `faceplate-partial` from the `#deferred-experiences-batch` template, points it at `/svc/shreddit/deferred-experiences`, adds one hidden `triggerId` input per trigger and loads it; what was sent names the experiences and groups to check and the page's context (`pageName`, the community, the query, `deviceType: DESKTOP`) (rea `ev_603dd49d…`). It fired on every page we opened.

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` in the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. The answer is where an unexpected promo or onboarding prompt would come from, so if log-cli acts on Reddit, a dialog nobody planned for can be traced back to this call.

## What can go wrong

All eight recorded calls answered 200 with an empty body, meaning none of the experiences asked about were shown to our account. `loadBatch` does nothing when the template or its partial is missing or there are no triggers, and the slice has no error handling, so a failure only means no promo appears.
