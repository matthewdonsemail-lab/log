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
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 9 time(s) in 6 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 404 | 369 ms | 4026 ms | — |
| inspect | step 5: click e40 | 1 | 404 | 328 ms | 5873 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 404 | 394 ms | 2935 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 404 | 315 ms | 2306 ms | — |
| inspect | step 1: goto /login | 3 | 404 | 384–962 ms | 10709–1045085 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 401 | 330 ms | 8719 ms | — |
| inspect | step 2: snapshot | 1 | 404 | 338 ms | 48254 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 404, 465 ms

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

**runs/inspect/20261030T222341_<name:1>**, step 1: goto /channels/@me: 401, 330 ms

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

**runs/inspect/20261030T222341_<name:1>**, step 2: snapshot: 404, 338 ms

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
