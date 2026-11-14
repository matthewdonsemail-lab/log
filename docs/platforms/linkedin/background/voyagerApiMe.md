# voyagerApiMe

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/me` |
| Sends | — |
| Reads | `data.plainId`, `data.publicContactInfo`, `data.premiumSubscriber`, `data.*miniProfile`, `data.$type`, `included` |
| Called from | — |
| rea | `ev_3599e16ad61df3a4cd5da3a6051350192973c93f0be19d014235323b6f149c44` |

Seen 7 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 1 | 200 | 113 ms | 3203 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 102 ms | 205625 ms | — |
| inspect | step 4: goto /feed/ | 1 | 200 | 119 ms | 3552 ms | — |
| inspect | step 5: goto /feed/ | 1 | 200 | 104 ms | 3099 ms | — |
| inspect | step 6: goto /feed/ | 1 | 200 | 154 ms | 3046 ms | — |
| inspect | step 12: goto /feed/ | 1 | 200 | 88 ms | 3559 ms | — |
| inspect | step 25: goto /in/<profile>/ | 1 | 200 | 118 ms | 2376 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:3>**, step 1: goto /in/<profile>/: 200, 113 ms

Sent:

```json
null
```

Answered:

```json
{
  "data": {
    "plainId": 1240627925,
    "publicContactInfo": {
      "$type": "com.linkedin.voyager.identity.shared.PublicContactInfo"
    },
    "premiumSubscriber": false,
    "*miniProfile": "urn:li:fs_miniProfile:<memberId>",
    "$type": "com.linkedin.voyager.common.Me"
  },
  "included": [
    {
      "customPronoun": null,
      "memorialized": false,
      "lastName": "<name:1>",
      "dashEntityUrn": "<userId:1>",
      "standardizedPronoun": "HE_HIM",
      "occupation": "<messageText>",
      "objectUrn": "urn:li:member:1240627925",
      "backgroundImage": {
        "digitalmediaAsset": "urn:li:digitalmediaAsset:D5616AQHAAywQTiAx4Q",
        "artifacts": [
          {
            "width": 1400,
            "fileIdentifyingUrlPathSegment": "350_1400/B56ZwsX5BjIwAY-/0/1770270987166?e=1795651200&v=beta&t=PBNTMc63HClAlpqpFpqEdRVMwHZs_1IPV0XXVOTMoyM",
            "expiresAt": 1795651200000,
            "height": 349,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          {
            "width": 800,
            "fileIdentifyingUrlPathSegment": "200_800/B56ZwsX5BjIwAU-/0/1770270987166?e=1795651200&v=beta&t=yWOyPeJfYqBb2RNGIT5BpAoO_IcEbb7p_BZKcfPDAhM",
            "expiresAt": 1795651200000,
            "height": 199,
            "$type": "com.linkedin.common.VectorArtifact"
          }
        ],
        "rootUrl": "https://media.licdn.com/dms/image/v2/D5616AQHAAywQTiAx4Q/profile-displaybackgroundimage-shrink_",
        "$type": "com.linkedin.common.VectorImage"
      },
      "picture": {
        "digitalmediaAsset": "urn:li:digitalmediaAsset:D5603AQGx9boZKxta6A",
        "artifacts": [
          {
            "width": 200,
            "fileIdentifyingUrlPathSegment": "scale_200_200/B56ZwsVOj5H0Ac-/0/1770270288853?e=1795651200&v=beta&t=Gy4R5iOWuzIn0320Xs5iyiOdK6vkLKRKvsPy25UC3EI",
            "expiresAt": 1795651200000,
            "height": 200,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          {
            "width": 400,
            "fileIdentifyingUrlPathSegment": "scale_400_400/B56ZwsVOj5H0Ak-/0/1770270288853?e=1795651200&v=beta&t=1At5J5Dps43p7i6E2JeEOUMLeTQDG6allbYVMPxmlZc",
            "expiresAt": 1795651200000,
            "height": 400,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          {
            "width": 100,
            "fileIdentifyingUrlPathSegment": "scale_100_100/B56ZwsVOj5H0Ag-/0/1770270288853?e=1795651200&v=beta&t=dtr8bhYyTWmUK28fkg3CqmnHSLmhvbYBvh41eVVi3iQ",
            "expiresAt": 1795651200000,
            "height": 100,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          {
            "width": 800,
            "fileIdentifyingUrlPathSegment": "crop_800_800/B56ZwsVOj5H0AM-/0/1770270288766?e=1795651200&v=beta&t=RrFUwr71X-GT3PqQ5eO75jHksPClyRuArwT_Bz6tOaU",
            "expiresAt": 1795651200000,
            "height": 800,
            "$type": "com.linkedin.common.VectorArtifact"
          }
        ],
        "rootUrl": "https://media.licdn.com/dms/image/v2/D5603AQGx9boZKxta6A/profile-displayphoto-",
        "$type": "com.linkedin.common.VectorImage"
      },
      "$type": "com.linkedin.voyager.identity.shared.MiniProfile",
      "firstName": "<name:2>",
      "entityUrn": "<userId:2>",
      "publicIdentifier": "<username:1>",
      "trackingId": "VFjeYvaBQR6H8pd9t8gF0w=="
    }
  ]
}
```

**runs/inspect/20261107T170649_<name:3>**, step 1: goto /in/<profile>/: 200, 113 ms

Sent:

```json
null
```

Answered:

```json
{
  "data": {
    "plainId": 1240627925,
    "publicContactInfo": {
      "$type": "com.linkedin.voyager.identity.shared.PublicContactInfo"
    },
    "premiumSubscriber": false,
    "*miniProfile": "urn:li:fs_miniProfile:<memberId>",
    "$type": "com.linkedin.voyager.common.Me"
  },
  "included": [
    {
      "customPronoun": null,
      "memorialized": false,
      "lastName": "<name:1>",
      "dashEntityUrn": "<userId:1>",
      "standardizedPronoun": "HE_HIM",
      "occupation": "<messageText>",
      "objectUrn": "urn:li:member:1240627925",
      "backgroundImage": {
        "digitalmediaAsset": "urn:li:digitalmediaAsset:D5616AQHAAywQTiAx4Q",
        "artifacts": [
          {
            "width": 1400,
            "fileIdentifyingUrlPathSegment": "350_1400/B56ZwsX5BjIwAY-/0/1770270987166?e=1795651200&v=beta&t=PBNTMc63HClAlpqpFpqEdRVMwHZs_1IPV0XXVOTMoyM",
            "expiresAt": 1795651200000,
            "height": 349,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          {
            "width": 800,
            "fileIdentifyingUrlPathSegment": "200_800/B56ZwsX5BjIwAU-/0/1770270987166?e=1795651200&v=beta&t=yWOyPeJfYqBb2RNGIT5BpAoO_IcEbb7p_BZKcfPDAhM",
            "expiresAt": 1795651200000,
            "height": 199,
            "$type": "com.linkedin.common.VectorArtifact"
          }
        ],
        "rootUrl": "https://media.licdn.com/dms/image/v2/D5616AQHAAywQTiAx4Q/profile-displaybackgroundimage-shrink_",
        "$type": "com.linkedin.common.VectorImage"
      },
      "picture": {
        "digitalmediaAsset": "urn:li:digitalmediaAsset:D5603AQGx9boZKxta6A",
        "artifacts": [
          {
            "width": 200,
            "fileIdentifyingUrlPathSegment": "scale_200_200/B56ZwsVOj5H0Ac-/0/1770270288853?e=1795651200&v=beta&t=Gy4R5iOWuzIn0320Xs5iyiOdK6vkLKRKvsPy25UC3EI",
            "expiresAt": 1795651200000,
            "height": 200,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          {
            "width": 400,
            "fileIdentifyingUrlPathSegment": "scale_400_400/B56ZwsVOj5H0Ak-/0/1770270288853?e=1795651200&v=beta&t=1At5J5Dps43p7i6E2JeEOUMLeTQDG6allbYVMPxmlZc",
            "expiresAt": 1795651200000,
            "height": 400,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          {
            "width": 100,
            "fileIdentifyingUrlPathSegment": "scale_100_100/B56ZwsVOj5H0Ag-/0/1770270288853?e=1795651200&v=beta&t=dtr8bhYyTWmUK28fkg3CqmnHSLmhvbYBvh41eVVi3iQ",
            "expiresAt": 1795651200000,
            "height": 100,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          {
            "width": 800,
            "fileIdentifyingUrlPathSegment": "crop_800_800/B56ZwsVOj5H0AM-/0/1770270288766?e=1795651200&v=beta&t=RrFUwr71X-GT3PqQ5eO75jHksPClyRuArwT_Bz6tOaU",
            "expiresAt": 1795651200000,
            "height": 800,
            "$type": "com.linkedin.common.VectorArtifact"
          }
        ],
        "rootUrl": "https://media.licdn.com/dms/image/v2/D5603AQGx9boZKxta6A/profile-displayphoto-",
        "$type": "com.linkedin.common.VectorImage"
      },
      "$type": "com.linkedin.voyager.identity.shared.MiniProfile",
      "firstName": "<name:2>",
      "entityUrn": "<userId:2>",
      "publicIdentifier": "<username:1>",
      "trackingId": "VFjeYvaBQR6H8pd9t8gF0w=="
    }
  ]
}
```

**runs/inspect/20261107T161246_<name:3>**, step 2: snapshot: 200, 102 ms

Sent:

```json
null
```

Answered:

```json
{
  "data": {
    "plainId": 1240627925,
    "publicContactInfo": {
      "$type": "com.linkedin.voyager.identity.shared.PublicContactInfo"
    },
    "premiumSubscriber": false,
    "*miniProfile": "urn:li:fs_miniProfile:<memberId>",
    "$type": "com.linkedin.voyager.common.Me"
  },
  "included": [
    {
      "customPronoun": null,
      "memorialized": false,
      "lastName": "<name:1>",
      "dashEntityUrn": "<userId:1>",
      "standardizedPronoun": "HE_HIM",
      "occupation": "<messageText>",
      "objectUrn": "urn:li:member:1240627925",
      "backgroundImage": {
        "digitalmediaAsset": "urn:li:digitalmediaAsset:D5616AQHAAywQTiAx4Q",
        "artifacts": [
          {
            "width": 1400,
            "fileIdentifyingUrlPathSegment": "350_1400/B56ZwsX5BjIwAY-/0/1770270987166?e=1795651200&v=beta&t=PBNTMc63HClAlpqpFpqEdRVMwHZs_1IPV0XXVOTMoyM",
            "expiresAt": 1795651200000,
            "height": 349,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          {
            "width": 800,
            "fileIdentifyingUrlPathSegment": "200_800/B56ZwsX5BjIwAU-/0/1770270987166?e=1795651200&v=beta&t=yWOyPeJfYqBb2RNGIT5BpAoO_IcEbb7p_BZKcfPDAhM",
            "expiresAt": 1795651200000,
            "height": 199,
            "$type": "com.linkedin.common.VectorArtifact"
          }
        ],
        "rootUrl": "https://media.licdn.com/dms/image/v2/D5616AQHAAywQTiAx4Q/profile-displaybackgroundimage-shrink_",
        "$type": "com.linkedin.common.VectorImage"
      },
      "picture": {
        "digitalmediaAsset": "urn:li:digitalmediaAsset:D5603AQGx9boZKxta6A",
        "artifacts": [
          {
            "width": 200,
            "fileIdentifyingUrlPathSegment": "scale_200_200/B56ZwsVOj5H0Ac-/0/1770270288853?e=1795651200&v=beta&t=Gy4R5iOWuzIn0320Xs5iyiOdK6vkLKRKvsPy25UC3EI",
            "expiresAt": 1795651200000,
            "height": 200,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          {
            "width": 400,
            "fileIdentifyingUrlPathSegment": "scale_400_400/B56ZwsVOj5H0Ak-/0/1770270288853?e=1795651200&v=beta&t=1At5J5Dps43p7i6E2JeEOUMLeTQDG6allbYVMPxmlZc",
            "expiresAt": 1795651200000,
            "height": 400,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          {
            "width": 100,
            "fileIdentifyingUrlPathSegment": "scale_100_100/B56ZwsVOj5H0Ag-/0/1770270288853?e=1795651200&v=beta&t=dtr8bhYyTWmUK28fkg3CqmnHSLmhvbYBvh41eVVi3iQ",
            "expiresAt": 1795651200000,
            "height": 100,
            "$type": "com.linkedin.common.VectorArtifact"
          },
          {
            "width": 800,
            "fileIdentifyingUrlPathSegment": "crop_800_800/B56ZwsVOj5H0AM-/0/1770270288766?e=1795651200&v=beta&t=RrFUwr71X-GT3PqQ5eO75jHksPClyRuArwT_Bz6tOaU",
            "expiresAt": 1795651200000,
            "height": 800,
            "$type": "com.linkedin.common.VectorArtifact"
          }
        ],
        "rootUrl": "https://media.licdn.com/dms/image/v2/D5603AQGx9boZKxta6A/profile-displayphoto-",
        "$type": "com.linkedin.common.VectorImage"
      },
      "$type": "com.linkedin.voyager.identity.shared.MiniProfile",
      "firstName": "<name:2>",
      "entityUrn": "<userId:2>",
      "publicIdentifier": "<username:1>",
      "trackingId": "i3pggt8BT6y515kBivl0Cw=="
    }
  ]
}
```

<!-- facts:end -->

## What it does

The signed-in member as the web client sees it: `plainId`, `publicContactInfo`, `premiumSubscriber`, the `miniProfile` and its `included` records. It sends nothing and fires once on each profile and feed load, about 2.4 to 3.6 seconds in, in 88 to 154 ms.

## What our machine does with it

It is the session check. `ping` (`check` in `python/linkedinApi/engine.py`) sends it through openLinkedinApi's `_fetch("/me")` without following redirects, and a 200 with JSON is `loggedIn`: it reads the miniProfile (or the `MiniProfile` in `included`) for the account's public identifier, name and profile id, and `premiumSubscriber`, and saves any cookies LinkedIn refreshed. `Messaging.open_mailbox` in `python/linkedinApi/messaging.py` reads it too, to find the account's profile id and build its mailbox urn before `inbox` or `messages`.

## What can go wrong

Only 200 is in our recordings. For `ping`, the code decides the rest: an answer that deletes `li_at` is `sessionRevoked`, and 301, 302, 303, 401 or 403 is `sessionDead` (both `loggedOut`); 429 or 999 is `rateLimited` with the event `throttled`; any other status or a non-JSON answer is `sessionUnknown`. For the mailbox, an answer that names no profile id stops the read with `templateStale`.
