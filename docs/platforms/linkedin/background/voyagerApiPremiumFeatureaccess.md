# voyagerApiPremiumFeatureaccess

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/premium/featureAccess` |
| Sends | — |
| Reads | `data.canBrowseProfiles`, `data.reactivationFeaturesEligible`, `data.canViewJobAnalytics`, `data.canViewWVMP`, `data.premiumFreeTrialEligible`, `data.canAccessLearningVideos`, `data.premiumLearningUpgradeEligible`, `data.canViewCompanyInsights`, `data.$type`, `included` |
| Called from | `runs/inspect/20261107T170649_<name:2>/script50.js:3453 setReactivationFeatures`, `runs/inspect/20261107T170649_<name:2>/script35.js:1404 anonymous`, `runs/inspect/20261107T170649_<name:2>/script35.js:1412 statement`, `runs/inspect/20261107T170649_<name:2>/script37.js:372 anonymous` |
| rea | `ev_944cf6d391d8b8c8222c65c1af7fd2a8f89f67dfc522108d77d57a368ba99cfd` |

Seen 7 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 200 | 100 ms | 3203 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 80 ms | 205625 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 77 ms | 3553 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 78 ms | 3099 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 122 ms | 3046 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 67 ms | 3559 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 101 ms | 2376 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:2>**, step 1: goto /in/<profile>/: 200, 100 ms

Sent:

```json
{
  "query": {
    "name": "<name:1>"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "canBrowseProfiles": false,
    "reactivationFeaturesEligible": false,
    "canViewJobAnalytics": false,
    "canViewWVMP": false,
    "premiumFreeTrialEligible": true,
    "canAccessLearningVideos": false,
    "premiumLearningUpgradeEligible": false,
    "canViewCompanyInsights": false,
    "$type": "com.linkedin.voyager.premium.FeatureAccess"
  },
  "included": []
}
```

**runs/inspect/20261107T170649_<name:2>**, step 1: goto /in/<profile>/: 200, 100 ms

Sent:

```json
{
  "query": {
    "name": "<name:1>"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "canBrowseProfiles": false,
    "reactivationFeaturesEligible": false,
    "canViewJobAnalytics": false,
    "canViewWVMP": false,
    "premiumFreeTrialEligible": true,
    "canAccessLearningVideos": false,
    "premiumLearningUpgradeEligible": false,
    "canViewCompanyInsights": false,
    "$type": "com.linkedin.voyager.premium.FeatureAccess"
  },
  "included": []
}
```

**runs/inspect/20261107T161246_<name:2>**, step 2: snapshot: 200, 80 ms

Sent:

```json
{
  "query": {
    "name": "<name:1>"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "canBrowseProfiles": false,
    "reactivationFeaturesEligible": false,
    "canViewJobAnalytics": false,
    "canViewWVMP": false,
    "premiumFreeTrialEligible": true,
    "canAccessLearningVideos": false,
    "premiumLearningUpgradeEligible": false,
    "canViewCompanyInsights": false,
    "$type": "com.linkedin.voyager.premium.FeatureAccess"
  },
  "included": []
}
```

<!-- facts:end -->

## What it does

LinkedIn's web client asks which Premium features the signed-in account may use: browsing profiles, viewing who viewed the profile, job analytics, company insights, learning videos, and whether it is eligible for a free trial or reactivation. It fires a few seconds into every profile and feed page load in our inspect runs, and every answer showed a free account with a trial on offer. The client uses it to decide which Premium prompts and locked features to draw.

## What our machine does with it

Background traffic: nothing in log's LinkedIn direct-API engine (`python/linkedinApi/`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) sends this call, waits on it or reads its answer. The engine never needs Premium status to read the inbox, react, post or connect.

## What can go wrong

Every call in our runs answered 200 in about 70 to 120 ms. A failure here would only change which Premium prompts the page draws; it never touches a log run, because log never sends it.
