# discordApiDismissibleContentArbitrate

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/dismissible-content/arbitrate` |
| Sends | `candidates` |
| Reads | `candidates` |
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_792e002d727b7f194a7754a9aaa2ad8ce44fb7fec6fd633260bedcf5fc76bc0f` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 428 ms | 10460 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 3294 ms | 3368 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 398 ms | 2733 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 428 ms

Sent:

```json
{
  "candidates": [
    {
      "content": 816
    }
  ]
}
```

Answered:

```json
{
  "candidates": [
    {
      "content": 816,
      "weight": 1
    }
  ]
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 9: goto /channels/@me: 200, 3294 ms

Sent:

```json
{
  "candidates": [
    {
      "content": 816
    }
  ]
}
```

Answered:

```json
{
  "candidates": [
    {
      "content": 816,
      "weight": 1
    }
  ]
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 25: goto /channels/@me: 200, 398 ms

Sent:

```json
{
  "candidates": [
    {
      "content": 816
    }
  ]
}
```

Answered:

```json
{
  "candidates": [
    {
      "content": 816,
      "weight": 1
    }
  ]
}
```

<!-- facts:end -->

## What it does

Asks which promo or tip (dismissible content) the client may show now, so only one shows at a time.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
