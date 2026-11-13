# discordApiUsersProfile

<!-- facts:start · written by `log facebook capture --docs` from the run captures and rea. Not edited by hand. -->

| | |
| --- | --- |
| Domain | background |
| Kind | endpoint |
| doc_id | — |
| Path | `discord.com/api/users/profile` |
| Sends | — |
| Reads | `user.id`, `user.username`, `user.global_name`, `user.avatar`, `user.avatar_decoration_data`, `user.collectibles`, `user.discriminator`, `user.display_name_styles`, `user.public_flags`, `user.primary_guild`, `user.clan`, `user.flags` and 28 more |
| Called from | `runs/inspect/20261030T222341_<name:2>/script1.js:208 app_store_parental_revocation`, `runs/inspect/20261030T222341_<name:2>/script1036.js:1 parse`, `runs/inspect/20261030T222341_<name:2>/script1221.js:2 anonymous`, `runs/inspect/20261028T074137_<name:2>/script1245.js:2 anonymous` |
| rea | `ev_065e7ad37dcb5911d240f9de7d6e2882220c5a8d7c025d92b46a23de59cf297c` |

Seen 4 time(s) in 2 run(s).

| Action | Our step | Times | Status | Took | After step start | Errors |
| --- | --- | --- | --- | --- | --- | --- |
| inspect | step 1: goto /channels/@me/<id> | 1 | 200 | 510 ms | 7785 ms | — |
| inspect | step 4: press Enter | 1 | 200 | 649 ms | 8522 ms | — |
| inspect | step 28: press Enter | 1 | 200 | 403 ms | 196 ms | — |
| inspect | step 31: wait 60s | 1 | 200 | 456 ms | 37764 ms | — |

### What it sent and what came back (the newest 3 from our runs)

Read from each run's own recording (rule 73), secrets and signed link tokens taken out. Kept in `~/.logCli/rea/clientFacts.json`, so it stays after the run is pruned.

**runs/inspect/20261028T065202_<name:2>**, step 1: goto /channels/@me/<id>: 200, 510 ms

Sent:

```json
{
  "query": {
    "type": "sidebar",
    "with_mutual_guilds": "true",
    "with_mutual_friends": "false",
    "with_mutual_friends_count": "false"
  },
  "body": null
}
```

Answered:

```json
{
  "user": {
    "id": "<id:1>",
    "username": "<name:1>",
    "global_name": null,
    "avatar": "fb80bbc029b4e9d1df8999fddb550687",
    "avatar_decoration_data": null,
    "collectibles": null,
    "discriminator": "0902",
    "display_name_styles": null,
    "public_flags": 0,
    "primary_guild": null,
    "clan": null,
    "flags": 0,
    "bot": true,
    "banner": null,
    "banner_color": null,
    "accent_color": null,
    "bio": "<messageText>"
  },
  "connected_accounts": [],
  "premium_type": 0,
  "premium_since": null,
  "premium_guild_since": null,
  "profile_themes_experiment_bucket": 4,
  "user_profile": {
    "bio": "<messageText>",
    "accent_color": null,
    "pronouns": "",
    "profile_effect": null,
    "collectibles": [],
    "banner": null,
    "theme_colors": null,
    "popout_animation_particle_type": null,
    "emoji": null
  },
  "badges": [
    {
      "id": "bot_commands",
      "description": "Supports Commands",
      "icon": "6f9e37f9029ff57aef81db857890005e",
      "link": "https://discord.com/blog/welcome-to-the-new-era-of-discord-apps?ref=badge"
    }
  ],
  "guild_badges": [],
  "mutual_guilds": [
    {
      "id": "<id:2>",
      "nick": null
    }
  ],
  "application": {
    "id": "<id:1>",
    "name": "<name:1>",
    "flags": 11051008,
    "verified": false,
    "storefront_available": false,
    "embedded_surfaces": [],
    "flags_new": "11051008",
    "integration_types_config": {
      "0": {},
      "1": {}
    }
  },
  "legacy_username": null
}
```

**runs/inspect/20261028T065202_<name:2>**, step 4: press Enter: 200, 649 ms

Sent:

```json
{
  "query": {
    "type": "sidebar",
    "with_mutual_guilds": "true",
    "with_mutual_friends": "false",
    "with_mutual_friends_count": "false"
  },
  "body": null
}
```

Answered:

```json
{
  "user": {
    "id": "<id:1>",
    "username": "<name:1>",
    "global_name": null,
    "avatar": "fb80bbc029b4e9d1df8999fddb550687",
    "avatar_decoration_data": null,
    "collectibles": null,
    "discriminator": "0902",
    "display_name_styles": null,
    "public_flags": 0,
    "primary_guild": null,
    "clan": null,
    "flags": 0,
    "bot": true,
    "banner": null,
    "banner_color": null,
    "accent_color": null,
    "bio": "<messageText>"
  },
  "connected_accounts": [],
  "premium_type": 0,
  "premium_since": null,
  "premium_guild_since": null,
  "profile_themes_experiment_bucket": 4,
  "user_profile": {
    "bio": "<messageText>",
    "accent_color": null,
    "pronouns": "",
    "profile_effect": null,
    "collectibles": [],
    "banner": null,
    "theme_colors": null,
    "popout_animation_particle_type": null,
    "emoji": null
  },
  "badges": [
    {
      "id": "bot_commands",
      "description": "Supports Commands",
      "icon": "6f9e37f9029ff57aef81db857890005e",
      "link": "https://discord.com/blog/welcome-to-the-new-era-of-discord-apps?ref=badge"
    }
  ],
  "guild_badges": [],
  "mutual_guilds": [
    {
      "id": "<id:2>",
      "nick": null
    }
  ],
  "application": {
    "id": "<id:1>",
    "name": "<name:1>",
    "flags": 11051008,
    "verified": false,
    "storefront_available": false,
    "embedded_surfaces": [],
    "flags_new": "11051008",
    "integration_types_config": {
      "0": {},
      "1": {}
    }
  },
  "legacy_username": null
}
```

**runs/inspect/20261028T062914_<name:2>**, step 28: press Enter: 200, 403 ms

Sent:

```json
{
  "query": {
    "type": "sidebar",
    "with_mutual_guilds": "true",
    "with_mutual_friends": "false",
    "with_mutual_friends_count": "false"
  },
  "body": null
}
```

Answered:

```json
{
  "user": {
    "id": "<id:1>",
    "username": "<name:1>",
    "global_name": null,
    "avatar": "fb80bbc029b4e9d1df8999fddb550687",
    "avatar_decoration_data": null,
    "collectibles": null,
    "discriminator": "0902",
    "display_name_styles": null,
    "public_flags": 0,
    "primary_guild": null,
    "clan": null,
    "flags": 0,
    "bot": true,
    "banner": null,
    "banner_color": null,
    "accent_color": null,
    "bio": "<messageText>"
  },
  "connected_accounts": [],
  "premium_type": 0,
  "premium_since": null,
  "premium_guild_since": null,
  "profile_themes_experiment_bucket": 4,
  "user_profile": {
    "bio": "<messageText>",
    "accent_color": null,
    "pronouns": "",
    "profile_effect": null,
    "collectibles": [],
    "banner": null,
    "theme_colors": null,
    "popout_animation_particle_type": null,
    "emoji": null
  },
  "badges": [
    {
      "id": "bot_commands",
      "description": "Supports Commands",
      "icon": "6f9e37f9029ff57aef81db857890005e",
      "link": "https://discord.com/blog/welcome-to-the-new-era-of-discord-apps?ref=badge"
    }
  ],
  "guild_badges": [],
  "mutual_guilds": [
    {
      "id": "<id:2>",
      "nick": null
    }
  ],
  "application": {
    "id": "<id:1>",
    "name": "<name:1>",
    "flags": 11051008,
    "verified": false,
    "storefront_available": false,
    "embedded_surfaces": [],
    "flags_new": "11051008",
    "integration_types_config": {
      "0": {},
      "1": {}
    }
  },
  "legacy_username": null
}
```

<!-- facts:end -->

## What it does

Reads a user's full profile (`GET .../users/<id>/profile`): bio, badges, mutual servers and friends.

## What our machine does with it

The client fetches it to draw a sender after their `MESSAGE_CREATE` arrives (<name:1>). A watch can read the sender's name from the event itself, so it doesn't need this.

## What can go wrong

404 / 10013 unknown user; 403 when the user can't be seen.
