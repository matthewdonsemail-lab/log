# ChatRedditors

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | chat |
| Kind | query |
| doc_id | — |
| Path | `/svc/shreddit/graphql` |
| Sends | `ids`, `includeRedditorAttributes` |
| Reads | `data.redditorsInfoByIds`, `errors`, `operation`, `extensions.traceID` |
| Called from | `runs/inspect/20261025T124815_MaleficentTry8338/script113.js:9 anonymous` |
| rea | `ev_645fc274cdca39326bbbdc3ac6d53ff198750c564de9bdedf74beccfaceecbce` |

Seen 7 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto / | 1 | 200 | 737 ms | 7064 ms | — |
| inspect | step 3: goto /r/AskReddit/ | 1 | 200 | 489 ms | 8262 ms | — |
| inspect | step 5: goto /search/ | 1 | 200 | 366 ms | 3043 ms | — |
| inspect | step 6: goto /r/AskReddit/comments/1x8sr8s/whats_a_high_paying_but_soul_crushing_career_th | 1 | 200 | 344 ms | 3719 ms | — |
| inspect | step 10: goto /user/Maleficent-Try-8338/ | 1 | 200 | 335 ms | 3832 ms | — |
| inspect | step 11: goto /notifications | 1 | 200 | 580 ms | 3715 ms | — |
| inspect | step 12: goto /r/popular/ | 1 | 200 | 356 ms | 2792 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261025T124815_MaleficentTry8338**, step 1: goto /: 200, 737 ms

Sent:

```json
{
  "operation": "ChatRedditors",
  "variables": {
    "ids": [
      "t2_20ettscugi"
    ],
    "includeRedditorAttributes": true
  }
}
```

Answered:

```json
{
  "data": {
    "redditorsInfoByIds": [
      {
        "__typename": "Redditor",
        "attributes": {
          "verificationStatus": "NONE"
        },
        "cakeDayOn": "2025-10-22",
        "displayName": "Maleficent-Try-8338",
        "icon": {
          "url": "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_2.png"
        },
        "id": "t2_20ettscugi",
        "isAcceptingChats": true,
        "isBlocked": false,
        "karma": {
          "total": 1
        },
        "name": "Maleficent-Try-8338",
        "prefixedName": "u/Maleficent-Try-8338",
        "profile": null,
        "snoovatarIcon": null
      }
    ]
  },
  "errors": [],
  "operation": "ChatRedditors",
  "extensions": {
    "traceID": "8a706519707bd4135f7e894af67c0bb2"
  }
}
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 3: goto /r/AskReddit/: 200, 489 ms

Sent:

```json
{
  "operation": "ChatRedditors",
  "variables": {
    "ids": [
      "t2_20ettscugi"
    ],
    "includeRedditorAttributes": true
  }
}
```

Answered:

```json
{
  "data": {
    "redditorsInfoByIds": [
      {
        "__typename": "Redditor",
        "attributes": {
          "verificationStatus": "NONE"
        },
        "cakeDayOn": "2025-10-22",
        "displayName": "Maleficent-Try-8338",
        "icon": {
          "url": "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_2.png"
        },
        "id": "t2_20ettscugi",
        "isAcceptingChats": true,
        "isBlocked": false,
        "karma": {
          "total": 1
        },
        "name": "Maleficent-Try-8338",
        "prefixedName": "u/Maleficent-Try-8338",
        "profile": null,
        "snoovatarIcon": null
      }
    ]
  },
  "errors": [],
  "operation": "ChatRedditors",
  "extensions": {
    "traceID": "369dc589d53c45a23aca97b2defd8a62"
  }
}
```

**runs/inspect/20261025T124815_MaleficentTry8338**, step 5: goto /search/: 200, 366 ms

Sent:

```json
{
  "operation": "ChatRedditors",
  "variables": {
    "ids": [
      "t2_20ettscugi"
    ],
    "includeRedditorAttributes": true
  }
}
```

Answered:

```json
{
  "data": {
    "redditorsInfoByIds": [
      {
        "__typename": "Redditor",
        "attributes": {
          "verificationStatus": "NONE"
        },
        "cakeDayOn": "2025-10-22",
        "displayName": "Maleficent-Try-8338",
        "icon": {
          "url": "https://www.redditstatic.com/avatars/defaults/v2/avatar_default_2.png"
        },
        "id": "t2_20ettscugi",
        "isAcceptingChats": true,
        "isBlocked": false,
        "karma": {
          "total": 1
        },
        "name": "Maleficent-Try-8338",
        "prefixedName": "u/Maleficent-Try-8338",
        "profile": null,
        "snoovatarIcon": null
      }
    ]
  },
  "errors": [],
  "operation": "ChatRedditors",
  "extensions": {
    "traceID": "2860b6b6dde21d7c1610adc7a63378db"
  }
}
```

<!-- facts:end -->

## What it does

The chat's GraphQL client (`reddit-chat-gql-client`, class `d` in `script113.js`, rea `ev_f8cd0aaf…`) has `queryRedditors`, which sends `ChatRedditors` with a list of account ids and hands the result to the chat app (`rs-app`). In our run it asked only for the account's own id and got its profile back: name, cake day, karma, avatar, verification status, `isAcceptingChats` and `isBlocked`. It fired on every page load, 3-8 seconds after the goto, as the chat widget loaded in the background.

## What our machine does with it

Nothing waits on it yet. log-cli's Reddit platform has only `log reddit session check` (the direct-API engine, no Reddit client vendored yet) and `log inspect` on the account's AdsPower browser with no proxy (rule 84); inspect records this call in each step's `exchanges.json`, names it, and SubQ reads it with the rest of the step. If log-cli acts on Reddit, this is where the chat reads who a person is (and whether they accept chats) before a message is sent to them.

## What can go wrong

All seven calls were 200 with `errors` empty. The client's wrapper `u()` clears an empty `errors` and passes everything else to the chat app, whose handling the slice doesn't show; an error here would only mean the chat can't show that person. No failure has been recorded.
