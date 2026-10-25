# UserCommunityAchievements

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | community |
| Kind | query |
| doc_id | — |
| Path | `/svc/shreddit/graphql` |
| Sends | `username`, `subredditId`, `imageMaxWidth` |
| Reads | `data.redditorInfoByName`, `errors`, `operation`, `extensions.traceID` |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script33.js:5 getCommunityAchievementsData` |
| rea | `ev_7eb9479e35d54f913fc2f4a191e2f87153f3e03b997a57a40d4a11db3e670f67` |

Seen 2 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 711 ms | 6116 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 385 ms | 1433 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 711 ms

Sent:

```json
{
  "operation": "UserCommunityAchievements",
  "variables": {
    "username": "Maleficent-Try-8338",
    "subredditId": "t5_2qh1i",
    "imageMaxWidth": 100
  }
}
```

Answered:

```json
{
  "data": {
    "redditorInfoByName": {
      "__typename": "Redditor",
      "trophyCase": {
        "totalUnlocked": 10,
        "trophiesBySubredditId": null
      }
    }
  },
  "errors": [],
  "operation": "UserCommunityAchievements",
  "extensions": {
    "traceID": "1cc85c049df3ad2805b5c9096e49abec"
  }
}
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th: 200, 385 ms

Sent:

```json
{
  "operation": "UserCommunityAchievements",
  "variables": {
    "username": "Maleficent-Try-8338",
    "subredditId": "t5_2qh1i",
    "imageMaxWidth": 100
  }
}
```

Answered:

```json
{
  "data": {
    "redditorInfoByName": {
      "__typename": "Redditor",
      "trophyCase": {
        "totalUnlocked": 10,
        "trophiesBySubredditId": null
      }
    }
  },
  "errors": [],
  "operation": "UserCommunityAchievements",
  "extensions": {
    "traceID": "91cd1adb79fa0a46610853127682e6dc"
  }
}
```

<!-- facts:end -->

## What it does

`getCommunityAchievementsData()` sends the GraphQL query UserCommunityAchievements with the signed-in user's `username`, the community's `subredditId` and `imageMaxWidth: 100`, to fill the achievements entry point shown for that user inside one community. It keeps only `AchievementImageTrophy` and `AchievementRepeatableImageTrophy` items from `trophyCase.trophiesBySubredditId` and counts them; when `redditorInfoByName` is not a `Redditor` or has no `trophyCase`, it sets `shouldRenderEntrypoint` to false and shows nothing (rea `ev_7eb9479e…`). It fired when we opened r/AskReddit (step 3) and one of its posts (step 6).

## What our machine does with it

log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, with no Reddit client vendored yet) and `log inspect` in the account's AdsPower browser with no proxy (rule 84). Nothing waits on this call yet: inspect records it and names it in each step's `exchanges.json`, and SubQ reads it with the rest of the step. Its answer is a cheap read of how much this account has done in a given community (here `totalUnlocked: 10` overall and `trophiesBySubredditId: null` for r/AskReddit), which would matter if log-cli ever warms up or acts on Reddit community by community.

## What can go wrong

Both recorded calls answered 200 with an empty `errors` list. In the code any thrown error is caught and only reported (`n.Cc(e)`), and a missing or odd answer just hides the entry point, so a failure here changes nothing else on the page and never stops a run. A `null` `trophiesBySubredditId`, as we saw, means no achievements in that community, not an error.
