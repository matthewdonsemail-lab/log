# discordCdnCgiChallengePlatformHBJsdOneshot

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/cdn-cgi/challenge-platform/h/b/jsd/oneshot` |
| Sends | — |
| Reads | — |
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_13e337b741bd43d0ac8cba4fd211db16cabdc06f12ec02fd20221db474c448f1` |

Seen 5 time(s) in 5 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 5 | 200 | 29–142 ms | 453–2386 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 1: goto /login: 200, 69 ms

Sent:

```json
"8NWETcl+TnzCm0PJYNik9zOuZkkNoD127IAFLOQq2YP3qz7K9KmSffPWSi5BqIgwZHeoCV-umUS2Rb4GR9aBd2WFpIz-Pu1pOouN5OHa43DM-AlP0HvN7-BAWcnzzFsXI9rBU8o1g8C4+xWjpHou9eVyan-X-etRKag+y+sx60NRtNjr1T-GN06boFRmrjLr679ou-FkKuAAEsZivMtcvxLm-neUV+SU8WrIbJ92f80yXRqyyVniyfE5HJ-scTH6tViJhtOvQS5iYS+emoHjkwBmXjxpoKA+lA3ypulWYzONonzg9xtr-ByHvOGn-iice8OnWaVc7D6taaJj9yvjPH4xFWOA0fgCW-Gk0IeTo+JczDK0FZv14e6jXZPC38Dpcm54Bxfj7EKp8qyx… (16504 chars)"
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
