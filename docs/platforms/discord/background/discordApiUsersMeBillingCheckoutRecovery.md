# discordApiUsersMeBillingCheckoutRecovery

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/billing/checkout-recovery` |
| Sends | — |
| Reads | `is_eligible` |
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_ed9b45d1f019e0a5bd8fcd33f32c2ee840e521329a22c31652d2771cb233b43b` |

Seen 14 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 429 ms | 11811 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 368 ms | 12898 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 441 ms | 9544 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 307 ms | 8654 ms | — |
| inspect | step 1: goto /login | 7 | 200 | 162–9794 ms | 18484–1052570 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 371 ms | 51732 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 176 ms | 25493 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 187 ms | 4494 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 176 ms

Sent:

```json
null
```

Answered:

```json
{
  "is_eligible": false
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 197 ms

Sent:

```json
null
```

Answered:

```json
{
  "is_eligible": false
}
```

**runs/inspect/20261109T192314_deepman2**, step 1: goto /channels/@me: 200, 187 ms

Sent:

```json
null
```

Answered:

```json
{
  "is_eligible": false
}
```

<!-- facts:end -->

## What it does

Asks whether the account left a checkout unfinished, to offer to finish it.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
