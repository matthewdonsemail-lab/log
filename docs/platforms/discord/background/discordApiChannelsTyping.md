# discordApiChannelsTyping

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/channels/typing` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1059.js:1 parse`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_2070dc40e13af93274e72f1888affeb563d50467d7eb14b18189f1443a1c0d33` |

Seen 8 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 3: type e2287 | 1 | 204 | 389 ms | 1534 ms | — |
| inspect | step 11: type e2625 | 3 | 204 | 357–405 ms | 1580–17812 ms | — |
| inspect | step 19: type e3935 | 3 | 204 | 348–393 ms | 1978–18132 ms | — |
| inspect | step 29: type e3276 | 1 | 204 | 362 ms | 1590 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 3: type e2287: 204, 389 ms

Sent:

```json
null
```

Answered:

```json
null
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 11: type e2625: 204, 405 ms

Sent:

```json
null
```

Answered:

```json
null
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 19: type e3935: 204, 348 ms

Sent:

```json
null
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Says the account is typing in a channel (`POST .../typing`); others then get a `TYPING_START` on their gateway.

## What our machine does with it

Fires on our type step before a send. The other side's typing comes back to us as `TYPING_START` over the gateway (Jilly, +0.64 s).

## What can go wrong

204 is normal; a 429 only means the typing dots don't show.
