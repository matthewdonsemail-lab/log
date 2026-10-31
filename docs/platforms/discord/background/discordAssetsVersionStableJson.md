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
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_e22164425135feecd14d85decba5692bb2c43805b9e833a30de32de1373b51d9` |

Seen 6 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 65 ms | 11817 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 63 ms | 12907 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 67 ms | 9552 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 56 ms | 8661 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 74 ms | 18492 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 95 ms | 51740 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 2: snapshot: 200, 95 ms

Sent:

```json
{
  "query": {
    "_": "5977997"
  },
  "body": null
}
```

Answered:

```json
{
  "hash": "7f7c08c79473d1dfb12023bff0a35a6f9097c383",
  "required": false
}
```

**runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder**, step 1: goto /login: 200, 74 ms

Sent:

```json
{
  "query": {
    "_": "5977244"
  },
  "body": null
}
```

Answered:

```json
{
  "hash": "5c8490b77d210a433203192c6e08fb7cd45550c8",
  "required": false
}
```

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 65 ms

Sent:

```json
{
  "query": {
    "_": "5977234"
  },
  "body": null
}
```

Answered:

```json
{
  "hash": "5c8490b77d210a433203192c6e08fb7cd45550c8",
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
