# discordApiUsersMeReferralsEligibility

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me/referrals/eligibility` |
| Sends | — |
| Reads | `message`, `code` |
| Called from | `runs/inspect/20261113T231616_deepman2/script3.js:232 625075`, `runs/inspect/20261113T231616_deepman2/script3.js:124 559868`, `runs/inspect/20261113T231616_deepman2/script3.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_6f2c6b17522cbdf710602ec10ad86480aee3adc32d4917ed75a075345a36c77b` |

Seen 16 time(s) in 13 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 404 | 369 ms | 4026 ms | — |
| inspect | step 5: click e40 | 1 | 404 | 328 ms | 5873 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 404 | 394 ms | 2935 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 404 | 315 ms | 2306 ms | — |
| inspect | step 1: goto /login | 7 | 404 | 136–962 ms | 10709–1045085 ms | — |
| inspect | step 1: goto /channels/@me | 3 | 401, 404 | 162–330 ms | 1156–8719 ms | — |
| inspect | step 2: snapshot | 1 | 404 | 338 ms | 48254 ms | — |
| inspect | step 6: wait 45s | 1 | 404 | 140 ms | 22181 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T231616_deepman2**, step 6: wait 45s: 404, 140 ms

Sent:

```json
null
```

Answered:

```json
{
  "message": "<messageText>",
  "code": 0
}
```

**runs/inspect/20261111T233723_deepman2**, step 1: goto /login: 404, 239 ms

Sent:

```json
null
```

Answered:

```json
{
  "message": "<messageText>",
  "code": 0
}
```

**runs/inspect/20261109T193411_deepman2**, step 1: goto /channels/@me: 401, 178 ms

Sent:

```json
null
```

Answered:

```json
{
  "message": "<messageText>",
  "code": 0
}
```

<!-- facts:end -->

## What it does

Asks whether the account can send Nitro referrals.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

404 means the account isn't in the referral programme: normal.
