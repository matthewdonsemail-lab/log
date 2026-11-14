# discordAssetsVersionStableJson

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/assets/version.stable.json` |
| Sends | — |
| Reads | `hash`, `required` |
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_30c5cc212028e4cdf0e35c3b825c77680549aa2a6120d17a25b3e8d7daad5ac1` |

Seen 14 time(s) in 12 run(s).

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

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

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

**runs/inspect/20261109T192314_deepman2**, step 1: goto /channels/@me: 200, 30 ms

Sent:

```json
{
  "query": {
    "_": "5980840"
  },
  "body": null
}
```

Answered:

```json
{
  "hash": "21747121a0223f8cde73260cd2d6bc606b4adbcc",
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
