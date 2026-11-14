# discordAssetsVersionStableJson

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/assets/version.stable.json` |
| Sends | — |
| Reads | `hash`, `required` |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 15 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 65 ms | 11817 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 63 ms | 12907 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 67 ms | 9552 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 56 ms | 8661 ms | — |
| inspect | step 1: goto /login | 7 | 200 | 26–9781 ms | 18492–1052583 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 95 ms | 51740 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 34 ms | 25496 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 30 ms | 4496 ms | — |
| inspect | step 9: wait 45s | 1 | 200 | 34 ms | 16552 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 9: wait 45s: 200, 34 ms

Sent:

```json
{
  "query": {
    "_": "5982273"
  },
  "body": null
}
```

Answered:

```json
{
  "hash": "1a91563be4fe77c3fbd15a4071b3893cdbe1167b",
  "required": false
}
```

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 34 ms

Sent:

```json
{
  "query": {
    "_": "5982039"
  },
  "body": null
}
```

Answered:

```json
{
  "hash": "192f6d25314632f052ac3d056a3c45e245159747",
  "required": false
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 48 ms

Sent:

```json
{
  "query": {
    "_": "5981467"
  },
  "body": null
}
```

Answered:

```json
{
  "hash": "b3c0fdde529de65f069998d669fe1987e4cdbeef",
  "required": false
}
```

<!-- facts:end -->

## What it does

Says which build of the web client is current, so an open tab knows to reload for an update.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
