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
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_e0d8a974ff0c9fd0e0089e04f4ca2594369fce6ba3ac10c4848abea1200baa16` |

Seen 14 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 404 | 342 ms | 11824 ms | — |
| inspect | step 5: click e40 | 1 | 404 | 367 ms | 12912 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 404 | 430 ms | 9553 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 404 | 353 ms | 8663 ms | — |
| inspect | step 1: goto /login | 7 | 404 | 158–9780 ms | 18497–1052590 ms | — |
| inspect | step 2: snapshot | 1 | 404 | 454 ms | 51746 ms | — |
| inspect | step 6: wait 45s | 1 | 404 | 159 ms | 25499 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 404 | 152 ms | 4498 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 404, 159 ms

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

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 404, 193 ms

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

**runs/inspect/20261109T192314_deepman2**, step 1: goto /channels/@me: 404, 152 ms

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
