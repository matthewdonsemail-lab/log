# discordApiUsersMe

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/@me` |
| Sends | — |
| Reads | `id`, `username`, `avatar`, `discriminator`, `public_flags`, `flags`, `banner`, `accent_color`, `global_name`, `avatar_decoration_data`, `collectibles`, `display_name_styles` and 23 more |
| Called from | `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:160 app_store_parental_revocation`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1059.js:1 parse`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script1245.js:2 anonymous`, `runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder/script0.js:158 2242` |
| rea | `ev_2070dc40e13af93274e72f1888affeb563d50467d7eb14b18189f1443a1c0d33` |

Seen 1 time(s) in 1 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /login | 1 | 200 | 380 ms | 6569 ms | — |

### What it sent and what came back (the newest 1 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T074137_sourcedandsoldtothehighestbidder**, step 1: goto /login: 200, 380 ms

Sent:

```json
null
```

Answered:

```json
{
  "id": "1434443116663930960",
  "username": "sourcedandsoldtothehighestbidder",
  "avatar": "82e338d2355f93220637a3ec394ca3c4",
  "discriminator": "0",
  "public_flags": 0,
  "flags": 0,
  "banner": null,
  "accent_color": null,
  "global_name": null,
  "avatar_decoration_data": null,
  "collectibles": null,
  "display_name_styles": null,
  "banner_color": null,
  "clan": {
    "identity_guild_id": null,
    "identity_enabled": false,
    "tag": null,
    "badge": null
  },
  "primary_guild": {
    "identity_guild_id": null,
    "identity_enabled": false,
    "tag": null,
    "badge": null
  },
  "mfa_enabled": false,
  "locale": "en-US",
  "premium_type": 0,
  "email": "matthewdonsemail@gmail.com",
  "verified": true,
  "phone": "+84586762027",
  "nsfw_allowed": true,
  "linked_users": [],
  "bio": "try out log on https://log.listeningkit.com\ntokenmaxxing on https://inferencesaver.com/en/",
  "authenticator_types": [],
  "age_verification_status": 4,
  "store_country": {
    "country": "VN",
    "set_at": null,
    "is_locked": false
  }
}
```

<!-- facts:end -->

## What it does

Reads the signed-in account itself (`GET /api/v9/users/@me`): its id, username, global name, whether its email is verified and whether two-step is on. The web client calls it as soon as the app loads.

## What our machine does with it

It is the session check: `log discord session check` sends this one call through `vendor/endcord` with the account's saved token, and Discord's answer decides `sessionState` in Twenty (rule 73). 200 with the account is loggedIn.

## What can go wrong

401 means the token is no longer valid (sessionDead: the account has to be signed in again in its browser), 403 a locked or disabled account, 429 rate limited (the governor backs off). endcord's own constructor exits on a 401; the engine catches that and answers sessionDead.
