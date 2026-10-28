# discordApiTokens

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/tokens` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_c679c650043dd33f32c4db371f87a1a847526a616182cd91b7760365b66505d1` |

Seen 3 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 5: click e40 | 1 | 200 | 361 ms | 13047 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 362 ms | 10197 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 354 ms | 8802 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 361 ms

Sent:

```json
{
  "query": {
    "application_ids": "409416265891971072"
  },
  "body": null
}
```

Answered:

```json
[]
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 9: goto /channels/@me: 200, 362 ms

Sent:

```json
{
  "query": {
    "application_ids": "409416265891971072"
  },
  "body": null
}
```

Answered:

```json
[]
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 25: goto /channels/@me: 200, 354 ms

Sent:

```json
{
  "query": {
    "application_ids": "409416265891971072"
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

Registers the browser's push or session token after sign-in.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

The account carries on whatever it answers; a failure here changes nothing for our steps.
