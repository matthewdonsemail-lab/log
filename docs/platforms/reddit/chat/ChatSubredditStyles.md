# ChatSubredditStyles

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | chat |
| Kind | query |
| doc_id | — |
| Path | `/svc/shreddit/graphql` |
| Sends | `subredditIds` |
| Reads | `data.subredditsInfoByIds`, `errors`, `operation`, `extensions.traceID` |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script113.js:9 anonymous` |
| rea | `ev_645fc274cdca39326bbbdc3ac6d53ff198750c564de9bdedf74beccfaceecbce` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 735 ms | 7059 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 453 ms | 8218 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 820 ms | 2721 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 348 ms | 3608 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 329 ms | 3598 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 376 ms | 3243 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 326 ms | 2484 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 735 ms

Sent:

```json
{
  "operation": "ChatSubredditStyles",
  "variables": {
    "subredditIds": [
      "t5_2vs4i"
    ]
  }
}
```

Answered:

```json
{
  "data": {
    "subredditsInfoByIds": [
      {
        "__typename": "Subreddit",
        "id": "t5_2vs4i",
        "styles": {
          "icon": "https://styles.redditmedia.com/t5_2vs4i/styles/communityIcon_1o7vv6nka5ra1.jpg?width=64&frame=1&auto=webp&s=14ca22566f9599cafc33b149d8289eb49724f646"
        }
      }
    ]
  },
  "errors": [],
  "operation": "ChatSubredditStyles",
  "extensions": {
    "traceID": "91c431ea01a0a7be486c7bb0252d22d9"
  }
}
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 453 ms

Sent:

```json
{
  "operation": "ChatSubredditStyles",
  "variables": {
    "subredditIds": [
      "t5_2vs4i"
    ]
  }
}
```

Answered:

```json
{
  "data": {
    "subredditsInfoByIds": [
      {
        "__typename": "Subreddit",
        "id": "t5_2vs4i",
        "styles": {
          "icon": "https://styles.redditmedia.com/t5_2vs4i/styles/communityIcon_1o7vv6nka5ra1.jpg?width=64&frame=1&auto=webp&s=14ca22566f9599cafc33b149d8289eb49724f646"
        }
      }
    ]
  },
  "errors": [],
  "operation": "ChatSubredditStyles",
  "extensions": {
    "traceID": "85f36e11c0f33ae56eeaee5771f079bf"
  }
}
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 820 ms

Sent:

```json
{
  "operation": "ChatSubredditStyles",
  "variables": {
    "subredditIds": [
      "t5_2vs4i"
    ]
  }
}
```

Answered:

```json
{
  "data": {
    "subredditsInfoByIds": [
      {
        "__typename": "Subreddit",
        "id": "t5_2vs4i",
        "styles": {
          "icon": "https://styles.redditmedia.com/t5_2vs4i/styles/communityIcon_1o7vv6nka5ra1.jpg?width=64&frame=1&auto=webp&s=14ca22566f9599cafc33b149d8289eb49724f646"
        }
      }
    ]
  },
  "errors": [],
  "operation": "ChatSubredditStyles",
  "extensions": {
    "traceID": "0a23f091f5002deaf4846217f2eb29e6"
  }
}
```

<!-- facts:end -->

## What it does

`querySubredditStyles` in the same chat GraphQL client (`script113.js`, rea `ev_645fc274…`) sends `ChatSubredditStyles` with community ids and reads back each community's icon. In our run it asked for one community (`t5_2vs4i`) on every page load, 2-8 seconds after the goto, while the chat widget loaded in the background.

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. It only matters for how the chat shows communities; no action depends on it.

## What can go wrong

All seven calls were 200 with `errors` empty. A failure would only leave a community icon out of the chat; no failure has been recorded.
