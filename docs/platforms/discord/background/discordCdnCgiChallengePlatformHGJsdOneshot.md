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
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 5 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 58 ms | 2405 ms | — |
| inspect | step 1: goto /login | 3 | 200 | 37–324 ms | 1831–4817 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 200 | 63 ms | 4789 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 200, 37 ms

Sent:

```json
"JUDiZM4Ruo2mde$2P8R6s7OofqzgYfPbAehCuknU38X3yIDPL53WJU2ao$RdmGNUNbp1soFzNVMddZYZJrwqE1VB0VgCQkBbC07-Bhm+W1kqyXvMvjeovsoObDiZ5rGz2Pa2p83KZbmv9Rz$-0yBrtie$bCR81mkv0PB4HhjgSwWgvOYS-MRjnc$fQjkvVFXJK0PLagaN30VUqWROdSfBcVZPNVqH033j1wYE2HgeQ0ZXx08t6fV67697p$EgVm7v19SJ8i5CSTucNU-I+BnmzvVMwnDpUg3o4Fxhu6DhmUiF+8PFeAzFB9oTNu3B2bAOhRx-W6Yjnsj2KKq9aOj9uPYRMpEAmAQD$mQJrLLMBPX9QXPBoICmIupRXPA+bZbL2-yGF6FEa$2Jgno… (16502 chars)"
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
