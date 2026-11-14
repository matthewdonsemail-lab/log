# discordApiUsersMeBillingUserOffer

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/billing/user-offer` |
| Sends | `allow_triggers` |
| Reads | `should_trigger_offer` |
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_a7036b2c22ce7e58e9904c2fce69c3341d975269052dea13423ccf17c8d1a20d` |

Seen 14 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 452 ms | 11810 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 456 ms | 12896 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 442 ms | 9543 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 407 ms | 8653 ms | — |
| inspect | step 1: goto /login | 7 | 200, 204 | 229–410 ms | 18482–1052568 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 404 ms | 51730 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 336 ms | 25492 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 204 | 198 ms | 4493 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 336 ms

Sent:

```json
{
  "allow_triggers": true
}
```

Answered:

```json
{
  "should_trigger_offer": false
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 204, 298 ms

Sent:

```json
{
  "allow_triggers": true
}
```

Answered:

```json
null
```

**runs/inspect/20261109T192314_deepman2**, step 1: goto /channels/@me: 204, 198 ms

Sent:

```json
{
  "allow_triggers": true
}
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Asks which Nitro offer the account may be shown.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
