# discordApiUsersMeMfaWebauthnCredentials

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/mfa/webauthn/credentials` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 15 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 357 ms | 11797 ms | — |
| inspect | step 5: click e40 | 1 | 200 | 392 ms | 12886 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 200 | 453 ms | 9529 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 200 | 359 ms | 8642 ms | — |
| inspect | step 1: goto /login | 7 | 200 | 158–9812 ms | 18469–1052552 ms | — |
| inspect | step 2: snapshot | 1 | 200 | 479 ms | 51717 ms | — |
| inspect | step 6: wait 45s | 1 | 200 | 166 ms | 25489 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 162 ms | 4491 ms | — |
| inspect | step 9: wait 45s | 1 | 200 | 165 ms | 16544 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 9: wait 45s: 200, 165 ms

Sent:

```json
null
```

Answered:

```json
[
  {
    "id": "<id:1>",
    "type": 1,
    "name": "<name:1>",
    "last_used": "2026-11-14T18:48:05.462552+00:00",
    "cred_id": "sqm7opz-DOpSIN_BBxnqXoNYIA0"
  }
]
```

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 166 ms

Sent:

```json
null
```

Answered:

```json
[
  {
    "id": "<id:1>",
    "type": 1,
    "name": "<name:1>",
    "last_used": "2026-11-13T23:16:32.167333+00:00",
    "cred_id": "sqm7opz-DOpSIN_BBxnqXoNYIA0"
  }
]
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 231 ms

Sent:

```json
null
```

Answered:

```json
[
  {
    "id": "<id:1>",
    "type": 1,
    "name": "<name:1>",
    "last_used": "2026-11-11T23:37:30.248717+00:00",
    "cred_id": "sqm7opz-DOpSIN_BBxnqXoNYIA0"
  }
]
```

<!-- facts:end -->

## What it does

Lists the account's security keys and passkeys.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

A failure only hides the security-key list in settings.
