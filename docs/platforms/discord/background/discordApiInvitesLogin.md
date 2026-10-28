# discordApiInvitesLogin

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/invites/login` |
| Sends | — |
| Reads | `message`, `code` |
| Called from | `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script892.js:1 parse`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script1090.js:2 anonymous`, `runs/inspect/20261028T065202_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_08f2067b76d7c6cb1664661cf2aa0ff1446dfb306e1a75c9669b9b45c3490bac` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 1 | 404 | 311 ms | 4280 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T062914_sourcedandsoldtothehighestbidder**, step 1: goto /login: 404, 311 ms

Sent:

```json
{
  "query": {
    "with_counts": "true",
    "with_expiration": "true",
    "with_permissions": "true",
    "with_games": "true"
  },
  "body": null
}
```

Answered:

```json
{
  "message": "Unknown Invite",
  "code": 10006
}
```

<!-- facts:end -->

## What it does

Reads an invite by its code. `discord.gg/login` reads `login` as an invite code.

## What our machine does with it

Our first goto went to `discord.gg/login`; this answered 404 `Unknown Invite` (10006) and the page said Invite Invalid. The login page is `discord.com/login`.

## What can go wrong

404 / 10006 is an invite that doesn't exist or expired; it never means the account is signed out.
