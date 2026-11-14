# voyagerApiIdentityDashProfiles

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/identity/dash/profiles` |
| Sends | — |
| Reads | `data.birthDateOn`, `data.multiLocalePhoneticLastName`, `data.industryV2Urn`, `data.objectUrn`, `data.multiLocaleLastName`, `data.pronounUnion`, `data.multiLocaleFirstNamePronunciationHint`, `data.multiLocaleLastNamePronunciationHint`, `data.tempStatusExpiredAtUnion`, `data.multiLocaleFirstName`, `data.contentRestrictedAnnotation`, `data.multiLocaleTempStatus` and 28 more |
| Called from | `runs/inspect/20261107T161246_<name:4>/script30.js:921 yc`, `runs/inspect/20261107T161246_<name:4>/script264.js:196 statement`, `runs/chrome/20261114T213510_<name:4>/script45.js:310 anonymous`, `runs/inspect/20261107T170649_<name:4>/script35.js:1702 anonymous` |
| rea | `ev_6badcb73ee0c880288495bef39b9b82ae5c53c6333331967f9afa7f150dd91cc` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| chrome | step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open | 1 | 200 | 238 ms | 24292 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/chrome/20261114T213510_<name:4>**, step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open: 200, 238 ms

Sent:

```json
{
  "query": {
    "decorationId": "com.linkedin.voyager.dash.deco.identity.profile.FullProfile-77"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "birthDateOn": {
      "month": 3,
      "day": 30,
      "$recipeTypes": "(1 items)",
      "$type": "com.linkedin.common.Date"
    },
    "multiLocalePhoneticLastName": null,
    "industryV2Urn": null,
    "objectUrn": "urn:li:member:1240627925",
    "multiLocaleLastName": {
      "en_US": "Singh"
    },
    "pronounUnion": {
      "standardizedPronoun": "HE_HIM"
    },
    "multiLocaleFirstNamePronunciationHint": {},
    "multiLocaleLastNamePronunciationHint": {},
    "tempStatusExpiredAtUnion": null,
    "multiLocaleFirstName": {
      "en_US": "Mandeep"
    },
    "contentRestrictedAnnotation": null,
    "multiLocaleTempStatus": null,
    "companyNameOnProfileTopCardShown": true,
    "state": null,
    "publicIdentifier": "<username:1>",
    "trackingId": "/Qm2oXnJQxmwgRNJgGcHoA==",
    "phoneticFirstName": null,
    "multiLocaleSummary": {
      "en_US": "I have industry experience in building, deploying, and operating real-world software systems. I have worked on backend and data engineering projects involving event-driven pipelines, APIs, automation tools, and long-running services in Linux environments. My experience includes designing and maintaining production systems used by customers, as well as deploying services across cloud platforms such… (429 chars)"
    },
    "firstNamePronunciationHint": null,
    "lastNamePronunciationHint": null,
    "versionTag": "1510409328",
    "profilePicture": {
      "$recipeTypes": "(1 items)",
      "photoFilterEditInfo": "(11 fields)",
      "$type": "com.linkedin.voyager.dash.identity.profile.PhotoFilterPicture",
      "originalImageReference": "(1 fields)",
      "originalImageUrn": "urn:li:digitalmediaAsset:D5604AQG-pr75Rmit0Q",
      "a11yText": "Mandeep Singh",
      "displayImageReference": "(1 fields)",
      "displayImageUrn": "urn:li:digitalmediaAsset:D5603AQGx9boZKxta6A"
    },
    "firstName": "<name:1>",
    "multiLocaleMaidenName": null,
    "multiLocaleHeadline": {
      "en_US": "System Analyst @ City of Merritt | Full-Stack Developer | cs @ tru"
    },
    "lastName": "<name:2>",
    "memorialized": false,
    "multiLocalePhoneticFirstName": null,
    "volunteerCauses": null,
    "*industry": "urn:li:fsd_industry:4",
    "showPremiumSubscriberBadge": false,
    "tempStatusEmoji": null,
    "maidenName": null,
    "geoLocationBackfilled": false,
    "multiLocaleFullNamePronunciationAudio": {},
    "phoneticLastName": null,
    "premium": false,
    "entityUrn": "<userId:1>",
    "headline": "<messageText>",
    "fullNamePronunciationAudio": null,
    "summary": "I have industry experience in building, deploying, and operating real-world software systems. I have worked on backend and data engineering projects involving event-driven pipelines, APIs, automation tools, and long-running services in Linux environments. My experience includes designing and maintaining production systems used by customers, as well as deploying services across cloud platforms such… (429 chars)",
    "supportedLocales": [
      "(4 fields)"
    ],
    "address": null,
    "locationName": null,
    "multiLocaleAddress": null,
    "educationOnProfileTopCardShown": true,
    "industryUrn": "urn:li:fsd_industry:4",
    "$recipeTypes": [
      "com.linkedin.voyager.dash.deco.identity.profile.FullProfile"
    ],
    "$type": "com.linkedin.voyager.dash.identity.profile.Profile",
    "geoLocation": {
      "*geo": "urn:li:fsd_geo:105650180",
      "$recipeTypes": "(1 items)",
      "geoUrn": "urn:li:fsd_geo:105650180",
      "postalCode": "V1S1W1",
      "$type": "com.linkedin.voyager.dash.identity.profile.ProfileGeoLocation"
    },
    "tempStatus": null,
    "*profileTreasuryMediaProfile": "urn:li:collectionResponse:Kt9mbZumv9ce3HGqdeOp6EAuxLBGSqDQPQ884b5rvmg=",
    "location": {
      "$recipeTypes": "(1 items)",
      "countryCode": "CA",
      "postalCode": "V1S1W1",
      "$type": "com.linkedin.voyager.dash.identity.profile.ProfileLocation"
    },
    "primaryLocale": {
      "country": "US",
      "language": "en",
      "$recipeTypes": "(1 items)",
      "$type": "com.linkedin.common.Locale"
    },
    "backgroundPicture": {
      "originalImageReference": "(1 fields)",
      "originalImageUrn": "urn:li:digitalmediaAsset:D5604AQHvqdGy4EoqdA",
      "displayImageReference": "(1 fields)",
      "$recipeTypes": "(1 items)",
      "displayImageUrn": "urn:li:digitalmediaAsset:D5616AQHAAywQTiAx4Q",
      "photoFilterEditInfo": "(11 fields)",
      "$type": "com.linkedin.voyager.dash.identity.profile.PhotoFilterPicture"
    }
  },
  "meta": {
    "microSchema": {
      "version": "2",
      "types": "(71 fields)"
    }
  },
  "included": [
    {
      "paging": "(6 fields)",
      "*elements": "(1 items)",
      "entityUrn": "<userId:2>",
      "$recipeTypes": "(1 items)",
      "$type": "com.linkedin.restli.common.CollectionResponse"
    },
    {
      "entityUrn": "<userId:3>",
      "$recipeTypes": "(1 items)",
      "defaultLocalizedName": "Canada",
      "$type": "com.linkedin.voyager.dash.common.Geo"
    },
    {
      "countryUrn": "urn:li:fsd_geo:101174742",
      "defaultLocalizedNameWithoutCountryName": "Kamloops, British Columbia",
      "*country": "urn:li:fsd_geo:101174742",
      "entityUrn": "<userId:4>",
      "$recipeTypes": "(1 items)",
      "defaultLocalizedName": "Kamloops, British Columbia, Canada",
      "$type": "com.linkedin.voyager.dash.common.Geo"
    },
    {
      "entityUrn": "<userId:5>",
      "name": "<name:3>",
      "$recipeTypes": "(1 items)",
      "$type": "com.linkedin.voyager.dash.common.Industry"
    },
    {
      "multiLocaleTitle": "(1 fields)",
      "data": "(1 fields)",
      "description": "Updated 09/2026",
      "title": "Portfolio",
      "$recipeTypes": "(1 items)",
      "$type": "com.linkedin.voyager.dash.identity.profile.treasury.TreasuryMedia",
      "entityUrn": "<userId:6>",
      "multiLocaleDescription": "(1 fields)",
      "showThumbnailEditButton": true,
      "previewImage": "(3 fields)",
      "providerName": "mandeep.work"
    }
  ]
}
```

<!-- facts:end -->

## What it does

Reads the full profile of the signed-in member with the `FullProfile` decoration: names in each locale, pronouns, birth date, industry, the member urn, the public identifier and about 28 more fields. The by-hand recording fetches it once when the feed and messaging open, about 24.3 s in, in 238 ms.

## What our machine does with it

Our engine never sends it. The session check and the mailbox read the account from `/voyager/api/me` instead (`check` in `python/linkedinApi/engine.py`, `Messaging.open_mailbox` in `messaging.py`), and openLinkedinApi's own profile calls use the older `/identity/profiles` paths, which our engine doesn't call either.

## What can go wrong

Only 200 is in our recording, so its other statuses aren't shown, and since our engine doesn't send it, none can reach our runs.
