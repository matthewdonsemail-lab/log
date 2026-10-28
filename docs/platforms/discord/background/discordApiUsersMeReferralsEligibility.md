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
| Called from | `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1059.js:1 parse`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_2070dc40e13af93274e72f1888affeb563d50467d7eb14b18189f1443a1c0d33` |

Seen 5 time(s) in 3 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 404 | 369 ms | 4026 ms | — |
| inspect | step 5: click e40 | 1 | 404 | 328 ms | 5873 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 404 | 394 ms | 2935 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 404 | 315 ms | 2306 ms | — |
| inspect | step 1: goto /login | 1 | 404 | 384 ms | 10709 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder**, step 1: goto /login: 404, 384 ms

Sent:

```json
null
```

Answered:

```json
{
  "message": "404: Not Found",
  "code": 0
}
```

**runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me/<id>: 404, 369 ms

Sent:

```json
null
```

Answered:

```json
{
  "message": "404: Not Found",
  "code": 0
}
```

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 5: click e40: 404, 328 ms

Sent:

```json
null
```

Answered:

```json
{
  "message": "404: Not Found",
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
