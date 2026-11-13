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
| Called from | `runs/inspect/20261113T044840_<name:1>/script0.js:232 625075`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 559868`, `runs/inspect/20261113T044840_<name:1>/script0.js:124 961943`, `runs/inspect/20261113T044840_<name:1>/script1294.js:1 634654` |
| rea | `ev_d831a118d3660312a92a77e942ba5e4dfcdb0adb351192c986c4e48686162615` |

Seen 6 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 428 ms | 10460 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 3294 ms | 3368 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 398 ms | 2733 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 401 | 308 ms | 9986 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 495 ms | 49556 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 393 ms | 43890 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T044840_<name:1>**, step 1: goto /login: 200, 393 ms

Sent:

```json
{
  "candidates": [
    {
      "content": "<messageText>"
    }
  ]
}
```

Answered:

```json
{
  "candidates": [
    {
      "content": "<messageText>",
      "weight": 1
    }
  ]
}
```

**runs/inspect/20261030T222341_<name:1>**, step 1: goto /channels/@me: 401, 308 ms

Sent:

```json
{
  "candidates": [
    {
      "content": "<messageText>"
    }
  ]
}
```

Answered:

```json
{
  "message": "<messageText>",
  "code": 0
}
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 495 ms

Sent:

```json
{
  "candidates": [
    {
      "content": "<messageText>"
    }
  ]
}
```

Answered:

```json
{
  "candidates": [
    {
      "content": "<messageText>",
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
