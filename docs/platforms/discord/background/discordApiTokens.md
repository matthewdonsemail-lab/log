# discordApiTokens

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/tokens` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 6 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 361 ms | 13047 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 362 ms | 10197 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 354 ms | 8802 ms | — |
| inspect | step 1: goto /login | 2 | 200 | 350–392 ms | 18653–1051885 ms | — |
| inspect | Stopping after 1 step(s). | 1 | 200 | 375 ms | 5771 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 200, 392 ms

Sent:

```json
{
  "query": {
    "application_ids": "1466851783816249365"
  },
  "body": null
}
```

Answered:

```json
[]
```

**runs/inspect/20261113T044840_<name:1>**, Stopping after 1 step(s).: 200, 375 ms

Sent:

```json
{
  "query": {
    "application_ids": "1550689624509128784"
  },
  "body": null
}
```

Answered:

```json
[]
```

**runs/inspect/20261028T062914_<name:1>**, step 5: click e40: 200, 361 ms

Sent:

```json
{
  "query": {
    "application_ids": "409416265891971072"
  },
  "body": null
}
```

Answered:

```json
[]
```

<!-- facts:end -->

## What it does

Registers the browser's push or session token after sign-in.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
