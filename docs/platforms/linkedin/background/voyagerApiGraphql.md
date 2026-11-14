# voyagerApiGraphql

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/graphql` |
| Sends | — |
| Reads | `data.data`, `data.extensions`, `meta.microSchema`, `included` |
| Called from | `runs/inspect/20261107T170649_<name:7>/script37.js:1433 fetchIdentityModule`, `runs/inspect/20261107T161246_<name:7>/script264.js:252 fetchIdentityModule` |
| rea | `ev_ebb311c92c2fd9b9d68f44d37f3ac6312b93ea7fe007073cf2c6760d9ed28046` |

Seen 102 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /in/<profile>/ | 13 | 200 | 62–370 ms | 3203–5885 ms | — |
| inspect | step 4: click e2111 | 2 | 200 | 140–143 ms | 1081–1226 ms | — |
| inspect | step 6: click e2157 | 1 | 200 | 136 ms | 918 ms | — |
| inspect | step 2: snapshot | 13 | 200 | 68–344 ms | 205624–206090 ms | — |
| inspect | step 4: goto /feed/ | 15 | 200 | 65–372 ms | 3551–10010 ms | — |
| inspect | step 5: goto /feed/ | 15 | 200 | 75–379 ms | 3097–7426 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/pagination (759 ms) | 1 | 200 | 149 ms | 327 ms | — |
| inspect | step 6: goto /feed/ | 13 | 200 | 82–535 ms | 3044–3590 ms | — |
| inspect | step 12: goto /feed/ | 13 | 200 | 77–403 ms | 3558–4061 ms | — |
| inspect | step 25: goto /in/<profile>/ | 13 | 200 | 67–398 ms | 2375–2928 ms | — |
| inspect | step 27: click e1346 | 2 | 200 | 142–150 ms | 2067–2212 ms | — |
| inspect | step 31: press Escape | 1 | 200 | 138 ms | 7 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:7>**, step 1: goto /in/<profile>/: 200, 370 ms

Sent:

```json
{
  "query": {
    "includeWebMetadata": "true",
    "variables": "()",
    "queryId": "voyagerFeedDashGlobalNavs.a618d03c522276ae43e2ecc891d11cf2"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "data": {
      "feedDashGlobalNavs": {
        "logo": "(5 fields)",
        "$recipeTypes": "(1 items)",
        "spotlight": "(4 fields)",
        "primaryItems": "(7 items)",
        "$type": "com.linkedin.voyager.dash.feed.nav.GlobalNav"
      },
      "$recipeTypes": [
        "com.linkedin.1f89c60d56117f36dc02eb3d95a6504d"
      ],
      "$type": "com.linkedin.1f89c60d56117f36dc02eb3d95a6504d"
    },
    "extensions": {
      "webMetadata": {}
    }
  },
  "meta": {
    "microSchema": {
      "isGraphQL": true,
      "version": "2.1",
      "types": {
        "com.linkedin.dcb85e1ca353361cb2b5f6fa24a1c9af": "(2 fields)",
        "com.linkedin.a79548cba60a2c749bd98898c709a2d7": "(2 fields)",
        "com.linkedin.1e797f68b521546886989869c5b44a2d": "(2 fields)",
        "com.linkedin.fb4511fb6c2df4a805ef662367e15026": "(2 fields)",
        "com.linkedin.f1332bd87cf4dccab8aa4b4583ad44be": "(2 fields)",
        "com.linkedin.61dcef34ee68ce7a34919062297c038b": "(2 fields)",
        "com.linkedin.6c29a299f640b6e802d15141c355bd92": "(2 fields)",
        "com.linkedin.1f89c60d56117f36dc02eb3d95a6504d": "(2 fields)",
        "com.linkedin.3f6b70271a191b90b9e67a2863679a77": "(2 fields)",
        "com.linkedin.bb35e914e880d9f9ad79d52bf644c44c": "(2 fields)",
        "com.linkedin.1112232e110fbaf9f6866335ae420a21": "(2 fields)",
        "com.linkedin.a08f426e41608b84229ccb3206c4ce64": "(2 fields)",
        "com.linkedin.1510f76c77ff4950d15267dda7463e3f": "(2 fields)",
        "com.linkedin.bda725ec0f4ddc7380fb44de84e29723": "(2 fields)",
        "com.linkedin.bfdfb2683d138420bc521056a605174d": "(2 fields)",
        "com.linkedin.a86b6e849f7116bd22f422840d68c265": "(2 fields)",
        "com.linkedin.b2c03744140a6cd6a2e693c32790988c": "(2 fields)",
        "com.linkedin.371c4584dc45b7919c4eb6ed6697e8cf": "(2 fields)",
        "com.linkedin.1c710707068d7b33bcbee05036904a3b": "(2 fields)",
        "com.linkedin.8b2657e6d402c000382bd65eb94ba628": "(2 fields)",
        "com.linkedin.ae72a2e8f27d029e18d8e6d4350b0273": "(2 fields)",
        "com.linkedin.d66f0cb7963e0345d3ff893927e60c88": "(2 fields)",
        "com.linkedin.eae2ed6e463973c8e0d55baecd814363": "(2 fields)",
        "com.linkedin.9d1c9f8db73cc268b525043481708082": "(2 fields)",
        "com.linkedin.513969f6493543c4ad7f04b46c3b67f6": "(2 fields)",
        "com.linkedin.73113dd58d976ff22a5e4aa2ca35d21d": "(2 fields)",
        "com.linkedin.d6038751fe26f2a90ed06dcfd5acb15e": "(2 fields)",
        "com.linkedin.68d330957951bfe0ba509507962b88b5": "(2 fields)",
        "com.linkedin.72c1c1091a60c5a77aaadac057a84b54": "(2 fields)",
        "com.linkedin.72e4cd594b8572e0ec9ddb034eafc088": "(2 fields)",
        "com.linkedin.f58e91c23e63f52ceb12bd0fab3eb07b": "(2 fields)",
        "com.linkedin.4973670c8e07d9bf8572c4c7f8658e2b": "(2 fields)",
        "com.linkedin.8fbc11c3b77aca2f1a34ab7a34600da7": "(2 fields)",
        "com.linkedin.72ff698dfdea20e2538931532a528e81": "(2 fields)",
        "com.linkedin.6cf7727c816c79567a0564982ee35ef4": "(2 fields)",
        "com.linkedin.9af983b772f4bbd9cbf89546c7918c81": "(2 fields)",
        "com.linkedin.84ab56fbc5e5295838e45c3196fae496": "(2 fields)",
        "com.linkedin.566376561ef86249fc89f5596eaf6fe1": "(2 fields)",
        "com.linkedin.f89edd0cdc11632a12f86e550f2f5e46": "(2 fields)",
        "com.linkedin.797f28906de48c13543c3ff29a412882": "(2 fields)",
        "com.linkedin.d89019fe8a3ce5b421f6a2194d098cd9": "(2 fields)",
        "com.linkedin.0d2a5c07095246fc3e756f3e922d8aa0": "(2 fields)",
        "com.linkedin.ea3b60347e16ebbb7c71f3d831758a92": "(2 fields)",
        "com.linkedin.2b5530b88c12ba36048beee3aca27737": "(2 fields)",
        "com.linkedin.feccefa74b57bf711c74d0b09805c9f6": "(2 fields)",
        "com.linkedin.1febda95b00bfc8c540a7af0dc75a88a": "(2 fields)",
        "com.linkedin.65deee184b56ce21c8d7d30fec6acfe4": "(2 fields)",
        "com.linkedin.98f5f0b76629959525795b08bdfbcc26": "(2 fields)",
        "com.linkedin.188858304ae14097e59518d245c7cc85": "(2 fields)",
        "com.linkedin.550a9af095fffdd7fc0f6ceb8743a141": "(2 fields)",
        "com.linkedin.44f2985bd25b663c32c3c4d4ec070248": "(2 fields)",
        "com.linkedin.10f415928dc4647be1fe1eebc72fe277": "(2 fields)",
        "com.linkedin.c7f876e8e9f8a631b2896f62a656ce64": "(2 fields)",
        "com.linkedin.96db794fa6a744844b487cfa3e195632": "(2 fields)",
        "com.linkedin.f94aca2770a997f8a58dfb7d6154954a": "(2 fields)",
        "com.linkedin.a94ff0919cddaa7056025e9491dc3794": "(2 fields)",
        "com.linkedin.c8b3cc209fc06180b17a4ffb72120344": "(2 fields)",
        "com.linkedin.4ef51bc3dc729207a4f87aa1ac1b37cf": "(2 fields)",
        "com.linkedin.e6506ba5f5cc1a9b5124781a3661a7db": "(2 fields)",
        "com.linkedin.ca116024396bd29dd1345ad0998a57d5": "(2 fields)"
      }
    }
  },
  "included": [
    {
      "firstName": "<name:1>",
      "lastName": "<name:2>",
      "profilePicture": {
        "displayImageReferenceResolutionResult": "(2 fields)",
        "displayImageWithFrameReference": null,
        "$recipeTypes": "(1 items)",
        "$type": "com.linkedin.voyager.dash.identity.profile.PhotoFilterPicture"
      },
      "verificationData": {
        "verificationStateResolutionResult": "(2 fields)",
        "$recipeTypes": "(1 items)",
        "$type": "com.linkedin.voyager.dash.identity.profile.VerificationState"
      },
      "displayBadges": [
        "(4 fields)"
      ],
      "entityUrn": "<userId:1>",
      "headline": "<messageText>",
      "publicIdentifier": "<username:1>",
      "$recipeTypes": [
        "com.linkedin.c8b3cc209fc06180b17a4ffb72120344"
      ],
      "$type": "com.linkedin.voyager.dash.identity.profile.Profile"
    }
  ]
}
```

**runs/inspect/20261107T170649_<name:7>**, step 4: click e2111: 200, 140 ms

Sent:

```json
{
  "query": {
    "includeWebMetadata": "true",
    "variables": "(memberIdentity:<profile>)",
    "queryId": "voyagerIdentityDashProfiles.273a499c117721535e6da078bee17e9c"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "data": {
      "$recipeTypes": [
        "com.linkedin.126af938864c2dbf4662f04d08e4cdc2"
      ],
      "identityDashProfilesByMemberIdentity": {
        "*elements": [
          "urn:li:fsd_profile:<memberId>"
        ],
        "$recipeTypes": [
          "com.linkedin.96d769eab396ca1c0922533578c9b90e"
        ],
        "$type": "com.linkedin.restli.common.CollectionResponse"
      },
      "$type": "com.linkedin.126af938864c2dbf4662f04d08e4cdc2"
    },
    "extensions": {
      "webMetadata": {}
    }
  },
  "meta": {
    "microSchema": {
      "isGraphQL": true,
      "version": "2.1",
      "types": {
        "com.linkedin.96d769eab396ca1c0922533578c9b90e": {
          "fields": {
            "elements": {
              "type": {
                "array": "com.linkedin.d4836cb3053ad56cb5a7bfe515546c7b"
              }
            }
          },
          "baseType": "com.linkedin.restli.common.CollectionResponse"
        },
        "com.linkedin.9ab028181d567cd64f0fd984ee620b7d": {
          "fields": {
            "emailAddress": {
              "type": "com.linkedin.common.EmailAddress"
            }
          },
          "baseType": "com.linkedin.voyager.dash.common.handles.EmailAddress"
        },
        "com.linkedin.126af938864c2dbf4662f04d08e4cdc2": {
          "fields": {
            "identityDashProfilesByMemberIdentity": {
              "type": "com.linkedin.96d769eab396ca1c0922533578c9b90e"
            }
          },
          "baseType": "com.linkedin.graphql.Query"
        },
        "com.linkedin.d4836cb3053ad56cb5a7bfe515546c7b": {
          "fields": {
            "lastName": {
              "type": "string"
            },
            "firstName": {
              "type": "string"
            },
            "emailAddress": {
              "type": "com.linkedin.9ab028181d567cd64f0fd984ee620b7d"
            },
            "entityUrn": {
              "type": "com.linkedin.voyager.dash.common.ProfileUrn"
            },
            "iweWarned": {
              "type": "boolean"
            },
            "maidenName": {
              "type": "string"
            },
            "emailRequired": {
              "type": "boolean"
            },
            "publicIdentifier": {
              "type": "string"
            }
          },
          "baseType": "com.linkedin.voyager.dash.identity.profile.Profile"
        }
      }
    }
  },
  "included": [
    {
      "firstName": "<name:3>",
      "lastName": "<name:4>",
      "emailAddress": null,
      "entityUrn": "<userId:2>",
      "iweWarned": false,
      "maidenName": null,
      "emailRequired": false,
      "publicIdentifier": "<username:2>",
      "$recipeTypes": [
        "com.linkedin.d4836cb3053ad56cb5a7bfe515546c7b"
      ],
      "$type": "com.linkedin.voyager.dash.identity.profile.Profile"
    }
  ]
}
```

**runs/inspect/20261107T170649_<name:7>**, step 6: click e2157: 200, 136 ms

Sent:

```json
{
  "query": {
    "queryId": "voyagerMessagingDashAffiliatedMailboxes.aef223806c4270935ab6bdebfda1695d"
  },
  "body": null
}
```

Answered:

```json
{
  "data": {
    "data": {
      "$recipeTypes": [
        "com.linkedin.fdc08497f0c187a569384c6f043ad3ce"
      ],
      "messagingDashAffiliatedMailboxesAll": {
        "$recipeTypes": [
          "com.linkedin.443efd0179bf33df1a78fe9ff29fae07"
        ],
        "elements": [
          {
            "mailbox": {
              "pageMailbox": {
                "pageMailboxes": [
                  {
                    "unreadCount": "…",
                    "*pageMailbox": "…",
                    "$recipeTypes": "…",
                    "$type": "…"
                  },
                  {
                    "unreadCount": "…",
                    "*pageMailbox": "…",
                    "$recipeTypes": "…",
                    "$type": "…"
                  }
                ],
                "aggregatedUnreadCount": 0,
                "$recipeTypes": [
                  "com.linkedin.c1921083b302aa6085947e239e5ff4ff"
                ],
                "$type": "com.linkedin.voyager.dash.messaging.PageMailboxesBadge"
              },
              "recruiter": null,
              "sales": null
            },
            "$recipeTypes": [
              "com.linkedin.75d428cc927cf718962414914d125dd9"
            ],
            "$type": "com.linkedin.voyager.dash.messaging.AffiliatedMailbox"
          }
        ],
        "$type": "com.linkedin.restli.common.CollectionResponse"
      },
      "$type": "com.linkedin.fdc08497f0c187a569384c6f043ad3ce"
    }
  },
  "included": [
    {
      "entityUrn": "<userId:3>",
      "name": "<name:5>",
      "logoResolutionResult": {
        "url": null,
        "vectorImage": {
          "attribution": null,
          "$recipeTypes": [
            "com.linkedin.255f646d1ad4e933086c68f924638c0e"
          ],
          "artifacts": [
            {
              "width": 100,
              "$recipeTypes": [
                "com.linkedin.66221a223b2f1f38e5d77cd4afacbe40"
              ],
              "fileIdentifyingUrlPathSegment": "100_100/B4EZ5zxPSbIAAI-/0/1780058748299/inference_saver_logo?e=1795651200&v=beta&t=3reXDgowc6Pwd5cEnKMkBDsmJ85AXolI6dgWeu_78FI",
              "expiresAt": 1795651200000,
              "height": 100,
              "$type": "com.linkedin.common.VectorArtifact"
            },
            {
              "width": 400,
              "$recipeTypes": [
                "com.linkedin.66221a223b2f1f38e5d77cd4afacbe40"
              ],
              "fileIdentifyingUrlPathSegment": "400_400/B4EZ5zxPSbIAAU-/0/1780058748300/inference_saver_logo?e=1795651200&v=beta&t=Y2U07q9j3z7u2s8IYxJ_mFcZcedZbzznGWD3nzpOPbE",
              "expiresAt": 1795651200000,
              "height": 400,
              "$type": "com.linkedin.common.VectorArtifact"
            },
            {
              "width": 200,
              "$recipeTypes": [
                "com.linkedin.66221a223b2f1f38e5d77cd4afacbe40"
              ],
              "fileIdentifyingUrlPathSegment": "200_200/B4EZ5zxPSbIAAE-/0/1780058748300/inference_saver_logo?e=1795651200&v=beta&t=1nTEzs35qG-uD7Pb0A3Pbq2HL1yOe64gQqxvc8ZmLqw",
              "expiresAt": 1795651200000,
              "height": 200,
              "$type": "com.linkedin.common.VectorArtifact"
            }
          ],
          "rootUrl": "https://media.licdn.com/dms/image/v2/D4E0BAQEPjRhYHdktww/company-logo_",
          "$type": "com.linkedin.common.VectorImage"
        }
      },
      "$recipeTypes": [
        "com.linkedin.365d462519398e1175ef2685e40f6109"
      ],
      "$type": "com.linkedin.voyager.dash.organization.Company"
    },
    {
      "entityUrn": "<userId:4>",
      "name": "<name:6>",
      "logoResolutionResult": {
        "url": null,
        "vectorImage": {
          "attribution": null,
          "$recipeTypes": [
            "com.linkedin.255f646d1ad4e933086c68f924638c0e"
          ],
          "artifacts": [
            {
              "width": 100,
              "$recipeTypes": [
                "com.linkedin.66221a223b2f1f38e5d77cd4afacbe40"
              ],
              "fileIdentifyingUrlPathSegment": "100_100/B56aD.jmdRHcAI-/0/1790977140792?e=1795651200&v=beta&t=FqgYm4vyvAN2GH0V9EltEnTZzZSEnjjiL1_18MknOQc",
              "expiresAt": 1795651200000,
              "height": 100,
              "$type": "com.linkedin.common.VectorArtifact"
            },
            {
              "width": 400,
              "$recipeTypes": [
                "com.linkedin.66221a223b2f1f38e5d77cd4afacbe40"
              ],
              "fileIdentifyingUrlPathSegment": "400_400/B56aD.jmdRHcAU-/0/1790977140792?e=1795651200&v=beta&t=PbLMzwFo07Upzk77JdPvE-bTagE4k56JJAZqcUM7S7Y",
              "expiresAt": 1795651200000,
              "height": 400,
              "$type": "com.linkedin.common.VectorArtifact"
            },
            {
              "width": 200,
              "$recipeTypes": [
                "com.linkedin.66221a223b2f1f38e5d77cd4afacbe40"
              ],
              "fileIdentifyingUrlPathSegment": "200_200/B56aD.jmdRHcAE-/0/1790977140792?e=1795651200&v=beta&t=mNh_58fOtHQypfTDIaBhESYMzAuLKh4gg8QRjoj_LZE",
              "expiresAt": 1795651200000,
              "height": 200,
              "$type": "com.linkedin.common.VectorArtifact"
            }
          ],
          "rootUrl": "https://media.licdn.com/dms/image/v2/D560BAQElW_vt-tFecw/company-logo_",
          "$type": "com.linkedin.common.VectorImage"
        }
      },
      "$recipeTypes": [
        "com.linkedin.365d462519398e1175ef2685e40f6109"
      ],
      "$type": "com.linkedin.voyager.dash.organization.Company"
    },
    {
      "ownerOrganization": {
        "*company": "urn:li:fsd_company:143943533"
      },
      "entityUrn": "<userId:5>",
      "messagingEnabled": true,
      "$recipeTypes": [
        "com.linkedin.b367174ecdbc48b36bb4c73a7df32c42"
      ],
      "$type": "com.linkedin.voyager.dash.organization.PageMailbox"
    },
    {
      "ownerOrganization": {
        "*company": "urn:li:fsd_company:112618992"
      },
      "entityUrn": "<userId:6>",
      "messagingEnabled": true,
      "$recipeTypes": [
        "com.linkedin.b367174ecdbc48b36bb4c73a7df32c42"
      ],
      "$type": "com.linkedin.voyager.dash.organization.PageMailbox"
    }
  ]
}
```

<!-- facts:end -->

## What it does

The web client's main Voyager GraphQL endpoint: a GET with a `queryId` and `variables` (and `includeWebMetadata=true`) that answers with `data`, `meta.microSchema` and `included`. The queries seen in our runs are `voyagerFeedDashGlobalNavs` (the top navigation), `voyagerIdentityDashProfiles` (a profile by its public identifier) and `voyagerMessagingDashAffiliatedMailboxes` (the mailboxes the account can read), called from code named `fetchIdentityModule`. It fires about 13 times on every profile and feed load, in 62 to 535 ms.

## What our machine does with it

No action of log's LinkedIn direct-API engine (`ACTIONS` in `python/linkedinApi/engine.py`) sends a request to this path. Its messaging reads go to `/voyager/api/voyagerMessagingGraphQL/graphql` instead (`messengerConversations` and `messengerMessages` in `python/linkedinApi/messaging.py`, documented in `voyagerApiVoyagermessaginggraphqlGraphql.md`). The vendored openLinkedinApi has calls here (`voyagerSearchDashClusters` in its people search, `voyagerIdentityDashProfileComponents` in `get_profile_experiences`), but no engine action calls them.

## What can go wrong

Every answer in our runs is 200. Since the engine sends nothing here, a refusal on this path only shows up in the browser page.
