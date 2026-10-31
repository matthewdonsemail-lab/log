# discordApiUsersMeEntitlements

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/entitlements` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_a8897d732f859cdb15e4e03701b1e07fa4f2bf4b364e3087ab915ae075455e45` |

Seen 3 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 314 ms | 6487 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 391 ms | 11361 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 382 ms | 48639 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 2: snapshot: 200, 382 ms

Sent:

```json
{
  "query": {
    "with_sku": "false",
    "with_application": "false",
    "entitlement_type": "11",
    "exclude_ended": "true"
  },
  "body": null
}
```

Answered:

```json
[]
```

**runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder**, step 1: goto /login: 200, 391 ms

Sent:

```json
{
  "query": {
    "with_sku": "false",
    "with_application": "false",
    "entitlement_type": "11",
    "exclude_ended": "true"
  },
  "body": null
}
```

Answered:

```json
[]
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 314 ms

Sent:

```json
{
  "query": {
    "with_sku": "false",
    "with_application": "false",
    "entitlement_type": "11",
    "exclude_ended": "true"
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

Lists everything the account is entitled to (gifts, Nitro, items).

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
