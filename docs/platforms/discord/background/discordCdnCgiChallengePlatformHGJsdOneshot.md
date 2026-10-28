# discordCdnCgiChallengePlatformHGJsdOneshot

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/cdn-cgi/challenge-platform/h/g/jsd/oneshot` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_2070dc40e13af93274e72f1888affeb563d50467d7eb14b18189f1443a1c0d33` |

Seen 2 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 58 ms | 2405 ms | — |
| inspect | step 1: goto /login | 1 | 200 | 57 ms | 3117 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 200, 58 ms

Sent:

```json
"iPH23RabkJK+CuiRTLys1NP4Lw8BljlakKAzPzcpuZyBk6Aw-MP-EW3YMcfnIUdEuY$PrcswT$bmXd+VLTk$$YxMWXh5aGWXwyCCpf5YU-3NzciYAZianT9x3frNqOAi1ICchjey6u12xf7doWk2uyAFpZfrHD4opPZeb42Pw$c7vURdxupIEBEhCqtbrBfIh21VKNev-M0O$sYQFxrJoyNJ-hEed+OGGA8xMDFA0bJIOk-RyGXYf8Sjvrk4NjNOpzOtSEZAZ+EWKK-vSWj2eXtV0BUyE4Ei7eqMjxsifr9OD2BG4P43Mp$Ga7LpGdAGMMppsdLE6seyTVhUjHuRK47+EUHklOaSI3k0$wJrm+MlqELhF-w-FhOdwKeqZjT77c3nkBnBCUz1pYd3… (16503 chars)"
```

Answered:

```json
null
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 1: goto /login: 200, 57 ms

Sent:

```json
"iPH23RabkJK+CuiRTL4u4NnPLJ8BljlakKAzPzcpuZyBk6Aw-MP-EW3YMcfnIUdEuY$PrcswT$bmXd+VLTk$$YxMWXh5aGWXwyCCpf5YU-3NzciYAZianT9x3frNqOAi1ICchjey6u12xf7doWk2uyAFpZfrHD4opPZeb42Pw$c7vURdxupIEBEhCqtbrBfIh21VKNev-M0O$sYQFxrJoyNJ-hEed+OGGA8xMDFA0bJIOk-RyGXYf8Sjvrk4NjNOpzOtSEZAZ+EWKK-vSWj2eXtV0BUyE4Ei7eqMjxsifr9OD2BG4P43Mp$Ga7LpGdAGMMppsdLE6seyTVhUjHuRK47+EUHklOaSI3k0$wJrm+MlqELhF-w-FhOdwKeqZjT77c3nkBnBCUz1pYd3… (16482 chars)"
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Cloudflare's background bot check (the JS detection one-shot), sent by the page without anything shown.

## What our machine does with it

Not decided on. A Cloudflare challenge page instead of Discord would be its own state.

## What can go wrong

If Cloudflare challenges, the page shows a check instead of Discord; that is said to matt.
