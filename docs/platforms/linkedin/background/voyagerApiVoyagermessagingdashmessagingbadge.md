# voyagerApiVoyagermessagingdashmessagingbadge

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `/voyager/api/voyagerMessagingDashMessagingBadge` |
| Sends | `until` |
| Reads | — |
| Called from | — |
| rea | `ev_ddff4de309d532f2007cf0e2f772b6542f407dcea17ca5a68a47c53f221fd96a` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| chrome | step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open | 2 | 200 | 90–122 ms | 23996–24062 ms | — |
| chrome | step 8: comment on a post, by hand | 1 | 200 | 105 ms | 7284 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/chrome/20261114T213510_<name:1>**, step 1: the owner's own Chrome, recorded by hand (har4): the feed and messaging open: 200, 90 ms

Sent:

```json
{
  "query": {
    "action": "markAllMessagesAsSeen"
  },
  "body": {
    "until": 1794692134237
  }
}
```

Answered:

```json
null
```

**runs/chrome/20261114T213510_<name:1>**, step 8: comment on a post, by hand: 200, 105 ms

Sent:

```json
{
  "query": {
    "action": "markAllMessagesAsSeen"
  },
  "body": {
    "until": 1794692228844
  }
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Marks every message as seen up to a time: `action=markAllMessagesAsSeen` with `until` in milliseconds, which clears the messaging badge. The by-hand recording sends it twice when messaging opens and once during the comment step, each answered 200 with no body in 90 to 122 ms.

## What our machine does with it

Our engine never sends it: nothing in `python/linkedinApi` calls this path, so reading the inbox or a thread through our engine doesn't mark messages as seen.

## What can go wrong

Only 200 with an empty answer is in our recording, so its other statuses aren't shown. Our engine doesn't send it, so none can reach our runs.
