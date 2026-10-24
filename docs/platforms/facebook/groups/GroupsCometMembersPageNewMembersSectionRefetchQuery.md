# GroupsCometMembersPageNewMembersSectionRefetchQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | groups |
| Kind | query |
| doc_id | `28370356755953476` |
| Path | `/api/graphql/` |
| Sends | `count`, `cursor`, `groupID`, `id`, `recruitingGroupFilterNonCompliant`, `scale` |
| Reads | `node....GroupsCometMembersPageNewMembersSection_group` |
| Called from | `GroupsCometMembersPageNewMembersSection_group.graphql` |
| rea | `ev_8e8cc2ec98a6467be97de3457ca6a4bef4c934527b159b1252e22b91ca6b76ae` |

Seen 6 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | scroll: +385px in 9 wheel steps, 344 ms | 1 | 200 | 832 ms | 3448 ms | — |
| inspect | scroll: +381px in 9 wheel steps, 312 ms | 1 | 200 | 663 ms | 2342 ms | — |
| inspect | scroll: +323px in 9 wheel steps, 421 ms | 1 | 200 | 563 ms | 3040 ms | — |
| inspect | step 24: scroll 3-5 x 300-600px | 2 | 200 | 510–555 ms | 142–796 ms | — |
| inspect | scroll: +539px in 14 wheel steps, 906 ms | 1 | 200 | 608 ms | 2579 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T060921_61594063207669**, scroll: +385px in 9 wheel steps, 344 ms: 200, 832 ms

Sent:

```json
{
  "qpl_active_flow_ids": "431626709",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "GroupsCometMembersPageNewMembersSectionRefetchQuery",
  "server_timestamps": "true",
  "variables": {
    "count": 10,
    "cursor": "AQHT8B1dRzleCIFUPFP21wBYh4FFlGUzBQBBGjZqCRUXhynD36mogS_w0zd0hvc5A2Wd5bqq7i7A150go3RSvVxqnw",
    "groupID": "3549906855288164",
    "recruitingGroupFilterNonCompliant": false,
    "scale": 1,
    "id": "3549906855288164"
  },
  "doc_id": "28370356755953476",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=431626709"
  ]
}
```

Answered:

```json
{
  "data": {
    "node": {
      "__typename": "Group",
      "id": "3549906855288164",
      "new_members": {
        "edges": [
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTdRu8CxsRkPueI0T3YdM4Ob_OqIlvWRfxC-udbi78tjOz_IgadVMUxBbUDFr-WV6cwi5re-Hj-O5cyI3YBsJtiA"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTedS0Ep27SbDwQ9fMagxqCd7YuaGmTL9FoZOHWNdA8xsYNrTHHLQKDGQdTACKgE1zAmP_Sc32_ITpJsECkG6fJQ"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTy4CKYdxBTiXQCRSNri8gzUi-lmSMx7mqjgCwYZ8GAYp1G-NkW1F0woLfc3chqj0niH4SiYTDLArK6SNf7FxlFw"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTKK3ne5BmL_uHlkMZptxj8OqcXaLBZUFX42Rn_QNrc-_xBMlWhy6FZ8Mg8GGl2HfI8wPrvUUlAITrruO5rN9aKQ"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTI7xClypJ3uX44VrD1ABBv4JPr4DBkztjpPdLHSb1YVItLbFnQkKthw4MHh4IYNWlkLXRwLrX97H2OgVkvsgURQ"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTXlPsNNaXSmGwYYaAwygTqiJyIY9vZtvUaOzUoV0PnClaMccY8NWk9LiRreAMkG5ruVPTzwKIB1LPJowB--0nPw"
          },
          "… 4 more"
        ],
        "page_info": {
          "has_next_page": true,
          "end_cursor": "AQHT75uQyBlhpcam0pG0AzK7qrMoELSvwtauo2MryWqlJd38kmmcvjx46pCxp7WEBJrxWkbd8t8pRE7LOIMCuibD-w"
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792822293828,
      "time_at_flush_ms": 1792822294311
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hblp": {
            "consistency": "(1 fields)",
            "rsrcMap": "(1 fields)",
            "indexUpgrades": "(0 fields)"
          }
        },
        "jsmods": {
          "require": [
            "(1 items)",
            "(1 items)",
            "(4 items)",
            "(4 items)",
            "(4 items)"
          ]
        },
        "allResources": [
          "csr:_1e_0_JD"
        ],
        "tieredResources": {
          "r": [
            "csr:_1e_0_JD"
          ],
          "rdfds": [],
          "rds": []
        }
      }
    }
  }
}
```

**runs/inspect/20261024T060921_61594063207669**, scroll: +381px in 9 wheel steps, 312 ms: 200, 663 ms

Sent:

```json
{
  "qpl_active_flow_ids": "431626709",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "GroupsCometMembersPageNewMembersSectionRefetchQuery",
  "server_timestamps": "true",
  "variables": {
    "count": 10,
    "cursor": "AQHT75uQyBlhpcam0pG0AzK7qrMoELSvwtauo2MryWqlJd38kmmcvjx46pCxp7WEBJrxWkbd8t8pRE7LOIMCuibD-w",
    "groupID": "3549906855288164",
    "recruitingGroupFilterNonCompliant": false,
    "scale": 1,
    "id": "3549906855288164"
  },
  "doc_id": "28370356755953476",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=431626709"
  ]
}
```

Answered:

```json
{
  "data": {
    "node": {
      "__typename": "Group",
      "id": "3549906855288164",
      "new_members": {
        "edges": [
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTp9tzIuHZQOdQZzDWEl1wPyQ4kPaboDL_sL6rmWevW84N91BiBC6TOIWvBOH5u8kSF-G7SBeTkRz3DFIZLERx3A"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTJLO2f-qpoUeM4BIBDSd3FgvMuSI6IEcF5HkDIr9i9Ko4QfUqSAF86NUrDX7bHu_Ddwyz7YirMuBSfNA0FVMAJA"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTzosK9uI1xbcvtj81upo-sUbueZPLPlj-m3wInhgNPnTBqPPNfn1KYIGy51qfZfmjctU1qHe2QXGwPx7uNPs5vA"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTt9bXgdk0f4L1yHPn9Il_cO9_NmQ-z87flRyFOAD-xt70X69YGfFdtfFdEjSgzB3hEhvUBA-dxhTNrTYrVRIPXA"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTIsWbZO6WbzcwyGlXf-Ilx_VLuPzRVdFf8t4tZ6-7Hc4YBOtJxJ0Pb7ZpnS_fC3zZMIAFkcBZM6lMcClDHUKQIA"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTnCFbDRHEQrhe2G03juih6kaWu05zDwAswSSlgJFzpihgfRDwbsI4Dy6pkDs42Gkn4iUjw5b8yKVHV6OaQJs2YA"
          },
          "… 4 more"
        ],
        "page_info": {
          "has_next_page": true,
          "end_cursor": "AQHTENtLJm078h7kgWIEr091XlmTtPx2NTOg0Kgxap0brxQNT24iwI_mpedfa-ckek_h-P9cGYpXUipp80RE-iY1Yg"
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792822358186,
      "time_at_flush_ms": 1792822358522
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hblp": {
            "consistency": "(1 fields)",
            "rsrcMap": "(1 fields)",
            "indexUpgrades": "(0 fields)"
          }
        },
        "jsmods": {
          "require": [
            "(1 items)",
            "(1 items)",
            "(4 items)",
            "(4 items)",
            "(4 items)"
          ]
        },
        "allResources": [
          "csr:_28_0_bu"
        ],
        "tieredResources": {
          "r": [
            "csr:_28_0_bu"
          ],
          "rdfds": [],
          "rds": []
        }
      }
    }
  }
}
```

**runs/inspect/20261024T060921_61594063207669**, scroll: +323px in 9 wheel steps, 421 ms: 200, 563 ms

Sent:

```json
{
  "qpl_active_flow_ids": "431626709",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "GroupsCometMembersPageNewMembersSectionRefetchQuery",
  "server_timestamps": "true",
  "variables": {
    "count": 10,
    "cursor": "AQHT8B1dRzleCIFUPFP21wBYh4FFlGUzBQBBGjZqCRUXhynD36mogS_w0zd0hvc5A2Wd5bqq7i7A150go3RSvVxqnw",
    "groupID": "3549906855288164",
    "recruitingGroupFilterNonCompliant": false,
    "scale": 1,
    "id": "3549906855288164"
  },
  "doc_id": "28370356755953476",
  "fb_api_analytics_tags": [
    "qpl_active_flow_ids=431626709"
  ]
}
```

Answered:

```json
{
  "data": {
    "node": {
      "__typename": "Group",
      "id": "3549906855288164",
      "new_members": {
        "edges": [
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTQaZVQMu_xFTErqpUOGpmwFB9c7I86Sp3vnDRna1rrdTAl_ClG6lwG_i-cNKzJrvQfpdZuF51KiAapy7ht_sspw"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHT4w69ZDQmfiZdf7cIzkzOZZRDnoxuKdG4SU_3_u6d7m66dfWlMILbcoRup0l5pVmfFUyTgZAzF66d0Avgzvm0Qw"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTR83wzu-XX28Ev_KmtRBNm4G4dKX6AZ8VCtiTDGiunjiNK-INZoXJIe9wTZlQRBsZYWz6_2GbyH9N9E8eXDVxFQ"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHTxm1VLjCpLVsc11v31RJMEHalNRLwktDddD8Wu62w3ksF4gmh3Frx2VVQduzaIGP5pZx6uifyBmE2f2pNNwc6sw"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHT9AeVo8Y7t-1QjDKtnkG1Gn5fC-ztlENSSsG_G8fVAsvJVmWJKSa0P1xJ_F_dNYAEB9DeQi98fKmWtIm55MsADg"
          },
          {
            "invite_status_text": null,
            "join_status_text": "(7 fields)",
            "node": "(18 fields)",
            "cursor": "AQHT4yonYbz6wml0YVdfYgEi1lRfOV2V_SCxE9jI2b0OI6i3WfYC4OvQK9Uukdx0PfcZs7Fp3DEpvtUs0NO9jiWl_w"
          },
          "… 4 more"
        ],
        "page_info": {
          "has_next_page": true,
          "end_cursor": "AQHT75uQyBlhpcam0pG0AzK7qrMoELSvwtauo2MryWqlJd38kmmcvjx46pCxp7WEBJrxWkbd8t8pRE7LOIMCuibD-w"
        }
      }
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792824160099,
      "time_at_flush_ms": 1792824160349
    },
    "is_final": true,
    "sr_payload": {
      "ddd": {
        "hsrp": {
          "hblp": {
            "consistency": "(1 fields)",
            "rsrcMap": "(1 fields)",
            "indexUpgrades": "(0 fields)"
          }
        },
        "jsmods": {
          "require": [
            "(1 items)",
            "(1 items)",
            "(4 items)",
            "(4 items)",
            "(4 items)"
          ]
        },
        "allResources": [
          "csr:_1a_0_bA"
        ],
        "tieredResources": {
          "r": [
            "csr:_1a_0_bA"
          ],
          "rdfds": [],
          "rds": []
        }
      }
    }
  }
}
```

<!-- facts:end -->

## What it does

The People tab's "New to the group" list loading its next page (`GroupsCometMembersPageNewMembersSection_group.graphql`, `/groups/<g>/members`). The page's HTML carries the first 10 new members (`data.group.new_members`); each time the list's end scrolls into view, this query asks for the next `count: 10` after the `cursor` (the last `page_info.end_cursor`), by `groupID`. Its answer is `data.node.new_members`: `edges[]`, each with `join_status_text.text` ("Joined on Wednesday") and a `node` of `__typename: "User"` carrying `id`, `name`, `url`, `bio_text.text`, `profile_plus_category_display_name` and `follower_count`, then `page_info` (`end_cursor`, `has_next_page`). In run 20261024T060921 (account 61594063207669, "Junk Removal Winners") a plain scroll (3-5 wheel moves) fired it 1 to 3 times, 2 on average: 34 answers over 18 scrolls, 340 members, no duplicates, each 200 in 500-850 ms.

## What our machine does with it

`membersReadMachine` (`src/facebook/group/members`, `log facebook read members`, rule 77) reads every answer of it in each scroll step's own HAR (`membersFromRefetch`): the members are merged by id, `page_info.has_next_page: false` ends the read, and an answer for another group (`node.id`) is ignored. It never sends this query itself: the page does, because the step scrolled. A step on the members page whose answer to it holds `new_members` edges is the known page state `groupMembersList`, which needs nothing, so an inspect scroll there is decided without SubQ.

## What can go wrong

Only 200s have been seen. If an answer had no edges, the step adds no members and the read scrolls again until `--maxScrolls`; `has_next_page: false` ends it as the list's end. If a scroll fired no refetch (the list's end not yet in view), the step adds nothing and the next scroll goes on. A checkpoint or login during a scroll stops the read with what it had (`checkpointed`, `loginWall`); a failed step stops it with `groupReadStepFailed`. It only reads: nothing on Facebook changes.
