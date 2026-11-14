# discordAssets

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/assets` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 18 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 6 | 200 | 115–648 ms | 1026–56165 ms | — |
| inspect | step 5: click e40 | 2 | 200 | 773–976 ms | 13016–13576 ms | — |
| inspect | step 9: goto /channels/@me | 2 | 200 | 592–644 ms | 10190–10249 ms | — |
| inspect | step 28: press Enter | 6 | 200 | 68–181 ms | 2847–3229 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 437 ms | 51841 ms | — |
| inspect | Stopping after 1 step(s). | 1 | 200 | 309 ms | 5727 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 648 ms

Sent:

```json
null
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

The client's own JavaScript, CSS and images (`/assets/...`). Its bundles are where `capture --docs` finds each call's code (rule 85).

## What our machine does with it

Read by `capture --docs` to find each request's code in the bundles; never decided on.

## What can go wrong

A failed asset only means part of the page didn't load; the step's snapshot says what showed.
