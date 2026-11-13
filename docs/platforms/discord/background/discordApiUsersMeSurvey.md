# discordApiUsersMeSurvey

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/survey` |
| Sends | — |
| Reads | `message`, `retry_after`, `global` |
| Called from | `runs/inspect/20261113T044840_<name:1>/script0.js:232 625075`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 559868`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 961943`, `runs/inspect/20261113T044840_<name:1>/script1294.js:1 634654` |
| rea | `ev_1d58df65d3c0d4c4629c45711e724f6c6f856bde2deb78a8372c0106473c13ba` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 429 | 394 ms | 5298 ms | — |
| inspect | step 2: snapshot | 1 | 429 | 363 ms | 47817 ms | — |
| inspect | step 1: goto /login | 1 | 429 | 500 ms | 34713 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T044840_<name:1>**, step 1: goto /login: 429, 500 ms

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
  "retry_after": 14256.042,
  "global": false
}
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 429, 363 ms

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
  "retry_after": 15997.079,
  "global": false
}
```

**runs/inspect/20261028T062914_<name:1>**, step 5: click e40: 429, 394 ms

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
  "retry_after": 65369.159,
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
