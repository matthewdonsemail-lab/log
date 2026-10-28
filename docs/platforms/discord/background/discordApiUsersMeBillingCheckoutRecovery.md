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
| Called from | `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1059.js:1 parse`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_2070dc40e13af93274e72f1888affeb563d50467d7eb14b18189f1443a1c0d33` |

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 429 ms | 11811 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 368 ms | 12898 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 441 ms | 9544 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 307 ms | 8654 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 367 ms | 18484 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder**, step 1: goto /login: 200, 367 ms

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

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 429 ms

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

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 368 ms

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
