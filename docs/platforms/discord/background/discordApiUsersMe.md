# discordApiUsersMe

<!-- facts:start · written by `log capture docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me` |
| Sends | — |
| Reads | `message`, `code` |
| Called from | `runs/inspect/20261114T184328_deepman2/script0.js:232 625075`, `runs/inspect/20261114T184328_deepman2/script0.js:124 559868`, `runs/inspect/20261114T184328_deepman2/script0.js:124 961943`, `runs/inspect/20261111T233723_deepman2/script1280.js:1 anonymous` |
| rea | `ev_f6daff8038b4f477b27b852e31fc1f2f76f7dd725b1883891e74b824ed6f0ac3` |

Seen 16 time(s) in 10 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 14 | 200, 401 | 126–397 ms | 1049–7827 ms | — |
| inspect | step 1: goto /channels/@me | 2 | 401 | 280–1147 ms | 1971–10897 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261114T184328_deepman2**, step 1: goto /login: 401, 141 ms

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

**runs/inspect/20261109T193411_deepman2**, step 1: goto /channels/@me: 401, 280 ms

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

Reads the signed-in account itself (`GET /api/v9/users/@me`): its id, username, global name, whether its email is verified and whether two-step is on. The web client calls it as soon as the app loads.

## What our machine does with it

It is the session check: `log discord session check` sends this one call through `vendor/endcord` with the account's saved token, and Discord's answer decides `sessionState` in Twenty (rule 73). 200 with the account is loggedIn.

## What can go wrong

401 means the token is no longer valid (sessionDead: the account has to be signed in again in its browser), 403 a locked or disabled account, 429 rate limited (the governor backs off). endcord's own constructor exits on a 401; the engine catches that and answers sessionDead.
