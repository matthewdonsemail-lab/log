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
| Called from | `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1036.js:1 parse`, `runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous` |
| rea | `ev_54d8f80792367f7de1abf49804004bf806243e62306b8c24cbc48b308b87507d` |

Seen 7 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 404 | 369 ms | 4026 ms | — |
| inspect | step 5: click e40 | 1 | 404 | 328 ms | 5873 ms | — |
| inspect | step 9: goto /channels/@me | 1 | 404 | 394 ms | 2935 ms | — |
| inspect | step 25: goto /channels/@me | 1 | 404 | 315 ms | 2306 ms | — |
| inspect | step 1: goto /login | 1 | 404 | 384 ms | 10709 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 401 | 330 ms | 8719 ms | — |
| inspect | step 2: snapshot | 1 | 404 | 338 ms | 48254 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 1: goto /channels/@me: 401, 330 ms

Sent:

```json
null
```

Answered:

```json
{
  "message": "401: Unauthorized",
  "code": 0
}
```

**runs/inspect/20261030T222341_sourcedandsoldtothehighestbidder**, step 2: snapshot: 404, 338 ms

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

<!-- facts:end -->

## What it does

Asks whether the account can send Nitro referrals.

## What our machine does with it

Nothing in log-cli waits for it or reads it. It is part of what Discord's client loads around the page; a watch or a send never depends on it.

## What can go wrong

404 means the account isn't in the referral programme: normal.
