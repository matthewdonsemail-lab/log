# flagshipWebRscActionActionsNavigation

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/flagship-web/rsc-action/actions/navigation` |
| Sends | `clientArguments`, `isModal` |
| Reads | — |
| Called from | `runs/inspect/20261107T170649_<name:3>/script13.js:12 anonymous`, `runs/inspect/20261106T014139_<name:3>/script12.js:12 anonymous`, `runs/inspect/20261107T170649_<name:3>/script35.js:1762 statement`, `runs/inspect/20261107T161246_<name:3>/script60.js:24 KO` |
| rea | `ev_3e36a4a88d9128318fc76c01120d2d604bb9cdb4ba5eeda61aa4e976eac312d6` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| chrome | step 6: open the add-a-note invite, by hand | 1 | 200 | 110 ms | 300 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/chrome/20261114T213510_<name:3>**, step 6: open the add-a-note invite, by hand: 200, 110 ms

Sent:

```json
{
  "query": {
    "screenId": "com.linkedin.sdui.flagshipnav.mynetwork.invitations.CustomInvite",
    "sduiid": "com.linkedin.sdui.flagshipnav.mynetwork.invitations.CustomInvite"
  },
  "body": {
    "clientArguments": {
      "$type": "proto.sdui.actions.requests.RequestedArguments",
      "requestedStateKeys": [],
      "payload": {
        "inviteeUrn": {
          "memberId": "<userId:1>"
        },
        "connectionState": {
          "type": "com.linkedin.sdui.components.core.BindingImpl",
          "value": {
            "key": "state:invitation:urn:li:member:16184"
          }
        },
        "isDisabled": {
          "type": "com.linkedin.sdui.components.core.BindingImpl",
          "value": {
            "key": "connect-button-disabled-chanezon"
          }
        },
        "nonIterableProfileId": {
          "profileId": "<userId:2>"
        },
        "firstName": "<name:1>",
        "lastName": "<name:2>",
        "origin": 16,
        "profileCanonicalUrl": "https://www.linkedin.com/in/<profile>",
        "profilePictureRenderPayload": "AApVaHR0cHM6Ly9tZWRpYS5saWNkbi5jb20vZG1zL2ltYWdlL3YyL0Q1NjAzQVFHYXY2UVNEVTRlb0EvcHJvZmlsZS1kaXNwbGF5cGhvdG8tc2hyaW5rXxKDAQhkEGQafTEwMF8xMDAvcHJvZmlsZS1kaXNwbGF5cGhvdG8tc2hyaW5rXzEwMF8xMDAvMC8xNzI2MTg3NTg3NDU2P2U9MTc5NjI1NjAwMCZ2PWJldGEmdD0yZTZ5Yy1HeHJFRXQySkVET2RaTndTLW1NOGVVcWVSeXhoTDVFbF9RRmNZEoUBCMgBEMgBGn0yMDBfMjAwL3Byb2ZpbGUtZGlzcGxheXBob3RvLXNocmlua18yMDBfMjAwLzAvMTcyNjE4NzU4NzQ1Nj9lPTE3OTYy… (904 chars)",
        "postSendDrawerRequest": {
          "serverRequestId": "com.linkedin.sdui.impl.mynetwork.infra.components.relationshipbuildingdrawer",
          "args": {
            "properties": {
              "componentRef": "ProfilePostConnectDrawer_chanezon",
              "drawerType": {
                "type": "RelationshipBuildingDrawerVariant.ConnectDrawer",
                "value": {
                  "profileUrn": {
                    "profileId": "<userId:3>"
                  },
                  "origin": 16
                }
              },
              "style": 0,
              "componentDisplayBinding": {
                "type": "com.linkedin.sdui.components.core.BindingImpl",
                "value": {
                  "key": "executive_top_voice_drawer_display_chanezon",
                  "namespace": "MemoryNamespace"
                }
              },
              "clientContext": 4
            }
          }
        }
      },
      "requestMetadata": {
        "$type": "proto.sdui.common.RequestMetadata"
      },
      "states": [],
      "screenId": "com.linkedin.sdui.flagshipnav.mynetwork.invitations.CustomInvite",
      "knownTemplateIds": []
    },
    "isModal": true
  }
}
```

Answered:

```json
"1:\"71ad95267c605a34fefe1155a61e6ad3\"\n2:\"SduiTrackingProvenanceProvider\"\n3:I[\"$1\",[],\"$2\"]\n4:\"2ad3ea7278caf3e388ff36e545132f6c\"\n5:\"DestinationReporter\"\n6:I[\"$4\",[],\"$5\"]\n7:\"9572b44cf39ab2b79fb58e1626297543\"\n8:\"PageLoadTracingProvider\"\n9:I[\"$7\",[],\"$8\"]\nb:\"ac9f789664089d7af150a9a8b58e69ff\"\nc:\"RealtimeActionRunner\"\nd:I[\"$b\",[],\"$c\"]\ne:\"030d6035cb3a997efb1cff7a008d2f89\"\nf:I[\"$e\",[],\"default\"]\n11:\"fd2b… (19203 chars)"
```

<!-- facts:end -->

## What it does

Asks the server for a screen to open over the page, named by `screenId` and `sduiid` in the query, with `clientArguments` (the state keys and payload the screen needs) and `isModal`. In the by-hand recording it fires 300 ms into opening the add-a-note invite and returns the custom invite screen in 110 ms.

## What our machine does with it

Our engine sends this path for one screen only: `Composer.open_composer` in `python/linkedinApi/share.py` posts the recorded `shareCompose` template with the share composer's `screenId`, and reads the sharebox session urn and the mention typeahead reference out of the answer before a post. It never opens the add-a-note invite screen this recording shows: `connect` sends no note.

## What can go wrong

Only 200 is in our recording. For the composer, `check` decides the status (429 or 999 `rateLimited`, 401 or 403 `sessionDead`, a deleted `li_at` `sessionRevoked`, anything else from 300 up `linkedinRefused`), errors in the answer are `linkedinRefused`, and an answer with no sharebox session is `templateStale`. None is retried.
