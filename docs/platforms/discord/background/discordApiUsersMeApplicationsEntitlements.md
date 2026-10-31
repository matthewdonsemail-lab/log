# discordApiUsersMeApplicationsEntitlements

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/applications/entitlements` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_b714eff50c5699e3e4e8f839e2cfa1b60f5ac414510cf0376fde3fae46998b14` |

Seen 4 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 2 | 200 | 327–467 ms | 6489–10239 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 334 ms | 11364 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 377 ms | 48655 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 2: snapshot: 200, 377 ms

Sent:

```json
{
  "query": {
    "exclude_consumed": "true"
  },
  "body": null
}
```

Answered:

```json
[]
```

**runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder**, step 1: goto /login: 200, 334 ms

Sent:

```json
{
  "query": {
    "exclude_consumed": "true"
  },
  "body": null
}
```

Answered:

```json
[]
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 467 ms

Sent:

```json
{
  "query": {
    "exclude_consumed": "true"
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

Lists what the account owns in applications (game or app purchases).

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
