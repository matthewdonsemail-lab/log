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
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 8 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 357 ms | 11797 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 392 ms | 12886 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 453 ms | 9529 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 359 ms | 8642 ms | — |
| inspect | step 1: goto /login | 3 | 200 | 366–9812 ms | 18469–1052552 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 479 ms | 51717 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 200, 651 ms

Sent:

```json
null
```

Answered:

```json
[]
```

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 200, 479 ms

Sent:

```json
null
```

Answered:

```json
[]
```

**runs/inspect/20261028T065202_<name:1>**, step 1: goto /channels/@me/<id>: 200, 357 ms

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
