# UserSignalsHovercardQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `38450961167851576` |
| Path | `/api/graphql/` |
| Sends | `scale`, `userSignalID` |
| Reads | `node` |
| Called from | `UserSignalsHovercard.react` |
| rea | `ev_382ecb2f1f9c8312d424c4d3feb7955285fa5a623b894018b36b15a638b8cf51` |

Seen 4 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /groups/junkremovalwinners/members | 3 | 200 | 415–719 ms | 14010–19667 ms | — |
| inspect | step 23: scroll 3-5 x 300-600px | 1 | 200 | 606 ms | 196 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T060921_61594063207669**, step 3: goto /groups/junkremovalwinners/members: 200, 719 ms

Sent:

```json
{
  "qpl_active_flow_ids": "431626709",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "UserSignalsHovercardQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1,
    "userSignalID": "810150165507170"
  },
  "doc_id": "38450961167851576",
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
      "__typename": "UserSignal",
      "signal_type_id": "1593744847475603",
      "detail_description": {
        "text": "Kirk manages the membership, moderators, settings and posts for Junk Removal Winners ™ - How to Start, Get Leads & Grow Your Business. Only group members can see this badge."
      },
      "detail_title": {
        "text": "Admin"
      },
      "detail_meta": null,
      "members": {
        "nodes": [
          {
            "__typename": "User",
            "__isProfile": "User",
            "profile_picture": {
              "uri": "https://scontent-xxc1-1.xx.fbcdn.net/v/t39.30808-1/557393206_122261982086208222_4212414984653403591_n.jpg?stp=c300.164.556.555a_cp0_dst-jpg_tt6&cstp=mx556x555&ctp=s32x32&_nc_cat=110&ccb=1-7&_nc_sid=1d2534&_nc_ohc=S-utAFDUUboQ7kNvwHBOt4l&_nc_oc=AdqXWXsOO0Hl2zdTHZKtmEcZ-bo-cl1oIzLZZruAOK5TUxtOX-Bo1bKku4X5JxqWeFk&_nc_zt=24&_nc_ht=scontent-xxc1-1.xx&_nc_gid=o7YxqPCTvPYldBAnXLi4Cw&_nc_ss=792a8&oh=00_AQ… (456 chars)"
            },
            "id": "61556246673364"
          },
          {
            "__typename": "User",
            "__isProfile": "User",
            "profile_picture": {
              "uri": "https://scontent-xxc1-1.xx.fbcdn.net/v/t39.30808-1/275291205_352680496755308_7768636917374553629_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx828x828&ctp=s32x32&_nc_cat=101&ccb=1-7&_nc_sid=1d2534&_nc_ohc=UJ-alMRbL2EQ7kNvwEOl2Yl&_nc_oc=Adr8CcQJWY0uAxAdLxKC25SvsA827sUMRFImLVUGMQYNFRRGEBpDzLLP4Uj6bwRJqyA&_nc_zt=24&_nc_ht=scontent-xxc1-1.xx&_nc_gid=o7YxqPCTvPYldBAnXLi4Cw&_nc_ss=792a8&oh=00_AQM34YAqwOhmAhqP8I0G-xv… (435 chars)"
            },
            "id": "100060400817918"
          }
        ]
      },
      "see_all_members_action": {
        "label": "See All Admins",
        "uri": "https://www.facebook.com/groups/3549906855288164/members/badges/?badge_type=ADMIN"
      },
      "see_member_profile_action": null,
      "signal_image": {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yN/r/kjI39w47HBJ.webp"
      },
      "extra_items": [],
      "extra_actions": [],
      "extra_mutation_actions": [],
      "disclaimer_text": null,
      "hide_facepile": false,
      "id": "810150165507170"
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792822253580,
      "time_at_flush_ms": 1792822253964
    },
    "is_final": true
  }
}
```

**runs/inspect/20261024T060921_61594063207669**, step 23: scroll 3-5 x 300-600px: 200, 606 ms

Sent:

```json
{
  "qpl_active_flow_ids": "431626709",
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "UserSignalsHovercardQuery",
  "server_timestamps": "true",
  "variables": {
    "scale": 1,
    "userSignalID": "9949263188500045"
  },
  "doc_id": "38450961167851576",
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
      "__typename": "UserSignal",
      "signal_type_id": "131647715479949",
      "detail_description": {
        "text": "This member consistently shares content the group values."
      },
      "detail_title": {
        "text": "Top Voice"
      },
      "detail_meta": {
        "text": "Learn more"
      },
      "members": {
        "nodes": [
          {
            "__typename": "User",
            "__isProfile": "User",
            "profile_picture": {
              "uri": "https://scontent-xxc1-1.xx.fbcdn.net/v/t1.6435-1/52500204_10157344101568706_4615676803254583296_n.jpg?stp=c0.12.640.640a_cp0_dst-jpg_tt6&cstp=mx640x640&ctp=s32x32&_nc_cat=107&ccb=1-7&_nc_sid=e99d92&_nc_ohc=IP3IP8kylBgQ7kNvwFoy3fd&_nc_oc=Adpxm5T51u1V3OVO-TTybPOWXCDpYwR6QppWOgM7aFD5MEvgs7QQSfBRdWMYn3Z-1EA&_nc_zt=24&_nc_ht=scontent-xxc1-1.xx&_nc_gid=B5UOLoanyrydlRODUsookA&_nc_ss=792a8&oh=00_AQOLbgBcf… (449 chars)"
            },
            "id": "544903705"
          },
          {
            "__typename": "User",
            "__isProfile": "User",
            "profile_picture": {
              "uri": "https://scontent-xxc1-1.xx.fbcdn.net/v/t39.30808-1/531864621_1310657057433109_37231903509643755_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx960x958&ctp=s32x32&_nc_cat=101&ccb=1-7&_nc_sid=1d2534&_nc_ohc=FDcVbep_L54Q7kNvwGrQwWz&_nc_oc=AdpjMh2KreEr5bYLrrpNxYbiAV2JwLes_KpRjf8mEWGlkxCxEDjzXBf2RZ8ZqqYu-hI&_nc_zt=24&_nc_ht=scontent-xxc1-1.xx&_nc_gid=B5UOLoanyrydlRODUsookA&_nc_ss=792a8&oh=00_AQPqicHvujKfuoQxHBqOPEuq… (434 chars)"
            },
            "id": "100054664802437"
          },
          {
            "__typename": "User",
            "__isProfile": "User",
            "profile_picture": {
              "uri": "https://scontent-xxc1-1.xx.fbcdn.net/v/t39.30808-1/428638353_7149560185097274_3254830166740772333_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx2048x2048&ctp=s32x32&_nc_cat=110&ccb=1-7&_nc_sid=e99d92&_nc_ohc=PWaXeZM92JgQ7kNvwGJLSo-&_nc_oc=AdpyShBy7WPz9VsJWQNKqqo0lNR6Kb0pzjCE_0XZ6aSroy8mtbsJRyhnIPYzcNdWngo&_nc_zt=24&_nc_ht=scontent-xxc1-1.xx&_nc_gid=B5UOLoanyrydlRODUsookA&_nc_ss=792a8&oh=00_AQNg25_G89xpNtmGrmod… (438 chars)"
            },
            "id": "100001300891867"
          },
          {
            "__typename": "User",
            "__isProfile": "User",
            "profile_picture": {
              "uri": "https://scontent-xxc1-1.xx.fbcdn.net/v/t39.30808-1/523356016_10104337613829396_4617979928259180259_n.jpg?stp=cp0_dst-jpg_tt6&cstp=mx2048x2048&ctp=s32x32&_nc_cat=110&ccb=1-7&_nc_sid=1d2534&_nc_ohc=ExWjLCnIoE4Q7kNvwG9rCUO&_nc_oc=Adq2KW7OBo0Ra_bCSELSWua9Q9-S-Q_SRSKVuuZfOxslIrqMhykdPVGmMIPhGmKIAKM&_nc_zt=24&_nc_ht=scontent-xxc1-1.xx&_nc_gid=B5UOLoanyrydlRODUsookA&_nc_ss=792a8&oh=00_AQMwaWKAVOLsykdWBiQ… (439 chars)"
            },
            "id": "48506414"
          },
          {
            "__typename": "User",
            "__isProfile": "User",
            "profile_picture": {
              "uri": "https://scontent-xxc1-1.xx.fbcdn.net/v/t39.30808-1/481656975_9329628263764666_1630204477745536416_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx1002x1002&ctp=s32x32&_nc_cat=109&ccb=1-7&_nc_sid=1d2534&_nc_ohc=G-lIQVqYS9gQ7kNvwHMMnMJ&_nc_oc=AdpWco01jqIZ5KoU1MJYkkRlhOn-M5vpVO5Slmskz8YxznqYs9xgloeap8oMHsj_C4w&_nc_zt=24&_nc_ht=scontent-xxc1-1.xx&_nc_gid=B5UOLoanyrydlRODUsookA&_nc_ss=792a8&oh=00_AQMhV3hRn3lWZn64FOoF… (438 chars)"
            },
            "id": "100001527562418"
          },
          {
            "__typename": "User",
            "__isProfile": "User",
            "profile_picture": {
              "uri": "https://scontent-xxc1-1.xx.fbcdn.net/v/t39.30808-1/398650704_24006829518932313_3620468633468746750_n.jpg?stp=cp6_dst-jpg_tt6&cstp=mx2048x2048&ctp=s32x32&_nc_cat=105&ccb=1-7&_nc_sid=1d2534&_nc_ohc=mvk7mFljGzAQ7kNvwHityL4&_nc_oc=Adpstbi2aLef6CokyvyHwIN_z3qUqSgJtueVcwGEfedD0cIXAB32f0j3uW1HKbn7GBM&_nc_zt=24&_nc_ht=scontent-xxc1-1.xx&_nc_gid=B5UOLoanyrydlRODUsookA&_nc_ss=792a8&oh=00_AQNl92GF-yxD939ZGRF… (439 chars)"
            },
            "id": "100000957997360"
          },
          "… 3 more"
        ]
      },
      "see_all_members_action": {
        "label": "See all Top voices",
        "uri": "https://www.facebook.com/groups/3549906855288164/members/badges/?badge_type=EXPERT"
      },
      "see_member_profile_action": null,
      "signal_image": {
        "uri": "https://static.xx.fbcdn.net/rsrc.php/yh/r/hlgm7BJFbcW.webp"
      },
      "extra_items": [],
      "extra_actions": [],
      "extra_mutation_actions": [],
      "disclaimer_text": null,
      "hide_facepile": false,
      "id": "9949263188500045"
    }
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792824153336,
      "time_at_flush_ms": 1792824153630
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

The hover card of a member's badge (`UserSignalsHovercard.react`): by `userSignalID` it loads what the badge means ("Admin", "Top Voice"), its description, a few members who carry it and a "See all" link to `/groups/<id>/members/badges/?badge_type=…`. In run 20261024T060921 it fired when the cursor came to rest over a badge on the People tab, 3 times while the members page loaded (step 3) and once on a scroll, each 200 in 415-719 ms.

## What our machine does with it

No machine waits for it or reads it. It comes from the cursor resting on a badge (the idle mouse, rule 32), not from anything we pressed; `log facebook read members` reads only `GroupsCometMembersPageNewMembersSectionRefetchQuery` and the page's HTML.

## What can go wrong

Only 200s have been seen. If it failed, the hover card would stay empty; nothing of ours depends on it, and it only reads.
