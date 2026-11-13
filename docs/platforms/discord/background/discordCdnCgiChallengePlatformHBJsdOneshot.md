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
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 1 | 200 | 142 ms | 2386 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 200, 142 ms

Sent:

```json
"vQZvfbBWsVFwo8LQ8Q8Cs2g8eQ3ydfNd3Ic6pmyGrM1EvT90JZxW$0L$x9xwoL46-p68KyuMTSdEN6+Bh9Cyzw0jfwdwTAhg8lI3FwA$WXkAn6n+OsAtwzcp0XAyKilXaXXDlujgI1C1KmRS$mqciUGv4mSkN0GvlaF8+0h$2iyiTjNLTUS1Fv5tM5eh++F8lA5wgYICs9o2QkRgrj68qDdWW$h+esEYd7CNTl11$8kf0VVvN0yb3I41dADivNbKJxV4RUp43LRVnDyhoAy472GM7B2s0Kzkq7nuAeHZN2zCi+MgNN0RofixJfDBK7eMdk4Qs1T0G7rNnbCwwp8qjzmH$EWg4tS9cLgOdCxDYHka972-wDGvFENACJ$oosFYeT$wG3Nlz9Yo7ZlC… (16456 chars)"
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
