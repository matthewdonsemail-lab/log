# discordApiApexExperiments

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/apex/experiments` |
| Sends | — |
| Reads | `assignments.1`, `assignments.2` |
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_11c5489142b6a8112444df8316e4afd3d425acb43159962fb169e006f27ebd0f` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 2 | 200 | 179–522 ms | 1931–3233 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261109T192134_deepman2**, step 1: goto /login: 200, 179 ms

Sent:

```json
{
  "query": {
    "surface": "2"
  },
  "body": null
}
```

Answered:

```json
{
  "assignments": {
    "1": {
      "2031446579660906796": {
        "evaluation_id": "be30f1a3",
        "assignments": [
          [
            1945502063,
            0,
            8,
            0
          ],
          [
            2092655299,
            0,
            8,
            1
          ],
          [
            2587967235,
            0,
            8,
            0
          ],
          [
            2906847044,
            0,
            8,
            0
          ],
          [
            1492095053,
            0,
            10,
            5
          ],
          [
            2834320160,
            0,
            8,
            0
          ],
          "… 14 more"
        ]
      }
    },
    "2": {
      "1569431731562348602": {
        "evaluation_id": "e231d021",
        "assignments": [
          [
            1945316123,
            1,
            2,
            2
          ]
        ]
      }
    }
  }
}
```

<!-- facts:end -->

## What it does

Gives the client its experiment buckets before sign-in (`surface=2`): which variant of each feature this browser gets.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
