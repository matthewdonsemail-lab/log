# discordApiUsersMe

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me` |
| Sends | — |
| Reads | `message`, `code` |
| Called from | `runs/inspect/20261113T141543_<name:1>/script1.js:232 625075`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 559868`, `runs/inspect/20261113T141543_<name:1>/script1.js:124 961943`, `runs/inspect/20261113T141543_<name:1>/script1294.js:1 634654` |
| rea | `ev_a9fa69c7432fa1fcc41058ba491790444cfcec72f4c96150b3d2566a4e5def67` |

Seen 6 time(s) in 4 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 5 | 200, 401 | 304–397 ms | 4449–7827 ms | — |
| inspect | step 1: goto /channels/@me | 1 | 401 | 1147 ms | 10897 ms | — |

### What it sent and what came back (the newest 2 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261113T141543_<name:1>**, step 1: goto /login: 401, 372 ms

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

**runs/inspect/20261030T222341_<name:1>**, step 1: goto /channels/@me: 401, 1147 ms

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
