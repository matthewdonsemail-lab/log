# voyagerApiVoyagerrelationshipsdashmemberrelationships

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerRelationshipsDashMemberRelationships` |
| Sends | `invitee` |
| Reads | `data.value`, `data.$type`, `meta.microSchema`, `included` |
| Called from | — |
| rea | `ev_99f341f871ab6a7fd99a5029ee1e64c2ae5a59824eea1a83c8954a6041b5977d` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: click e2157 | 1 | 200 | 255 ms | 658 ms | — |
| inspect | POST 0 /flagship-web/rsc-action/actions/pagination (759 ms) | 1 | 200 | 257 ms | 64 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261107T170649_<name:1>**, step 6: click e2157: 200, 255 ms

Sent:

```json
{
  "query": {
    "action": "verifyQuotaAndCreateV2",
    "decorationId": "com.linkedin.voyager.dash.deco.relationships.InvitationCreationResultWithInvitee-3"
  },
  "body": {
    "invitee": {
      "inviteeUnion": {
        "memberProfile": "urn:li:fsd_profile:<memberId>"
      }
    }
  }
}
```

Answered:

```json
{
  "data": {
    "value": {
      "invitationUrn": "urn:li:fsd_invitation:7524880445914849280",
      "$recipeTypes": [
        "com.linkedin.voyager.dash.deco.relationships.InvitationCreationResultWithInvitee"
      ],
      "$type": "com.linkedin.voyager.dash.relationships.invitation.InvitationCreationResult",
      "*invitation": "urn:li:fsd_invitation:7524880445914849280"
    },
    "$type": "com.linkedin.restli.common.ActionResponse"
  },
  "meta": {
    "microSchema": {
      "version": "2",
      "types": {
        "com.linkedin.voyager.dash.deco.relationships.PageKey": {
          "fields": {
            "anchorPage": {
              "type": "boolean"
            },
            "pageKey": {
              "type": "string"
            }
          },
          "baseType": "com.linkedin.voyager.dash.common.tracking.PageKey"
        },
        "com.linkedin.voyager.dash.deco.common.VectorArtifact": {
          "fields": {
            "width": {
              "type": "int"
            },
            "fileIdentifyingUrlPathSegment": {
              "type": "string"
            },
            "expiresAt": {
              "type": "long"
            },
            "height": {
              "type": "int"
            }
          },
          "baseType": "com.linkedin.common.VectorArtifact"
        },
        "com.linkedin.voyager.dash.deco.feed.FollowingState": {
          "fields": {
            "followeeCount": {
              "type": "long"
            },
            "entityUrn": {
              "type": "string"
            },
            "preDashFollowingInfoUrn": {
              "type": "string"
            },
            "following": {
              "type": "boolean"
            },
            "trackingUrn": {
              "type": "string"
            },
            "followingType": {
              "type": "string"
            },
            "followerCount": {
              "type": "long"
            }
          },
          "baseType": "com.linkedin.voyager.dash.feed.FollowingState"
        },
        "com.linkedin.voyager.dash.deco.relationships.InvitationInfo": {
          "fields": {
            "entityUrn": {
              "type": "string"
            }
          },
          "baseType": "com.linkedin.voyager.dash.relationships.invitation.Invitation"
        },
        "com.linkedin.voyager.dash.deco.relationships.InviteeProfile": {
          "fields": {
            "profilePicture": {
              "type": "com.linkedin.voyager.dash.deco.identity.profile.ProfilePhotoDecoSpecReadOnlyProfilePicture"
            },
            "firstName": {
              "type": "string"
            },
            "lastName": {
              "type": "string"
            },
            "entityUrn": {
              "type": "string"
            },
            "publicIdentifier": {
              "type": "string"
            },
            "headline": {
              "type": "string"
            }
          },
          "baseType": "com.linkedin.voyager.dash.identity.profile.Profile"
        },
        "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution": {
          "fields": {
            "attribution": {
              "type": "string"
            },
            "isStandardDynamicRangeEnforced": {
              "type": "boolean"
            },
            "rootUrl": {
              "type": "string"
            },
            "artifacts": {
              "type": {
                "array": "com.linkedin.voyager.dash.deco.common.VectorArtifact"
              }
            }
          },
          "baseType": "com.linkedin.common.VectorImage"
        },
        "com.linkedin.voyager.dash.deco.identity.profile.ProfilePhotoDecoSpecReadOnlyProfilePicture": {
          "fields": {
            "displayImageWithFrameReferenceUnion": {
              "type": {
                "union": {
                  "url": "string",
                  "vectorImage": "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution"
                }
              }
            },
            "frameType": {
              "type": "string"
            },
            "a11yText": {
              "type": "string"
            },
            "displayImageReference": {
              "type": {
                "union": {
                  "url": "string",
                  "vectorImage": "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution"
                }
              }
            },
            "displayImageUrn": {
              "type": "string"
            }
          },
          "baseType": "com.linkedin.voyager.dash.identity.profile.PhotoFilterPicture"
        },
        "com.linkedin.voyager.dash.deco.relationships.InvitationCreationResultWithInvitee": {
          "fields": {
            "followingStateUrn": {
              "type": "string"
            },
            "inviteeUrn": {
              "type": "string"
            },
            "followingState": {
              "resolvedFrom": "followingStateUrn",
              "type": "com.linkedin.voyager.dash.deco.feed.FollowingState"
            },
            "invitation": {
              "resolvedFrom": "invitationUrn",
              "type": "com.linkedin.voyager.dash.deco.relationships.InvitationInfo"
            },
            "invitationUrn": {
              "type": "string"
            },
            "followEdgeUpdated": {
              "type": "boolean"
            },
            "fuseEducationView": {
              "type": "com.linkedin.voyager.dash.deco.relationships.FuseEducationView"
            },
            "invitee": {
              "resolvedFrom": "inviteeUrn",
              "type": "com.linkedin.voyager.dash.deco.relationships.InviteeProfile"
            }
          },
          "baseType": "com.linkedin.voyager.dash.relationships.invitation.InvitationCreationResult"
        },
        "com.linkedin.voyager.dash.deco.relationships.FuseEducationView": {
          "fields": {
            "pageKey": {
              "type": "com.linkedin.voyager.dash.deco.relationships.PageKey"
            },
            "subTitle": {
              "type": "string"
            },
            "learnMoreUrl": {
              "type": "string"
            },
            "title": {
              "type": "string"
            }
          },
          "baseType": "com.linkedin.voyager.dash.relationships.invitation.FuseEducationView"
        }
      }
    }
  },
  "included": [
    {
      "entityUrn": "<userId:1>",
      "$recipeTypes": [
        "com.linkedin.voyager.dash.deco.relationships.InvitationInfo"
      ],
      "$type": "com.linkedin.voyager.dash.relationships.invitation.Invitation"
    }
  ]
}
```

**runs/inspect/20261107T161246_<name:1>**, POST 0 /flagship-web/rsc-action/actions/pagination (759 ms): 200, 257 ms

Sent:

```json
{
  "query": {
    "action": "verifyQuotaAndCreateV2",
    "decorationId": "com.linkedin.voyager.dash.deco.relationships.InvitationCreationResultWithInvitee-3"
  },
  "body": {
    "invitee": {
      "inviteeUnion": {
        "memberProfile": "urn:li:fsd_profile:<memberId>"
      }
    }
  }
}
```

Answered:

```json
{
  "data": {
    "value": {
      "invitationUrn": "urn:li:fsd_invitation:7524867667313504257",
      "$recipeTypes": [
        "com.linkedin.voyager.dash.deco.relationships.InvitationCreationResultWithInvitee"
      ],
      "$type": "com.linkedin.voyager.dash.relationships.invitation.InvitationCreationResult",
      "*invitation": "urn:li:fsd_invitation:7524867667313504257"
    },
    "$type": "com.linkedin.restli.common.ActionResponse"
  },
  "meta": {
    "microSchema": {
      "version": "2",
      "types": {
        "com.linkedin.voyager.dash.deco.relationships.PageKey": {
          "fields": {
            "anchorPage": {
              "type": "boolean"
            },
            "pageKey": {
              "type": "string"
            }
          },
          "baseType": "com.linkedin.voyager.dash.common.tracking.PageKey"
        },
        "com.linkedin.voyager.dash.deco.common.VectorArtifact": {
          "fields": {
            "width": {
              "type": "int"
            },
            "fileIdentifyingUrlPathSegment": {
              "type": "string"
            },
            "expiresAt": {
              "type": "long"
            },
            "height": {
              "type": "int"
            }
          },
          "baseType": "com.linkedin.common.VectorArtifact"
        },
        "com.linkedin.voyager.dash.deco.feed.FollowingState": {
          "fields": {
            "followeeCount": {
              "type": "long"
            },
            "entityUrn": {
              "type": "string"
            },
            "preDashFollowingInfoUrn": {
              "type": "string"
            },
            "following": {
              "type": "boolean"
            },
            "trackingUrn": {
              "type": "string"
            },
            "followingType": {
              "type": "string"
            },
            "followerCount": {
              "type": "long"
            }
          },
          "baseType": "com.linkedin.voyager.dash.feed.FollowingState"
        },
        "com.linkedin.voyager.dash.deco.relationships.InvitationInfo": {
          "fields": {
            "entityUrn": {
              "type": "string"
            }
          },
          "baseType": "com.linkedin.voyager.dash.relationships.invitation.Invitation"
        },
        "com.linkedin.voyager.dash.deco.relationships.InviteeProfile": {
          "fields": {
            "profilePicture": {
              "type": "com.linkedin.voyager.dash.deco.identity.profile.ProfilePhotoDecoSpecReadOnlyProfilePicture"
            },
            "firstName": {
              "type": "string"
            },
            "lastName": {
              "type": "string"
            },
            "entityUrn": {
              "type": "string"
            },
            "publicIdentifier": {
              "type": "string"
            },
            "headline": {
              "type": "string"
            }
          },
          "baseType": "com.linkedin.voyager.dash.identity.profile.Profile"
        },
        "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution": {
          "fields": {
            "attribution": {
              "type": "string"
            },
            "isStandardDynamicRangeEnforced": {
              "type": "boolean"
            },
            "rootUrl": {
              "type": "string"
            },
            "artifacts": {
              "type": {
                "array": "com.linkedin.voyager.dash.deco.common.VectorArtifact"
              }
            }
          },
          "baseType": "com.linkedin.common.VectorImage"
        },
        "com.linkedin.voyager.dash.deco.identity.profile.ProfilePhotoDecoSpecReadOnlyProfilePicture": {
          "fields": {
            "displayImageWithFrameReferenceUnion": {
              "type": {
                "union": {
                  "url": "string",
                  "vectorImage": "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution"
                }
              }
            },
            "frameType": {
              "type": "string"
            },
            "a11yText": {
              "type": "string"
            },
            "displayImageReference": {
              "type": {
                "union": {
                  "url": "string",
                  "vectorImage": "com.linkedin.voyager.dash.deco.common.VectorImageOnlyRootUrlAndAttribution"
                }
              }
            },
            "displayImageUrn": {
              "type": "string"
            }
          },
          "baseType": "com.linkedin.voyager.dash.identity.profile.PhotoFilterPicture"
        },
        "com.linkedin.voyager.dash.deco.relationships.InvitationCreationResultWithInvitee": {
          "fields": {
            "followingStateUrn": {
              "type": "string"
            },
            "inviteeUrn": {
              "type": "string"
            },
            "followingState": {
              "resolvedFrom": "followingStateUrn",
              "type": "com.linkedin.voyager.dash.deco.feed.FollowingState"
            },
            "invitation": {
              "resolvedFrom": "invitationUrn",
              "type": "com.linkedin.voyager.dash.deco.relationships.InvitationInfo"
            },
            "invitationUrn": {
              "type": "string"
            },
            "followEdgeUpdated": {
              "type": "boolean"
            },
            "fuseEducationView": {
              "type": "com.linkedin.voyager.dash.deco.relationships.FuseEducationView"
            },
            "invitee": {
              "resolvedFrom": "inviteeUrn",
              "type": "com.linkedin.voyager.dash.deco.relationships.InviteeProfile"
            }
          },
          "baseType": "com.linkedin.voyager.dash.relationships.invitation.InvitationCreationResult"
        },
        "com.linkedin.voyager.dash.deco.relationships.FuseEducationView": {
          "fields": {
            "pageKey": {
              "type": "com.linkedin.voyager.dash.deco.relationships.PageKey"
            },
            "subTitle": {
              "type": "string"
            },
            "learnMoreUrl": {
              "type": "string"
            },
            "title": {
              "type": "string"
            }
          },
          "baseType": "com.linkedin.voyager.dash.relationships.invitation.FuseEducationView"
        }
      }
    }
  },
  "included": [
    {
      "entityUrn": "<userId:2>",
      "$recipeTypes": [
        "com.linkedin.voyager.dash.deco.relationships.InvitationInfo"
      ],
      "$type": "com.linkedin.voyager.dash.relationships.invitation.Invitation"
    }
  ]
}
```

<!-- facts:end -->

## What it does

LinkedIn's endpoint that creates a connection invitation: the web client posts `action=verifyQuotaAndCreateV2` with the invitee's profile, and LinkedIn checks the account's invitation quota and answers with the new invitation. In our runs it fired in the click that sent an invitation (step 6) and right after a My Network pagination action, and both answers created one.

## What our machine does with it

Our engine does not send this call. `log linkedin connect` (`Network.connect`, `python/linkedinApi/network.py`) sends what a My Network suggestion's own Connect button sends, the server request `addaAddConnection` to `/flagship-web/rsc-action/actions/server-request`, through the account's governor, and decides on whether that answer sets the invitation to Pending. The vendored `add_connection` in `vendor/openLinkedinApi/open_linkedin_api/linkedin.py` posts to this endpoint, but nothing in `python/linkedinApi/` calls it.

## What can go wrong

Both browser calls answered 200 with an invitation, in about 255 ms. For the engine's own connect, an error toast or an answer that never says Pending is `connectRefused`, a 429 or 999 is `rateLimited`, and either stops the run with nothing retried (rule 94).
