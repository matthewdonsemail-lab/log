# discordApiUsersMeApplicationsEntitlements

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/applications/entitlements` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 21 time(s) in 12 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 2 | 200 | 327–467 ms | 6489–10239 ms | — |
| inspect | step 1: goto /login | 13 | 200 | 189–12231 ms | 11364–1049256 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 377 ms | 48655 ms | — |
| inspect | step 6: wait 45s | 2 | 200 | 249–321 ms | 22336–23146 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 177 ms | 2244 ms | — |
| inspect | step 9: wait 45s | 2 | 200 | 300–301 ms | 13135–14061 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 9: wait 45s: 200, 300 ms

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

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 249 ms

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

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 189 ms

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
