# discordAssets

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/assets` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261113T044840_<name:1>/script0.js:232 625075`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 559868`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 961943`, `runs/inspect/20261113T044840_<name:1>/script1294.js:1 634654` |
| rea | `ev_210c2e1feae38d4ebe882245795b572b866c334021133e00af499cf279dd81f2` |

Seen 14 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 2 | 200 | 253–393 ms | 1338–2114 ms | — |
| inspect | step 5: click e40 | 2 | 200 | 773–976 ms | 13016–13576 ms | — |
| inspect | step 9: goto /channels/@me | 2 | 200 | 592–644 ms | 10190–10249 ms | — |
| inspect | step 28: press Enter | 6 | 200 | 68–181 ms | 2847–3229 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 437 ms | 51841 ms | — |
| inspect | Stopping after 1 step(s). | 1 | 200 | 309 ms | 5727 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T044840_<name:1>**, step 1: goto /login: 200, 393 ms

Sent:

```json
null
```

Answered:

```json
"AGFzbQEAAAABpwRQYAJ/fwBgAn9/AX9gAX8AYAN/f38AYAN/f38Bf2ABfwF/YAR/f39/AGABbwF/YAR/f39/AX9gAW8Bb2AFf39/f38AYAZ/f39/f38AYAABf2AEf39+fwBgAABgAm9vAW9gAAFvYAV/f39/fwF/YAJ/fwF+YAV/f39+fwBgAn9vAGACb28AYAN/fn8AYAJ/fwFvYAACf39gAm9vAX9gAm9/AGABbwBgA29vbwFvYAN/f38Bb2AHf39/f39/fwBgBH9+f38AYAJ/bwFvYAADf39/YAJvfwFvYAZ/f39/f38Bf2ACf34AYAF/AW9gAX4Bb2AFb39/f38AYANvf38Bb2AEf39/fgBgB39/f39/f38Bf2ADf39+AGALf39/f39/f39/… (1604240 chars)"
```

**runs/inspect/20261113T044840_<name:1>**, Stopping after 1 step(s).: 200, 309 ms

Sent:

```json
null
```

Answered:

```json
null
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 437 ms

Sent:

```json
{
  "query": {
    "br": "1"
  },
  "body": null
}
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
