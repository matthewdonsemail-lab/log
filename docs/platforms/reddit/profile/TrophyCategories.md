# TrophyCategories

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | profile |
| Kind | query |
| doc_id | — |
| Path | `/svc/shreddit/graphql` |
| Sends | `trophyImageMaxWidth`, `name`, `includeRepeatableAchievements` |
| Reads | `data.redditorInfoByName`, `errors`, `operation`, `extensions.traceID` |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script33.js:5 getAllAchievementsData` |
| rea | `ev_d76bbb733755c46c37d091c36af4b4c229bdc60c8ca31e5bcf43b2a22367837d` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 441 ms | 1772 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 10: goto /user/Maleficent-Try-8338/: 200, 441 ms

Sent:

```json
{
  "operation": "TrophyCategories",
  "variables": {
    "trophyImageMaxWidth": 100,
    "name": "Maleficent-Try-8338",
    "includeRepeatableAchievements": true
  }
}
```

Answered:

```json
{
  "data": {
    "redditorInfoByName": {
      "__typename": "Redditor",
      "id": "t2_20ettscugi",
      "trophyCase": {
        "categories": {
          "edges": [
            {
              "cursor": "Y29tbXVuaXR5",
              "node": {
                "__typename": "AchievementTrophyCategory",
                "accessibilityLabel": "Building Community with 0 of 16 achievements unlocked",
                "id": "community",
                "name": "Building Community",
                "pill": null,
                "total": 16,
                "trophies": {
                  "edges": [
                    "…",
                    "…",
                    "…",
                    "…",
                    "…",
                    "…",
                    "… 10 more"
                  ],
                  "pageInfo": {
                    "__typename": "…",
                    "endCursor": "…",
                    "hasNextPage": "…",
                    "hasPreviousPage": "…",
                    "startCursor": "…"
                  }
                },
                "unlocked": 0
              }
            },
            {
              "cursor": "Mg==",
              "node": {
                "__typename": "AchievementTrophyCategory",
                "accessibilityLabel": "Exploration with 5 of 22 achievements unlocked",
                "id": "2",
                "name": "Exploration",
                "pill": null,
                "total": 22,
                "trophies": {
                  "edges": [
                    "…",
                    "…",
                    "…",
                    "…",
                    "…",
                    "…",
                    "… 16 more"
                  ],
                  "pageInfo": {
                    "__typename": "…",
                    "endCursor": "…",
                    "hasNextPage": "…",
                    "hasPreviousPage": "…",
                    "startCursor": "…"
                  }
                },
                "unlocked": 5
              }
            },
            {
              "cursor": "MQ==",
              "node": {
                "__typename": "AchievementTrophyCategory",
                "accessibilityLabel": "Getting Started with 5 of 7 achievements unlocked",
                "id": "1",
                "name": "Getting Started",
                "pill": null,
                "total": 7,
                "trophies": {
                  "edges": [
                    "…",
                    "…",
                    "…",
                    "…",
                    "…",
                    "…",
                    "… 1 more"
                  ],
                  "pageInfo": {
                    "__typename": "…",
                    "endCursor": "…",
                    "hasNextPage": "…",
                    "hasPreviousPage": "…",
                    "startCursor": "…"
                  }
                },
                "unlocked": 5
              }
            },
            {
              "cursor": "Mw==",
              "node": {
                "__typename": "AchievementTrophyCategory",
                "accessibilityLabel": "Reddit Streak with 0 of 19 achievements unlocked",
                "id": "3",
                "name": "Reddit Streak",
                "pill": null,
                "total": 19,
                "trophies": {
                  "edges": [
                    "…",
                    "…",
                    "…",
                    "…",
                    "…",
                    "…",
                    "… 13 more"
                  ],
                  "pageInfo": {
                    "__typename": "…",
                    "endCursor": "…",
                    "hasNextPage": "…",
                    "hasPreviousPage": "…",
                    "startCursor": "…"
                  }
                },
                "unlocked": 0
              }
            },
            {
              "cursor": "bW9kZXJhdGlvbg==",
              "node": {
                "__typename": "AchievementTrophyCategory",
                "accessibilityLabel": "Community Moderation with 0 of 15 achievements unlocked",
                "id": "moderation",
                "name": "Community Moderation",
                "pill": null,
                "total": 15,
                "trophies": {
                  "edges": [
                    "…",
                    "…",
                    "…",
                    "…",
                    "…",
                    "…",
                    "… 9 more"
                  ],
                  "pageInfo": {
                    "__typename": "…",
                    "endCursor": "…",
                    "hasNextPage": "…",
                    "hasPreviousPage": "…",
                    "startCursor": "…"
                  }
                },
                "unlocked": 0
              }
            }
          ]
        },
        "totalUnlocked": 10
      }
    }
  },
  "errors": [],
  "operation": "TrophyCategories",
  "extensions": {
    "traceID": "396d553d2d5f748bc11ea1aad6906c75"
  }
}
```

<!-- facts:end -->

## What it does

`getAllAchievementsData()` sends the GraphQL query TrophyCategories with the profile's `name`, `trophyImageMaxWidth: 100` and `includeRepeatableAchievements: true`, to fill the achievements section of a user's profile. It keeps every `AchievementTrophyCategory` from `trophyCase.categories.edges` and works out the trophy counts (`setTrophyCounts`); without a username it shows no achievements (rea `ev_d76bbb73…`). It fired when we opened our own profile (step 10).

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` in the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. Its answer is a plain record of what the account has done on Reddit (ours: 10 unlocked, 5 of 7 in Getting Started, 5 of 22 in Exploration, none in Reddit Streak), which would show whether a warm-up builds any history if log-cli warms up Reddit accounts.

## What can go wrong

The one recorded call answered 200 with no errors. In the code an answer that isn't a `Redditor`, or has no categories, returns quietly and leaves the section empty, and any thrown error is caught and only reported (`n.Cc(e)`); it never stops the page or a run.
