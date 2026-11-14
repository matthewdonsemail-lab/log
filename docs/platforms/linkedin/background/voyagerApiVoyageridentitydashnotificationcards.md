# voyagerApiVoyageridentitydashnotificationcards

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerIdentityDashNotificationCards` |
| Sends | — |
| Reads | `data.metadata`, `data.entityUrn`, `data.paging`, `data.*elements`, `data.$type`, `meta.microSchema`, `included` |
| Called from | `runs/inspect/20261107T161246_<name:1>/script251.js:1174 processToggle`, `runs/inspect/20261107T161246_<name:1>/script251.js:1045 anonymous`, `runs/inspect/20261107T161246_<name:1>/script251.js:1077 anonymous`, `runs/inspect/20261107T161246_<name:1>/script251.js:1027 anonymous` |
| rea | `ev_2a17bfb1e836e28fdd8e4317a57bcf86f97dc074232857f685b4e7c446274db3` |

Seen 7 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 200 | 870 ms | 3461 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 892 ms | 205813 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 869 ms | 3795 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 868 ms | 3341 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 862 ms | 3286 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 885 ms | 3795 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 904 ms | 2698 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 870 ms

Sent:

```json
{
  "query": {
    "decorationId": "com.linkedin.voyager.dash.deco.identity.notifications.CardsCollectionWithInjectionsNoPills-25",
    "count": "10",
    "q": "filterVanityName"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "metadata": {
      "numUnseen": 1,
      "*notificationFilter": "urn:li:fsd_notificationFilter:ALL",
      "nextStart": 12,
      "$recipeTypes": "(1 items)",
      "latestPublishedAt": 1794069698520,
      "$type": "com.linkedin.voyager.dash.identity.notifications.NotificationsMetadata"
    },
    "entityUrn": "<userId:1>",
    "paging": {
      "count": 10,
      "start": 0,
      "links": "(0 items)",
      "$recipeTypes": "(1 items)",
      "$type": "com.linkedin.restli.common.CollectionMetadata"
    },
    "*elements": [
      "urn:li:fsd_notificationCard:(REACTIONS_BY_YOUR_NETWORK,urn:li:uniqueSuffix:(urn:li:activity:7524629984116715520,i8YOGHjdTGur7bP-vc6Lgw))",
      "urn:li:fsd_notificationCard:(NEW_JOBS_IN_SAVED_SEARCH,urn:li:savedSearch:15650765180)",
      "urn:li:fsd_notificationCard:(REACTED_TO_YOUR_UPDATE,urn:li:ugcPost:7524595669551067136)",
      "urn:li:fsd_notificationCard:(WVMP_V2,urn:li:string:WVMP_V2)",
      "urn:li:fsd_notificationCard:(NEW_JOBS_IN_SAVED_SEARCH,urn:li:savedSearch:15836684732)",
      "urn:li:fsd_notificationCard:(SOCIAL_SEEKING,urn:li:uniqueSuffix:(urn:li:member:1240627925,OFsNGFOxTCK8f0nUlRCceg))",
      "… 4 more"
    ],
    "$type": "com.linkedin.restli.common.CollectionResponse"
  },
  "meta": {
    "microSchema": {
      "version": "2",
      "types": "(79 fields)"
    }
  },
  "included": [
    {
      "entityUrn": "<userId:2>",
      "$recipeTypes": "(1 items)",
      "elements": "(0 items)",
      "$type": "com.linkedin.restli.common.CollectionResponse"
    },
    {
      "entityUrn": "<userId:3>",
      "$recipeTypes": "(1 items)",
      "elements": "(0 items)",
      "$type": "com.linkedin.restli.common.CollectionResponse"
    },
    {
      "numLikes": 3,
      "$recipeTypes": "(1 items)",
      "liked": false,
      "$type": "com.linkedin.voyager.dash.feed.SocialActivityCounts",
      "urn": "urn:li:activity:7524250023363252224",
      "numComments": 1,
      "entityUrn": "<userId:4>"
    },
    {
      "numLikes": 2,
      "$recipeTypes": "(1 items)",
      "liked": false,
      "$type": "com.linkedin.voyager.dash.feed.SocialActivityCounts",
      "urn": "urn:li:ugcPost:7524595669551067136",
      "numComments": 0,
      "entityUrn": "<userId:5>"
    },
    {
      "numLikes": 2,
      "$recipeTypes": "(1 items)",
      "liked": false,
      "$type": "com.linkedin.voyager.dash.feed.SocialActivityCounts",
      "urn": "urn:li:activity:7522068420021116928",
      "numComments": 5,
      "entityUrn": "<userId:6>"
    },
    {
      "numLikes": 155,
      "$recipeTypes": "(1 items)",
      "liked": false,
      "$type": "com.linkedin.voyager.dash.feed.SocialActivityCounts",
      "urn": "urn:li:ugcPost:7524629981155647488",
      "numComments": 26,
      "entityUrn": "<userId:7>"
    },
    "… 29 more"
  ]
}
```

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 870 ms

Sent:

```json
{
  "query": {
    "decorationId": "com.linkedin.voyager.dash.deco.identity.notifications.CardsCollectionWithInjectionsNoPills-25",
    "count": "10",
    "q": "filterVanityName"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "metadata": {
      "numUnseen": 1,
      "*notificationFilter": "urn:li:fsd_notificationFilter:ALL",
      "nextStart": 12,
      "$recipeTypes": "(1 items)",
      "latestPublishedAt": 1794069698520,
      "$type": "com.linkedin.voyager.dash.identity.notifications.NotificationsMetadata"
    },
    "entityUrn": "<userId:1>",
    "paging": {
      "count": 10,
      "start": 0,
      "links": "(0 items)",
      "$recipeTypes": "(1 items)",
      "$type": "com.linkedin.restli.common.CollectionMetadata"
    },
    "*elements": [
      "urn:li:fsd_notificationCard:(REACTIONS_BY_YOUR_NETWORK,urn:li:uniqueSuffix:(urn:li:activity:7524629984116715520,i8YOGHjdTGur7bP-vc6Lgw))",
      "urn:li:fsd_notificationCard:(NEW_JOBS_IN_SAVED_SEARCH,urn:li:savedSearch:15650765180)",
      "urn:li:fsd_notificationCard:(REACTED_TO_YOUR_UPDATE,urn:li:ugcPost:7524595669551067136)",
      "urn:li:fsd_notificationCard:(WVMP_V2,urn:li:string:WVMP_V2)",
      "urn:li:fsd_notificationCard:(NEW_JOBS_IN_SAVED_SEARCH,urn:li:savedSearch:15836684732)",
      "urn:li:fsd_notificationCard:(SOCIAL_SEEKING,urn:li:uniqueSuffix:(urn:li:member:1240627925,OFsNGFOxTCK8f0nUlRCceg))",
      "… 4 more"
    ],
    "$type": "com.linkedin.restli.common.CollectionResponse"
  },
  "meta": {
    "microSchema": {
      "version": "2",
      "types": "(79 fields)"
    }
  },
  "included": [
    {
      "entityUrn": "<userId:2>",
      "$recipeTypes": "(1 items)",
      "elements": "(0 items)",
      "$type": "com.linkedin.restli.common.CollectionResponse"
    },
    {
      "entityUrn": "<userId:3>",
      "$recipeTypes": "(1 items)",
      "elements": "(0 items)",
      "$type": "com.linkedin.restli.common.CollectionResponse"
    },
    {
      "numLikes": 3,
      "$recipeTypes": "(1 items)",
      "liked": false,
      "$type": "com.linkedin.voyager.dash.feed.SocialActivityCounts",
      "urn": "urn:li:activity:7524250023363252224",
      "numComments": 1,
      "entityUrn": "<userId:4>"
    },
    {
      "numLikes": 2,
      "$recipeTypes": "(1 items)",
      "liked": false,
      "$type": "com.linkedin.voyager.dash.feed.SocialActivityCounts",
      "urn": "urn:li:ugcPost:7524595669551067136",
      "numComments": 0,
      "entityUrn": "<userId:5>"
    },
    {
      "numLikes": 2,
      "$recipeTypes": "(1 items)",
      "liked": false,
      "$type": "com.linkedin.voyager.dash.feed.SocialActivityCounts",
      "urn": "urn:li:activity:7522068420021116928",
      "numComments": 5,
      "entityUrn": "<userId:6>"
    },
    {
      "numLikes": 155,
      "$recipeTypes": "(1 items)",
      "liked": false,
      "$type": "com.linkedin.voyager.dash.feed.SocialActivityCounts",
      "urn": "urn:li:ugcPost:7524629981155647488",
      "numComments": 26,
      "entityUrn": "<userId:7>"
    },
    "… 29 more"
  ]
}
```

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 892 ms

Sent:

```json
{
  "query": {
    "decorationId": "com.linkedin.voyager.dash.deco.identity.notifications.CardsCollectionWithInjectionsNoPills-25",
    "count": "10",
    "q": "filterVanityName"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "metadata": {
      "numUnseen": 6,
      "*notificationFilter": "urn:li:fsd_notificationFilter:ALL",
      "nextStart": 11,
      "$recipeTypes": "(1 items)",
      "latestPublishedAt": 1794067901121,
      "$type": "com.linkedin.voyager.dash.identity.notifications.NotificationsMetadata"
    },
    "entityUrn": "<userId:1>",
    "paging": {
      "count": 10,
      "start": 0,
      "links": "(0 items)",
      "$recipeTypes": "(1 items)",
      "$type": "com.linkedin.restli.common.CollectionMetadata"
    },
    "*elements": [
      "urn:li:fsd_notificationCard:(NEW_JOBS_IN_SAVED_SEARCH,urn:li:savedSearch:15650765180)",
      "urn:li:fsd_notificationCard:(REACTED_TO_YOUR_UPDATE,urn:li:ugcPost:7524595669551067136)",
      "urn:li:fsd_notificationCard:(WVMP_V2,urn:li:string:WVMP_V2)",
      "urn:li:fsd_notificationCard:(NEW_JOBS_IN_SAVED_SEARCH,urn:li:savedSearch:15836684732)",
      "urn:li:fsd_notificationCard:(SOCIAL_SEEKING,urn:li:uniqueSuffix:(urn:li:member:1240627925,OFsNGFOxTCK8f0nUlRCceg))",
      "urn:li:fsd_notificationCard:(REACTIONS_BY_YOUR_NETWORK,urn:li:uniqueSuffix:(urn:li:activity:7524250023363252224,locRGgTYTJqs7KuX-UVZrg))",
      "… 4 more"
    ],
    "$type": "com.linkedin.restli.common.CollectionResponse"
  },
  "meta": {
    "microSchema": {
      "version": "2",
      "types": "(79 fields)"
    }
  },
  "included": [
    {
      "entityUrn": "<userId:8>",
      "$recipeTypes": "(1 items)",
      "elements": "(0 items)",
      "$type": "com.linkedin.restli.common.CollectionResponse"
    },
    {
      "entityUrn": "<userId:9>",
      "$recipeTypes": "(1 items)",
      "elements": "(0 items)",
      "$type": "com.linkedin.restli.common.CollectionResponse"
    },
    {
      "numLikes": 3,
      "$recipeTypes": "(1 items)",
      "liked": false,
      "$type": "com.linkedin.voyager.dash.feed.SocialActivityCounts",
      "urn": "urn:li:activity:7524250023363252224",
      "numComments": 1,
      "entityUrn": "<userId:4>"
    },
    {
      "numLikes": 2,
      "$recipeTypes": "(1 items)",
      "liked": false,
      "$type": "com.linkedin.voyager.dash.feed.SocialActivityCounts",
      "urn": "urn:li:ugcPost:7524595669551067136",
      "numComments": 0,
      "entityUrn": "<userId:5>"
    },
    {
      "numLikes": 2,
      "$recipeTypes": "(1 items)",
      "liked": false,
      "$type": "com.linkedin.voyager.dash.feed.SocialActivityCounts",
      "urn": "urn:li:activity:7522068420021116928",
      "numComments": 5,
      "entityUrn": "<userId:6>"
    },
    {
      "contentImages": "(1 items)",
      "objectUrn": "urn:li:notificationV2:(urn:li:member:1240627925,REACTED_TO_YOUR_UPDATE,urn:li:ugcPost:7524595669551067136)",
      "settingTooltipTrackingId": null,
      "tertiaryAction": null,
      "settingTooltipText": null,
      "headerImage": "(5 fields)",
      "entityUrn": "<userId:10>",
      "subHeadline": null,
      "tertiaryImage": null,
      "kickerIcon": null,
      "kickerText": null,
      "contentType": "VIDEO",
      "headline": "<messageText>",
      "trackingId": "WSeovtiNQHeocuf0S86JMw==",
      "read": false,
      "*socialActivityCounts": "urn:li:fsd_socialActivityCounts:urn:li:ugcPost:7524595669551067136",
      "publishedAt": 1794037681422,
      "contentAccessibilityText": null,
      "contentAction": null,
      "insightType": "SOCIAL_ACTIVITY_COUNTS",
      "$recipeTypes": "(1 items)",
      "surveyDisplayTrigger": null,
      "socialActivityCountsUrn": "urn:li:fsd_socialActivityCounts:urn:li:ugcPost:7524595669551067136",
      "$type": "com.linkedin.voyager.dash.identity.notifications.Card",
      "insight": null,
      "insightAction": null,
      "contentSecondaryText": "(0 items)",
      "cardAction": "(4 fields)",
      "additionalContentImagesCount": null,
      "settingOptions": "(3 items)",
      "contentPrimaryText": "(1 items)",
      "actions": "(0 items)",
      "prompt": null,
      "tertiaryText": null,
      "actionCaption": null
    },
    "… 28 more"
  ]
}
```

<!-- facts:end -->

## What it does

LinkedIn's web client loads the account's notification cards (`q=filterVanityName`, ten at a time) with their unseen count, paging and the reaction and comment counts of the posts they point at. It fires a few seconds into every profile and feed page load in our inspect runs, to fill the notifications list and its badge.

## What our machine does with it

Background traffic: nothing in log's LinkedIn direct-API engine (`python/linkedinApi/`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) sends this call, waits on it or reads its answer. The engine marks notifications seen through its own My Network follow-ups (`markNotificationsSeen` in `python/linkedinApi/network.py`), not through this list.

## What can go wrong

Every call answered 200, the slowest of these background calls at about 860 to 900 ms, because each answer carries dozens of included cards and counts. A failure would only leave the page's notifications empty; it never affects a log run.
