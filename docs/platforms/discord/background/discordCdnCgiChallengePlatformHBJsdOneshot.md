# discordCdnCgiChallengePlatformHBJsdOneshot

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/cdn-cgi/challenge-platform/h/b/jsd/oneshot` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 6 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 6 | 200 | 29–142 ms | 453–2386 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 1: goto /login: 200, 33 ms

Sent:

```json
"O5OmhAvmK3hvGkZC2tGpiM5pk9cPWw57zH359pTylcntnkx-o5bAP9BiuAUR9dx8rb7w+xGrG3LW+xmMRW2IZDMNHWaZacgdkgArdebsSx813LwV9GNbtlvL+9$KIVU1Sy$7bN0encw97YojYQfXZReuqyQHM1O7Vkph$y5Ku8AFQCV5pVFVHSpy2vHxf12OD5OznDf8bME7sMEts7gyGi-E3MYZFxGjZ7UkEgGlYZhryBCOzQySeII$4RQEYMZlH1eX7miZtTdYuTivfzQQuE1ydAZ2cnKVmpEJgu$+I$BIg5w1ZCNYqjQUv1DUyXA99sOKyKfoZNxYHvjKQf07nS5Rqhjm3+jt$$uKUngpMBWeX-qMmdko+75dKVRNc1Gw$OrNc$7ObL7ntPjm… (16500 chars)"
```

Answered:

```json
null
```

<!-- facts:end -->

## What it does

Cloudflare's background browser check on discord.com. The page posts one encoded reading of the browser when the login page loads, and Cloudflare answers with no body.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It fires by itself while the account's browser sits on the login page; the owner signs in and the session is saved when the browser closes.

## What can go wrong

It answered 200 in the one run that has it. If Cloudflare instead puts a challenge page in front of the login form, that is a stop for the owner to clear in the window; log retries nothing (rule 94).
