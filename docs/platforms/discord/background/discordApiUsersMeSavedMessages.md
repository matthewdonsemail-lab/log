# discordApiUsersMeSavedMessages

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/saved-messages` |
| Sends | — |
| Reads | `message`, `code` |
| Called from | `runs/inspect/20261113T044840_<name:1>/script0.js:232 625075`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 559868`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 961943`, `runs/inspect/20261113T044840_<name:1>/script1294.js:1 634654` |
| rea | `ev_6f5fead73af26f33b491828dd30cc518c1f4fcfe76d5d92a5696d58680be4c48` |

Seen 7 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 404 | 342 ms | 11824 ms | — |
| inspect | step 5: click e40 | 1 | 404 | 367 ms | 12912 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 404 | 430 ms | 9553 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 404 | 353 ms | 8663 ms | — |
| inspect | step 1: goto /login | 2 | 404 | 384–9780 ms | 18497–46271 ms | — |
| inspect | step 2: snapshot | 1 | 404 | 454 ms | 51746 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T044840_<name:1>**, step 1: goto /login: 404, 9780 ms

Sent:

```json
{
  "query": {
    "bookmark_ids": "true"
  },
  "body": null
}
```

Answered:

```json
{
  "message": "<messageText>",
  "code": 10133
}
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 404, 454 ms

Sent:

```json
{
  "query": {
    "bookmark_ids": "true"
  },
  "body": null
}
```

Answered:

```json
{
  "message": "<messageText>",
  "code": 10133
}
```

**runs/inspect/20261028T065202_<name:1>**, step 1: goto /channels/@me/<id>: 404, 342 ms

Sent:

```json
{
  "query": {
    "bookmark_ids": "true"
  },
  "body": null
}
```

Answered:

```json
{
  "message": "<messageText>",
  "code": 10133
}
```

<!-- facts:end -->

## What it does

Reads the account's saved (bookmarked) messages.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

404 means the feature isn't on for this account: normal.
