# discordApiUsersMeRemoteAuthLogin

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/remote-auth/login` |
| Sends | `ticket` |
| Reads | `encrypted_token` |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 6 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 6: wait 45s | 1 | 200 | 457 ms | 19827 ms | — |
| inspect | step 1: goto /login | 4 | 200 | 476–1117 ms | 23085–132898 ms | — |
| inspect | step 9: wait 45s | 1 | 200 | 487 ms | 10493 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 9: wait 45s: 200, 487 ms

Sent:

```json
{
  "ticket": "(taken out)"
}
```

Answered:

```json
{
  "encrypted_token": "(taken out)"
}
```

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 200, 457 ms

Sent:

```json
{
  "ticket": "(taken out)"
}
```

Answered:

```json
{
  "encrypted_token": "(taken out)"
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 496 ms

Sent:

```json
{
  "ticket": "(taken out)"
}
```

Answered:

```json
{
  "encrypted_token": "(taken out)"
}
```

<!-- facts:end -->

## What it does

The QR sign-in's last step. The phone app, already signed in, scanned the code the browser showed through `wss://remote-auth-gateway.discord.gg/?v=2` (hello, init with the browser's public key, nonce_proof, pending_remote_init, pending_ticket, pending_login); the browser then posts the ticket here and gets back `encrypted_token`, which only its own private key opens. That token is the new session. On 2026-11-13 it is how deepman2 got in after `auth/login` refused the typed password.

## What our machine does with it

Stage 5 (signing in again) ends here when a person signs in by QR: the step that follows reads the gateway's READY and `/users/@me` 200, then the browser closes and its token is saved. Nothing in log-cli sends it; a person scanning the code does.

## What can go wrong

200 with `encrypted_token` is the session. Any other answer, or no pending_login within the QR's life, means no session: the sign-in is handed back to the person, never retried.
