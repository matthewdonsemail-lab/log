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
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_04e36d30f435d6521f60da8ddf945254e43c8f51b14ebac25b895600ea7014f1` |

Seen 11 time(s) in 11 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 314 ms | 6487 ms | — |
| inspect | step 1: goto /login | 7 | 200 | 166–441 ms | 11361–1045683 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 382 ms | 48639 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 177 ms | 22336 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 148 ms | 2243 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 177 ms

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

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 166 ms

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

**runs/inspect/20261109T192314_deepman2**, step 1: goto /channels/@me: 200, 148 ms

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
