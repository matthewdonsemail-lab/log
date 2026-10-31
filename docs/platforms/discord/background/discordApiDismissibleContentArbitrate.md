# discordApiDismissibleContentArbitrate

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/dismissible-content/arbitrate` |
| Sends | `candidates` |
| Reads | `message`, `code`, `candidates` |
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_479b2aee3d345f79854b86d6e6aeb9ffae976b866a8095714fadf4420bbf3ec9` |

Seen 5 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 428 ms | 10460 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 3294 ms | 3368 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 398 ms | 2733 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 401 | 308 ms | 9986 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 495 ms | 49556 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me: 401, 308 ms

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
  "message": "401: Unauthorized",
  "code": 0
}
```

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 2: snapshot: 200, 495 ms

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

<!-- facts:end -->

## What it does

Asks which promo or tip (dismissible content) the client may show now, so only one shows at a time.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
