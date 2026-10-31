# FriendingCometMutualFriendsSocialContextTooltipContentQuery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | query |
| doc_id | `23890617217238423` |
| Path | `/api/graphql/` |
| Sends | `count`, `ordering`, `userIDs` |
| Reads | `nodes` |
| Called from | `FriendingCometMutualFriendsSocialContextTooltipContent.react` |
| rea | `ev_d13924766ed06c4b36d0ad0ff5252538707118b04812f64831980744ac740c56` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| host | page has 80 interactive element(s); snapshot: C:\Users\0\.logCli\runs\host\20261019T163027 | 1 | 200 | 539 ms | 25706 ms | — |
| inspect | step 8: wait 5s | 1 | 200 | 417 ms | 122545 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261024T164523_61593843527201**, step 8: wait 5s: 200, 417 ms

Sent:

```json
{
  "fb_api_caller_class": "RelayModern",
  "fb_api_req_friendly_name": "FriendingCometMutualFriendsSocialContextTooltipContentQuery",
  "server_timestamps": "true",
  "variables": {
    "count": 10,
    "ordering": [
      "importance"
    ],
    "userIDs": [
      "61559438276167"
    ]
  },
  "doc_id": "23890617217238423"
}
```

Answered:

```json
{
  "data": {
    "nodes": [
      {
        "__typename": "User",
        "mutual_friends": {
          "count": 0,
          "nodes": []
        },
        "id": "61559438276167"
      }
    ]
  },
  "extensions": {
    "server_metadata": {
      "request_start_time_ms": 1792860621493,
      "time_at_flush_ms": 1792860621530
    },
    "is_final": true
  }
}
```

<!-- facts:end -->

## What it does

Fills the mutual-friends tooltip when the pointer rests on a person's name (`userIDs` in, `nodes` out). It fired once while the host's account check looked at the page, from the human mouse's idle loop passing over a name.

## What our machine does with it

Nothing: it is a side effect of the cursor's loose loops around what is looked at (rule 32), not of a click. It is evidence that hovering is seen by Facebook, as a person's would be.

## What can go wrong

Nothing for our runs. An error only leaves the tooltip empty.
