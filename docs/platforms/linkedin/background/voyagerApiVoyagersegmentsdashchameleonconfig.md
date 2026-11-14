# voyagerApiVoyagersegmentsdashchameleonconfig

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerSegmentsDashChameleonConfig` |
| Sends | — |
| Reads | `data.entityUrn`, `data.elements`, `data.paging`, `data.$type`, `included` |
| Called from | `runs/inspect/20261107T170649_<name:1>/script50.js:3447 model` |
| rea | `ev_7a001f034c32c2b8325f40d5e5c9f057683df25f0e3f68f4515052acf484959e` |

Seen 7 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 200 | 126 ms | 3186 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 95 ms | 205621 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 119 ms | 3549 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 100 ms | 3095 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 148 ms | 3041 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 100 ms | 3555 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 101 ms | 2372 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 126 ms

Sent:

```json
null
```

Answered:

```json
{
  "data": {
    "entityUrn": "<userId:1>",
    "elements": [
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 5,
          "experimentId": 4721390,
          "treatmentIndex": 2,
          "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.31824",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "job-posting-shared/components/budget/budget-setter",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_budget_recommended_daily",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "lixTreatment": "VAR_t48262_PR_3",
        "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.31824",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 3,
          "experimentId": 5323297,
          "treatmentIndex": 1,
          "lixKey": "chameleon.GLOBAL_premium.web-copy-definition.101072.child.101074",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "seeker-coach-engine/components/resume-builder/edit-button",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_rewrite_with_ai",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "parentLixKey": "chameleon.GLOBAL_premium.web-copy-definition.101072.parent",
        "lixTreatment": "VAR_t101074_PR_1",
        "parentLixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 3,
          "experimentId": 5323300,
          "treatmentIndex": 1,
          "lixKey": "chameleon.GLOBAL_premium.web-copy-definition.101072.parent",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "lixKey": "chameleon.GLOBAL_premium.web-copy-definition.101072.child.101074",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 5,
          "experimentId": 5055946,
          "treatmentIndex": 3,
          "lixKey": "chameleon.PLAY_global.web-copy-definition.79846",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "play-shared/components/games-entrypoint",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_todays_puzzles",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "lixTreatment": "VAR_t79846_PR_5",
        "lixKey": "chameleon.PLAY_global.web-copy-definition.79846",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 2,
          "experimentId": 4919522,
          "treatmentIndex": 1,
          "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.64012.child.64015",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "job-posting/components/budget/benefits-comparison",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_recommendations",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "parentLixKey": "chameleon.OJ_GLOBAL.web-copy-definition.64012.parent",
        "lixTreatment": "VAR_t64015_PR_1",
        "parentLixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 2,
          "experimentId": 4919525,
          "treatmentIndex": 1,
          "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.64012.parent",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.64012.child.64015",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 5,
          "experimentId": 5018233,
          "treatmentIndex": 3,
          "lixKey": "chameleon.TGVerifications_GLOBAL.web-copy-definition.75167",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "trust/components/verifications/i18n-constants/hub",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_verification_value_v2",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "lixTreatment": "VAR_t75167_PR_3",
        "lixKey": "chameleon.TGVerifications_GLOBAL.web-copy-definition.75167",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 2,
          "experimentId": 4832252,
          "treatmentIndex": 1,
          "lixKey": "chameleon.PROJECTX:Global.web-copy-definition.29644.child.42423",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "social-details/components/x-article-insightful-button",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_upvote_as_insightful",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "parentLixKey": "chameleon.PROJECTX:Global.ssr-copy-definition.29654.parent",
        "lixTreatment": "VAR_t42423_PR_1",
        "parentLixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 2,
          "experimentId": 4656763,
          "treatmentIndex": 1,
          "lixKey": "chameleon.PROJECTX:Global.ssr-copy-definition.29654.parent",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "lixKey": "chameleon.PROJECTX:Global.web-copy-definition.29644.child.42423",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      "… 79 more"
    ],
    "paging": {
      "count": 10,
      "start": 0,
      "links": []
    },
    "$type": "com.linkedin.restli.common.CollectionResponse"
  },
  "included": []
}
```

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 126 ms

Sent:

```json
null
```

Answered:

```json
{
  "data": {
    "entityUrn": "<userId:1>",
    "elements": [
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 5,
          "experimentId": 4721390,
          "treatmentIndex": 2,
          "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.31824",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "job-posting-shared/components/budget/budget-setter",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_budget_recommended_daily",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "lixTreatment": "VAR_t48262_PR_3",
        "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.31824",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 3,
          "experimentId": 5323297,
          "treatmentIndex": 1,
          "lixKey": "chameleon.GLOBAL_premium.web-copy-definition.101072.child.101074",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "seeker-coach-engine/components/resume-builder/edit-button",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_rewrite_with_ai",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "parentLixKey": "chameleon.GLOBAL_premium.web-copy-definition.101072.parent",
        "lixTreatment": "VAR_t101074_PR_1",
        "parentLixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 3,
          "experimentId": 5323300,
          "treatmentIndex": 1,
          "lixKey": "chameleon.GLOBAL_premium.web-copy-definition.101072.parent",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "lixKey": "chameleon.GLOBAL_premium.web-copy-definition.101072.child.101074",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 5,
          "experimentId": 5055946,
          "treatmentIndex": 3,
          "lixKey": "chameleon.PLAY_global.web-copy-definition.79846",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "play-shared/components/games-entrypoint",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_todays_puzzles",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "lixTreatment": "VAR_t79846_PR_5",
        "lixKey": "chameleon.PLAY_global.web-copy-definition.79846",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 2,
          "experimentId": 4919522,
          "treatmentIndex": 1,
          "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.64012.child.64015",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "job-posting/components/budget/benefits-comparison",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_recommendations",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "parentLixKey": "chameleon.OJ_GLOBAL.web-copy-definition.64012.parent",
        "lixTreatment": "VAR_t64015_PR_1",
        "parentLixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 2,
          "experimentId": 4919525,
          "treatmentIndex": 1,
          "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.64012.parent",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.64012.child.64015",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 5,
          "experimentId": 5018233,
          "treatmentIndex": 3,
          "lixKey": "chameleon.TGVerifications_GLOBAL.web-copy-definition.75167",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "trust/components/verifications/i18n-constants/hub",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_verification_value_v2",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "lixTreatment": "VAR_t75167_PR_3",
        "lixKey": "chameleon.TGVerifications_GLOBAL.web-copy-definition.75167",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 2,
          "experimentId": 4832252,
          "treatmentIndex": 1,
          "lixKey": "chameleon.PROJECTX:Global.web-copy-definition.29644.child.42423",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "social-details/components/x-article-insightful-button",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_upvote_as_insightful",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "parentLixKey": "chameleon.PROJECTX:Global.ssr-copy-definition.29654.parent",
        "lixTreatment": "VAR_t42423_PR_1",
        "parentLixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 2,
          "experimentId": 4656763,
          "treatmentIndex": 1,
          "lixKey": "chameleon.PROJECTX:Global.ssr-copy-definition.29654.parent",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "lixKey": "chameleon.PROJECTX:Global.web-copy-definition.29644.child.42423",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      "… 79 more"
    ],
    "paging": {
      "count": 10,
      "start": 0,
      "links": []
    },
    "$type": "com.linkedin.restli.common.CollectionResponse"
  },
  "included": []
}
```

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 95 ms

Sent:

```json
null
```

Answered:

```json
{
  "data": {
    "entityUrn": "<userId:1>",
    "elements": [
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 5,
          "experimentId": 4721390,
          "treatmentIndex": 2,
          "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.31824",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "job-posting-shared/components/budget/budget-setter",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_budget_recommended_daily",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "lixTreatment": "VAR_t48262_PR_3",
        "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.31824",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 3,
          "experimentId": 5323297,
          "treatmentIndex": 1,
          "lixKey": "chameleon.GLOBAL_premium.web-copy-definition.101072.child.101074",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "seeker-coach-engine/components/resume-builder/edit-button",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_rewrite_with_ai",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "parentLixKey": "chameleon.GLOBAL_premium.web-copy-definition.101072.parent",
        "lixTreatment": "VAR_t101074_PR_1",
        "parentLixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 3,
          "experimentId": 5323300,
          "treatmentIndex": 1,
          "lixKey": "chameleon.GLOBAL_premium.web-copy-definition.101072.parent",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "lixKey": "chameleon.GLOBAL_premium.web-copy-definition.101072.child.101074",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 5,
          "experimentId": 5055946,
          "treatmentIndex": 3,
          "lixKey": "chameleon.PLAY_global.web-copy-definition.79846",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "play-shared/components/games-entrypoint",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_todays_puzzles",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "lixTreatment": "VAR_t79846_PR_5",
        "lixKey": "chameleon.PLAY_global.web-copy-definition.79846",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 2,
          "experimentId": 4919522,
          "treatmentIndex": 1,
          "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.64012.child.64015",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "job-posting/components/budget/benefits-comparison",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_recommendations",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "parentLixKey": "chameleon.OJ_GLOBAL.web-copy-definition.64012.parent",
        "lixTreatment": "VAR_t64015_PR_1",
        "parentLixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 2,
          "experimentId": 4919525,
          "treatmentIndex": 1,
          "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.64012.parent",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "lixKey": "chameleon.OJ_GLOBAL.web-copy-definition.64012.child.64015",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 5,
          "experimentId": 5018233,
          "treatmentIndex": 3,
          "lixKey": "chameleon.TGVerifications_GLOBAL.web-copy-definition.75167",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "trust/components/verifications/i18n-constants/hub",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_verification_value_v2",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "lixTreatment": "VAR_t75167_PR_3",
        "lixKey": "chameleon.TGVerifications_GLOBAL.web-copy-definition.75167",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      {
        "lixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 2,
          "experimentId": 4832252,
          "treatmentIndex": 1,
          "lixKey": "chameleon.PROJECTX:Global.web-copy-definition.29644.child.42423",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "data": {
          "namespace": "social-details/components/x-article-insightful-button",
          "locale": "en_US",
          "message": "<messageText>",
          "key": "i18n_upvote_as_insightful",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigDataI18n"
        },
        "parentLixKey": "chameleon.PROJECTX:Global.ssr-copy-definition.29654.parent",
        "lixTreatment": "VAR_t42423_PR_1",
        "parentLixTracking": {
          "urn": "urn:li:member:1240627925",
          "segmentIndex": 2,
          "experimentId": 4656763,
          "treatmentIndex": 1,
          "lixKey": "chameleon.PROJECTX:Global.ssr-copy-definition.29654.parent",
          "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigLixTrackingInfo"
        },
        "lixKey": "chameleon.PROJECTX:Global.web-copy-definition.29644.child.42423",
        "$type": "com.linkedin.voyager.dash.segments.chameleon.ChameleonConfigItem"
      },
      "… 79 more"
    ],
    "paging": {
      "count": 10,
      "start": 0,
      "links": []
    },
    "$type": "com.linkedin.restli.common.CollectionResponse"
  },
  "included": []
}
```

<!-- facts:end -->

## What it does

LinkedIn's web client loads its Chameleon config: the copy experiments the account is enrolled in, each item naming the experiment, its treatment and the translated text to show in place of the default. It fires on every profile and feed page load in our inspect runs, so the page draws the wording the account's experiment group gets.

## What our machine does with it

Background traffic: nothing in log's LinkedIn direct-API engine (`python/linkedinApi/`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) sends this call, waits on it or reads its answer. It only changes wording in the browser's page.

## What can go wrong

Every call answered 200 in about 95 to 150 ms. A failure would only leave the page on its default wording; it never affects a log run.
