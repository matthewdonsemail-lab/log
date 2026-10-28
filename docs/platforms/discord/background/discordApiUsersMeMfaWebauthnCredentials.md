# discordApiUsersMeMfaWebauthnCredentials

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/mfa/webauthn/credentials` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_3b1d45e09980f518a0ac91e04cfe2e7ccff79d5f22393003b02efc2694f29245` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 357 ms | 11797 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 392 ms | 12886 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 453 ms | 9529 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 359 ms | 8642 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 357 ms

Sent:

```json
null
```

Answered:

```json
[]
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 200, 392 ms

Sent:

```json
null
```

Answered:

```json
[]
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 9: goto /channels/@me: 200, 453 ms

Sent:

```json
null
```

Answered:

```json
[]
```

<!-- facts:end -->

## What it does

Lists the account's security keys and passkeys.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

A failure only hides the security-key list in settings.
