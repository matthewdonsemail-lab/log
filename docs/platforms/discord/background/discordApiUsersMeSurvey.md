# discordApiUsersMeSurvey

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/survey` |
| Sends | — |
| Reads | `message`, `retry_after`, `global`, `survey` |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 10 time(s) in 10 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 429 | 394 ms | 5298 ms | — |
| inspect | step 2: snapshot | 1 | 429 | 363 ms | 47817 ms | — |
| inspect | step 1: goto /login | 6 | 429, 200 | 143–500 ms | 25485–1044475 ms | — |
| inspect | step 6: wait 45s | 1 | 429 | 169 ms | 22074 ms | — |
| inspect | step 9: wait 45s | 1 | 429 | 170 ms | 12807 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 9: wait 45s: 429, 170 ms

Sent:

```json
{
  "query": {
    "disable_auto_seen": "true"
  },
  "body": null
}
```

Answered:

```json
{
  "message": "<messageText>",
  "retry_after": 10972.826,
  "global": false
}
```

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 429, 169 ms

Sent:

```json
{
  "query": {
    "disable_auto_seen": "true"
  },
  "body": null
}
```

Answered:

```json
{
  "message": "<messageText>",
  "retry_after": 81170.79,
  "global": false
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 429, 161 ms

Sent:

```json
{
  "query": {
    "disable_auto_seen": "true"
  },
  "body": null
}
```

Answered:

```json
{
  "message": "<messageText>",
  "retry_after": 74130.419,
  "global": false
}
```

<!-- facts:end -->

## What it does

Asks whether to show the account a survey.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

It answered 429 (rate limited) in our run: the client asks often; nothing else is affected.
