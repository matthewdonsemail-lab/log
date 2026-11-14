# psettingsPolicyNotices

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/psettings/policy/notices` |
| Sends | — |
| Reads | `result.responseCode`, `content.member`, `content.noticePolicy` |
| Called from | `runs/inspect/20261107T170649_<name:1>/script61.js:569 _enableActiveStatusSetting`, `runs/inspect/20261107T170649_<name:1>/script37.js:1344 showConsentExperienceConfirmationToast`, `runs/inspect/20261107T170649_<name:1>/script60.js:2453 anonymous`, `runs/inspect/20261107T170649_<name:1>/script61.js:565 anonymous` |
| rea | `ev_cdd4a44be0d9ca2918d12e33d45dcb1e615b55c972d1f523c49e64343bdade4b` |

Seen 7 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 200 | 97 ms | 3204 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 60 ms | 205623 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 60 ms | 3550 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 62 ms | 3096 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 99 ms | 3043 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 59 ms | 3556 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 79 ms | 2373 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 97 ms

Sent:

```json
{
  "query": {
    "types": "CONTROL_PROFILE_VISIBILITY"
  },
  "body": null
}
```

Answered:

```json
{
  "result": {
    "responseCode": 200
  },
  "content": {
    "member": "urn:li:member:1240627925",
    "noticePolicy": [
      {
        "type": "COMMENTS_VISIBILITY",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "TRACK_LIKE_FOR_PERSONALIZATION",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "SHARING_POST_VISIBILITY_FOR_PERSONALIZATION",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "POST_VISBILE_ON_GROUP",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "EASY_APPLY_PHONE_NUMBER",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "RESUME_UPLOAD",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      "… 15 more"
    ]
  }
}
```

**runs/inspect/20261107T170649_<name:1>**, step 1: goto /in/<profile>/: 200, 97 ms

Sent:

```json
{
  "query": {
    "types": "CONTROL_PROFILE_VISIBILITY"
  },
  "body": null
}
```

Answered:

```json
{
  "result": {
    "responseCode": 200
  },
  "content": {
    "member": "urn:li:member:1240627925",
    "noticePolicy": [
      {
        "type": "COMMENTS_VISIBILITY",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "TRACK_LIKE_FOR_PERSONALIZATION",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "SHARING_POST_VISIBILITY_FOR_PERSONALIZATION",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "POST_VISBILE_ON_GROUP",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "EASY_APPLY_PHONE_NUMBER",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "RESUME_UPLOAD",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      "… 15 more"
    ]
  }
}
```

**runs/inspect/20261107T161246_<name:1>**, step 2: snapshot: 200, 60 ms

Sent:

```json
{
  "query": {
    "types": "CONTROL_PROFILE_VISIBILITY"
  },
  "body": null
}
```

Answered:

```json
{
  "result": {
    "responseCode": 200
  },
  "content": {
    "member": "urn:li:member:1240627925",
    "noticePolicy": [
      {
        "type": "COMMENTS_VISIBILITY",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "TRACK_LIKE_FOR_PERSONALIZATION",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "SHARING_POST_VISIBILITY_FOR_PERSONALIZATION",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "POST_VISBILE_ON_GROUP",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "EASY_APPLY_PHONE_NUMBER",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      {
        "type": "RESUME_UPLOAD",
        "shouldDisplayNotice": false,
        "isAlwaysDisplayNotice": false
      },
      "… 15 more"
    ]
  }
}
```

<!-- facts:end -->

## What it does

The web client asks which privacy notices to show the signed-in member (`types=CONTROL_PROFILE_VISIBILITY` in the query) and reads `content.noticePolicy`, one entry per notice type (comments visibility, likes used for personalisation, resume upload and others) with `shouldDisplayNotice` and `isAlwaysDisplayNotice`. It is called from code named `_enableActiveStatusSetting` and `showConsentExperienceConfirmationToast`, on each profile and feed load, in 59 to 99 ms.

## What our machine does with it

Nothing: log's LinkedIn direct-API engine (`python/linkedinApi`, openLinkedinApi over curl_cffi as Chrome, through the account's governor) never sends it. A notice LinkedIn wants shown appears only in the browser page, so a direct-API run never sees or answers one.

## What can go wrong

Every answer in our runs is 200 with `result.responseCode` 200 and every notice's `shouldDisplayNotice` false. A notice set to true would be a dialog in the browser; nothing in the engine waits on it or reads it.
