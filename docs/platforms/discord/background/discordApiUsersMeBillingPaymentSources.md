# discordApiUsersMeBillingPaymentSources

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/billing/payment-sources` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_d78b30b4313e24290a50643652180951b2f676391474d4145d6a41ce0b273f77` |

Seen 3 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 8: click e221 | 2 | 200 | 417–744 ms | 1820–1823 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 388 ms | 140824 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261109T194954_deepman2**, step 1: goto /login: 200, 388 ms

Sent:

```json
null
```

Answered:

```json
[]
```

<!-- facts:end -->

## What it does

Lists the account's saved payment methods for the billing screens.

## What our machine does with it

Never read or used by log-cli; nothing is bought (rule 41).

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
