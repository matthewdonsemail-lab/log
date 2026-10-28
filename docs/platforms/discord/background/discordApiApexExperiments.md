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
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_3e8dcbadf2a951e277e97cd223feebb8c78e34b17872f5108221f0a043fdebaf` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 1 | 200 | 522 ms | 3233 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 1: goto /login: 200, 522 ms

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
        "evaluation_id": "f2442643",
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
            10,
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
          "… 12 more"
        ]
      }
    },
    "2": {
      "1564888812923125872": {
        "evaluation_id": "85486f01",
        "assignments": [
          [
            1945316123,
            0,
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
