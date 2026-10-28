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
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_ab10031fb328bfe327a2c03e6ae8740d988cf4fa89aee87a04a4b5ff542edf34` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 404 | 342 ms | 11824 ms | — |
| inspect | step 5: click e40 | 1 | 404 | 367 ms | 12912 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 404 | 430 ms | 9553 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 404 | 353 ms | 8663 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 404, 342 ms

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
  "message": "Unknown Saved Messages",
  "code": 10133
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 404, 367 ms

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
  "message": "Unknown Saved Messages",
  "code": 10133
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 9: goto /channels/@me: 404, 430 ms

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
  "message": "Unknown Saved Messages",
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
