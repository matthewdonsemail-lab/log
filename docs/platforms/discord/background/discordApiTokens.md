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
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_225404b07825f23d784e649412fbd6f2214823c1878a818c704ef59608b0e276` |

Seen 11 time(s) in 9 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 361 ms | 13047 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 362 ms | 10197 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 354 ms | 8802 ms | — |
| inspect | step 1: goto /login | 6 | 200 | 143–392 ms | 18653–1051885 ms | — |
| inspect | Stopping after 1 step(s). | 1 | 200 | 375 ms | 5771 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 160 ms | 4432 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 176 ms

Sent:

```json
{
  "query": {
    "application_ids": "1516819322058576022"
  },
  "body": null
}
```

Answered:

```json
[]
```

**runs/inspect/20261109T192314_deepman2**, step 1: goto /channels/@me: 200, 160 ms

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
